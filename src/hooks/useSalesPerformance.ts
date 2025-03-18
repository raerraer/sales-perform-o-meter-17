
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
      
      // 버전 데이터 적용
      if (versionData && currentVersion && versionData[currentVersion]) {
        // 깊은 복사를 통해 새로운 데이터 객체 생성
        try {
          const deepCopyData = JSON.parse(JSON.stringify(versionData[currentVersion]));
          
          // 데이터 구조 확인
          if (Array.isArray(deepCopyData)) {
            setData(deepCopyData);
            
            // 최초 로드 시에는 토스트 메시지 표시하지 않음
            if (!isInitialLoad) {
              toast.info(`${currentVersion} 버전 데이터를 불러왔습니다.`);
            } else {
              setIsInitialLoad(false);
            }
          } else {
            console.error('데이터 형식 오류:', deepCopyData);
            toast.error('데이터 형식이 올바르지 않습니다.');
          }
        } catch (error) {
          console.error('버전 데이터 처리 중 오류 발생:', error);
          toast.error('버전 데이터 처리 중 오류가 발생했습니다.');
        }
      } else {
        // 데이터가 없는 버전인 경우 rev1 데이터로 복구
        if (versionData["rev1"]) {
          try {
            const rev1Data = JSON.parse(JSON.stringify(versionData["rev1"]));
            setData(rev1Data);
            toast.warning(`${currentVersion} 버전 데이터가 없어 rev1 데이터를 표시합니다.`);
          } catch (error) {
            console.error('rev1 데이터 복원 중 오류 발생:', error);
            toast.error('기본 데이터 복원 중 오류가 발생했습니다.');
          }
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
    // 현재 편집 모드인 경우, 편집 모드를 종료
    if (isEditMode) {
      setIsEditMode(false);
      setOriginalData([]);
      setChangedCells(new Set());
    }
    
    // 버전 전환 - 버전 데이터를 직접 확인하고 적용
    if (versionData[version]) {
      try {
        // 깊은 복사를 통해 새 데이터 객체 생성
        const versionDataCopy = JSON.parse(JSON.stringify(versionData[version]));
        // 데이터 설정
        setData(versionDataCopy);
        // 현재 버전 업데이트
        setCurrentVersion(version);
        toast.info(`${version} 버전 데이터를 불러왔습니다.`);
      } catch (error) {
        console.error(`${version} 버전 데이터 로드 중 오류 발생:`, error);
        toast.error(`${version} 버전 데이터 로드에 실패했습니다.`);
      }
    } else {
      toast.error(`${version} 버전 데이터를 찾을 수 없습니다.`);
    }
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
