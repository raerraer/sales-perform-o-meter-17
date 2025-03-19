
/**
 * 데이터 유효성 검사를 위한 유틸리티 함수들
 */

/**
 * 숫자 입력값 검증
 * @param value 검증할 값
 * @returns 유효한 숫자인지 여부
 */
export const isValidNumberInput = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  const numericValue = String(value).replace(/,/g, '');
  return !isNaN(Number(numericValue));
};

/**
 * 편집 가능한 셀인지 확인
 * @param colIndex 열 인덱스
 * @returns 편집 가능 여부
 */
export const isEditableColumn = (colIndex: number): boolean => {
  const isRemarksColumn = (colIndex - 1) % 11 === 10;
  return true; // 현재는 모든 열이 편집 가능하지만, 필요시 제한 가능
};

/**
 * 주어진 열의 유형이 Qty인지 확인
 * @param colIndex 열 인덱스
 * @returns Qty 열 여부
 */
export const isQtyColumn = (colIndex: number): boolean => {
  return colIndex > 0 && (colIndex - 1) % 2 === 0 && (colIndex - 1) % 11 !== 10;
};

/**
 * 주어진 열의 유형이 Amt인지 확인
 * @param colIndex 열 인덱스
 * @returns Amt 열 여부
 */
export const isAmtColumn = (colIndex: number): boolean => {
  return colIndex > 0 && (colIndex - 1) % 2 === 1 && (colIndex - 1) % 11 !== 10;
};

/**
 * 주어진 열의 유형이 비고인지 확인
 * @param colIndex 열 인덱스
 * @returns 비고 열 여부
 */
export const isRemarksColumn = (colIndex: number): boolean => {
  return (colIndex - 1) % 11 === 10;
};
