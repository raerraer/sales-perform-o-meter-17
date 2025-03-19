
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
  
  const { 
    afterChange: highlightingAfterChange,
    modifiedCells,
    clearHighlighting,
    isModifiedCell
  } = useHighlighting();
  
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
    updateVersionData,
    isLatestVersion
  } = useSalesVersions();
  
  const { 
    versionHistory, 
    addVersionHistory, 
    showHistoryDialog, 
    toggleHistoryDialog
  } = useSalesHistory();

  const afterChange = (changes: any, source: string) => {
    highlightingAfterChange(changes, source, data, setData, isEditMode, originalData);
  };
  
  useEffect(() => {
    if (!isInitialLoad || previousVersion !== currentVersion) {
      try {
        if (versionData && versionData[currentVersion]) {
          console.log(`${currentVersion} 버전 데이터 로드:`, versionData[currentVersion]);
          
          const versionDataCopy = JSON.parse(JSON.stringify(versionData[currentVersion]));
          
          if (Array.isArray(versionDataCopy)) {
            setData(versionDataCopy);
            setPreviousVersion(currentVersion);
            
            if (isEditMode) {
              setIsEditMode(false);
              setOriginalData([]);
              clearHighlighting();
            }
            
            toast.info(`${currentVersion} 버전 데이터를 불러왔습니다.`);
          } else {
            throw new Error(`${currentVersion} 버전의 데이터 형식이 올바르지 않습니다.`);
          }
        } else {
          throw new Error(`${currentVersion} 버전 데이터가 존재하지 않습니다.`);
        }
      } catch (error) {
        console.error(`버전 데이터 로드 오류:`, error);
        toast.error(`${currentVersion} 버전 데이터를 불러오는 데 실패했습니다.`);
        
        if (currentVersion !== 'rev1' && versionData['rev1']) {
          setCurrentVersion('rev1');
        }
      }
    }
    
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [currentVersion, versionData, isInitialLoad]);

  const handleToggleEditMode = () => {
    if (!isLatestVersion) {
      toast.warning("이전 버전은 수정할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
    toggleEditMode(data, originalData, setOriginalData, setData, clearHighlighting);
  };

  const handleSaveChanges = () => {
    if (!isLatestVersion) {
      toast.warning("이전 버전은 저장할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
    
    // 타입 불일치 오류 수정 - addVersionHistory 호출 변경
    const historyEntry = {
      version: currentVersion,
      date: new Date().toISOString(),
      year: currentYear,
      month: currentMonth,
      week: currentWeek,
      changes: []  // 변경 내역 - 비워둠
    };
    
    // 먼저 현재 버전에 변경사항 저장
    saveChanges(
      data, 
      originalData, 
      setOriginalData, 
      updateVersionData, 
      currentVersion, 
      // 타입에 맞게 addVersionHistory 직접 호출
      () => addVersionHistory(historyEntry),
      currentYear, 
      currentMonth, 
      currentWeek,
      setIsEditMode,
      clearHighlighting
    );
    
    // 새 버전으로 저장
    const newVersion = saveNewVersion(data);
    
    if (newVersion) {
      // 새로운 버전으로 전환
      setCurrentVersion(newVersion);
      
      toast.success(`새 버전(${newVersion})이 저장되었습니다.`);
    }
  };

  const moveToVersion = (version: string) => {
    if (version !== currentVersion) {
      moveToVersionHandler(version, setCurrentVersion, versionData, setData);
    }
  };

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
