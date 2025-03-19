
/**
 * 데이터 변환을 위한 유틸리티 함수들
 */

import { parseNumericValue } from './dataTransformers';

/**
 * 랜덤 데이터 생성 함수 (qty는 2자리, amt는 3자리로 생성)
 * @returns 생성된 qty, amt 객체
 */
export const generateRandomData = () => {
  const qty = Math.floor(Math.random() * 90) + 10; // 10-99 범위의 2자리 숫자
  const amt = Math.floor(Math.random() * 900) + 100; // 100-999 범위의 3자리 숫자
  return { qty, amt: amt.toLocaleString() }; // amt는 천 단위 구분자(,) 포함
};

/**
 * 셀 값에 대한 합계 계산 (Qty, Amt에 따라 다르게 처리)
 * @param rows 합계를 계산할 행들
 * @param colIndex 계산할 열 인덱스
 * @param isAmtColumn 금액 열 여부
 * @returns 계산된 합계 (문자열)
 */
export const calculateCellSum = (rows: any[], colIndex: number, isAmtColumn: boolean = false) => {
  const sum = rows.reduce((acc, row) => {
    const value = row[colIndex];
    return acc + parseNumericValue(value, 0);
  }, 0);
  
  return isAmtColumn ? sum.toLocaleString() : sum.toString();
};

/**
 * 모델 데이터 초기화
 * @param model 모델명
 * @returns 초기화된 모델 행 데이터
 */
export const initializeModelRow = (model: string) => {
  return [model];
};

/**
 * 모델 행에 월별 데이터 추가
 * @param modelRow 모델 행 데이터
 * @param monthCount 월 수
 * @param categoryCount 카테고리 수 (비고 제외)
 */
export const addMonthlyDataToModelRow = (modelRow: any[], monthCount: number, categoryCount: number) => {
  const updatedRow = [...modelRow];
  
  // 월별 데이터 생성
  for (let month = 0; month < monthCount; month++) {
    // 카테고리별 데이터 생성
    for (let category = 0; category < categoryCount; category++) {
      // 모든 월(짝수/홀수)에 대해 일관된 방식으로 랜덤 데이터 생성
      const { qty, amt } = generateRandomData();
      updatedRow.push(qty.toString());
      updatedRow.push(amt);
    }
    // 비고 칼럼 추가
    updatedRow.push('');
  }
  
  return updatedRow;
};
