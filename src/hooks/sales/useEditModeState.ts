
import { useState } from 'react';

export interface UseEditModeStateReturn {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
}

/**
 * 편집 모드의 상태만 관리하는 간단한 훅
 */
export function useEditModeState(): UseEditModeStateReturn {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  return {
    isEditMode,
    setIsEditMode
  };
}
