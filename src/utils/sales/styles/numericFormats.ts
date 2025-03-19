
/**
 * 숫자 형식 설정
 * @param col 열 인덱스
 * @returns 열에 적합한 숫자 형식 설정
 */
export const getNumericFormat = (col: number) => {
  const isRemarksColumn = (col - 1) % 11 === 10;
  if (!isRemarksColumn && col > 0) {
    if ((col - 1) % 2 === 0) {
      // Qty 열: 숫자 형식
      return {
        type: 'numeric',
        numericFormat: {
          pattern: '0,0',
          culture: 'ko-KR'
        }
      };
    } else {
      // Amt 열: 통화 형식
      return {
        type: 'numeric',
        numericFormat: {
          pattern: '0,0',
          culture: 'ko-KR'
        }
      };
    }
  }
  return {};
};
