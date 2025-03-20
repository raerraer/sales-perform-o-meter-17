
import { useCallback } from 'react';
import { toast } from 'sonner';
import { CellChange, VersionHistory } from './useSalesHistory';
import { detectDataChanges } from './utils/salesChangesDetector';

export interface UseSaveChangesReturn {
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
}

/**
 * 변경사항 저장 기능을 담당하는 훅
 */
export function useSaveChanges(): UseSaveChangesReturn {
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
      const dataCopy = JSON.parse(JSON.stringify(data));
      
      // 변경사항 감지
      const changes = detectDataChanges(data, originalData);
      
      if (changes.length === 0) {
        toast.info('변경된 내용이 없습니다.');
        return;
      }
      
      // 버전 데이터 업데이트
      updateVersionData(currentVersion, dataCopy);
      
      // 변경 이력 생성
      const now = new Date();
      const formattedDate = now.toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const historyEntry: VersionHistory = {
        version: currentVersion,
        date: now.toISOString(),
        formattedDate,
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
  }, []);

  return {
    saveChanges
  };
}
