
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useEditMode = () => {
  const [isEditMode, setIsEditMode] = useState(false);

  /**
   * 편집 모드 토글 함수 - useCallback으로 최적화
   */
  const toggleEditMode = useCallback((
    data: any[][], 
    originalData: any[][], 
    setOriginalData: (data: any[][]) => void,
    setData: (data: any[][]) => void,
    clearHighlighting?: () => void
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
          
          // 하이라이팅 초기화
          if (clearHighlighting) {
            clearHighlighting();
          }
          
          toast.info("편집이 취소되었습니다.");
        }
      } else {
        setIsEditMode(false);
        toast.info("편집 모드가 종료되었습니다.");
      }
    }
  }, [isEditMode]);

  /**
   * 변경사항 저장 함수 - useCallback으로 최적화
   */
  const saveChanges = useCallback((
    data: any[][], 
    originalData: any[][],
    setOriginalData: (data: any[][]) => void,
    updateVersionData: (version: string, data: any[][]) => void,
    currentVersion: string,
    addVersionHistory: () => void,
    currentYear: string,
    currentMonth: string,
    currentWeek: string,
    setIsEditMode: (isEditMode: boolean) => void,
    clearHighlighting?: () => void
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
        addVersionHistory();
        
        // 편집 모드 종료 및 상태 초기화
        setOriginalData([]);
        setIsEditMode(false);
        
        // 하이라이팅 초기화
        if (clearHighlighting) {
          clearHighlighting();
        }
        
        toast.success("변경사항이 저장되었습니다.");
      } catch (error) {
        console.error("저장 실패:", error);
        toast.error("변경사항 저장에 실패했습니다.");
      }
    }
  }, [isEditMode]);

  return {
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    saveChanges
  };
};
