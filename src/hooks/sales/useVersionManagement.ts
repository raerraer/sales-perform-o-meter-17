
import { toast } from 'sonner';
import { useSalesVersions } from './useSalesVersions';
import { useVersionControl } from './useVersionControl';
import { VersionHistory } from './useSalesHistory';

export interface UseVersionManagementReturn {
  versions: string[];
  currentVersion: string;
  setCurrentVersion: (version: string) => void;
  isLatestVersion: boolean;
  moveToVersion: (version: string) => void;
  saveNewVersionWithData: (data: any[][]) => string | null;
  previousVersion: string | null;
  setPreviousVersion: React.Dispatch<React.SetStateAction<string | null>>;
  versionData: Record<string, any[]>;
}

/**
 * 버전 관리 관련 로직을 분리한 커스텀 훅
 */
export const useVersionManagement = (
  setData: React.Dispatch<React.SetStateAction<any[][]>>,
  setIsEditMode: (value: boolean) => void,
  setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
  clearHighlighting: () => void
): UseVersionManagementReturn => {
  const { 
    versions, 
    currentVersion, 
    setCurrentVersion, 
    versionData, 
    saveNewVersion, 
    updateVersionData,
    isLatestVersion
  } = useSalesVersions();
  
  const { 
    previousVersion, 
    setPreviousVersion, 
    moveToVersion: moveToVersionHandler 
  } = useVersionControl();

  // 특정 버전으로 이동하는 함수
  const moveToVersion = (version: string) => {
    if (version !== currentVersion) {
      moveToVersionHandler(version, setCurrentVersion, versionData, setData);
    }
  };

  // 데이터 저장 및 새 버전 생성 함수
  const saveNewVersionWithData = (data: any[][]): string | null => {
    try {
      const newVersion = saveNewVersion(data);
      
      if (newVersion) {
        setCurrentVersion(newVersion);
        
        // 편집 모드 종료 및 상태 초기화
        setIsEditMode(false);
        setOriginalData([]);
        clearHighlighting();
        
        toast.success(`새 버전(${newVersion})이 저장되었습니다.`);
        return newVersion;
      }
      return null;
    } catch (error) {
      console.error("새 버전 저장 중 오류 발생:", error);
      toast.error("새 버전 저장에 실패했습니다.");
      return null;
    }
  };

  return {
    versions,
    currentVersion, 
    setCurrentVersion,
    isLatestVersion,
    moveToVersion,
    saveNewVersionWithData,
    previousVersion,
    setPreviousVersion,
    versionData
  };
};
