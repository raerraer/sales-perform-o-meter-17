
import { isQtyColumn, isAmtColumn, isRemarksColumn } from './validators';
import { formatQtyValue, formatAmtValue } from './dataTransformers';

/**
 * 셀 데이터 변경 핸들러
 * @param changes 변경된 셀 정보 배열
 * @param data 원본 데이터 배열
 * @returns 유효성 검사를 통과한 새 데이터 배열
 */
export function processDataChanges(changes: any, data: any[]): any[] {
  if (!changes || changes.length === 0) return data;
  
  const newData = [...data];
  
  changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
    const colIndex = Number(prop);
    
    // 비고 열인 경우 그대로 저장
    if (isRemarksColumn(colIndex)) {
      newData[row][colIndex] = newValue;
      return;
    }
    
    // Qty 열: 숫자만 허용
    if (isQtyColumn(colIndex)) {
      // 유효하지 않은 입력은 이전 값으로 복원
      try {
        newData[row][colIndex] = formatQtyValue(newValue);
      } catch (error) {
        newData[row][colIndex] = oldValue;
      }
    } 
    // Amt 열: 숫자만 허용 (천 단위 구분자 처리)
    else if (isAmtColumn(colIndex)) {
      try {
        newData[row][colIndex] = formatAmtValue(newValue);
      } catch (error) {
        newData[row][colIndex] = oldValue;
      }
    }
    // 그 외 컬럼은 그대로 저장
    else {
      newData[row][colIndex] = newValue;
    }
  });
  
  return newData;
}
