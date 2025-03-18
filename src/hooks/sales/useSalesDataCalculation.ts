
import { COUNTRIES } from '@/utils/salesTableUtils';

export function recalculateCountryTotals(newData: any[]): any[] {
  const updatedData = [...newData];
  
  // 각 국가별 처리
  let currentCountryIndex = -1;
  
  for (let i = 0; i < updatedData.length; i++) {
    // 현재 행이 국가 행인지 확인
    if (COUNTRIES.includes(updatedData[i][0])) {
      currentCountryIndex = i;
      
      // 해당 국가의 모델 행 범위 찾기
      const modelRows: number[] = [];
      let j = i + 1;
      while (j < updatedData.length && !COUNTRIES.includes(updatedData[j][0])) {
        modelRows.push(j);
        j++;
      }
      
      // 각 셀에 대해 합계 계산
      for (let col = 1; col < updatedData[i].length; col++) {
        // 비고 열은 계산에서 제외
        if ((col - 1) % 11 === 10) continue;
        
        // Qty 열 또는 Amt 열인지 확인하여 합계 계산
        if ((col - 1) % 2 === 0) { // Qty 열
          const sum = modelRows.reduce((acc, rowIdx) => {
            return acc + (Number(updatedData[rowIdx][col]) || 0);
          }, 0);
          updatedData[currentCountryIndex][col] = sum.toString();
        } else { // Amt 열
          const sum = modelRows.reduce((acc, rowIdx) => {
            const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
            return acc + (Number(amtValue) || 0);
          }, 0);
          updatedData[currentCountryIndex][col] = sum.toLocaleString();
        }
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
