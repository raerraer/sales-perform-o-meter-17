
import { LEVELS } from '@/utils/sales';
import { parseNumericValue } from './dataTransformers';

/**
 * 총 합계 데이터 계산
 * @param data 처리할 데이터 배열
 * @returns 총 합계가 계산된 새 배열
 */
export function calculateTotalSums(data: any[]): any[] {
  const updatedData = [...data];
  
  // 총 합계 계산
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
    totalModelRows.forEach((modelRowIdx) => {
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
            return acc + parseNumericValue(updatedData[rowIdx][col], 0);
          }, 0);
          updatedData[modelRowIdx][col] = sum.toString();
        } else { // Amt 열
          const sum = regionModelRows.reduce((acc, rowIdx) => {
            return acc + parseNumericValue(updatedData[rowIdx][col], 0);
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
          return acc + parseNumericValue(updatedData[rowIdx][col], 0);
        }, 0);
        updatedData[totalIndex][col] = sum.toString();
      } else { // Amt 열
        const sum = totalModelRows.reduce((acc, rowIdx) => {
          return acc + parseNumericValue(updatedData[rowIdx][col], 0);
        }, 0);
        updatedData[totalIndex][col] = sum.toLocaleString();
      }
    }
  }
  
  return updatedData;
}
