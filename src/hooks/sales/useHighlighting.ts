
import { useState } from 'react';
import { handleDataChange } from './useSalesDataCalculation';

export interface UseHighlightingReturn {
  changedCells: Set<string>;
  setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>;
  afterChange: (changes: any, source: string, data: any[][], setData: React.Dispatch<React.SetStateAction<any[][]>>, isEditMode: boolean, originalData: any[][]) => void;
}

export const useHighlighting = (): UseHighlightingReturn => {
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());

  const afterChange = (
    changes: any, 
    source: string, 
    data: any[][], 
    setData: React.Dispatch<React.SetStateAction<any[][]>>, 
    isEditMode: boolean,
    originalData: any[][]
  ) => {
    if (source === 'loadData' || !isEditMode) return;
    
    // 변경사항이 있을 때만 데이터 업데이트
    if (changes && changes.length > 0) {
      // 현재 셀의 하이라이팅 상태를 복사
      const tmpChangedCells = new Set<string>(changedCells);
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        // 값이 실제로 변경된 경우만 처리
        if (oldValue !== newValue) {
          const cellKey = `${row},${prop}`;
          
          // 원본 데이터와 비교하여 실제로 변경된 경우에만 하이라이팅 적용
          if (originalData[row] && originalData[row][prop] !== newValue) {
            tmpChangedCells.add(cellKey);
          } else {
            // 원본 데이터와 동일해진 경우는 하이라이팅 제거
            tmpChangedCells.delete(cellKey);
          }
        }
      });
      
      // 하이라이팅 상태 업데이트
      setChangedCells(tmpChangedCells);
      
      // 데이터 업데이트 (셀 값 계산 로직 적용)
      const updatedData = handleDataChange(changes, data);
      setData(updatedData);
    }
  };

  return {
    changedCells,
    setChangedCells,
    afterChange
  };
};
