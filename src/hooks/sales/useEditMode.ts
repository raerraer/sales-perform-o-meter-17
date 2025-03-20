
import { useState, useCallback } from 'react';
import { CellChange } from './useSalesHistory';
import { useEditModeState } from './useEditModeState';
import { useEditModeToggle } from './useEditModeToggle';
import { useSaveChanges } from './useSaveChanges';
import { detectDataChanges } from './utils/salesChangesDetector';

export interface UseEditModeReturn {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  toggleEditMode: (
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => void;
  saveChanges: (
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    currentVersion: string,
    addVersionHistory: (historyEntry: any) => void,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setIsEditMode: (isEditMode: boolean) => void,
    clearHighlighting: () => void
  ) => void;
  getChangesFromData: (data: any[][], originalData: any[][]) => CellChange[];
}

/**
 * 편집 모드 관련 기능을 통합한 훅
 * 여러 개의 작은 훅들을 조합해서 편집 모드 기능 제공
 */
export function useEditMode(): UseEditModeReturn {
  // 편집 모드 상태 관리
  const { isEditMode, setIsEditMode } = useEditModeState();
  
  // 편집 모드 토글 기능
  const { toggleEditMode: toggleEditModeBase } = useEditModeToggle();
  
  // 변경사항 저장 기능
  const { saveChanges: saveChangesBase } = useSaveChanges();
  
  // 변경사항 감지 함수 (별도 파일로 분리된 유틸리티 함수 사용)
  const getChangesFromData = useCallback((data: any[][], originalData: any[][]): CellChange[] => {
    return detectDataChanges(data, originalData);
  }, []);

  // 편집 모드 토글 래퍼 함수
  const toggleEditMode = useCallback((
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => {
    toggleEditModeBase(
      data, 
      originalData, 
      setOriginalData, 
      setData, 
      clearHighlighting,
      isEditMode,
      setIsEditMode
    );
  }, [toggleEditModeBase, isEditMode]);

  // 기존 인터페이스와 호환되는 API 유지
  return {
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    saveChanges: saveChangesBase,
    getChangesFromData
  };
}
