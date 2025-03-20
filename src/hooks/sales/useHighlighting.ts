
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
 * @returns 데이터 변경 처리 함수와 하이라이팅 관련 상태/함수
 */
export const useHighlighting = (): UseHighlightingReturn => {
  // 수정된 셀 상태 저장 - '행_열' 형식의 키와 boolean 값을 가진 Map
  const [modifiedCells, setModifiedCells] = useState<Map<string, boolean>>(new Map());
  
  // 렌더링 최적화를 위한 참조 값 저장
  const modifiedCellsRef = useRef<Map<string, boolean>>(modifiedCells);
  
  // 참조 값 업데이트
  const updateModifiedCells = useCallback((newMap: Map<string, boolean>) => {
    modifiedCellsRef.current = newMap;
    setModifiedCells(newMap);
  }, []);

  /**
   * 셀 변경 처리 및 하이라이팅 함수 - useCallback으로 최적화
   */
  const afterChange = useCallback((
    changes: any, 
    source: string, 
    data: any[][], 
    setData: React.Dispatch<React.SetStateAction<any[][]>>, 
    isEditMode: boolean,
    originalData: any[][]
  ) => {
    // 데이터 로드 시에는 처리하지 않음
    if (source === 'loadData') return;
    
    // 변경사항이 있을 때만 처리
    if (changes && changes.length > 0 && isEditMode && originalData.length > 0) {      
      // 성능 최적화: Map 복사 최소화
      let needsUpdate = false;
      const newModifiedCells = new Map(modifiedCellsRef.current);
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        const colIndex = Number(prop);
        const cellKey = `${row}_${colIndex}`;
        
        // 모델 행(국가 소속)만 하이라이트 적용 - 원본 데이터와 비교
        if (originalData[row] && originalData[row][colIndex] !== undefined) {
          const originalValue = originalData[row][colIndex];
          
          // 중요 수정: 값이 실제로 변경된 경우에만 하이라이팅 적용
          // 문자열로 통일하여 비교 (콤마 등 포맷 고려)
          const normalizedOriginal = String(originalValue).replace(/,/g, '');
          const normalizedNew = String(newValue).replace(/,/g, '');
          
          if (normalizedOriginal !== normalizedNew) {
            if (!newModifiedCells.has(cellKey)) {
              newModifiedCells.set(cellKey, true);
              needsUpdate = true;
            }
          } else if (newModifiedCells.has(cellKey)) {
            // 원래 값으로 돌아갔으면 하이라이팅 제거
            newModifiedCells.delete(cellKey);
            needsUpdate = true;
          }
        }
      });
      
      // 변경된 경우에만 상태 업데이트 수행
      if (needsUpdate) {
        updateModifiedCells(newModifiedCells);
      }
      
      // 데이터 업데이트 (셀 값 계산 로직 적용)
      // 성능 최적화: 불필요한 재렌더링 방지
      const updatedData = handleDataChange(changes, data);
      setData(updatedData);
    } else if (!isEditMode) {
      // 편집 모드가 아닌 경우 하이라이팅 초기화
      if (modifiedCellsRef.current.size > 0) {
        updateModifiedCells(new Map());
      }
      
      // 데이터 업데이트
      if (changes && changes.length > 0) {
        const updatedData = handleDataChange(changes, data);
        setData(updatedData);
      }
    }
  }, [updateModifiedCells]);

  /**
   * 하이라이팅 초기화 함수 - useCallback으로 최적화
   */
  const clearHighlighting = useCallback(() => {
    updateModifiedCells(new Map());
  }, [updateModifiedCells]);

  /**
   * 셀이 수정되었는지 확인하는 함수 - useCallback으로 최적화
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
