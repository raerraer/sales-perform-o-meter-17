
import { useState, useEffect } from "react";
import { parseNumericValue } from "@/utils/sales/dataTransformers";
import { LEVELS, MONTHS } from "@/utils/sales/constants";

// 현재 월을 얻는 함수
const getCurrentMonth = (): number => {
  const now = new Date();
  return now.getMonth() + 1; // JavaScript는 월을 0부터 시작하므로 +1
};

// 현재 월 설정
const CURRENT_MONTH = getCurrentMonth();

export type RegionData = {
  name: string;
  qty: number;
  amt: number;
  color: string;
};

export type ForecastData = {
  month: string;
  isCurrent: boolean;
  totalQty: number;
  totalAmt: number;
  americasQty: number;
  americasAmt: number;
  europeQty: number;
  europeAmt: number;
};

export type CountryData = {
  code: string;
  name: string;
  amt: number;
  region: string;
};

export const useDashboardData = () => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonthData, setCurrentMonthData] = useState<RegionData[]>([]);

  useEffect(() => {
    // 로컬스토리지에서 데이터 가져오기
    const fetchData = () => {
      try {
        const versionDataStr = localStorage.getItem('salesVersionData');
        if (!versionDataStr) {
          console.error("로컬스토리지에 영업 데이터가 없습니다. 먼저 영업실적표 페이지를 방문해주세요.");
          return;
        }
        
        const versionData = JSON.parse(versionDataStr);
        const latestVersion = Object.keys(versionData).sort().pop();
        
        if (!latestVersion || !versionData[latestVersion]) {
          console.error("최신 버전 데이터를 찾을 수 없습니다.");
          return;
        }
        
        // 대시보드용 데이터 가공
        processDataForDashboard(versionData[latestVersion]);
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processDataForDashboard = (rawData: any[][]) => {
    if (!rawData || !Array.isArray(rawData)) return;
    
    // 인덱스 찾기 (총합계, 지역, 국가)
    const totalIndex = rawData.findIndex(row => row[0] === LEVELS.TOTAL);
    const regionIndices = {
      '미주': rawData.findIndex(row => row[0] === '미주'),
      '구주': rawData.findIndex(row => row[0] === '구주')
    };
    
    // 국가 데이터 찾기 (세계지도용)
    const countryIndices = LEVELS.COUNTRIES.map(country => 
      rawData.findIndex(row => row[0] === country)
    );
    
    // 국가별 데이터 설정 (세계지도용)
    const countryMappings: Record<string, { code: string, region: string }> = {
      '미국': { code: 'USA', region: '미주' },
      '캐나다': { code: 'CAN', region: '미주' },
      '영국': { code: 'GBR', region: '구주' },
      '이태리': { code: 'ITA', region: '구주' }
    };
    
    // 월별 전망 데이터 추출
    // 각 월마다 11개 컬럼 존재 (5개 데이터 타입 * 2(Qty, Amt) + 1 비고)
    // 전망 데이터는 각 월의 9번째, 10번째 컬럼(인덱스 8, 9)
    const formattedData = MONTHS.map((month, idx) => {
      // 월별 기준 컬럼 인덱스 (첫 번째 컬럼은 이름)
      const baseColIdx = 1 + (idx * 11);
      // 전망 Qty 컬럼 위치 (8번째 오프셋)
      const forecastQtyColIdx = baseColIdx + 8;
      // 전망 Amt 컬럼 위치 (9번째 오프셋)
      const forecastAmtColIdx = baseColIdx + 9;
      
      // 총합계 및 지역별 값 추출
      const totalQty = parseNumericValue(rawData[totalIndex]?.[forecastQtyColIdx] || 0);
      const totalAmt = parseNumericValue(rawData[totalIndex]?.[forecastAmtColIdx] || 0);
      
      const americasQty = parseNumericValue(rawData[regionIndices['미주']]?.[forecastQtyColIdx] || 0);
      const americasAmt = parseNumericValue(rawData[regionIndices['미주']]?.[forecastAmtColIdx] || 0);
      const europeQty = parseNumericValue(rawData[regionIndices['구주']]?.[forecastQtyColIdx] || 0);
      const europeAmt = parseNumericValue(rawData[regionIndices['구주']]?.[forecastAmtColIdx] || 0);
      
      return {
        month: month,
        isCurrent: idx === CURRENT_MONTH - 1,
        totalQty,
        totalAmt,
        americasQty,
        americasAmt,
        europeQty,
        europeAmt
      };
    });
    
    setForecastData(formattedData);
    
    // 현재 월의 지역별 통계 설정
    const currentMonth = formattedData.find(d => d.isCurrent);
    if (currentMonth) {
      setCurrentMonthData([
        { 
          name: '총합계', 
          qty: currentMonth.totalQty, 
          amt: currentMonth.totalAmt,
          color: '#1e2761'
        },
        {
          name: '미주',
          qty: currentMonth.americasQty,
          amt: currentMonth.americasAmt,
          color: '#4169E1'
        },
        {
          name: '구주',
          qty: currentMonth.europeQty,
          amt: currentMonth.europeAmt, 
          color: '#6A5ACD'
        }
      ]);
    }
    
    // 세계지도용 국가 데이터 설정
    const countries: CountryData[] = [];
    
    // 현재 월에 해당하는 컬럼 인덱스 계산
    const currentMonthBaseColIdx = 1 + ((CURRENT_MONTH - 1) * 11);
    const currentMonthForecastAmtColIdx = currentMonthBaseColIdx + 9;
    
    countryIndices.forEach((index, i) => {
      if (index !== -1) {
        const countryName = rawData[index][0];
        const mappingInfo = countryMappings[countryName];
        
        if (mappingInfo) {
          const forecastAmtValue = parseNumericValue(
            rawData[index][currentMonthForecastAmtColIdx] || 0
          );
          
          countries.push({
            code: mappingInfo.code,
            name: countryName,
            amt: forecastAmtValue,
            region: mappingInfo.region
          });
        }
      }
    });
    
    setCountryData(countries);
  };

  return {
    forecastData,
    countryData,
    isLoading,
    currentMonthData,
    currentMonth: CURRENT_MONTH
  };
};
