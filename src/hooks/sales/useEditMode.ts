
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CellChange } from './useSalesHistory';

export interface UseEditModeReturn {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  toggleEditMode: (
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => void;
  saveChanges: (
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    currentVersion: string,
    addVersionHistory: (historyEntry: any) => void,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setIsEditMode: (isEditMode: boolean) => void,
    clearHighlighting: () => void
  ) => void;
  getChangesFromData: (data: any[][], originalData: any[][]) => CellChange[];
}

export function useEditMode(): UseEditModeReturn {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // 변경된 셀 목록 추출 함수
  const getChangesFromData = useCallback((data: any[][], originalData: any[][]): CellChange[] => {
    const changes: CellChange[] = [];
    const directChanges = new Set<string>(); // 직접 변경된 셀 위치를 추적
    
    // 먼저 직접 변경된 셀만 식별
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        // 국가/모델 셀이거나 합계 행은 건너뜀
        if (col === 0 || 
            (data[row][0] && (
              data[row][0].includes('합계') || 
              data[row][0] === '총 합계' || 
              data[row][0] === '미주' || 
              data[row][0] === '유럽' || 
              data[row][0] === '아시아'
            ))
          ) {
          continue;
        }

        if (originalData[row] && originalData[row][col] !== undefined) {
          const originalValue = originalData[row][col];
          const currentValue = data[row][col];
          
          // 값이 변경된 경우만 추적 (문자열로 변환하여 비교)
          const normalizedOriginal = String(originalValue).replace(/,/g, '');
          const normalizedCurrent = String(currentValue).replace(/,/g, '');
          
          if (normalizedOriginal !== normalizedCurrent) {
            // 직접 변경 셀만 추적
            if (!data[row][0].includes('합계') && col > 0) {
              directChanges.add(`${row}:${col}`);
            }
          }
        }
      }
    }
    
    // 직접 변경과 자동 계산된 변경을 구분하여 기록
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (originalData[row] && originalData[row][col] !== undefined) {
          const originalValue = originalData[row][col];
          const currentValue = data[row][col];
          
          // 값이 변경된 경우만 기록 (문자열로 변환하여 비교)
          const normalizedOriginal = String(originalValue).replace(/,/g, '');
          const normalizedCurrent = String(currentValue).replace(/,/g, '');
          
          if (normalizedOriginal !== normalizedCurrent) {
            const isDirectChange = directChanges.has(`${row}:${col}`);
            
            // 국가 또는 모델 정보 추출
            let country = '';
            let model = '';
            
            // 직접 셀 위치로부터 국가/모델 정보 결정
            if (data[row] && data[row][0]) {
              if (data[row][0].includes('합계') || 
                  data[row][0] === '총 합계' || 
                  data[row][0] === '미주' || 
                  data[row][0] === '유럽' || 
                  data[row][0] === '아시아') {
                // 지역 또는 합계 행
                country = data[row][0];
              } else {
                // 국가 또는 모델 행
                model = data[row][0];
                
                // 상위 행에서 국가 정보 찾기
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
            }
            
            // 정확한 월과 항목(QTY/AMT) 결정
            const monthIndex = Math.ceil(col / 2); // 2개 열(Qty, Amt)당 1개월
            const month = `${monthIndex}월`;
            const itemType = col % 2 === 1 ? 'QTY' : 'AMT';
            
            changes.push({
              row,
              col,
              oldValue: originalValue,
              newValue: currentValue,
              country,
              model,
              month,
              category: '전망', // 기본값은 '전망'으로 설정
              isDirectChange // 직접 변경 여부 표시
            });
          }
        }
      }
    }
    
    return changes;
  }, []);

  // 편집 모드 토글 함수
  const toggleEditMode = useCallback((
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => {
    setIsEditMode(prev => {
      if (!prev) {
        // 편집 모드 진입 시 현재 데이터를 원본으로 저장
        setOriginalData(JSON.parse(JSON.stringify(data)));
      } else {
        // 편집 모드 종료 시
        if (window.confirm('변경 내용을 저장하지 않고 편집 모드를 종료하시겠습니까?')) {
          // 원본 데이터로 복원
          setData(JSON.parse(JSON.stringify(originalData)));
          // 하이라이팅 제거
          clearHighlighting();
          setOriginalData([]);
        } else {
          // 취소 시 편집 모드 유지
          return true;
        }
      }
      return !prev;
    });
  }, []);

  // 변경 내용 저장 함수
  const saveChanges = useCallback((
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    currentVersion: string,
    addVersionHistory: (historyEntry: any) => void,
    currentYear: string, 
    currentMonth: string, 
    currentWeek: string,
    setIsEditMode: (isEditMode: boolean) => void,
    clearHighlighting: () => void
  ) => {
    if (originalData.length === 0) {
      toast.warning('편집 모드에서만 저장할 수 있습니다.');
      return;
    }
    
    try {
      // 데이터 깊은 복사
      const dataCopy = JSON.parse(JSON.stringify(data));
      
      // 변경사항 추출
      const changes = getChangesFromData(data, originalData);
      
      // 변경사항이 없는 경우
      if (changes.length === 0) {
        toast.info('변경된 내용이 없습니다.');
        return;
      }
      
      // 현재 버전 데이터 업데이트
      updateVersionData(currentVersion, dataCopy);
      
      // 변경 이력에 추가
      const now = new Date();
      const formattedDate = now.toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // 변경 이력 생성
      const historyEntry = {
        version: currentVersion,
        date: now.toISOString(),
        formattedDate: formattedDate, // 표시용 날짜
        year: currentYear,
        month: currentMonth,
        week: currentWeek,
        changes: changes
      };
      
      // 변경 이력 추가
      addVersionHistory(historyEntry);
      
      // 편집 모드 종료 및 상태 초기화
      setIsEditMode(false);
      setOriginalData([]);
      clearHighlighting();
      
      toast.success('변경 내용이 저장되었습니다.');
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    }
  }, [getChangesFromData]);

  return {
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    saveChanges,
    getChangesFromData
  };
}
