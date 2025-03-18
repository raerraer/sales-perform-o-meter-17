
import { useEffect } from 'react';
import { toast } from "sonner";
import { createCellsSettingsFunction } from '@/utils/salesTableUtils';
import { useSalesVersions } from './sales/useSalesVersions';
import { useSalesHistory } from './sales/useSalesHistory';
import { useEditMode } from './sales/useEditMode';
import { useHighlighting } from './sales/useHighlighting';
import { useDateContext } from './sales/useDateContext';
import { useTableData } from './sales/useTableData';

const useSalesPerformance = () => {
  // 분리된 훅들 사용
  const { hotRef, data, setData, afterChange: baseAfterChange } = useTableData();
  const { isEditMode, originalData, toggleEditMode: baseToggleEditMode, saveChanges: baseSaveChanges } = useEditMode();
  const { changedCells, setChangedCells, clearHighlighting, updateHighlighting } = useHighlighting();
  const { currentYear, currentMonth, currentWeek } = useDateContext();
  
  // 기존 훅 사용
  const { 
    versions, 
    currentVersion, 
    setCurrentVersion, 
    versionData, 
    saveNewVersion: baseSaveNewVersion, 
    updateVersionData 
  } = useSalesVersions();
  
  const { 
    versionHistory, 
    addVersionHistory, 
    showHistoryDialog, 
    toggleHistoryDialog
  } = useSalesHistory();
  
  // 버전 변경 시 해당 버전의 데이터로 업데이트
  useEffect(() => {
    if (versionData[currentVersion]) {
      // 깊은 복사를 통해 새로운 데이터 객체 생성
      const deepCopyData = JSON.parse(JSON.stringify(versionData[currentVersion]));
      setData(deepCopyData);
      
      // 버전 변경 시 하이라이팅 초기화 (rev1 선택 시에도 변경 전 데이터가 정상적으로 조회되도록)
      clearHighlighting();
      
      toast.info(`${currentVersion} 버전 데이터를 불러왔습니다.`);
    }
  }, [currentVersion, versionData, setData, clearHighlighting]);
  
  // 현재 보기 모드에 따라 셀 설정을 다르게 적용
  const getCellsSettings = () => {
    return createCellsSettingsFunction(data, isEditMode, originalData, changedCells);
  };

  // 편집 모드 토글 시 원본 데이터 백업/복원
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

  // 변경사항 저장
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

  // 새 버전 저장 핸들러
  const handleSaveNewVersion = () => {
    // 새 버전 생성 및 저장
    const newVersion = baseSaveNewVersion(data);
    
    if (newVersion) {
      // 새 버전으로 자동 전환
      setCurrentVersion(newVersion);
      
      // 새 버전 저장 시 하이라이팅 제거
      clearHighlighting();
      toast.success(`새 버전(${newVersion})이 저장되었습니다.`);
    }
  };

  // afterChange 함수 래핑
  const wrappedAfterChange = (changes: any, source: string) => {
    baseAfterChange(changes, source, isEditMode, originalData, updateHighlighting);
  };

  // 특정 버전으로 이동하는 함수
  const moveToVersion = (version: string) => {
    setCurrentVersion(version);
  };

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
