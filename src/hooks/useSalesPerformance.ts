import { useEffect, useState } from 'react';
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
    originalAfterChange(changes, source, data, setData, isEditMode, originalData);
  };
  
  // 초기 테이블 로드 후 비고 열 숨기기
  useEffect(() => {
    // 테이블이 로드된 후 비고 열을 숨김
    if (!isInitialLoad && hotRef.current && hotRef.current.hotInstance) {
      const hot = hotRef.current.hotInstance;
      
      // 각 월별 비고 열 인덱스 계산 (첫 번째 열은 모델명)
      const remarkColumns = Array.from({ length: 12 }, (_, i) => (i * 11) + 10 + 1);
      
      // 비고 열 숨기기 
      setTimeout(() => {
        hot.updateSettings({
          hiddenColumns: {
            columns: remarkColumns,
            indicators: true
          }
        });
      }, 500); // 테이블이 완전히 렌더링 된 후 실행하기 위해 약간의 지연 추가
    }
  }, [isInitialLoad, hotRef.current]);
  
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
              setChangedCells(new Set());
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
    toggleEditMode(data, originalData, setOriginalData, setData, setChangedCells);
  };

  const handleSaveChanges = () => {
    if (!isLatestVersion) {
      toast.warning("이전 버전은 저장할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
    
    // 먼저 현재 버전에 변경사항 저장
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
    
    // 변경된 내용이 있다면 새 버전으로 저장
    if (changedCells.size > 0) {
      // 저장 후 새 버전 생성
      const newVersion = saveNewVersion(data);
      
      if (newVersion) {
        // 새로운 버전으로 전환
        setCurrentVersion(newVersion);
        
        // 변경 셀 하이라이트 초기화
        setChangedCells(new Set());
        
        toast.success(`새 버전(${newVersion})이 저장되었습니다.`);
      }
    }
  };

  const moveToVersion = (version: string) => {
    if (version !== currentVersion) {
      try {
        if (versionData[version]) {
          const selectedVersionData = JSON.parse(JSON.stringify(versionData[version]));
          
          if (Array.isArray(selectedVersionData)) {
            setData(selectedVersionData);
            setCurrentVersion(version);
            
            if (isEditMode) {
              setIsEditMode(false);
              setOriginalData([]);
              setChangedCells(new Set());
            }
            
            toast.info(`${version} 버전 데이터를 불러왔습니다.`);
          } else {
            throw new Error("유효하지 않은 데이터 형식");
          }
        } else {
          throw new Error(`${version} 버전 데이터를 찾을 수 없습니다.`);
        }
      } catch (error) {
        console.error(`버전 전환 중 오류 발생:`, error);
        toast.error(`${version} 버전으로 전환하는 중 오류가 발생했습니다.`);
      }
    }
  };

  const getCellsSettings = () => {
    return createCellsSettingsFunction(data, isEditMode && isLatestVersion, originalData, changedCells);
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
