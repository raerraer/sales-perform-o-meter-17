
import { useState, useRef } from 'react';
import { generateInitialData, createCellsSettingsFunction } from '@/utils/salesTableUtils';
import { toast } from "sonner";

const useSalesPerformance = () => {
  const hotRef = useRef<any>(null);
  const [data, setData] = useState(generateInitialData());
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<any[]>([]);
  
  // 현재 보기 모드에 따라 셀 설정을 다르게 적용
  const getCellsSettings = () => {
    return createCellsSettingsFunction(data, isEditMode, originalData);
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      // 편집 모드로 전환 시 현재 데이터를 백업
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setIsEditMode(true);
      toast.info("편집 모드로 전환되었습니다.");
    } else {
      // 편집 취소
      setData(JSON.parse(JSON.stringify(originalData)));
      setIsEditMode(false);
      setOriginalData([]);
      toast.info("편집이 취소되었습니다.");
    }
  };

  const saveChanges = () => {
    // 변경사항 확인
    const hasChanges = data.some((row, rowIndex) => 
      row.some((cell: any, colIndex: number) => cell !== originalData[rowIndex][colIndex])
    );

    if (!hasChanges) {
      toast.info("변경사항이 없습니다.");
      setIsEditMode(false);
      return;
    }

    // 실제 저장 전 사용자에게 확인
    if (confirm("변경사항을 저장하시겠습니까?")) {
      toast.success("변경사항이 저장되었습니다.");
      setIsEditMode(false);
      setOriginalData([]);
    }
  };

  const afterChange = (changes: any, source: string) => {
    if (source === 'loadData') return;
    
    // 변경사항이 있을 때만 데이터 업데이트
    if (changes && changes.length > 0) {
      const newData = [...data];
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        newData[row][prop] = newValue;
      });
      
      setData(newData);
    }
  };

  return {
    hotRef,
    data,
    isEditMode,
    getCellsSettings,
    toggleEditMode,
    saveChanges,
    afterChange
  };
};

export default useSalesPerformance;
