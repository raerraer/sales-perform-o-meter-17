
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
  if (value === null || value === undefined || value === '') return defaultValue;
  
  // "2"와 같은 표시 값 처리
  if (value === "2") return defaultValue;
  
  const strValue = String(value).replace(/,/g, '');
  const numValue = Number(strValue);
  
  // NaN이거나 비정상적으로 작은 값인 경우 기본값 반환
  if (isNaN(numValue) || numValue < 1) return defaultValue;
  
  return numValue;
};

/**
 * 숫자 값에 천 단위 구분자 적용
 * @param value 포맷할 숫자 값
 * @returns 천 단위 구분자가 적용된 문자열
 */
export const formatWithComma = (value: number): string => {
  // 값이 100 미만이면 최소값 100으로 설정
  const validValue = value < 100 ? 100 : value;
  return validValue.toLocaleString();
};

/**
 * 입력값을 Qty 열에 적합한 형식으로 변환
 * @param value 처리할 값
 * @returns 변환된 값 (숫자 문자열)
 */
export const formatQtyValue = (value: any): string => {
  const numValue = parseNumericValue(value);
  
  // 최소값 설정 (10 미만이면 10으로)
  const validValue = numValue < 10 ? 10 : numValue;
  return validValue.toString();
};

/**
 * 입력값을 Amt 열에 적합한 형식으로 변환
 * @param value 처리할 값
 * @returns 변환된 값 (천 단위 구분자 적용)
 */
export const formatAmtValue = (value: any): string => {
  const numValue = parseNumericValue(value);
  
  // 최소값 설정 (100 미만이면 100으로)
  const validValue = numValue < 100 ? 100 : numValue;
  return formatWithComma(validValue);
};
