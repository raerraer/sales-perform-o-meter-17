
import { useState, useRef } from 'react';
import { generateInitialData } from '@/utils/salesTableUtils';

export interface UseTableStateReturn {
  hotRef: React.RefObject<any>;
  data: any[][];
  setData: React.Dispatch<React.SetStateAction<any[][]>>;
  originalData: any[][];
  setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>;
  isInitialLoad: boolean;
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useTableState = (): UseTableStateReturn => {
  const hotRef = useRef<any>(null);
  const initialData = useRef(generateInitialData());
  const [data, setData] = useState(initialData.current);
  const [originalData, setOriginalData] = useState<any[][]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  return {
    hotRef,
    data,
    setData,
    originalData,
    setOriginalData,
    isInitialLoad,
    setIsInitialLoad
  };
};
