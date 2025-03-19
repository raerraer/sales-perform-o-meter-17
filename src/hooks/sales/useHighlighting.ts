
import { useState } from 'react';
import { handleDataChange } from './useSalesDataCalculation';

export interface UseHighlightingReturn {
  changedCells: Set<string>;
  setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>;
  afterChange: (changes: any, source: string, data: any[][], setData: React.Dispatch<React.SetStateAction<any[][]>>, isEditMode: boolean, originalData: any[][]) => void;
}

export const useHighlighting = (): UseHighlightingReturn => {
  // 변경된 셀 추적을 위한 상태
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());

  const afterChange = (
    changes: any, 
    source: string, 
    data: any[][], 
    setData: React.Dispatch<React.SetStateAction<any[][]>>, 
    isEditMode: boolean,
    originalData: any[][]
  ) => {
    // 데이터 로드 시나 편집 모드가 아닌 경우에는 처리하지 않음
    if (source === 'loadData' || !isEditMode) return;
    
    // 변경사항이 있을 때만 데이터 업데이트
    if (changes && changes.length > 0) {
      // 현재 셀의 하이라이팅 상태를 복사
      const newChangedCells = new Set<string>(changedCells);
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        // 문자열로 변환해서 비교 (다른 타입 처리)
        const normalizedOldValue = String(oldValue).replace(/,/g, '');
        const normalizedNewValue = String(newValue).replace(/,/g, '');
        
        // 값이 실제로 변경된 경우만 처리 (콤마 제거 후 비교)
        if (normalizedOldValue !== normalizedNewValue) {
          const cellKey = `${row},${prop}`;
          
          // 원본 데이터와 비교하여 실제로 변경된 경우에만 하이라이팅 적용
          if (originalData[row]) {
            const originalValue = String(originalData[row][prop] || '').replace(/,/g, '');
            
            if (originalValue !== normalizedNewValue) {
              // 원본과 다르면 하이라이팅 추가
              newChangedCells.add(cellKey);
            } else {
              // 원본과 같아지면 하이라이팅 제거
              newChangedCells.delete(cellKey);
            }
          }
        }
      });
      
      // 하이라이팅 상태 업데이트
      setChangedCells(newChangedCells);
      
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
