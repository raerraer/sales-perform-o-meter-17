
import { LEVELS, REGION_COUNTRIES } from '@/utils/sales';
import { parseNumericValue } from './dataTransformers';

/**
 * 지역별 데이터 합계 계산
 * @param data 처리할 데이터 배열
 * @returns 지역 데이터가 계산된 새 배열
 */
export function calculateRegionTotals(data: any[]): any[] {
  const updatedData = [...data];
  
  // 지역별 계산
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
      regionModelRows.forEach((modelRowIdx) => {
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
              return acc + parseNumericValue(updatedData[rowIdx][col], 0);
            }, 0);
            updatedData[modelRowIdx][col] = sum.toString();
          } else { // Amt 열
            const sum = countryModelRows.reduce((acc, rowIdx) => {
              return acc + parseNumericValue(updatedData[rowIdx][col], 0);
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
            return acc + parseNumericValue(updatedData[rowIdx][col], 0);
          }, 0);
          updatedData[regionIndex][col] = sum.toString();
        } else { // Amt 열
          const sum = regionModelRows.reduce((acc, rowIdx) => {
            return acc + parseNumericValue(updatedData[rowIdx][col], 0);
          }, 0);
          updatedData[regionIndex][col] = sum.toLocaleString();
        }
      }
    }
  });
  
  return updatedData;
}
