
import { useHandleDataChanges } from './useHandleDataChanges';
import { useToggleEditMode } from './useToggleEditMode';
import { UseEditModeReturn } from './useEditMode';
import { CellChange, VersionHistory } from './useSalesHistory';

export interface UseChangeManagerReturn {
  handleSaveChanges: () => void;
  handleToggleEditMode: () => void;
}

/**
 * 데이터 변경 처리 관련 기능을 모두 관리하는 메인 커스텀 훅
 */
export const useChangeManager = (
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
): UseChangeManagerReturn => {
  const { 
    isEditMode, 
    setIsEditMode, 
    toggleEditMode, 
    saveChanges,
    getChangesFromData 
  } = editMode;

  // 데이터 저장 관련 훅
  const { handleSaveChanges: baseHandleSaveChanges } = useHandleDataChanges();
  
  // 편집 모드 관련 훅
  const { handleToggleEditMode: baseHandleToggleEditMode } = useToggleEditMode();

  // 편집 모드 전환 래퍼 함수
  const handleToggleEditMode = () => {
    baseHandleToggleEditMode(
      isLatestVersion,
      isEditMode,
      toggleEditMode,
      data,
      originalData,
      setOriginalData,
      setData,
      clearHighlighting
    );
  };

  // 변경 사항 저장 래퍼 함수
  const handleSaveChanges = () => {
    baseHandleSaveChanges(
      data,
      originalData,
      isLatestVersion,
      currentVersion,
      currentYear,
      currentMonth,
      currentWeek,
      isEditMode,
      getChangesFromData,
      saveChanges,
      setOriginalData,
      updateVersionData,
      addVersionHistory,
      saveNewVersionWithData,
      clearHighlighting,
      setIsEditMode
    );
  };

  return {
    handleSaveChanges,
    handleToggleEditMode
  };
};
