
import { CellChange } from '@/hooks/sales/useSalesHistory';

// 월 정보를 정확히 가져오는 함수
export const getMonthFromColIndex = (colIndex: number): string => {
  // 컬럼 인덱스는 0부터 시작, 실제 데이터 열은 1부터 시작
  // 2열씩 한 달을 나타냄 (홀수 열: QTY, 짝수 열: AMT)
  // 1,2열 = 1월, 3,4열 = 2월 ...
  const monthIndex = Math.floor((colIndex - 1) / 2) + 1;
  return `${monthIndex}월`;
};

// 변경 내역 필터링 함수 - 실제 변경된 값만 추출
export const filterChanges = (changes: CellChange[]): CellChange[] => {
  if (!changes || changes.length === 0) return [];
  
  // 실제 변경된 값만 필터링
  return changes.filter(change => {
    // 숫자로 변환하여 비교 (콤마 제거 후)
    const oldValueNormalized = String(change.oldValue || '').replace(/,/g, '');
    const newValueNormalized = String(change.newValue || '').replace(/,/g, '');
    return oldValueNormalized !== newValueNormalized;
  });
};

// 직접 변경한 셀만 추출하는 함수
export const getDirectChangesOnly = (changes: CellChange[]): CellChange[] => {
  if (!changes || changes.length === 0) return [];
  
  // 사용자가 직접 수정한 셀만 추출 (자동 계산된 합계 등은 제외)
  const directChanges = changes.filter(change => change.isDirectChange === true);
  
  // 직접 변경한 셀이 없다면 빈 배열 반환
  if (directChanges.length === 0) return [];
  
  // 정확한 월 정보 보정 - 직접 수정한 셀의 월 정보만 유지
  return directChanges.map(change => ({
    ...change,
    month: getMonthFromColIndex(change.col) // 직접 변경된 셀의 정확한 월 정보
  }));
};
