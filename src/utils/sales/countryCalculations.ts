
import { COUNTRIES } from '@/utils/sales';
import { parseNumericValue } from './dataTransformers';

/**
 * 국가별 데이터 합계 계산
 * @param data 처리할 데이터 배열
 * @returns 국가 데이터가 계산된 새 배열
 */
export function calculateCountryTotals(data: any[]): any[] {
  const updatedData = [...data];
  
  // 국가별 계산
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
            return acc + parseNumericValue(updatedData[rowIdx][col], 0);
          }, 0);
          updatedData[countryIndex][col] = sum.toString();
        } else { // Amt 열
          const sum = modelRows.reduce((acc, rowIdx) => {
            return acc + parseNumericValue(updatedData[rowIdx][col], 0);
          }, 0);
          updatedData[countryIndex][col] = sum.toLocaleString();
        }
      }
    }
  });
  
  return updatedData;
}
