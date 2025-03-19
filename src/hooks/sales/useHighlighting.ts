
import { useState } from 'react';
import { handleDataChange } from '@/utils/sales/useSalesDataCalculation';

export interface UseHighlightingReturn {
  afterChange: (changes: any, source: string, data: any[][], setData: React.Dispatch<React.SetStateAction<any[][]>>, isEditMode: boolean, originalData: any[][]) => void;
}

/**
 * 셀 값 변경 처리를 위한 훅
 * @returns 데이터 변경 처리 함수
 */
export const useHighlighting = (): UseHighlightingReturn => {
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
      // 데이터 업데이트 (셀 값 계산 로직 적용)
      const updatedData = handleDataChange(changes, data);
      setData(updatedData);
    }
  };

  return {
    afterChange
  };
};
