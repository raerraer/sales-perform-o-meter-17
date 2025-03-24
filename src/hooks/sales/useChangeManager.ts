
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
    console.log('편집 모드 전환 시작');
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
    console.log('편집 모드 전환 완료, 현재 모드:', !isEditMode);
  };

  // 변경 사항 저장 래퍼 함수
  const handleSaveChanges = () => {
    console.log('변경 사항 저장 시작');
    
    // 변경 사항 감지 (영국 또는 캐나다 변경 로깅)
    const allChanges = getChangesFromData(data, originalData);
    const ukChanges = allChanges.filter(change => change.country === "영국");
    const canadaChanges = allChanges.filter(change => change.country === "캐나다");
    
    console.log(`감지된 변경: 총 ${allChanges.length}개, 영국: ${ukChanges.length}개, 캐나다: ${canadaChanges.length}개`);
    
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
    console.log('변경 사항 저장 완료');
  };

  return {
    handleSaveChanges,
    handleToggleEditMode
  };
};
