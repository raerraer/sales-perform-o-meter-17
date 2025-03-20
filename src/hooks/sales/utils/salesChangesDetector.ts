
import { CellChange } from '../useSalesHistory';
import { getMonthFromColIndex } from '@/components/sales/history/historyUtils';

/**
 * 데이터 변경사항을 감지하고 변경 목록을 생성하는 유틸리티 함수
 * @param data 현재 데이터
 * @param originalData 원본 데이터
 * @returns 변경된 셀 목록
 */
export const detectDataChanges = (data: any[][], originalData: any[][]): CellChange[] => {
  const changes: CellChange[] = [];
  // 직접 변경된 셀 위치를 저장할 Set (행:열 형식)
  const directChanges = new Set<string>(); 
  
  // 1단계: 직접 변경된 셀 위치를 먼저 파악 (모델 수준 행만)
  for (let row = 0; row < data.length; row++) {
    // 모델1, 모델2 행인 경우만 확인 (직접 변경 가능한 행)
    if (data[row] && data[row][0] && 
        (data[row][0] === '모델1' || data[row][0] === '모델2') &&
        !data[row][0].includes('합계')) {
      
      for (let col = 1; col < data[row].length; col++) {
        // 비어있는 열이나 비고 열은 제외
        if (col === 0 || data[row][col] === undefined || data[row][col] === '' || 
            originalData[row][col] === undefined) {
          continue;
        }
      
        const originalValue = String(originalData[row][col]).replace(/,/g, '');
        const currentValue = String(data[row][col]).replace(/,/g, '');
        
        if (originalValue !== currentValue) {
          // 직접 변경된 셀 위치 기록
          directChanges.add(`${row}:${col}`);
        }
      }
    }
  }
  
  // 2단계: 실제 변경 사항 수집
  for (let row = 0; row < data.length; row++) {
    if (!data[row] || !data[row][0]) continue;
    
    for (let col = 1; col < data[row].length; col++) {
      if (col === 0 || data[row][col] === undefined || originalData[row][col] === undefined) {
        continue;
      }

      const originalValue = originalData[row][col];
      const currentValue = data[row][col];
      
      // 값이 변경되었는지 확인 (콤마 제거 후 비교)
      const normalizedOriginal = String(originalValue).replace(/,/g, '');
      const normalizedCurrent = String(currentValue).replace(/,/g, '');
      
      if (normalizedOriginal !== normalizedCurrent) {
        // 현재 셀이 직접 변경된 셀인지 확인
        const isDirectChange = directChanges.has(`${row}:${col}`);
        
        // 국가와 모델 정보 수집
        let country = '';
        let model = '';
        
        // 행 자체가 국가나 지역이면 직접 설정
        if (data[row][0] === '총 합계' || 
            data[row][0] === '미주' || 
            data[row][0] === '유럽' || 
            data[row][0] === '아시아' ||
            data[row][0].includes('합계')) {
          country = data[row][0];
        } 
        // 모델 행이면 모델 설정 및 국가 찾기
        else if (data[row][0] === '모델1' || data[row][0] === '모델2') {
          model = data[row][0];
          
          // 이 모델의 국가 찾기 (현재 행 위로 거슬러 올라가기)
          for (let i = row - 1; i >= 0; i--) {
            if (data[i] && data[i][0] && 
                (data[i][0] === '미국' || 
                 data[i][0] === '중국' || 
                 data[i][0] === '일본' ||
                 data[i][0] === '한국' ||
                 data[i][0] === '독일' ||
                 data[i][0] === '영국')) {
              country = data[i][0];
              break;
            }
          }
        }
        // 행 자체가 국가면 직접 설정
        else if (data[row][0] === '미국' || 
                data[row][0] === '중국' || 
                data[row][0] === '일본' ||
                data[row][0] === '한국' ||
                data[row][0] === '독일' ||
                data[row][0] === '영국') {
          country = data[row][0];
        }
        
        // 정확한 월 정보 계산
        const month = getMonthFromColIndex(col);
        
        // 항목 타입 (QTY/AMT) 결정
        const category = col % 2 === 0 ? 'AMT' : 'QTY';
        
        changes.push({
          row,
          col,
          oldValue: originalValue,
          newValue: currentValue,
          country,
          model,
          month,
          category: '전망',
          isDirectChange
        });
      }
    }
  }
  
  return changes;
};
