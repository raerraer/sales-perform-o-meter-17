
import { CellChange } from '@/hooks/sales/useSalesHistory';

// 월 정보를 정확히 가져오는 함수
export const getMonthFromColIndex = (colIndex: number): string => {
  // 컬럼 인덱스는 0부터 시작, 실제 데이터 열은 1부터 시작
  // 11열씩 한 달을 나타냄 (각 월별로 5개 카테고리 x 2 + 비고 1 = 11개 열)
  // 1~11열 = 1월, 12~22열 = 2월 ...
  
  // 정확한 월 계산 공식
  const monthIndex = Math.floor((colIndex - 1) / 11) + 1;
  
  console.log(`getMonthFromColIndex: 열=${colIndex}, 계산된 월=${monthIndex}`);
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

// 직접 변경한 셀만 추출하는 함수 - 완전히 개선된 버전
export const getDirectChangesOnly = (changes: CellChange[]): CellChange[] => {
  if (!changes || changes.length === 0) return [];
  
  // 1. 사용자가 직접 수정한 셀만 추출 (isDirectChange === true인 항목만)
  const directChanges = changes.filter(change => change.isDirectChange === true);
  
  // 2. 직접 변경한 셀이 없다면 빈 배열 반환
  if (directChanges.length === 0) return [];
  
  // 3. country와 model 필드가 있는 셀만 최종 필터링
  // - 국가와 모델 정보가 있는 직접 변경 셀만 추출 (자동 계산된 합계는 제외)
  return directChanges.filter(change => {
    // country가 직접 설정되어 있거나, model이 명확히 설정된 경우만 포함
    return change.country !== undefined && change.country !== "" && 
           change.country !== "총 합계" && 
           !["미주", "유럽", "아시아"].includes(change.country || "");
  });
};
