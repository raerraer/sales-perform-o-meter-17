
import { useEffect } from 'react';
import { createCellsSettingsFunction } from '@/utils/salesTableUtils';
import { toast } from 'sonner';
import { useSalesVersions } from './sales/useSalesVersions';
import { useSalesHistory } from './sales/useSalesHistory';
import { useTableState } from './sales/useTableState';
import { useEditMode } from './sales/useEditMode';
import { useDateFilter } from './sales/useDateFilter';
import { useHighlighting } from './sales/useHighlighting';
import { useVersionControl } from './sales/useVersionControl';

const useSalesPerformance = () => {
  // 훅 가져오기
  const { 
    hotRef, 
    data, 
    setData, 
    originalData, 
    setOriginalData,
    isInitialLoad,
    setIsInitialLoad
  } = useTableState();
  
  const { isEditMode, setIsEditMode, toggleEditMode, saveChanges } = useEditMode();
  
  const { currentYear, currentMonth, currentWeek } = useDateFilter();
  
  const { changedCells, setChangedCells, afterChange: originalAfterChange } = useHighlighting();
  
  const { 
    previousVersion, 
    setPreviousVersion, 
    handleSaveNewVersion: saveNewVersionHandler, 
    moveToVersion: moveToVersionHandler 
  } = useVersionControl();

  const { 
    versions, 
    currentVersion, 
    setCurrentVersion, 
    versionData, 
    saveNewVersion, 
    updateVersionData 
  } = useSalesVersions();
  
  const { 
    versionHistory, 
    addVersionHistory, 
    showHistoryDialog, 
    toggleHistoryDialog
  } = useSalesHistory();

  // afterChange 핸들러 래퍼
  const afterChange = (changes: any, source: string) => {
    originalAfterChange(changes, source, data, setData, isEditMode, originalData);
  };
  
  // 버전 변경 시 해당 버전의 데이터로 업데이트
  useEffect(() => {
    // 버전이 실제로 변경됐을 때만 처리 (첫 로드 및 실제 버전 선택 변경 시)
    if (previousVersion !== currentVersion || isInitialLoad) {
      setPreviousVersion(currentVersion);
      
      if (versionData[currentVersion]) {
        // 깊은 복사를 통해 새로운 데이터 객체 생성
        const deepCopyData = JSON.parse(JSON.stringify(versionData[currentVersion]));
        setData(deepCopyData);
        
        // 최초 로드 시에는 토스트 메시지 표시하지 않음
        if (!isInitialLoad) {
          toast.info(`${currentVersion} 버전 데이터를 불러왔습니다.`);
        } else {
          setIsInitialLoad(false);
        }
      } else {
        // 데이터가 없는 버전인 경우 rev1 데이터로 복구
        if (versionData["rev1"]) {
          const rev1Data = JSON.parse(JSON.stringify(versionData["rev1"]));
          setData(rev1Data);
          toast.warning(`${currentVersion} 버전 데이터가 없어 rev1 데이터를 표시합니다.`);
        }
      }
    }
  }, [currentVersion, versionData, isInitialLoad, previousVersion, setPreviousVersion, setData, setIsInitialLoad]);

  // 편집 모드 토글 핸들러
  const handleToggleEditMode = () => {
    toggleEditMode(data, originalData, setOriginalData, setData, setChangedCells);
  };

  // 변경사항 저장 핸들러
  const handleSaveChanges = () => {
    saveChanges(
      data, 
      originalData, 
      changedCells, 
      setChangedCells,
      setOriginalData, 
      updateVersionData, 
      currentVersion, 
      addVersionHistory, 
      currentYear, 
      currentMonth, 
      currentWeek,
      setIsEditMode
    );
  };

  // 새 버전 저장 핸들러
  const handleSaveNewVersion = () => {
    saveNewVersionHandler(data, saveNewVersion, setCurrentVersion, setChangedCells);
  };

  // 특정 버전으로 이동하는 함수
  const moveToVersion = (version: string) => {
    moveToVersionHandler(version, setCurrentVersion, versionData, setData);
  };

  // 현재 보기 모드에 따라 셀 설정을 다르게 적용
  const getCellsSettings = () => {
    return createCellsSettingsFunction(data, isEditMode, originalData, changedCells);
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
    saveNewVersion: handleSaveNewVersion,
    showHistoryDialog,
    toggleHistoryDialog,
    versionHistory,
    versionData,
    moveToVersion
  };
};

export default useSalesPerformance;
