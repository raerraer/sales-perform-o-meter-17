
import { CellChange } from '../useSalesHistory';
import { getMonthFromColIndex } from '@/components/sales/history/historyUtils';

/**
 * 데이터 변경사항을 감지하고 변경 목록을 생성하는 유틸리티 함수
 * @param data 현재 데이터
 * @param originalData 원본 데이터
 * @returns 변경된 셀 목록
 */
export const detectDataChanges = (data: any[][], originalData: any[][]): CellChange[] => {
  if (!data || !originalData || data.length === 0 || originalData.length === 0) {
    console.warn('감지할 데이터가 비어있습니다');
    return [];
  }

  console.log('변경사항 감지 시작');
  const changes: CellChange[] = [];
  
  // 모델 행들을 돌면서 변경 사항 확인
  for (let row = 0; row < data.length; row++) {
    if (!data[row] || !data[row][0]) continue;
    
    // 모델1, 모델2 행인 경우만 변경 감지 (직접 변경 가능한 행)
    if (data[row][0] === '모델1' || data[row][0] === '모델2') {
      // 이 모델의 국가 찾기 (현재 행 위로 거슬러 올라가기)
      let country = '';
      for (let i = row - 1; i >= 0; i--) {
        if (data[i] && data[i][0] && 
            (data[i][0] === '미국' || 
             data[i][0] === '중국' || 
             data[i][0] === '일본' ||
             data[i][0] === '한국' ||
             data[i][0] === '독일' ||
             data[i][0] === '영국' ||
             data[i][0] === '이태리' ||
             data[i][0] === '캐나다')) {
          country = data[i][0];
          break;
        }
      }
      
      // 국가가 찾아진 경우에만 처리
      if (country) {
        const model = data[row][0]; // 모델명 저장
        
        // 데이터 열을 돌면서 변경 사항 확인 (1열부터 시작, 0열은 모델명)
        for (let col = 1; col < data[row].length; col++) {
          // 빈 셀은 무시
          if (data[row][col] === undefined || originalData[row][col] === undefined) {
            continue;
          }
          
          // 문자열로 변환하여 콤마 제거 후 비교 (숫자 비교를 위해)
          const originalValue = String(originalData[row][col] || '').replace(/,/g, '');
          const currentValue = String(data[row][col] || '').replace(/,/g, '');
          
          // 실제 값이 변경된 경우에만 변경 목록에 추가
          if (originalValue !== currentValue) {
            // 월 정보 가져오기
            const month = getMonthFromColIndex(col);
            
            // 항목 유형(QTY/AMT) 판단
            // 각 월 내 11개 열 중에서 홀수/짝수 위치로 판단
            const colInMonth = ((col - 1) % 11) + 1;
            const itemType = colInMonth % 2 === 0 ? 'AMT' : 'QTY';
            
            console.log(`변경 감지: 국가=${country}, 모델=${model}, 월=${month}, 열=${col}, 유형=${itemType}, 이전=${originalValue}, 현재=${currentValue}`);
            
            changes.push({
              row,
              col,
              oldValue: originalData[row][col],
              newValue: data[row][col],
              country,
              model,
              month,
              category: '전망',
              isDirectChange: true
            });
          }
        }
      }
    }
  }
  
  console.log(`총 ${changes.length}개의 변경사항 감지됨`);
  return changes;
};
