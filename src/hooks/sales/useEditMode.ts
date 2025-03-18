
import { useState } from 'react';
import { toast } from "sonner";
import { VersionHistory } from './useSalesHistory';

export interface EditModeHookReturn {
  isEditMode: boolean;
  originalData: any[];
  toggleEditMode: () => void;
  saveChanges: (
    data: any[], 
    originalData: any[], 
    updateVersionData: (version: string, data: any[]) => void,
    addVersionHistory: (history: VersionHistory) => void,
    currentVersion: string,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setChangedCells: (cells: Set<string>) => void
  ) => void;
}

export function useEditMode(): EditModeHookReturn {
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<any[]>([]);

  const toggleEditMode = () => {
    if (!isEditMode) {
      // 편집 모드로 전환 시 현재 데이터를 백업
      setOriginalData([]);
      setIsEditMode(true);
      toast.info("편집 모드로 전환되었습니다.");
    } else {
      // 편집 취소 시 원본 데이터로 복원하고 하이라이팅 제거
      setIsEditMode(false);
      setOriginalData([]);
      
      toast.info("편집이 취소되었습니다. 변경 내용이 취소되었습니다.");
    }
  };

  const saveChanges = (
    data: any[], 
    originalData: any[], 
    updateVersionData: (version: string, data: any[]) => void,
    addVersionHistory: (history: VersionHistory) => void,
    currentVersion: string,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setChangedCells: (cells: Set<string>) => void
  ) => {
    // 변경사항 확인
    const changes: any[] = [];
    const newChangedCells = new Set<string>();
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell: any, colIndex: number) => {
        if (cell !== originalData[rowIndex][colIndex]) {
          changes.push({
            row: rowIndex,
            col: colIndex,
            oldValue: originalData[rowIndex][colIndex],
            newValue: cell
          });
          
          // 변경된 셀 좌표 추가 (수정된 셀만 하이라이팅)
          newChangedCells.add(`${rowIndex},${colIndex}`);
        }
      });
    });

    if (changes.length === 0) {
      toast.info("변경사항이 없습니다.");
      setIsEditMode(false);
      return;
    }

    // 실제 저장 전 사용자에게 확인
    if (confirm("변경사항을 저장하시겠습니까?")) {
      // 변경된 셀 하이라이팅 설정 (수정된 셀만 하이라이팅)
      setChangedCells(newChangedCells);
      
      // 변경 이력에 추가
      const newHistory: VersionHistory = {
        version: currentVersion,
        date: new Date().toISOString(),
        year: currentYear,
        month: currentMonth,
        week: currentWeek,
        changes
      };
      
      // 현재 버전의 데이터 업데이트
      updateVersionData(currentVersion, data);
      
      addVersionHistory(newHistory);
      toast.success("변경사항이 저장되었습니다.");
      setIsEditMode(false);
      setOriginalData([]);
    }
  };

  return {
    isEditMode,
    originalData,
    toggleEditMode,
    saveChanges
  };
}
