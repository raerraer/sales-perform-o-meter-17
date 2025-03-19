import { COUNTRIES, COUNTRY_GROUPS, GROUPS, MODELS } from '@/utils/sales/constants';

// 그룹 및 국가 합계 행을 모두 재계산
export function recalculateCountryTotals(newData: any[]): any[] {
  const updatedData = [...newData];
  const dataMap: Record<string, number> = {};
  
  // 데이터 맵 생성 (인덱스 빠르게 검색하기 위함)
  updatedData.forEach((row, index) => {
    dataMap[row[0]] = index;
  });
  
  // 각 그룹별 처리
  GROUPS.forEach(group => {
    const countriesInGroup = COUNTRY_GROUPS[group];
    
    // 각 국가별 합계 계산
    countriesInGroup.forEach(country => {
      if (dataMap[country] === undefined) return;
      
      const countryIndex = dataMap[country];
      const modelIndices: number[] = [];
      
      // 해당 국가에 속한 모델 행 찾기
      let i = countryIndex + 1;
      while (i < updatedData.length && !COUNTRIES.includes(updatedData[i][0]) && !GROUPS.includes(updatedData[i][0])) {
        if (MODELS.includes(updatedData[i][0])) {
          modelIndices.push(i);
        }
        i++;
      }
      
      // 각 셀에 대해 합계 계산
      for (let col = 1; col < updatedData[countryIndex].length; col++) {
        // 비고 열은 계산에서 제외
        if ((col - 1) % 11 === 10) continue;
        
        // Qty 열 또는 Amt 열인지 확인하여 합계 계산
        if ((col - 1) % 2 === 0) { // Qty 열
          const sum = modelIndices.reduce((acc, rowIdx) => {
            return acc + (Number(updatedData[rowIdx][col]) || 0);
          }, 0);
          updatedData[countryIndex][col] = sum.toString();
        } else { // Amt 열
          const sum = modelIndices.reduce((acc, rowIdx) => {
            const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
            return acc + (Number(amtValue) || 0);
          }, 0);
          updatedData[countryIndex][col] = sum.toLocaleString();
        }
      }
    });
    
    // 그룹 인덱스 찾기
    if (dataMap[group] === undefined) return;
    const groupIndex = dataMap[group];
    
    // 해당 그룹의 모델별 합계 행 인덱스 찾기
    const modelGroupIndices: Record<string, number> = {};
    let j = groupIndex + 1;
    
    // 그룹 바로 다음에 오는 모델 그룹 행들 찾기
    while (j < updatedData.length && MODELS.includes(updatedData[j][0]) && !COUNTRIES.includes(updatedData[j][0])) {
      modelGroupIndices[updatedData[j][0]] = j;
      j++;
    }
    
    // 각 모델별 그룹 합계 계산
    MODELS.forEach(model => {
      if (modelGroupIndices[model] === undefined) return;
      
      const modelGroupIndex = modelGroupIndices[model];
      const countryModelIndices: number[] = [];
      
      // 각 국가의 해당 모델 행 찾기
      countriesInGroup.forEach(country => {
        if (dataMap[country] === undefined) return;
        
        const countryIndex = dataMap[country];
        let k = countryIndex + 1;
        
        while (k < updatedData.length && !COUNTRIES.includes(updatedData[k][0]) && !GROUPS.includes(updatedData[k][0])) {
          if (updatedData[k][0] === model) {
            countryModelIndices.push(k);
            break;
          }
          k++;
        }
      });
      
      // 각 셀에 대해 합계 계산
      for (let col = 1; col < updatedData[modelGroupIndex].length; col++) {
        // 비고 열은 계산에서 제외
        if ((col - 1) % 11 === 10) continue;
        
        // Qty 열 또는 Amt 열인지 확인하여 합계 계산
        if ((col - 1) % 2 === 0) { // Qty 열
          const sum = countryModelIndices.reduce((acc, rowIdx) => {
            return acc + (Number(updatedData[rowIdx][col]) || 0);
          }, 0);
          updatedData[modelGroupIndex][col] = sum.toString();
        } else { // Amt 열
          const sum = countryModelIndices.reduce((acc, rowIdx) => {
            const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
            return acc + (Number(amtValue) || 0);
          }, 0);
          updatedData[modelGroupIndex][col] = sum.toLocaleString();
        }
      }
    });
    
    // 그룹 전체 합계 계산
    for (let col = 1; col < updatedData[groupIndex].length; col++) {
      // 비고 열은 계산에서 제외
      if ((col - 1) % 11 === 10) continue;
      
      // Qty 열 또는 Amt 열인지 확인하여 합계 계산
      if ((col - 1) % 2 === 0) { // Qty 열
        const sum = countriesInGroup.reduce((acc, country) => {
          if (dataMap[country] === undefined) return acc;
          return acc + (Number(updatedData[dataMap[country]][col]) || 0);
        }, 0);
        updatedData[groupIndex][col] = sum.toString();
      } else { // Amt 열
        const sum = countriesInGroup.reduce((acc, country) => {
          if (dataMap[country] === undefined) return acc;
          const amtValue = updatedData[dataMap[country]][col] ? updatedData[dataMap[country]][col].toString().replace(/,/g, '') : '0';
          return acc + (Number(amtValue) || 0);
        }, 0);
        updatedData[groupIndex][col] = sum.toLocaleString();
      }
    }
  });
  
  return updatedData;
}

export function handleDataChange(changes: any, data: any[]): any[] {
  if (!changes || changes.length === 0) return data;
  
  const newData = [...data];
  
  changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
    // 비고 열이 아닌 경우에 데이터 유효성 검사
    const colIndex = Number(prop);
    const isRemarksColumn = (colIndex - 1) % 11 === 10;
    
    // 수정된 셀이 모델1 또는 모델2 행에 있는지 확인
    const isModelRow = MODELS.includes(newData[row][0]);
    
    // 모델 행이 아니면 수정하지 않음 (국가, 그룹 행은 수정 불가)
    if (!isModelRow && !isRemarksColumn) {
      newData[row][colIndex] = oldValue;
      return;
    }
    
    if (!isRemarksColumn) {
      // Qty 열: 숫자만 허용
      if ((colIndex - 1) % 2 === 0) {
        // 숫자가 아닌 입력은 이전 값으로 복원
        if (isNaN(Number(newValue)) || newValue === '') {
          newData[row][colIndex] = oldValue;
          return;
        }
        // 숫자로 변환하여 저장
        newData[row][colIndex] = Number(newValue).toString();
      } 
      // Amt 열: 숫자만 허용 (천 단위 구분자 처리)
      else {
        // 콤마 제거 후 숫자 여부 확인
        const cleanValue = newValue?.toString().replace(/,/g, '');
        if (isNaN(Number(cleanValue)) || cleanValue === '') {
          newData[row][colIndex] = oldValue;
          return;
        }
        // 숫자로 변환 후 천 단위 구분자 추가하여 저장
        newData[row][colIndex] = Number(cleanValue).toLocaleString();
      }
    } else {
      // 비고 열: 그대로 저장
      newData[row][colIndex] = newValue;
    }
  });
  
  // 국가 행 및 그룹 행 합계 재계산
  return recalculateCountryTotals(newData);
}
