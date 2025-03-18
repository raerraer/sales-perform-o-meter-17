
import { useState } from 'react';
import { toast } from 'sonner';

export interface UseVersionControlReturn {
  previousVersion: string | null;
  setPreviousVersion: React.Dispatch<React.SetStateAction<string | null>>;
  handleSaveNewVersion: (
    data: any[][], 
    saveNewVersion: (data: any[]) => string | null, 
    setCurrentVersion: (version: string) => void, 
    setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => void;
  moveToVersion: (
    version: string, 
    setCurrentVersion: (version: string) => void
  ) => void;
}

export const useVersionControl = (): UseVersionControlReturn => {
  const [previousVersion, setPreviousVersion] = useState<string | null>(null);

  // 새 버전 저장 핸들러
  const handleSaveNewVersion = (
    data: any[][], 
    saveNewVersion: (data: any[]) => string | null, 
    setCurrentVersion: (version: string) => void, 
    setChangedCells: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    // 변경된 내용이 있는지 확인 (하이라이팅된 셀이 있는지)
    const hasChanges = document.querySelectorAll('.highlight-cell').length > 0;
    
    if (!hasChanges) {
      toast.info("변경된 내용이 없어 새 버전을 저장하지 않았습니다.");
      return;
    }
    
    // 사용자에게 확인
    if (confirm("새 버전을 저장하시겠습니까?")) {
      // 새 버전 생성 및 저장
      const newVersion = saveNewVersion(data);
      
      if (newVersion) {
        // 새 버전으로 자동 전환
        setCurrentVersion(newVersion);
        
        // 새 버전 저장 시 하이라이팅 제거
        setChangedCells(new Set());
        toast.success(`새 버전(${newVersion})이 저장되었습니다.`);
      }
    }
  };

  // 특정 버전으로 이동하는 함수
  const moveToVersion = (
    version: string, 
    setCurrentVersion: (version: string) => void
  ) => {
    setCurrentVersion(version);
  };

  return {
    previousVersion,
    setPreviousVersion,
    handleSaveNewVersion,
    moveToVersion
  };
};
