
import { useState } from 'react';
import { toast } from 'sonner';

export const useEditMode = () => {
  const [isEditMode, setIsEditMode] = useState(false);

  /**
   * 편집 모드 토글 함수
   * @param data 현재 데이터 
   * @param originalData 원본 데이터
   * @param setOriginalData 원본 데이터 설정 함수
   * @param setData 데이터 설정 함수
   */
  const toggleEditMode = (
    data: any[][], 
    originalData: any[][], 
    setOriginalData: (data: any[][]) => void,
    setData: (data: any[][]) => void
  ) => {
    if (!isEditMode) {
      // 편집 모드 진입 - 원본 데이터 저장
      const deepCopy = JSON.parse(JSON.stringify(data));
      setOriginalData(deepCopy);
      setIsEditMode(true);
      toast.info("편집 모드가 활성화되었습니다.");
    } else {
      // 편집 모드 해제 - 원본 데이터로 복원
      if (originalData.length > 0) {
        const confirmCancel = window.confirm("편집 모드를 종료하시겠습니까? 저장되지 않은 변경사항은 모두 취소됩니다.");
        if (confirmCancel) {
          setData(JSON.parse(JSON.stringify(originalData)));
          setOriginalData([]);
          setIsEditMode(false);
          toast.info("편집이 취소되었습니다.");
        }
      } else {
        setIsEditMode(false);
        toast.info("편집 모드가 종료되었습니다.");
      }
    }
  };

  /**
   * 변경사항 저장 함수
   * @param data 현재 데이터
   * @param originalData 원본 데이터
   * @param setOriginalData 원본 데이터 설정 함수
   * @param updateVersionData 버전 데이터 업데이트 함수
   * @param currentVersion 현재 버전
   * @param addVersionHistory 버전 이력 추가 함수
   * @param currentYear 현재 연도
   * @param currentMonth 현재 월
   * @param currentWeek 현재 주
   * @param setIsEditMode 편집 모드 설정 함수
   */
  const saveChanges = (
    data: any[][], 
    originalData: any[][],
    setOriginalData: (data: any[][]) => void,
    updateVersionData: (version: string, data: any[][]) => void,
    currentVersion: string,
    addVersionHistory: (version: string, year: string, month: string, week: string) => void,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setIsEditMode: (isEditMode: boolean) => void
  ) => {
    if (!isEditMode) {
      toast.error("편집 모드가 아닙니다.");
      return;
    }

    const confirmSave = window.confirm("변경사항을 저장하시겠습니까?");
    if (confirmSave) {
      try {
        // 변경사항 저장
        updateVersionData(currentVersion, data);
        
        // 변경 이력 추가
        addVersionHistory(currentVersion, currentYear, currentMonth, currentWeek);
        
        // 편집 모드 종료 및 상태 초기화
        setOriginalData([]);
        setIsEditMode(false);
        
        toast.success("변경사항이 저장되었습니다.");
      } catch (error) {
        console.error("저장 실패:", error);
        toast.error("변경사항 저장에 실패했습니다.");
      }
    }
  };

  return {
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    saveChanges
  };
};
