
import { useState, useCallback, useRef } from 'react';
import { handleDataChange } from '@/utils/sales/useSalesDataCalculation';

export interface UseHighlightingReturn {
  afterChange: (changes: any, source: string, data: any[][], setData: React.Dispatch<React.SetStateAction<any[][]>>, isEditMode: boolean, originalData: any[][]) => void;
  modifiedCells: Map<string, boolean>;
  clearHighlighting: () => void;
  isModifiedCell: (row: number, col: number) => boolean;
}

/**
 * 셀 값 변경 처리 및 하이라이팅을 위한 훅 - 성능 최적화 버전
 */
export const useHighlighting = (): UseHighlightingReturn => {
  // Map을 사용하여 메모리 효율성 향상
  const [modifiedCells, setModifiedCells] = useState<Map<string, boolean>>(new Map());
  
  // useRef로 최신 값 참조하여 불필요한 렌더링 방지
  const modifiedCellsRef = useRef<Map<string, boolean>>(modifiedCells);
  
  // 참조 값 업데이트 함수
  const updateModifiedCells = useCallback((newMap: Map<string, boolean>) => {
    modifiedCellsRef.current = newMap;
    setModifiedCells(newMap);
  }, []);

  /**
   * 셀 변경 처리 및 하이라이팅 함수 - 성능 최적화
   */
  const afterChange = useCallback((
    changes: any, 
    source: string, 
    data: any[][], 
    setData: React.Dispatch<React.SetStateAction<any[][]>>, 
    isEditMode: boolean,
    originalData: any[][]
  ) => {
    if (source === 'loadData') return;
    
    if (changes && changes.length > 0 && isEditMode && originalData.length > 0) {      
      // 성능 최적화: Map 복사 최소화
      let needsUpdate = false;
      const newModifiedCells = new Map(modifiedCellsRef.current);
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        const colIndex = Number(prop);
        const cellKey = `${row}_${colIndex}`;
        
        if (originalData[row] && originalData[row][colIndex] !== undefined) {
          // 문자열로 통일하여 비교 (콤마 등 포맷 고려)
          const normalizedOriginal = String(originalData[row][colIndex]).replace(/,/g, '');
          const normalizedNew = String(newValue).replace(/,/g, '');
          
          if (normalizedOriginal !== normalizedNew) {
            if (!newModifiedCells.has(cellKey)) {
              newModifiedCells.set(cellKey, true);
              needsUpdate = true;
            }
          } else if (newModifiedCells.has(cellKey)) {
            newModifiedCells.delete(cellKey);
            needsUpdate = true;
          }
        }
      });
      
      // 변경된 경우에만 상태 업데이트
      if (needsUpdate) {
        updateModifiedCells(newModifiedCells);
      }
      
      // 데이터 업데이트 (셀 값 계산 로직 적용)
      const updatedData = handleDataChange(changes, data);
      setData(updatedData);
    } else if (!isEditMode && modifiedCellsRef.current.size > 0) {
      // 편집 모드가 아닌 경우 하이라이팅 초기화
      updateModifiedCells(new Map());
      
      // 데이터 업데이트
      if (changes && changes.length > 0) {
        const updatedData = handleDataChange(changes, data);
        setData(updatedData);
      }
    }
  }, [updateModifiedCells]);

  /**
   * 하이라이팅 초기화 함수
   */
  const clearHighlighting = useCallback(() => {
    updateModifiedCells(new Map());
  }, [updateModifiedCells]);

  /**
   * 셀이 수정되었는지 확인하는 함수
   */
  const isModifiedCell = useCallback((row: number, col: number): boolean => {
    return modifiedCellsRef.current.has(`${row}_${col}`);
  }, []);

  return {
    afterChange,
    modifiedCells,
    clearHighlighting,
    isModifiedCell
  };
};
