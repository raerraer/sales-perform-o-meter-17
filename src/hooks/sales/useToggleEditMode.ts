
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface UseToggleEditModeReturn {
  handleToggleEditMode: (
    isLatestVersion: boolean,
    isEditMode: boolean,
    toggleEditMode: (
      data: any[][],
      originalData: any[][],
      setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
      setData: React.Dispatch<React.SetStateAction<any[][]>>,
      clearHighlighting: () => void
    ) => void,
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => void;
}

/**
 * 편집 모드 전환 관련 기능을 분리한 커스텀 훅
 */
export const useToggleEditMode = (): UseToggleEditModeReturn => {
  // 편집 모드 전환 함수
  const handleToggleEditMode = useCallback((
    isLatestVersion: boolean,
    isEditMode: boolean,
    toggleEditMode: (
      data: any[][],
      originalData: any[][],
      setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
      setData: React.Dispatch<React.SetStateAction<any[][]>>,
      clearHighlighting: () => void
    ) => void,
    data: any[][],
    originalData: any[][],
    setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>,
    clearHighlighting: () => void
  ) => {
    if (!isLatestVersion) {
      toast.warning("이전 버전은 수정할 수 없습니다. 최신 버전만 수정 가능합니다.");
      return;
    }
    
    toggleEditMode(data, originalData, setOriginalData, setData, clearHighlighting);
  }, []);

  return {
    handleToggleEditMode
  };
};
