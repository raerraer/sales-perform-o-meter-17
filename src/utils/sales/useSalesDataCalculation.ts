
import { processDataChanges } from '@/utils/sales/dataChangeHandler';
import { calculateCountryTotals } from '@/utils/sales/countryCalculations';
import { calculateRegionTotals } from '@/utils/sales/regionCalculations';
import { calculateTotalSums } from '@/utils/sales/totalCalculations';

/**
 * 모든 레벨의 합계를 재계산
 * @param data 처리할 데이터 배열
 * @returns 모든 합계가 계산된 새 배열
 */
export function recalculateAllTotals(data: any[]): any[] {
  // 단계별로 계산 진행
  let updatedData = [...data];
  
  // 1. 국가 레벨 계산
  updatedData = calculateCountryTotals(updatedData);
  
  // 2. 지역 레벨 계산
  updatedData = calculateRegionTotals(updatedData);
  
  // 3. 총 합계 레벨 계산
  updatedData = calculateTotalSums(updatedData);
  
  return updatedData;
}

/**
 * 데이터 변경을 처리하고 모든 합계를 재계산
 * @param changes 변경된 셀 정보 배열
 * @param data 원본 데이터 배열
 * @returns 변경과 계산이 완료된 새 데이터 배열
 */
export function handleDataChange(changes: any, data: any[]): any[] {
  if (!changes || changes.length === 0) return data;
  
  // 1. 데이터 변경 처리 (유효성 검사 및 포맷팅)
  const newData = processDataChanges(changes, data);
  
  // 2. 모든 레벨의 합계 재계산
  return recalculateAllTotals(newData);
}
