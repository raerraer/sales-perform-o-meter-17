
import { useCallback } from 'react';

export interface UseEditModeToggleReturn {
  toggleEditMode: (
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void,
    isEditMode: boolean,
    setIsEditMode: (isEditMode: boolean) => void
  ) => void;
}

/**
 * 편집 모드 토글 기능만 담당하는 훅
 */
export function useEditModeToggle(): UseEditModeToggleReturn {
  const toggleEditMode = useCallback((
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void,
    isEditMode: boolean,
    setIsEditMode: (isEditMode: boolean) => void
  ) => {
    if (!isEditMode) {
      // 편집 모드 진입 시 원본 데이터 저장
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setIsEditMode(true);
    } else {
      // 편집 모드 종료 시 확인 및 원본 데이터로 복원
      if (window.confirm('변경 내용을 저장하지 않고 편집 모드를 종료하시겠습니까?')) {
        setData(JSON.parse(JSON.stringify(originalData)));
        clearHighlighting();
        setOriginalData([]);
        setIsEditMode(false);
      }
    }
  }, []);

  return {
    toggleEditMode
  };
}
