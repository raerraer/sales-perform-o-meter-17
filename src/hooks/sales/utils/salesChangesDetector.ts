
import { CellChange } from '../useSalesHistory';
import { getMonthFromColIndex } from '@/components/sales/history/historyUtils';

/**
 * 데이터 변경사항을 감지하고 변경 목록을 생성하는 유틸리티 함수 - 성능 최적화 버전
 */
export const detectDataChanges = (data: any[][], originalData: any[][]): CellChange[] => {
  if (!data || !originalData || data.length === 0 || originalData.length === 0) {
    return [];
  }

  const changes: CellChange[] = [];
  const countryMap = new Map<number, string>(); // 행 인덱스 -> 국가명 매핑 캐시
  
  // 국가 정보 캐싱 (매번 반복 탐색 방지)
  for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i][0] && [
      '미국', '중국', '일본', '한국', '독일', '영국', '이태리', '캐나다'
    ].includes(data[i][0])) {
      countryMap.set(i, data[i][0]);
      console.log(`국가 캐싱: 행 ${i}, 국가=${data[i][0]}`);
    }
  }
  
  // 사용자 직접 변경 감지 및 추적 로직 (모델별)
  const directlyModifiedCells = new Set<string>();
  
  // 모델 행들을 돌면서 변경 사항 확인 (최적화된 방식)
  for (let row = 0; row < data.length; row++) {
    if (!data[row] || !data[row][0]) continue;
    
    // 모델1, 모델2 행인 경우만 변경 감지
    if (data[row][0] === '모델1' || data[row][0] === '모델2') {
      // 이 모델의 국가 찾기 (캐시된 정보 활용)
      let country = '';
      let currentRow = row - 1;
      
      // 현재 행의 바로 위로부터 위쪽으로 올라가면서 국가를 찾음
      while (currentRow >= 0) {
        if (countryMap.has(currentRow)) {
          country = countryMap.get(currentRow) || '';
          break;
        }
        currentRow--;
      }
      
      // 국가가 찾아진 경우에만 처리
      if (country) {
        const model = data[row][0];
        
        // 데이터 열을 돌면서 변경 사항 확인 (불필요한 처리 최소화)
        for (let col = 1; col < data[row].length; col++) {
          // 빈 셀이나 정의되지 않은 셀은 무시
          if (data[row][col] === undefined || originalData[row][col] === undefined) {
            continue;
          }
          
          // 문자열로 변환하여 콤마 제거 후 비교 (정확한 값 비교)
          const originalValue = String(originalData[row][col] || '').replace(/,/g, '').trim();
          const currentValue = String(data[row][col] || '').replace(/,/g, '').trim();
          
          // 실제 값이 변경된 경우에만 변경 목록에 추가
          if (originalValue !== currentValue) {
            // 월 정보 가져오기
            const month = getMonthFromColIndex(col);
            
            // 항목 유형(QTY/AMT) 판단
            const colInMonth = ((col - 1) % 11) + 1;
            const itemType = colInMonth % 2 === 0 ? 'AMT' : 'QTY';
            
            console.log(`변경 감지: 국가=${country}, 모델=${model}, 월=${month}, 유형=${itemType}, 이전값=${originalValue}, 새값=${currentValue}`);
            
            // 고유 식별자 생성 (국가:모델:월:유형)
            const cellKey = `${country}:${model}:${month}:${itemType}`;
            
            // 직접 수정된 셀 추적
            directlyModifiedCells.add(cellKey);
            
            // 변경 정보에 독립적인 식별자 추가 (확실한 구분을 위해)
            const changeId = `${country}:${model}:${month}:${itemType}:${row}:${col}`;
            
            // 필요한 정보만 포함하여 객체 생성 (불필요한 속성 제거)
            changes.push({
              row,
              col,
              oldValue: originalData[row][col],
              newValue: data[row][col],
              country,
              model,
              month,
              category: '전망',
              isDirectChange: true,
              changeId
            });
          }
        }
      }
    }
  }
  
  // 직접 수정된 셀만 최종 결과에 포함
  console.log(`총 감지된 변경: ${changes.length}개, 직접 수정 셀: ${directlyModifiedCells.size}개`);
  
  // 국가별 변경사항 로깅
  const countrySummary = new Map<string, number>();
  changes.forEach(change => {
    const country = change.country || '미지정';
    countrySummary.set(country, (countrySummary.get(country) || 0) + 1);
  });
  
  console.log('감지된 국가별 변경사항:');
  countrySummary.forEach((count, country) => {
    console.log(`${country}: ${count}개`);
  });
  
  return changes;
};
