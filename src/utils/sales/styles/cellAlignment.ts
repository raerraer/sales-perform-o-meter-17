
import { COUNTRIES, LEVELS } from '../constants';

/**
 * 셀 정렬 클래스 설정
 * @param col 열 인덱스
 * @param row 행 인덱스
 * @param data 데이터 배열
 * @returns 정렬 클래스명
 */
export const getCellAlignmentClass = (col: number, row: number, data: any[][]) => {
  // 비고 열은 왼쪽 정렬
  const isRemarksColumn = (col - 1) % 11 === 10;
  if (isRemarksColumn) {
    return 'cell-left';
  }
  
  // 첫 번째 열(국가/모델명)은 오른쪽 정렬
  if (col === 0) {
    // 국가/지역/총 합계 행의 첫 번째 열은 중앙 정렬
    if (COUNTRIES.includes(data[row][0]) || LEVELS.REGIONS.includes(data[row][0]) || data[row][0] === LEVELS.TOTAL) {
      return 'cell-center';
    }
    return 'cell-right';
  }
  
  // 기본값은 중앙 정렬
  return 'cell-center';
};
