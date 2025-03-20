import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CellChange } from './useSalesHistory';
import { getMonthFromColIndex } from '@/components/sales/history/historyUtils';

export interface UseEditModeReturn {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  toggleEditMode: (
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => void;
  saveChanges: (
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    currentVersion: string,
    addVersionHistory: (historyEntry: any) => void,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setIsEditMode: (isEditMode: boolean) => void,
    clearHighlighting: () => void
  ) => void;
  getChangesFromData: (data: any[][], originalData: any[][]) => CellChange[];
}

export function useEditMode(): UseEditModeReturn {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const getChangesFromData = useCallback((data: any[][], originalData: any[][]): CellChange[] => {
    const changes: CellChange[] = [];
    const directChanges = new Set<string>(); // 직접 변경된 셀 위치를 추적
    
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (col === 0 || 
            (data[row][0] && (
              data[row][0].includes('합계') || 
              data[row][0] === '총 합계' || 
              data[row][0] === '미주' || 
              data[row][0] === '유럽' || 
              data[row][0] === '아시아'
            ))
          ) {
          continue;
        }

        if (originalData[row] && originalData[row][col] !== undefined) {
          const originalValue = originalData[row][col];
          const currentValue = data[row][col];
          
          const normalizedOriginal = String(originalValue).replace(/,/g, '');
          const normalizedCurrent = String(currentValue).replace(/,/g, '');
          
          if (normalizedOriginal !== normalizedCurrent) {
            const isCountryOrRegion = data[row][0] === '미주' || 
                                     data[row][0] === '유럽' || 
                                     data[row][0] === '아시아' || 
                                     data[row][0].includes('합계');
            
            if (!isCountryOrRegion && col > 0) {
              directChanges.add(`${row}:${col}`);
            }
          }
        }
      }
    }
    
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (originalData[row] && originalData[row][col] !== undefined) {
          const originalValue = originalData[row][col];
          const currentValue = data[row][col];
          
          const normalizedOriginal = String(originalValue).replace(/,/g, '');
          const normalizedCurrent = String(currentValue).replace(/,/g, '');
          
          if (normalizedOriginal !== normalizedCurrent) {
            const isDirectChange = directChanges.has(`${row}:${col}`);
            
            let country = '';
            let model = '';
            
            if (data[row] && data[row][0]) {
              if (data[row][0].includes('합계') || 
                  data[row][0] === '총 합계' || 
                  data[row][0] === '미주' || 
                  data[row][0] === '유럽' || 
                  data[row][0] === '아시아') {
                country = data[row][0];
              } else {
                model = data[row][0];
                
                for (let i = row - 1; i >= 0; i--) {
                  if (data[i] && data[i][0] && 
                      (data[i][0] === '미국' || 
                       data[i][0] === '중국' || 
                       data[i][0] === '일본' ||
                       data[i][0] === '한국' ||
                       data[i][0] === '독일' ||
                       data[i][0] === '영국')) {
                    country = data[i][0];
                    break;
                  }
                }
              }
            }
            
            const month = getMonthFromColIndex(col);
            
            changes.push({
              row,
              col,
              oldValue: originalValue,
              newValue: currentValue,
              country,
              model,
              month,
              category: '전망',
              isDirectChange
            });
          }
        }
      }
    }
    
    return changes;
  }, []);

  const toggleEditMode = useCallback((
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => {
    setIsEditMode(prev => {
      if (!prev) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
      } else {
        if (window.confirm('변경 내용을 저장하지 않고 편집 모드를 종료하시겠습니까?')) {
          setData(JSON.parse(JSON.stringify(originalData)));
          clearHighlighting();
          setOriginalData([]);
        } else {
          return true;
        }
      }
      return !prev;
    });
  }, []);

  const saveChanges = useCallback((
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    updateVersionData: (version: string, data: any[]) => void,
    currentVersion: string,
    addVersionHistory: (historyEntry: any) => void,
    currentYear: string, 
    currentMonth: string, 
    currentWeek: string,
    setIsEditMode: (isEditMode: boolean) => void,
    clearHighlighting: () => void
  ) => {
    if (originalData.length === 0) {
      toast.warning('편집 모드에서만 저장할 수 있습니다.');
      return;
    }
    
    try {
      const dataCopy = JSON.parse(JSON.stringify(data));
      
      const changes = getChangesFromData(data, originalData);
      
      if (changes.length === 0) {
        toast.info('변경된 내용이 없습니다.');
        return;
      }
      
      updateVersionData(currentVersion, dataCopy);
      
      const now = new Date();
      const formattedDate = now.toLocaleString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const historyEntry = {
        version: currentVersion,
        date: now.toISOString(),
        formattedDate,
        year: currentYear,
        month: currentMonth,
        week: currentWeek,
        changes: changes
      };
      
      addVersionHistory(historyEntry);
      
      setIsEditMode(false);
      setOriginalData([]);
      clearHighlighting();
      
      toast.success('변경 내용이 저장되었습니다.');
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    }
  }, [getChangesFromData]);

  return {
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    saveChanges,
    getChangesFromData
  };
}
