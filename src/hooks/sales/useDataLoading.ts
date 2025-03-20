
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * 버전 데이터 로딩 로직을 분리한 커스텀 훅
 */
export const useDataLoading = (
  currentVersion: string,
  previousVersion: string | null,
  versionData: Record<string, any[]>,
  isInitialLoad: boolean,
  setData: React.Dispatch<React.SetStateAction<any[][]>>,
  setPreviousVersion: React.Dispatch<React.SetStateAction<string | null>>,
  setCurrentVersion: (version: string) => void,
  isEditMode: boolean,
  setIsEditMode: (value: boolean) => void,
  setOriginalData: React.Dispatch<React.SetStateAction<any[][]>>,
  clearHighlighting: () => void,
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  
  useEffect(() => {
    if (!isInitialLoad || previousVersion !== currentVersion) {
      try {
        if (versionData && versionData[currentVersion]) {
          console.log(`${currentVersion} 버전 데이터 로드:`, versionData[currentVersion]);
          
          const versionDataCopy = JSON.parse(JSON.stringify(versionData[currentVersion]));
          
          if (Array.isArray(versionDataCopy)) {
            setData(versionDataCopy);
            setPreviousVersion(currentVersion);
            
            if (isEditMode) {
              setIsEditMode(false);
              setOriginalData([]);
              clearHighlighting();
            }
            
            toast.info(`${currentVersion} 버전 데이터를 불러왔습니다.`);
          } else {
            throw new Error(`${currentVersion} 버전의 데이터 형식이 올바르지 않습니다.`);
          }
        } else {
          throw new Error(`${currentVersion} 버전 데이터가 존재하지 않습니다.`);
        }
      } catch (error) {
        console.error(`버전 데이터 로드 오류:`, error);
        toast.error(`${currentVersion} 버전 데이터를 불러오는 데 실패했습니다.`);
        
        if (currentVersion !== 'rev1' && versionData['rev1']) {
          setCurrentVersion('rev1');
        }
      }
    }
    
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [currentVersion, versionData, isInitialLoad]);
};
