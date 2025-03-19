
import { LEVELS } from '@/utils/sales';
import { parseNumericValue, formatQtyValue, formatAmtValue } from './dataTransformers';

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
    
    // 지역별 모델 행 인덱스 맵 생성
    const regionModelIndicesMap: { [modelType: string]: number[] } = {
      '모델1': [],
      '모델2': []
    };
    
    // 각 지역별로 모델 행 인덱스 찾기
    regionIndices.forEach(regionIdx => {
      let j = regionIdx + 1;
      while (j < updatedData.length && (updatedData[j][0] === '모델1' || updatedData[j][0] === '모델2')) {
        regionModelIndicesMap[updatedData[j][0]].push(j);
        j++;
      }
    });
    
    // 총 합계의 각 모델 행 계산
    totalModelRows.forEach(modelRowIdx => {
      const modelType = updatedData[modelRowIdx][0]; // 모델1 또는 모델2
      const regionModelIndices = regionModelIndicesMap[modelType];
      
      // 각 열에 대해 지역 모델 행들의 합계 계산
      for (let col = 1; col < updatedData[modelRowIdx].length; col++) {
        // 비고 열은 계산에서 제외
        if ((col - 1) % 11 === 10) continue;
        
        const isQtyColumn = (col - 1) % 2 === 0;
        
        // 지역 모델 행들의 합계 계산
        const sum = regionModelIndices.reduce((acc, idx) => {
          const cellValue = updatedData[idx][col];
          return acc + parseNumericValue(cellValue, 0);
        }, 0);
        
        // 계산된 합계 설정 (Qty 또는 Amt 형식에 맞게)
        if (isQtyColumn) {
          updatedData[modelRowIdx][col] = formatQtyValue(sum);
        } else {
          updatedData[modelRowIdx][col] = formatAmtValue(sum);
        }
      }
    });
    
    // 총 합계 행 계산 (총 합계 모델 행들의 합)
    for (let col = 1; col < updatedData[totalIndex].length; col++) {
      // 비고 열은 계산에서 제외
      if ((col - 1) % 11 === 10) continue;
      
      const isQtyColumn = (col - 1) % 2 === 0;
      
      // 총 합계 내 모델 행들의 합계 계산
      const sum = totalModelRows.reduce((acc, idx) => {
        const cellValue = updatedData[idx][col];
        return acc + parseNumericValue(cellValue, 0);
      }, 0);
      
      // 계산된 합계 설정 (Qty 또는 Amt 형식에 맞게)
      if (isQtyColumn) {
        updatedData[totalIndex][col] = formatQtyValue(sum);
      } else {
        updatedData[totalIndex][col] = formatAmtValue(sum);
      }
    }
  }
  
  return updatedData;
}
