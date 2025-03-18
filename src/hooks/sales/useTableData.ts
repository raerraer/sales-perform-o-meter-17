
import { useState, useRef } from 'react';
import { generateInitialData } from '@/utils/salesTableUtils';
import { handleDataChange } from './useSalesDataCalculation';

export interface TableDataHookReturn {
  hotRef: React.RefObject<any>;
  data: any[];
  setData: (data: any[]) => void;
  afterChange: (changes: any, source: string, isEditMode: boolean, originalData: any[], updateHighlighting: (changes: any[], data: any[], originalData: any[]) => void) => void;
}

export function useTableData(): TableDataHookReturn {
  const hotRef = useRef<any>(null);
  const initialData = useRef(generateInitialData());
  const [data, setData] = useState(initialData.current);
  
  const afterChange = (
    changes: any, 
    source: string, 
    isEditMode: boolean, 
    originalData: any[],
    updateHighlighting: (changes: any[], data: any[], originalData: any[]) => void
  ) => {
    if (source === 'loadData' || !isEditMode) return;
    
    // 변경사항이 있을 때만 데이터 업데이트
    if (changes && changes.length > 0) {
      // 하이라이팅 업데이트
      updateHighlighting(changes, data, originalData);
      
      // 데이터 변경 처리
      const updatedData = handleDataChange(changes, data);
      setData(updatedData);
    }
  };
  
  return {
    hotRef,
    data,
    setData,
    afterChange
  };
}
