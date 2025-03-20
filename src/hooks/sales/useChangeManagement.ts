
import { UseEditModeReturn } from './useEditMode';
import { CellChange, VersionHistory } from './useSalesHistory';
import { useChangeManager } from './useChangeManager';

export interface UseChangeManagementReturn {
  handleSaveChanges: () => void;
  handleToggleEditMode: () => void;
}

/**
 * 데이터 변경 처리 관련 로직 통합 훅
 * 이제 내부적으로 useChangeManager를 사용하여 더 모듈화된 구조 제공
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
  // useChangeManager 훅을 사용하여 기능 위임
  const {
    handleSaveChanges,
    handleToggleEditMode
  } = useChangeManager(
    data,
    originalData,
    isLatestVersion,
    currentVersion,
    currentYear,
    currentMonth,
    currentWeek,
    editMode,
    clearHighlighting,
    setOriginalData,
    setData,
    updateVersionData,
    addVersionHistory,
    saveNewVersionWithData
  );

  return {
    handleSaveChanges,
    handleToggleEditMode
  };
};
