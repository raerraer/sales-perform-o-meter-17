
import { useCallback } from 'react';
import { toast } from 'sonner';
import { CellChange, VersionHistory } from './useSalesHistory';

export interface UseHandleDataChangesReturn {
  handleSaveChanges: (
    data: any[][],
    originalData: any[][],
    isLatestVersion: boolean,
    currentVersion: string,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    isEditMode: boolean,
    getChangesFromData: (data: any[][], originalData: any[][]) => CellChange[],
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
    ) => void,
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    addVersionHistory: (historyEntry: VersionHistory) => void,
    saveNewVersionWithData: (data: any[][]) => string | null,
    clearHighlighting: () => void,
    setIsEditMode: (isEditMode: boolean) => void
  ) => void;
}

/**
 * 데이터 저장 처리 관련 기능을 분리한 커스텀 훅
 */
export const useHandleDataChanges = (): UseHandleDataChangesReturn => {
  // 변경 사항 저장 함수
  const handleSaveChanges = useCallback((
    data: any[][],
    originalData: any[][],
    isLatestVersion: boolean,
    currentVersion: string,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    isEditMode: boolean,
    getChangesFromData: (data: any[][], originalData: any[][]) => CellChange[],
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
    ) => void,
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    addVersionHistory: (historyEntry: VersionHistory) => void,
    saveNewVersionWithData: (data: any[][]) => string | null,
    clearHighlighting: () => void,
    setIsEditMode: (isEditMode: boolean) => void
  ) => {
    if (!isLatestVersion) {
      toast.warning("이전 버전은 저장할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
    
    if (!isEditMode) {
      toast.warning("편집 모드에서만 저장할 수 있습니다.");
      return;
    }
    
    const changes = getChangesFromData(data, originalData);
    
    if (changes.length === 0) {
      toast.info("변경된 내용이 없습니다.");
      return;
    }
    
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
      formattedDate: formattedDate,
      year: currentYear,
      month: currentMonth,
      week: currentWeek,
      changes: changes
    };
    
    saveChanges(
      data, 
      originalData, 
      setOriginalData, 
      updateVersionData, 
      currentVersion, 
      addVersionHistory, 
      currentYear, 
      currentMonth, 
      currentWeek,
      setIsEditMode,
      clearHighlighting
    );
    
    saveNewVersionWithData(data);
  }, []);

  return {
    handleSaveChanges
  };
};
