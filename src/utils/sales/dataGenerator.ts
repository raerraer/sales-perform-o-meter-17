
import { MONTHS, CATEGORIES, COUNTRIES, MODELS, COUNTRY_GROUPS, GROUPS } from './constants';

// 랜덤 데이터 생성 함수 (qty는 2자리, amt는 3자리로 생성)
const generateRandomData = () => {
  const qty = Math.floor(Math.random() * 90) + 10; // 10-99 범위의 2자리 숫자
  const amt = Math.floor(Math.random() * 900) + 100; // 100-999 범위의 3자리 숫자
  return { qty, amt: amt.toLocaleString() }; // amt는 천 단위 구분자(,) 포함
};

// 기본 데이터 구조 생성
export const generateInitialData = () => {
  const data: any[] = [];
  
  // 그룹별 처리
  GROUPS.forEach(group => {
    const countriesInGroup = COUNTRY_GROUPS[group];
    const groupDataByModel: Record<string, any[][]> = {};
    
    // 각 모델에 대한 그룹 데이터 저장소 초기화
    MODELS.forEach(model => {
      groupDataByModel[model] = [];
    });
    
    // 그룹 합계 행 (전체 합계)
    const groupRow = [`${group}`];
    
    // 그룹에 속한 국가들 처리
    countriesInGroup.forEach(country => {
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
        
        // 해당 모델의 그룹 데이터에 추가
        groupDataByModel[model].push([...row]);
      });
      
      // 국가 합계 행 생성
      const countryRow = [country];
      
      // 12개월에 대한 국가 합계 계산
      for (let month = 0; month < MONTHS.length; month++) {
        for (let category = 0; category < CATEGORIES.length - 1; category++) {
          // 해당 월/카테고리의 Qty 합계 계산 (각 모델의 해당 위치 값 합산)
          const qtySum = modelData.reduce((sum, modelRow) => {
            const idx = 1 + month * 11 + category * 2;
            return sum + (Number(modelRow[idx] || 0));
          }, 0);
          
          // 해당 월/카테고리의 Amt 합계 계산
          const amtSum = modelData.reduce((sum, modelRow) => {
            const idx = 1 + month * 11 + category * 2 + 1;
            const amtValue = modelRow[idx] ? modelRow[idx].toString().replace(/,/g, '') : '0';
            return sum + (Number(amtValue));
          }, 0);
          
          countryRow.push(qtySum.toString());
          countryRow.push(amtSum.toLocaleString());
        }
        // 비고 칼럼
        countryRow.push('');
      }
      
      // 국가 데이터를 최종 데이터 배열에 추가
      data.push(countryRow);
      
      // 해당 국가의 모델 행들 추가
      modelData.forEach(modelRow => {
        data.push(modelRow);
      });
    });
    
    // 각 모델별 그룹 합계 행 생성 및 데이터 배열 앞에 추가
    const modelGroupRows: any[] = [];
    
    MODELS.forEach(model => {
      const modelGroupRow = [`${model}`];
      const modelRows = groupDataByModel[model];
      
      // 12개월에 대한 모델별 그룹 합계 계산
      for (let month = 0; month < MONTHS.length; month++) {
        for (let category = 0; category < CATEGORIES.length - 1; category++) {
          // 해당 월/카테고리의 Qty 합계 계산
          const qtySum = modelRows.reduce((sum, row) => {
            const idx = 1 + month * 11 + category * 2;
            return sum + (Number(row[idx] || 0));
          }, 0);
          
          // 해당 월/카테고리의 Amt 합계 계산
          const amtSum = modelRows.reduce((sum, row) => {
            const idx = 1 + month * 11 + category * 2 + 1;
            const amtValue = row[idx] ? row[idx].toString().replace(/,/g, '') : '0';
            return sum + (Number(amtValue));
          }, 0);
          
          modelGroupRow.push(qtySum.toString());
          modelGroupRow.push(amtSum.toLocaleString());
        }
        // 비고 칼럼
        modelGroupRow.push('');
      }
      
      modelGroupRows.push(modelGroupRow);
    });
    
    // 그룹 전체 합계 행 계산
    for (let month = 0; month < MONTHS.length; month++) {
      for (let category = 0; category < CATEGORIES.length - 1; category++) {
        // 해당 월/카테고리의 Qty 합계 계산 (각 국가의 합계 행에서 합산)
        let qtySum = 0;
        let amtSum = 0;
        
        countriesInGroup.forEach(country => {
          // 데이터 배열에서 해당 국가 행의 인덱스 찾기
          const countryIndex = data.findIndex(row => row[0] === country);
          if (countryIndex !== -1) {
            const qtyIdx = 1 + month * 11 + category * 2;
            const amtIdx = qtyIdx + 1;
            
            qtySum += Number(data[countryIndex][qtyIdx] || 0);
            const amtValue = data[countryIndex][amtIdx] ? data[countryIndex][amtIdx].toString().replace(/,/g, '') : '0';
            amtSum += Number(amtValue);
          }
        });
        
        groupRow.push(qtySum.toString());
        groupRow.push(amtSum.toLocaleString());
      }
      // 비고 칼럼
      groupRow.push('');
    }
    
    // 그룹 데이터 삽입 순서:
    // 1. 그룹 전체 합계 행
    const insertIndex = data.findIndex(row => row[0] === countriesInGroup[0]);
    data.splice(insertIndex, 0, groupRow);
    
    // 2. 모델별 그룹 합계 행
    let currentIndex = insertIndex + 1;
    modelGroupRows.forEach(row => {
      data.splice(currentIndex, 0, row);
      currentIndex++;
    });
  });
  
  return data;
};
