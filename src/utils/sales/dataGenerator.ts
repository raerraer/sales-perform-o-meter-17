
import { MONTHS, CATEGORIES, COUNTRIES, MODELS } from './constants';

// 랜덤 데이터 생성 함수 (qty는 2자리, amt는 3자리로 생성)
const generateRandomData = () => {
  const qty = Math.floor(Math.random() * 90) + 10; // 10-99 범위의 2자리 숫자
  const amt = Math.floor(Math.random() * 900) + 100; // 100-999 범위의 3자리 숫자
  return { qty, amt: amt.toLocaleString() }; // amt는 천 단위 구분자(,) 포함
};

// 기본 데이터 구조 생성
export const generateInitialData = () => {
  const data: any[] = [];
  
  COUNTRIES.forEach(country => {
    // 각 모델별 데이터 생성을 위한 저장소
    const modelData: any[][] = [];
    
    // 각 국가별 모델 데이터 생성
    MODELS.forEach(model => {
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
  
  return data;
};
