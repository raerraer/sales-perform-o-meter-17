
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
    setCurrentVersion: (version: string) => void,
    versionData: Record<string, any[]>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>
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
      // 새 버전 생성 및 저장 - 강제로 새 버전 생성
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
    setCurrentVersion: (version: string) => void,
    versionData: Record<string, any[]>,
    setData: React.Dispatch<React.SetStateAction<any[][]>>
  ) => {
    // 선택한 버전의 데이터가 존재하는지 확인
    if (versionData[version]) {
      try {
        // 버전 데이터를 깊은 복사로 불러오기
        const versionDataCopy = JSON.parse(JSON.stringify(versionData[version]));
        
        // 테이블 데이터 업데이트
        setData(versionDataCopy);
        
        // 현재 버전 상태 업데이트
        setCurrentVersion(version);
        
        toast.info(`${version} 버전 데이터를 불러왔습니다.`);
      } catch (error) {
        console.error("버전 데이터 로드 중 오류 발생:", error);
        toast.error(`${version} 버전 데이터 로드 중 오류가 발생했습니다.`);
      }
    } else {
      toast.error(`${version} 버전 데이터를 찾을 수 없습니다.`);
    }
  };

  return {
    previousVersion,
    setPreviousVersion,
    handleSaveNewVersion,
    moveToVersion
  };
};
