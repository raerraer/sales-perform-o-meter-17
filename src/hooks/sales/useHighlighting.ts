
import { useState } from 'react';
import { handleDataChange } from '@/utils/sales/useSalesDataCalculation';

export interface UseHighlightingReturn {
  afterChange: (changes: any, source: string, data: any[][], setData: React.Dispatch<React.SetStateAction<any[][]>>, isEditMode: boolean, originalData: any[][]) => void;
  modifiedCells: Map<string, boolean>;
  clearHighlighting: () => void;
  isModifiedCell: (row: number, col: number) => boolean;
}

/**
 * 셀 값 변경 처리 및 하이라이팅을 위한 훅
 * @returns 데이터 변경 처리 함수와 하이라이팅 관련 상태/함수
 */
export const useHighlighting = (): UseHighlightingReturn => {
  // 수정된 셀 상태 저장 - '행_열' 형식의 키와 boolean 값을 가진 Map
  const [modifiedCells, setModifiedCells] = useState<Map<string, boolean>>(new Map());

  /**
   * 셀 변경 처리 및 하이라이팅 함수
   * @param changes 변경된 셀 정보
   * @param source 데이터 소스
   * @param data 현재 데이터
   * @param setData 데이터 설정 함수
   * @param isEditMode 편집 모드 여부
   * @param originalData 원본 데이터
   */
  const afterChange = (
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
      // 수정된 셀 맵 업데이트
      const newModifiedCells = new Map(modifiedCells);
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        const colIndex = Number(prop);
        const cellKey = `${row}_${colIndex}`;
        
        // 모델 행(국가 소속)만 하이라이트 적용 - 원본 데이터와 비교
        if (originalData[row] && originalData[row][colIndex] !== undefined) {
          const originalValue = originalData[row][colIndex];
          
          // 원본 값과 다른 경우 하이라이팅 적용, 같으면 하이라이팅 제거
          if (originalValue !== newValue) {
            newModifiedCells.set(cellKey, true);
          } else {
            newModifiedCells.delete(cellKey);
          }
        }
      });
      
      setModifiedCells(newModifiedCells);
      
      // 데이터 업데이트 (셀 값 계산 로직 적용)
      const updatedData = handleDataChange(changes, data);
      setData(updatedData);
    } else if (!isEditMode) {
      // 편집 모드가 아닌 경우 하이라이팅 초기화
      if (modifiedCells.size > 0) {
        setModifiedCells(new Map());
      }
      
      // 데이터 업데이트
      if (changes && changes.length > 0) {
        const updatedData = handleDataChange(changes, data);
        setData(updatedData);
      }
    }
  };

  /**
   * 하이라이팅 초기화 함수
   */
  const clearHighlighting = () => {
    setModifiedCells(new Map());
  };

  /**
   * 셀이 수정되었는지 확인하는 함수
   * @param row 행 인덱스
   * @param col 열 인덱스
   * @returns 수정 여부
   */
  const isModifiedCell = (row: number, col: number): boolean => {
    return modifiedCells.has(`${row}_${col}`);
  };

  return {
    afterChange,
    modifiedCells,
    clearHighlighting,
    isModifiedCell
  };
};
