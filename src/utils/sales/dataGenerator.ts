
import { MONTHS, CATEGORIES, COUNTRIES, MODELS, LEVELS, REGION_COUNTRIES } from './constants';

// 랜덤 데이터 생성 함수 (qty는 2자리, amt는 3자리로 생성)
const generateRandomData = () => {
  const qty = Math.floor(Math.random() * 90) + 10; // 10-99 범위의 2자리 숫자
  const amt = Math.floor(Math.random() * 900) + 100; // 100-999 범위의 3자리 숫자
  return { qty, amt: amt.toLocaleString() }; // amt는 천 단위 구분자(,) 포함
};

// 기본 데이터 구조 생성
export const generateInitialData = () => {
  const data: any[] = [];
  
  // 국가별 모델 데이터 저장소
  const countryModelData: {[key: string]: any[][]} = {};
  
  // 지역별 모델 데이터 합계 저장소
  const regionModelData: {[key: string]: any[][]} = {};
  
  // 전체 모델 데이터 합계 저장소
  const totalModelData: any[][] = [[], []]; // 모델1, 모델2
  
  // 1. 각 국가별 데이터 생성
  COUNTRIES.forEach(country => {
    // 각 모델별 데이터 생성을 위한 저장소
    const modelData: any[][] = [];
    
    // 각 국가별 모델 데이터 생성
    MODELS.forEach((model, modelIndex) => {
      const row = [model];
      
      // 12개월 데이터 생성
      for (let month = 0; month < MONTHS.length; month++) {
        // 5개 카테고리(전년, 계획, 실행, 속보, 전망)에 대해 Qty, Amt 생성
        for (let category = 0; category < CATEGORIES.length - 1; category++) {
          const { qty, amt } = generateRandomData();
          row.push(qty.toString());
          row.push(amt);
        }
        // 비고 칼럼 추가
        row.push('');
      }
      
      modelData.push([...row]); // 깊은 복사로 저장
      
      // 해당 국가의 모델 데이터 저장
      if (!countryModelData[country]) {
        countryModelData[country] = [[], []];
      }
      countryModelData[country][modelIndex] = [...row];
    });
    
    // 국가 합계 행 생성
    const countryRow = [country];
    
    // 12개월에 대한 국가 합계 계산
    for (let month = 0; month < MONTHS.length; month++) {
      for (let category = 0; category < CATEGORIES.length - 1; category++) {
        // 해당 월/카테고리의 Qty 합계 계산 (각 모델의 해당 위치 값 합산)
        const qtySum = modelData.reduce((sum, modelRow) => {
          const idx = 1 + month * 11 + category * 2;
          return sum + Number(modelRow[idx] || 0);
        }, 0);
        
        // 해당 월/카테고리의 Amt 합계 계산
        const amtSum = modelData.reduce((sum, modelRow) => {
          const idx = 1 + month * 11 + category * 2 + 1;
          const amtValue = modelRow[idx] ? modelRow[idx].replace(/,/g, '') : '0';
          return sum + Number(amtValue);
        }, 0);
        
        countryRow.push(qtySum.toString());
        countryRow.push(amtSum.toLocaleString());
      }
      // 비고 칼럼
      countryRow.push('');
    }
    
    // 국가 행을 먼저 추가
    data.push(countryRow);
    
    // 해당 국가의 모델 행들 추가
    modelData.forEach(modelRow => {
      data.push(modelRow);
    });
  });
  
  // 2. 지역별 합계 생성
  LEVELS.REGIONS.forEach(region => {
    const regionCountries = REGION_COUNTRIES[region];
    
    // 지역별 모델 데이터 저장소 초기화
    regionModelData[region] = [
      [MODELS[0]], // 모델1
      [MODELS[1]]  // 모델2
    ];
    
    // 모델별 합계 계산
    MODELS.forEach((model, modelIndex) => {
      // 12개월 데이터 생성
      for (let month = 0; month < MONTHS.length; month++) {
        for (let category = 0; category < CATEGORIES.length - 1; category++) {
          const qtyIdx = 1 + month * 11 + category * 2;
          const amtIdx = qtyIdx + 1;
          
          // Qty 합계 계산
          let qtySum = 0;
          regionCountries.forEach(country => {
            if (countryModelData[country] && countryModelData[country][modelIndex]) {
              qtySum += Number(countryModelData[country][modelIndex][qtyIdx] || 0);
            }
          });
          
          // Amt 합계 계산
          let amtSum = 0;
          regionCountries.forEach(country => {
            if (countryModelData[country] && countryModelData[country][modelIndex]) {
              const amtValue = countryModelData[country][modelIndex][amtIdx];
              amtSum += Number(amtValue ? amtValue.replace(/,/g, '') : 0);
            }
          });
          
          // 결과 저장
          regionModelData[region][modelIndex].push(qtySum.toString());
          regionModelData[region][modelIndex].push(amtSum.toLocaleString());
        }
        // 비고 칼럼
        regionModelData[region][modelIndex].push('');
      }
      
      // 전체 합계 계산을 위해 모델 데이터 누적
      if (totalModelData[modelIndex].length === 0) {
        totalModelData[modelIndex] = [...regionModelData[region][modelIndex]];
      } else {
        for (let i = 1; i < regionModelData[region][modelIndex].length; i++) {
          const isRemark = (i - 1) % 11 === 10;
          if (!isRemark) {
            const isAmt = (i - 1) % 2 === 1;
            if (isAmt) {
              const value1 = Number(totalModelData[modelIndex][i].replace(/,/g, '') || 0);
              const value2 = Number(regionModelData[region][modelIndex][i].replace(/,/g, '') || 0);
              totalModelData[modelIndex][i] = (value1 + value2).toLocaleString();
            } else {
              const value1 = Number(totalModelData[modelIndex][i] || 0);
              const value2 = Number(regionModelData[region][modelIndex][i] || 0);
              totalModelData[modelIndex][i] = (value1 + value2).toString();
            }
          }
        }
      }
    });
    
    // 지역 합계 행 생성
    const regionRow = [region];
    
    // 12개월에 대한 지역 합계 계산
    for (let month = 0; month < MONTHS.length; month++) {
      for (let category = 0; category < CATEGORIES.length - 1; category++) {
        const qtyIdx = 1 + month * 11 + category * 2;
        const amtIdx = qtyIdx + 1;
        
        // Qty 합계 계산 (지역 내 모든 모델의 합)
        let qtySum = 0;
        MODELS.forEach((_, modelIndex) => {
          qtySum += Number(regionModelData[region][modelIndex][qtyIdx] || 0);
        });
        
        // Amt 합계 계산 (지역 내 모든 모델의 합)
        let amtSum = 0;
        MODELS.forEach((_, modelIndex) => {
          const amtValue = regionModelData[region][modelIndex][amtIdx];
          amtSum += Number(amtValue ? amtValue.replace(/,/g, '') : 0);
        });
        
        regionRow.push(qtySum.toString());
        regionRow.push(amtSum.toLocaleString());
      }
      // 비고 칼럼
      regionRow.push('');
    }
    
    // 통합 데이터 생성을 위한 새로운 지역 데이터 배열
    const newRegionData = [];
    
    // 지역 행 추가
    newRegionData.push(regionRow);
    
    // 지역 모델 행 추가
    regionModelData[region].forEach(modelRow => {
      newRegionData.push(modelRow);
    });
    
    // 기존 데이터에서 해당 지역 국가들 검색
    const regionDataSections = [];
    regionCountries.forEach(country => {
      const countryStartIndex = data.findIndex(row => row[0] === country);
      if (countryStartIndex !== -1) {
        let nextCountryIndex = data.findIndex((row, index) => index > countryStartIndex && COUNTRIES.includes(row[0]));
        if (nextCountryIndex === -1) nextCountryIndex = data.length;
        
        regionDataSections.push(data.slice(countryStartIndex, nextCountryIndex));
      }
    });
    
    // 지역 데이터를 기존 데이터에 삽입 (기존 데이터 배열 수정)
    const firstCountryIndex = data.findIndex(row => row[0] === regionCountries[0]);
    if (firstCountryIndex !== -1) {
      data.splice(firstCountryIndex, 0, ...newRegionData);
    }
  });
  
  // 3. 총 합계 생성
  // 총 합계 행
  const totalRow = [LEVELS.TOTAL];
  
  // 12개월에 대한 총 합계 계산
  for (let month = 0; month < MONTHS.length; month++) {
    for (let category = 0; category < CATEGORIES.length - 1; category++) {
      const qtyIdx = 1 + month * 11 + category * 2;
      const amtIdx = qtyIdx + 1;
      
      // Qty 합계 계산 (모든 모델의 합)
      let qtySum = 0;
      MODELS.forEach((_, modelIndex) => {
        qtySum += Number(totalModelData[modelIndex][qtyIdx] || 0);
      });
      
      // Amt 합계 계산 (모든 모델의 합)
      let amtSum = 0;
      MODELS.forEach((_, modelIndex) => {
        const amtValue = totalModelData[modelIndex][amtIdx];
        amtSum += Number(amtValue ? amtValue.replace(/,/g, '') : 0);
      });
      
      totalRow.push(qtySum.toString());
      totalRow.push(amtSum.toLocaleString());
    }
    // 비고 칼럼
    totalRow.push('');
  }
  
  // 총 합계 데이터
  const totalData = [totalRow];
  
  // 총 합계 모델 행 추가
  totalModelData.forEach((modelRow, index) => {
    if (modelRow.length > 0) {
      // 모델 이름이 없는 경우 추가
      if (!modelRow[0]) {
        modelRow[0] = MODELS[index];
      }
      totalData.push(modelRow);
    }
  });
  
  // 총 합계 데이터를 맨 앞에 추가
  data.unshift(...totalData);
  
  return data;
};
