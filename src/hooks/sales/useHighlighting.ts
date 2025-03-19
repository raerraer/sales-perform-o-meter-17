
import { useState } from 'react';
import { handleDataChange } from './useSalesDataCalculation';
import { parseNumericValue } from '@/utils/sales/dataTransformers';

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
        const cellKey = `${row},${prop}`;
        
        // 원본 데이터가 존재하고 편집 모드인 경우에만 처리
        if (originalData && originalData.length > 0 && isEditMode) {
          if (originalData[row]) {
            const originalValue = originalData[row][prop];
            
            // 값 비교를 위해 숫자로 변환 (콤마 제거)
            const normalizedOriginal = originalValue !== null && originalValue !== undefined 
              ? String(originalValue).replace(/,/g, '') 
              : '';
              
            const normalizedNewValue = newValue !== null && newValue !== undefined 
              ? String(newValue).replace(/,/g, '') 
              : '';
            
            // 원본 값과 현재 값이 다른 경우 하이라이팅 추가
            if (normalizedOriginal !== normalizedNewValue) {
              newChangedCells.add(cellKey);
              console.log(`하이라이팅 추가: 셀 ${cellKey}`, {
                원본값: originalValue,
                새값: newValue,
                정규화원본: normalizedOriginal,
                정규화새값: normalizedNewValue
              });
            } else {
              // 원본과 동일하면 하이라이팅 제거
              newChangedCells.delete(cellKey);
              console.log(`하이라이팅 제거: 셀 ${cellKey}`, {
                원본값: originalValue,
                새값: newValue
              });
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
