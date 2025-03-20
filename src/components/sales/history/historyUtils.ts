
import { CellChange } from '@/hooks/sales/useSalesHistory';

// 월 정보를 정확히 가져오는 함수
export const getMonthFromColIndex = (colIndex: number): string => {
  // 월 인덱스 계산 (2개 열마다 1개월): 1,2열은 1월, 3,4열은 2월, ...
  const monthIndex = Math.floor(colIndex / 2) + 1;
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
  
  // 직접 수정된 셀만 추출 (자동 계산된 합계 등은 제외)
  return changes.filter(change => change.isDirectChange === true);
};
