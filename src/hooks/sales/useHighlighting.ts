
import { useState } from 'react';

export interface HighlightingHookReturn {
  changedCells: Set<string>;
  setChangedCells: (cells: Set<string>) => void;
  clearHighlighting: () => void;
  updateHighlighting: (changes: any[], data: any[], originalData: any[]) => void;
}

export function useHighlighting(): HighlightingHookReturn {
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());
  
  const clearHighlighting = () => {
    setChangedCells(new Set());
  };
  
  const updateHighlighting = (changes: any[], data: any[], originalData: any[]) => {
    if (!changes || changes.length === 0) return;
    
    // 현재 하이라이팅된 셀 집합 유지
    const tmpChangedCells = new Set<string>(changedCells);
    
    changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
      // 실제 값이 변경된 경우에만 하이라이팅 적용
      if (oldValue !== newValue) {
        // 원본 데이터와 비교하여 실제로 변경된 경우에만 하이라이팅
        if (originalData[row][prop] !== newValue) {
          tmpChangedCells.add(`${row},${prop}`);
        } else {
          // 원본 데이터와 같아지면 하이라이팅 제거
          tmpChangedCells.delete(`${row},${prop}`);
        }
      }
    });
    
    // 업데이트된 하이라이팅 적용
    setChangedCells(tmpChangedCells);
  };
  
  return {
    changedCells,
    setChangedCells,
    clearHighlighting,
    updateHighlighting
  };
}
