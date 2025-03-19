
import { useState } from 'react';
import { processDataChanges } from '@/utils/sales/dataChangeHandler';
import { recalculateCountryTotals } from '@/utils/sales/useSalesDataCalculation';

export interface UseHighlightingReturn {
  changedCells: Set<string>;
  setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>;
  afterChange: (changes: any, source: string, data: any[][], setData: React.Dispatch<React.SetStateAction<any[][]>>, isEditMode: boolean, originalData: any[][]) => void;
}

/**
 * 셀 값 변경 추적 및 하이라이팅 관리를 위한 훅
 * @returns 하이라이팅 관련 함수와 상태
 */
export const useHighlighting = (): UseHighlightingReturn => {
  // 변경된 셀 추적을 위한 상태
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());

  /**
   * 변경된 값이 원본과 동일한지 비교
   * @param originalValue 원본 값
   * @param newValue 새 값
   * @returns 값이 다른지 여부
   */
  const isValueDifferentFromOriginal = (originalValue: any, newValue: any): boolean => {
    // 값 비교를 위해 문자열로 변환 (콤마 제거)
    const normalizedOriginal = originalValue !== null && originalValue !== undefined 
      ? String(originalValue).replace(/,/g, '') 
      : '';
        
    const normalizedNewValue = newValue !== null && newValue !== undefined 
      ? String(newValue).replace(/,/g, '') 
      : '';
    
    // 원본 값과 현재 값 비교
    return normalizedOriginal !== normalizedNewValue;
  };

  /**
   * 하이라이팅 상태를 업데이트하는 함수
   * @param changes 변경된 셀 정보
   * @param originalData 원본 데이터
   * @returns 업데이트된 하이라이팅 셀 집합
   */
  const updateHighlightedCells = (
    changes: [number, any, any, any][], 
    originalData: any[][]
  ): Set<string> => {
    const newChangedCells = new Set<string>(changedCells);
    
    changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
      const cellKey = `${row},${prop}`;
      
      // 원본 데이터가 존재하는 경우에만 처리
      if (originalData && originalData.length > 0 && originalData[row]) {
        const originalValue = originalData[row][prop];
        
        if (isValueDifferentFromOriginal(originalValue, newValue)) {
          // 원본 값과 다른 경우 하이라이팅 추가
          newChangedCells.add(cellKey);
          console.log(`하이라이팅 추가: 셀 ${cellKey}`, {
            원본값: originalValue,
            새값: newValue
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
    });
    
    return newChangedCells;
  };

  /**
   * 데이터 변경 처리 함수
   * @param changes 변경된 셀 정보
   * @param data 현재 데이터
   * @returns 업데이트된 데이터
   */
  const handleDataChanges = (changes: any, data: any[][]): any[][] => {
    if (!changes || changes.length === 0) return data;
    
    // 1. 데이터 변경 처리 (유효성 검사 및 포맷팅)
    const processedData = processDataChanges(changes, data);
    
    // 2. 모든 레벨의 합계 재계산
    return recalculateCountryTotals(processedData);
  };

  /**
   * 셀 변경 처리 함수
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
    if (changes && changes.length > 0) {
      // 편집 모드에서만 하이라이팅 상태 업데이트
      if (isEditMode) {
        // 하이라이팅 상태 업데이트
        const newChangedCells = updateHighlightedCells(changes, originalData);
        setChangedCells(newChangedCells);
      }
      
      // 데이터 업데이트 (셀 값 계산 로직 적용) - 편집 모드 여부와 관계 없이 항상 실행
      const updatedData = handleDataChanges(changes, data);
      setData(updatedData);
    }
  };

  return {
    changedCells,
    setChangedCells,
    afterChange
  };
};
