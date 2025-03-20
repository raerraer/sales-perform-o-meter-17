
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
    
    // 원본 데이터와 현재 데이터 비교하여 변경사항 추출
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (originalData[row] && originalData[row][col] !== undefined) {
          const originalValue = originalData[row][col];
          const currentValue = data[row][col];
          
          // 값이 변경된 경우만 기록 (문자열로 변환하여 비교)
          const normalizedOriginal = String(originalValue).replace(/,/g, '');
          const normalizedCurrent = String(currentValue).replace(/,/g, '');
          
          if (normalizedOriginal !== normalizedCurrent) {
            const country = data[row][0] || ''; // 첫 번째 열은 보통 국가
            const modelOrCategory = row > 0 ? data[row-1][0] : ''; // 상위 행이 모델명인 경우
            
            // 열 인덱스에 따른 월과 카테고리 추출
            // 주의: 실제 데이터 구조에 맞게 수정 필요
            let month = '';
            let category = '';
            let model = '';
            
            // 열 인덱스로부터 월과 카테고리 추정
            // 0: 국가/모델, 1-12: 1월부터 12월
            if (col > 0) {
              const monthIndex = Math.ceil(col / 2); // 2개 열(Qty, Amt)당 1개월
              month = `${monthIndex}월`;
              category = col % 2 === 1 ? 'QTY' : 'AMT';
            }

            // 모델명 추출 시도
            if (row > 0 && !data[row][0].includes('합계')) {
              model = data[row][0];
            }
            
            changes.push({
              row,
              col,
              oldValue: originalValue,
              newValue: currentValue,
              country,
              model,
              month,
              category
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
