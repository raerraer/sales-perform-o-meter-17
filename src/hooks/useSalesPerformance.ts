
import { useState, useRef } from 'react';
import { generateInitialData, createCellsSettingsFunction, COUNTRIES } from '@/utils/salesTableUtils';
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

  // 국가 행에 대한 합계 재계산 함수
  const recalculateCountryTotals = (newData: any[]): any[] => {
    const updatedData = [...newData];
    
    // 각 국가별 처리
    let currentCountryIndex = -1;
    
    for (let i = 0; i < updatedData.length; i++) {
      // 현재 행이 국가 행인지 확인
      if (COUNTRIES.includes(updatedData[i][0])) {
        currentCountryIndex = i;
        
        // 해당 국가의 모델 행 범위 찾기
        const modelRows: number[] = [];
        let j = i + 1;
        while (j < updatedData.length && !COUNTRIES.includes(updatedData[j][0])) {
          modelRows.push(j);
          j++;
        }
        
        // 각 셀에 대해 합계 계산
        for (let col = 1; col < updatedData[i].length; col++) {
          // 비고 열은 계산에서 제외
          if ((col - 1) % 11 === 10) continue;
          
          // Qty 열 또는 Amt 열인지 확인하여 합계 계산
          if ((col - 1) % 2 === 0) { // Qty 열
            const sum = modelRows.reduce((acc, rowIdx) => {
              return acc + (Number(updatedData[rowIdx][col]) || 0);
            }, 0);
            updatedData[currentCountryIndex][col] = sum.toString();
          } else { // Amt 열
            const sum = modelRows.reduce((acc, rowIdx) => {
              const amtValue = updatedData[rowIdx][col] ? updatedData[rowIdx][col].toString().replace(/,/g, '') : '0';
              return acc + (Number(amtValue) || 0);
            }, 0);
            updatedData[currentCountryIndex][col] = sum.toLocaleString();
          }
        }
      }
    }
    
    return updatedData;
  };

  const afterChange = (changes: any, source: string) => {
    if (source === 'loadData') return;
    
    // 변경사항이 있을 때만 데이터 업데이트
    if (changes && changes.length > 0) {
      const newData = [...data];
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        // 비고 열이 아닌 경우에 데이터 유효성 검사
        const colIndex = Number(prop);
        const isRemarksColumn = (colIndex - 1) % 11 === 10;
        
        if (!isRemarksColumn) {
          // Qty 열: 숫자만 허용
          if ((colIndex - 1) % 2 === 0) {
            // 숫자가 아닌 입력은 이전 값으로 복원
            if (isNaN(Number(newValue)) || newValue === '') {
              newData[row][colIndex] = oldValue;
              return;
            }
            // 숫자로 변환하여 저장
            newData[row][colIndex] = Number(newValue).toString();
          } 
          // Amt 열: 숫자만 허용 (천 단위 구분자 처리)
          else {
            // 콤마 제거 후 숫자 여부 확인
            const cleanValue = newValue?.toString().replace(/,/g, '');
            if (isNaN(Number(cleanValue)) || cleanValue === '') {
              newData[row][colIndex] = oldValue;
              return;
            }
            // 숫자로 변환 후 천 단위 구분자 추가하여 저장
            newData[row][colIndex] = Number(cleanValue).toLocaleString();
          }
        } else {
          // 비고 열: 그대로 저장
          newData[row][colIndex] = newValue;
        }
      });
      
      // 국가 행 합계 재계산
      const updatedData = recalculateCountryTotals(newData);
      setData(updatedData);
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
