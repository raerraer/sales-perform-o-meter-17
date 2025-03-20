
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CellChange, VersionHistory } from './useSalesHistory';
import { UseEditModeReturn } from './useEditMode';

export interface UseChangeManagementReturn {
  handleSaveChanges: () => void;
  handleToggleEditMode: () => void;
}

/**
 * 데이터 변경 처리 관련 로직을 분리한 커스텀 훅
 */
export const useChangeManagement = (
  data: any[][],
  originalData: any[][],
  isLatestVersion: boolean,
  currentVersion: string,
  currentYear: string,
  currentMonth: string,
  currentWeek: string,
  editMode: UseEditModeReturn,
  clearHighlighting: () => void,
  setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
  setData: React.Dispatch<React.SetStateAction<any[][]>>,
  updateVersionData: (version: string, data: any[]) => void,
  addVersionHistory: (historyEntry: VersionHistory) => void,
  saveNewVersionWithData: (data: any[][]) => string | null
): UseChangeManagementReturn => {
  const { 
    isEditMode, 
    setIsEditMode, 
    toggleEditMode, 
    saveChanges,
    getChangesFromData 
  } = editMode;

  // 편집 모드 전환 함수
  const handleToggleEditMode = () => {
    if (!isLatestVersion) {
      toast.warning("이전 버전은 수정할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
    toggleEditMode(data, originalData, setOriginalData, setData, clearHighlighting);
  };

  // 변경 사항 저장 함수
  const handleSaveChanges = () => {
    if (!isLatestVersion) {
      toast.warning("이전 버전은 저장할 수 없습니다. 최신 버전만 수정 가능합니다.");
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
  };

  return {
    handleSaveChanges,
    handleToggleEditMode
  };
};
