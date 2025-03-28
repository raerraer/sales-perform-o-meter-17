
import { CellChange } from '@/hooks/sales/useSalesHistory';

// 월 정보를 정확히 가져오는 함수
export const getMonthFromColIndex = (colIndex: number): string => {
  // 컬럼 인덱스는 0부터 시작, 실제 데이터 열은 1부터 시작
  // 11열씩 한 달을 나타냄 (각 월별로 5개 카테고리 x 2 + 비고 1 = 11개 열)
  // 1~11열 = 1월, 12~22열 = 2월 ...
  
  // 정확한 월 계산 공식
  const monthIndex = Math.floor((colIndex - 1) / 11) + 1;
  
  console.log(`getMonthFromColIndex: 열=${colIndex}, 계산된 월=${monthIndex}월`);
  return `${monthIndex}월`;
};

// 변경 내역 필터링 함수 - 실제 변경된 값만 추출
export const filterChanges = (changes: CellChange[]): CellChange[] => {
  if (!changes || changes.length === 0) return [];
  
  // 실제 변경된 값만 필터링
  return changes.filter(change => {
    // 숫자로 변환하여 비교 (콤마 제거 후)
    const oldValueNormalized = String(change.oldValue || '').replace(/,/g, '').trim();
    const newValueNormalized = String(change.newValue || '').replace(/,/g, '').trim();
    return oldValueNormalized !== newValueNormalized;
  });
};

// 직접 변경한 셀만 추출하는 함수
export const getDirectChangesOnly = (changes: CellChange[]): CellChange[] => {
  if (!changes || changes.length === 0) return [];
  
  console.log(`변경 필터링 시작: 총 ${changes.length}개`);
  
  // 1. 사용자가 직접 수정한 셀만 추출 (isDirectChange === true인 항목만)
  const directChanges = changes.filter(change => change.isDirectChange === true);
  
  console.log(`직접 변경된 셀: ${directChanges.length}개`);
  
  // 2. 직접 변경한 셀이 없다면 빈 배열 반환
  if (directChanges.length === 0) return [];
  
  // 3. 유효한 국가와 모델 정보가 있는 셀만 최종 필터링
  const validChanges = directChanges.filter(change => {
    const hasValidCountry = change.country && 
                           change.country !== "" && 
                           change.country !== "총 합계" &&
                           !["미주", "유럽", "아시아"].includes(change.country || "");
    
    const hasValidModel = change.model && (change.model === "모델1" || change.model === "모델2");
    
    // 변경 정보 확인을 위한 디버깅 로그 추가
    console.log(`변경 확인: 국가=${change.country}, 모델=${change.model}, 유효=${hasValidCountry && hasValidModel}`);
    
    if (!hasValidCountry || !hasValidModel) {
      console.log(`제외된 변경: 국가=${change.country}, 모델=${change.model}`);
    }
    
    return hasValidCountry && hasValidModel;
  });
  
  console.log(`최종 유효한 변경: ${validChanges.length}개`);
  
  // 4. 중복 제거 및 국가별로 변경사항을 정확히 분류
  const uniqueChanges: CellChange[] = [];
  const seenCells = new Set<string>();
  
  // 5. 고유 식별자를 기준으로 중복 제거 (최신값 유지)
  validChanges.forEach(change => {
    // 고유 식별자 추출 또는 생성
    const cellKey = change.changeId || 
                    `${change.country}:${change.model}:${change.month}:${change.col % 2 === 0 ? 'AMT' : 'QTY'}`;
    
    // 이미 처리한 셀이면 건너뛰기 (중복 제거)
    if (seenCells.has(cellKey)) {
      console.log(`중복 제거된 변경: ${cellKey}`);
      return;
    }
    
    // 새로운 고유 셀 추가
    uniqueChanges.push(change);
    seenCells.add(cellKey);
    console.log(`추가된 변경: ${cellKey}`);
  });
  
  // 6. 각 국가별 변경 사항 개수 출력 (디버깅용)
  const countryChanges = new Map<string, number>();
  uniqueChanges.forEach(change => {
    const country = change.country || '미지정';
    countryChanges.set(country, (countryChanges.get(country) || 0) + 1);
  });
  
  // 국가별 변경 통계 출력
  console.log('국가별 변경 통계:');
  countryChanges.forEach((count, country) => {
    console.log(`${country}: ${count}개`);
  });
  
  return uniqueChanges;
};
