
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { createCellsSettingsFunction } from '@/utils/salesTableUtils';
import { useSalesVersions } from './sales/useSalesVersions';
import { useSalesHistory } from './sales/useSalesHistory';
import { useEditMode } from './sales/useEditMode';
import { useHighlighting } from './sales/useHighlighting';
import { useDateContext } from './sales/useDateContext';
import { useTableData } from './sales/useTableData';

/**
 * 통합된 판매 실적 데이터 관리 훅
 * 여러 서브 훅들을 조합하여 판매 데이터의 조회, 수정, 버전 관리 기능을 제공
 */
const useSalesPerformance = () => {
  // 1. 데이터 & 테이블 관련 훅
  const { 
    hotRef, 
    data, 
    setData, 
    afterChange: baseAfterChange 
  } = useTableData();

  // 2. 편집 모드 관련 훅
  const { 
    isEditMode, 
    originalData, 
    toggleEditMode: baseToggleEditMode, 
    saveChanges: baseSaveChanges 
  } = useEditMode();

  // 3. 하이라이팅 관련 훅
  const { 
    changedCells, 
    setChangedCells, 
    clearHighlighting, 
    updateHighlighting 
  } = useHighlighting();

  // 4. 날짜 컨텍스트 훅
  const { 
    currentYear, 
    currentMonth, 
    currentWeek 
  } = useDateContext();
  
  // 5. 버전 관리 훅
  const { 
    versions, 
    currentVersion, 
    setCurrentVersion, 
    versionData, 
    saveNewVersion: baseSaveNewVersion, 
    updateVersionData 
  } = useSalesVersions();
  
  // 6. 버전 이력 관리 훅
  const { 
    versionHistory, 
    addVersionHistory, 
    showHistoryDialog, 
    toggleHistoryDialog
  } = useSalesHistory();
  
  // 버전 변경 시 해당 버전의 데이터로 업데이트 (최초 한 번만 토스트 메시지 표시)
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (versionData[currentVersion]) {
      // 깊은 복사를 통해 새로운 데이터 객체 생성
      const deepCopyData = JSON.parse(JSON.stringify(versionData[currentVersion]));
      setData(deepCopyData);
      
      // 버전 변경 시 하이라이팅 초기화
      clearHighlighting();
      
      // 최초 로드 시에만 토스트 메시지 표시
      if (!initialLoad) {
        toast.info(`${currentVersion} 버전 데이터를 불러왔습니다.`);
      } else {
        setInitialLoad(false);
      }
    }
  }, [currentVersion, versionData, setData, clearHighlighting, initialLoad]);
  
  // 현재 보기 모드에 따라 셀 설정을 다르게 적용
  const getCellsSettings = () => {
    return createCellsSettingsFunction(data, isEditMode, originalData, changedCells);
  };

  // 편집 모드 토글 핸들러 (래핑)
  const toggleEditMode = () => {
    if (!isEditMode) {
      // 원본 데이터 백업
      const backupData = JSON.parse(JSON.stringify(data));
      baseSaveChanges([], backupData, () => {}, () => {}, "", "", "", "", () => {});
    } else {
      // 편집 취소 시 원본 데이터로 복원
      setData(JSON.parse(JSON.stringify(originalData)));
      clearHighlighting();
    }
    
    baseToggleEditMode();
  };

  // 변경사항 저장 핸들러 (래핑)
  const saveChanges = () => {
    baseSaveChanges(
      data, 
      originalData, 
      updateVersionData, 
      addVersionHistory, 
      currentVersion,
      currentYear,
      currentMonth,
      currentWeek,
      setChangedCells
    );
  };

  // 새 버전 저장 핸들러 (래핑)
  const handleSaveNewVersion = () => {
    const newVersion = baseSaveNewVersion(data);
    
    if (newVersion) {
      setCurrentVersion(newVersion);
      clearHighlighting();
      toast.success(`새 버전(${newVersion})이 저장되었습니다.`);
    }
  };

  // afterChange 핸들러 (래핑)
  const wrappedAfterChange = (changes: any, source: string) => {
    if (source !== 'loadData') {  // loadData일 때는 업데이트 하이라이팅 처리 안함
      baseAfterChange(changes, source, isEditMode, originalData, updateHighlighting);
    }
  };

  // 특정 버전으로 이동하는 핸들러
  const moveToVersion = (version: string) => {
    setCurrentVersion(version);
  };

  // 필요한 기능들을 모두 반환
  return {
    hotRef,
    data,
    isEditMode,
    getCellsSettings,
    toggleEditMode,
    saveChanges,
    afterChange: wrappedAfterChange,
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
