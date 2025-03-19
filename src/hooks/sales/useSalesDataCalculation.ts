
import { COUNTRIES, LEVELS, REGION_COUNTRIES } from '@/utils/salesTableUtils';

export function recalculateCountryTotals(newData: any[]): any[] {
  const updatedData = [...newData];
  
  // 1. 먼저 국가별 계산
  COUNTRIES.forEach(country => {
    const countryIndex = updatedData.findIndex(row => row[0] === country);
    if (countryIndex !== -1) {
      // 해당 국가의 모델 행 범위 찾기
      const modelRows: number[] = [];
      let j = countryIndex + 1;
      while (j < updatedData.length && (updatedData[j][0] === '모델1' || updatedData[j][0] === '모델2')) {
        modelRows.push(j);
        j++;
      }
      
      // 각 셀에 대해 합계 계산
      for (let col = 1; col < updatedData[countryIndex].length; col++) {
        // 비고 열은 계산에서 제외
        if ((col - 1) % 11 === 10) continue;
        
        // Qty 열 또는 Amt 열인지 확인하여 합계 계산
        if ((col - 1) % 2 === 0) { // Qty 열
          const sum = modelRows.reduce((acc, rowIdx) => {
            return acc + (Number(updatedData[rowIdx][col]) || 0);
          }, 0);
          updatedData[countryIndex][col] = sum.toString();
        } else { // Amt 열
          const sum = modelRows.reduce((acc, rowIdx) => {
            const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
            return acc + (Number(amtValue) || 0);
          }, 0);
          updatedData[countryIndex][col] = sum.toLocaleString();
        }
      }
    }
  });
  
  // 2. 지역별 계산
  LEVELS.REGIONS.forEach(region => {
    const regionIndex = updatedData.findIndex(row => row[0] === region);
    
    if (regionIndex !== -1) {
      // 지역 내 모델 행 찾기
      const regionModelRows: number[] = [];
      let j = regionIndex + 1;
      while (j < updatedData.length && (updatedData[j][0] === '모델1' || updatedData[j][0] === '모델2')) {
        regionModelRows.push(j);
        j++;
      }
      
      // 지역 내 국가 행 찾기
      const regionCountries = REGION_COUNTRIES[region];
      const countryIndices: number[] = [];
      
      regionCountries.forEach(country => {
        const idx = updatedData.findIndex(row => row[0] === country);
        if (idx !== -1) {
          countryIndices.push(idx);
        }
      });
      
      // 지역 모델 행 데이터 계산
      regionModelRows.forEach((modelRowIdx, idx) => {
        const modelType = updatedData[modelRowIdx][0]; // 모델1 또는 모델2
        
        // 해당 모델 타입의 국가별 모델 행 찾기
        const countryModelRows: number[] = [];
        
        countryIndices.forEach(countryIdx => {
          // 각 국가 아래의 모델 행 찾기
          let j = countryIdx + 1;
          while (j < updatedData.length && (updatedData[j][0] === '모델1' || updatedData[j][0] === '모델2')) {
            if (updatedData[j][0] === modelType) {
              countryModelRows.push(j);
            }
            j++;
          }
        });
        
        // 각 셀에 대해 합계 계산
        for (let col = 1; col < updatedData[modelRowIdx].length; col++) {
          // 비고 열은 계산에서 제외
          if ((col - 1) % 11 === 10) continue;
          
          // Qty 열 또는 Amt 열인지 확인하여 합계 계산
          if ((col - 1) % 2 === 0) { // Qty 열
            const sum = countryModelRows.reduce((acc, rowIdx) => {
              return acc + (Number(updatedData[rowIdx][col]) || 0);
            }, 0);
            updatedData[modelRowIdx][col] = sum.toString();
          } else { // Amt 열
            const sum = countryModelRows.reduce((acc, rowIdx) => {
              const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
              return acc + (Number(amtValue) || 0);
            }, 0);
            updatedData[modelRowIdx][col] = sum.toLocaleString();
          }
        }
      });
      
      // 지역 행 합계 계산 (지역 모델 행들의 합)
      for (let col = 1; col < updatedData[regionIndex].length; col++) {
        // 비고 열은 계산에서 제외
        if ((col - 1) % 11 === 10) continue;
        
        // Qty 열 또는 Amt 열인지 확인하여 합계 계산
        if ((col - 1) % 2 === 0) { // Qty 열
          const sum = regionModelRows.reduce((acc, rowIdx) => {
            return acc + (Number(updatedData[rowIdx][col]) || 0);
          }, 0);
          updatedData[regionIndex][col] = sum.toString();
        } else { // Amt 열
          const sum = regionModelRows.reduce((acc, rowIdx) => {
            const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
            return acc + (Number(amtValue) || 0);
          }, 0);
          updatedData[regionIndex][col] = sum.toLocaleString();
        }
      }
    }
  });
  
  // 3. 총 합계 계산
  const totalIndex = updatedData.findIndex(row => row[0] === LEVELS.TOTAL);
  
  if (totalIndex !== -1) {
    // 총 합계 내 모델 행 찾기
    const totalModelRows: number[] = [];
    let j = totalIndex + 1;
    while (j < updatedData.length && (updatedData[j][0] === '모델1' || updatedData[j][0] === '모델2')) {
      totalModelRows.push(j);
      j++;
    }
    
    // 지역 행 찾기
    const regionIndices = LEVELS.REGIONS.map(region => 
      updatedData.findIndex(row => row[0] === region)
    ).filter(idx => idx !== -1);
    
    // 총 합계 모델 행 데이터 계산
    totalModelRows.forEach((modelRowIdx, idx) => {
      const modelType = updatedData[modelRowIdx][0]; // 모델1 또는 모델2
      
      // 해당 모델 타입의 지역별 모델 행 찾기
      const regionModelRows: number[] = [];
      
      regionIndices.forEach(regionIdx => {
        // 각 지역 아래의 모델 행 찾기
        let j = regionIdx + 1;
        while (j < updatedData.length && (updatedData[j][0] === '모델1' || updatedData[j][0] === '모델2')) {
          if (updatedData[j][0] === modelType) {
            regionModelRows.push(j);
          }
          j++;
        }
      });
      
      // 각 셀에 대해 합계 계산
      for (let col = 1; col < updatedData[modelRowIdx].length; col++) {
        // 비고 열은 계산에서 제외
        if ((col - 1) % 11 === 10) continue;
        
        // Qty 열 또는 Amt 열인지 확인하여 합계 계산
        if ((col - 1) % 2 === 0) { // Qty 열
          const sum = regionModelRows.reduce((acc, rowIdx) => {
            return acc + (Number(updatedData[rowIdx][col]) || 0);
          }, 0);
          updatedData[modelRowIdx][col] = sum.toString();
        } else { // Amt 열
          const sum = regionModelRows.reduce((acc, rowIdx) => {
            const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
            return acc + (Number(amtValue) || 0);
          }, 0);
          updatedData[modelRowIdx][col] = sum.toLocaleString();
        }
      }
    });
    
    // 총 합계 행 계산 (총 합계 모델 행들의 합)
    for (let col = 1; col < updatedData[totalIndex].length; col++) {
      // 비고 열은 계산에서 제외
      if ((col - 1) % 11 === 10) continue;
      
      // Qty 열 또는 Amt 열인지 확인하여 합계 계산
      if ((col - 1) % 2 === 0) { // Qty 열
        const sum = totalModelRows.reduce((acc, rowIdx) => {
          return acc + (Number(updatedData[rowIdx][col]) || 0);
        }, 0);
        updatedData[totalIndex][col] = sum.toString();
      } else { // Amt 열
        const sum = totalModelRows.reduce((acc, rowIdx) => {
          const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
          return acc + (Number(amtValue) || 0);
        }, 0);
        updatedData[totalIndex][col] = sum.toLocaleString();
      }
    }
  }
  
  return updatedData;
}

export function handleDataChange(changes: any, data: any[]): any[] {
  if (!changes || changes.length === 0) return data;
  
  const newData = [...data];
  
  changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
    // 비고 열이 아닌 경우에 데이터 유효성 검사
    const colIndex = Number(prop);
    const isRemarksColumn = (colIndex - 1) % 11 === 10;
    
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
  
  // 국가 행 합계 재계산
  return recalculateCountryTotals(newData);
}
