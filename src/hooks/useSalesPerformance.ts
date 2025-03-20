
import { createCellsSettingsFunction } from '@/utils/salesTableUtils';
import { useTableState } from './sales/useTableState';
import { useEditMode } from './sales/useEditMode';
import { useDateFilter } from './sales/useDateFilter';
import { useHighlighting } from './sales/useHighlighting';
import { useSalesHistory } from './sales/useSalesHistory';
import { useSalesVersions } from './sales/useSalesVersions';
import { useDataLoading } from './sales/useDataLoading';
import { useVersionManagement } from './sales/useVersionManagement';
import { useChangeManagement } from './sales/useChangeManagement';

/**
 * 영업 실적표 관련 로직을 통합한 훅
 * 데이터 관리, 버전 관리, 변경 감지, 편집 기능 등을 관리
 */
const useSalesPerformance = () => {
  // 테이블 상태 관리
  const { 
    hotRef, 
    data, 
    setData, 
    originalData, 
    setOriginalData,
    isInitialLoad,
    setIsInitialLoad
  } = useTableState();
  
  // 편집 모드 관리
  const editMode = useEditMode();
  const { isEditMode, setIsEditMode } = editMode;
  
  // 날짜 필터
  const { currentYear, currentMonth, currentWeek } = useDateFilter();
  
  // 셀 변경 하이라이팅
  const { 
    afterChange: highlightingAfterChange,
    clearHighlighting,
    isModifiedCell
  } = useHighlighting();
  
  // 버전 관리 통합 훅
  const versionManager = useVersionManagement(
    setData,
    setIsEditMode,
    setOriginalData,
    clearHighlighting
  );
  
  const {
    versions,
    currentVersion,
    setCurrentVersion,
    isLatestVersion,
    moveToVersion,
    saveNewVersionWithData,
    previousVersion,
    setPreviousVersion,
    versionData
  } = versionManager;
  
  // 히스토리 관리
  const { 
    versionHistory, 
    addVersionHistory, 
    showHistoryDialog, 
    toggleHistoryDialog
  } = useSalesHistory();
  
  // 버전 데이터 로딩
  useDataLoading(
    currentVersion,
    previousVersion,
    versionData,
    isInitialLoad,
    setData,
    setPreviousVersion,
    setCurrentVersion,
    isEditMode,
    setIsEditMode,
    setOriginalData,
    clearHighlighting,
    setIsInitialLoad
  );
  
  // 버전 데이터 업데이트 함수 참조
  const { updateVersionData } = useSalesVersions();
  
  // 변경 처리 관리
  const { 
    handleSaveChanges, 
    handleToggleEditMode 
  } = useChangeManagement(
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

  // 셀 변경 처리 함수
  const afterChange = (changes: any, source: string) => {
    highlightingAfterChange(changes, source, data, setData, isEditMode, originalData);
  };

  // 셀 설정 함수
  const getCellsSettings = () => {
    return createCellsSettingsFunction(data, isEditMode && isLatestVersion, originalData, isModifiedCell);
  };

  return {
    hotRef,
    data,
    isEditMode,
    getCellsSettings,
    toggleEditMode: handleToggleEditMode,
    saveChanges: handleSaveChanges,
    afterChange,
    versions,
    currentVersion,
    setCurrentVersion,
    showHistoryDialog,
    toggleHistoryDialog,
    versionHistory,
    versionData,
    moveToVersion,
    isLatestVersion
  };
};

export default useSalesPerformance;
