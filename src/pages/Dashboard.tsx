
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import NavigationHeader from "@/components/common/NavigationHeader";
import WorldMap from "@/components/WorldMap";
import { parseNumericValue } from "@/utils/sales/dataTransformers";
import { LEVELS, MONTHS } from "@/utils/sales/constants";

// 현재 월 설정 (추후 동적으로 변경 가능)
const CURRENT_MONTH = 5; // June (index 5)

type RegionData = {
  name: string;
  qty: number;
  amt: number;
  color: string;
};

type ForecastData = {
  month: string;
  isCurrent: boolean;
  totalQty: number;
  totalAmt: number;
  americasQty: number;
  americasAmt: number;
  europeQty: number;
  europeAmt: number;
};

type CountryData = {
  code: string;
  name: string;
  amt: number;
  region: string;
};

const Dashboard = () => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");
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

  const getFilteredChartData = () => {
    if (selectedRegion === "americas") {
      return forecastData.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.americasQty,
        amt: item.americasAmt
      }));
    } else if (selectedRegion === "europe") {
      return forecastData.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.europeQty,
        amt: item.europeAmt
      }));
    } else {
      return forecastData.map(item => ({
        month: item.month,
        isCurrent: item.isCurrent,
        qty: item.totalQty,
        amt: item.totalAmt
      }));
    }
  };

  const dashboardConfig = {
    qty: { label: "수량", theme: { light: "#8B5CF6", dark: "#A78BFA" } },
    amt: { label: "금액", theme: { light: "#F97316", dark: "#FB923C" } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-12 bg-gray-200 rounded-md w-1/2"></div>
            <div className="h-80 bg-gray-200 rounded-md w-full"></div>
            <div className="h-40 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">통합 영업 대시보드</h1>
        
        {/* 현재 월 지역별 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {currentMonthData.map((data, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="pb-2" style={{ borderBottom: `3px solid ${data.color}` }}>
                <CardTitle>{data.name}</CardTitle>
                <CardDescription>{CURRENT_MONTH}월 판매 전망</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-bold">{data.amt.toLocaleString()} 만원</div>
                  <div className="text-sm text-muted-foreground">
                    수량: {data.qty.toLocaleString()} 개
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* 차트 및 세계지도 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>월별 판매 전망 추이</CardTitle>
              <CardDescription>월별 금액 판매 전망 추이 그래프</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedRegion}>
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="americas">미주</TabsTrigger>
                  <TabsTrigger value="europe">구주</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <LineChart data={getFilteredChartData()}>
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="qty"
                        name="수량"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amt"
                        name="금액"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="americas" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <LineChart data={getFilteredChartData()}>
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="qty"
                        name="수량"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amt"
                        name="금액"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="europe" className="space-y-4">
                  <ChartContainer className="aspect-[4/3]" config={dashboardConfig}>
                    <LineChart data={getFilteredChartData()}>
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="qty"
                        name="수량"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amt"
                        name="금액"
                        stroke="#F97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* 세계지도 카드 */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>세계 지역별 매출 분포</CardTitle>
              <CardDescription>{CURRENT_MONTH}월 지역별 판매 전망 분포도</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] w-full">
                <WorldMap countries={countryData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sales Perform-O-Meter. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
