
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
    updateVersionData,
    isLatestVersion
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
  
  // 버전 데이터를 불러오는 효과 처리
  useEffect(() => {
    if (!isInitialLoad || previousVersion !== currentVersion) {
      try {
        // 버전 데이터가 있는지 확인
        if (versionData && versionData[currentVersion]) {
          console.log(`${currentVersion} 버전 데이터 로드:`, versionData[currentVersion]);
          
          // 깊은 복사로 데이터 사본 생성
          const versionDataCopy = JSON.parse(JSON.stringify(versionData[currentVersion]));
          
          // 데이터 구조 검증
          if (Array.isArray(versionDataCopy)) {
            // 데이터가 유효한 경우에만 설정
            setData(versionDataCopy);
            setPreviousVersion(currentVersion);
            
            // 편집 모드였다면 종료
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
        
        // 오류 발생 시 초기 버전(rev1)으로 복구 시도
        if (currentVersion !== 'rev1' && versionData['rev1']) {
          setCurrentVersion('rev1');
        }
      }
    }
    
    // 초기 로드 상태 해제
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [currentVersion, versionData, isInitialLoad]);

  // 편집 모드 토글 핸들러
  const handleToggleEditMode = () => {
    // 최신 버전만 편집 가능
    if (!isLatestVersion) {
      toast.warning("이전 버전은 수정할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
    toggleEditMode(data, originalData, setOriginalData, setData, setChangedCells);
  };

  // 변경사항 저장 핸들러
  const handleSaveChanges = () => {
    // 최신 버전만 저장 가능
    if (!isLatestVersion) {
      toast.warning("이전 버전은 저장할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
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
    // 최신 버전만 저장 가능
    if (!isLatestVersion) {
      toast.warning("이전 버전에서는 새 버전을 생성할 수 없습니다. 최신 버전에서만 새 버전 생성이 가능합니다.");
      return;
    }
    saveNewVersionHandler(data, saveNewVersion, setCurrentVersion, setChangedCells);
  };

  // 특정 버전으로 이동하는 함수
  const moveToVersion = (version: string) => {
    // 선택한 버전이 현재 버전과 다른 경우에만 처리
    if (version !== currentVersion) {
      // 편집 모드인 경우 확인
      if (isEditMode) {
        if (confirm("편집 중인 내용이 있습니다. 버전을 변경하면 편집 내용이 모두 삭제됩니다. 계속하시겠습니까?")) {
          // 직접 버전 데이터 로드 함수 호출
          moveToVersionHandler(version, setCurrentVersion, versionData, setData);
          
          // 편집 모드 종료
          setIsEditMode(false);
          setOriginalData([]);
          setChangedCells(new Set());
        }
      } else {
        // 편집 모드가 아닌 경우 바로 전환
        moveToVersionHandler(version, setCurrentVersion, versionData, setData);
      }
    }
  };

  // 현재 보기 모드에 따라 셀 설정을 다르게 적용
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
    saveNewVersion: handleSaveNewVersion,
    showHistoryDialog,
    toggleHistoryDialog,
    versionHistory,
    versionData,
    moveToVersion,
    isLatestVersion
  };
};

export default useSalesPerformance;
