
import { useState } from 'react';
import { toast } from 'sonner';

export interface UseEditModeReturn {
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleEditMode: (currentData: any[][], originalData: any[][], setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>, setData: React.Dispatch<React.SetStateAction<any[][]>>, setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>) => void;
  saveChanges: (data: any[][], originalData: any[][], changedCells: Set<string>, setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>, setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>, updateVersionData: (version: string, data: any[]) => void, currentVersion: string, addVersionHistory: (history: any) => void, currentYear: string, currentMonth: string, currentWeek: string, setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export const useEditMode = (): UseEditModeReturn => {
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = (
    currentData: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    if (!isEditMode) {
      // 편집 모드로 전환 시 현재 데이터를 백업
      setOriginalData(JSON.parse(JSON.stringify(currentData)));
      setIsEditMode(true);
      toast.info("편집 모드로 전환되었습니다.");
    } else {
      // 편집 취소 시 원본 데이터로 복원하고 하이라이팅 제거
      setData(JSON.parse(JSON.stringify(originalData)));
      setIsEditMode(false);
      setOriginalData([]);
      setChangedCells(new Set()); // 하이라이팅 완전히 제거
      
      toast.info("편집이 취소되었습니다. 변경 내용이 취소되었습니다.");
    }
  };

  const saveChanges = (
    data: any[][],
    originalData: any[][],
    changedCells: Set<string>,
    setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>,
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    currentVersion: string,
    addVersionHistory: (history: any) => void,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    // 변경사항 확인
    const changes: { row: number; col: number; oldValue: any; newValue: any }[] = [];
    const newChangedCells = new Set<string>();
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell: any, colIndex: number) => {
        if (originalData[rowIndex] && cell !== originalData[rowIndex][colIndex]) {
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
      // 저장을 하면 하이라이팅 제거 (2번 요구사항)
      setChangedCells(new Set());
      
      // 변경 이력에 추가
      const newHistory = {
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
    setIsEditMode,
    toggleEditMode,
    saveChanges
  };
};
