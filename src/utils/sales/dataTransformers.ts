
/**
 * 데이터 변환을 위한 유틸리티 함수들
 */

/**
 * 문자열을 숫자로 변환 (콤마 제거 후)
 * @param value 변환할 문자열 값
 * @param defaultValue 기본값 (변환 실패 시)
 * @returns 변환된 숫자
 */
export const parseNumericValue = (value: any, defaultValue: number = 0): number => {
  // null, undefined, 빈 문자열인 경우 기본값 반환
  if (value === null || value === undefined || value === '') return defaultValue;
  
  // 문자열로 변환 후 콤마 제거
  const strValue = String(value).replace(/,/g, '');
  
  // 숫자로 변환
  const numValue = Number(strValue);
  
  // NaN인 경우만 기본값 반환, 0은 유효한 값으로 처리
  if (isNaN(numValue)) return defaultValue;
  
  return numValue;
};

/**
 * 숫자 값에 천 단위 구분자 적용
 * @param value 포맷할 숫자 값
 * @returns 천 단위 구분자가 적용된 문자열
 */
export const formatWithComma = (value: number): string => {
  return value.toLocaleString();
};

/**
 * 입력값을 Qty 열에 적합한 형식으로 변환
 * @param value 처리할 값
 * @returns 변환된 값 (숫자 문자열)
 */
export const formatQtyValue = (value: any): string => {
  // 0을 포함한 모든 숫자값 처리
  const numValue = parseNumericValue(value);
  return numValue.toString();
};

/**
 * 입력값을 Amt 열에 적합한 형식으로 변환
 * @param value 처리할 값
 * @returns 변환된 값 (천 단위 구분자 적용)
 */
export const formatAmtValue = (value: any): string => {
  // 0을 포함한 모든 숫자값 처리
  const numValue = parseNumericValue(value);
  return formatWithComma(numValue);
};
