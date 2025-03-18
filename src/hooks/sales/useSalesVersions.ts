
import { useState, useEffect } from 'react';
import { generateInitialData } from '@/utils/salesTableUtils';
import { toast } from "sonner";

export interface VersionData {
  [version: string]: any[];
}

export interface SalesVersionsHookReturn {
  versions: string[];
  currentVersion: string;
  setCurrentVersion: (version: string) => void;
  versionData: VersionData;
  saveNewVersion: (data: any[]) => string | null;
  updateVersionData: (version: string, data: any[]) => void;
}

export function useSalesVersions(): SalesVersionsHookReturn {
  const initialData = generateInitialData();
  const [versions, setVersions] = useState<string[]>(["rev1"]);
  const [currentVersion, setCurrentVersion] = useState<string>("rev1");
  const [versionData, setVersionData] = useState<VersionData>({
    "rev1": initialData
  });

  // 버전 변경 시 해당 버전의 데이터로 업데이트
  useEffect(() => {
    if (!versionData[currentVersion]) {
      console.error(`버전 데이터가 없습니다: ${currentVersion}`);
      
      // rev1으로 돌아가기 (기본 버전이 없는 경우 방지)
      if (currentVersion !== "rev1" && versionData["rev1"]) {
        setCurrentVersion("rev1");
        toast.error(`${currentVersion} 버전 데이터가 없습니다. rev1 버전으로 돌아갑니다.`);
      }
    }
  }, [currentVersion, versionData]);

  // 새 버전 저장 핸들러 - 버전명 반환하도록 수정
  const saveNewVersion = (data: any[]): string | null => {
    try {
      // 새 버전 번호 생성
      const versionNum = versions.length + 1;
      const newVersion = `rev${versionNum}`;
      
      // 버전 데이터 저장 (깊은 복사)
      const newVersionData = JSON.parse(JSON.stringify(data));
      
      setVersionData(prev => ({
        ...prev,
        [newVersion]: newVersionData
      }));
      
      // 버전 추가
      setVersions(prev => [...prev, newVersion]);
      
      // 새 버전명 반환
      return newVersion;
    } catch (error) {
      console.error("새 버전 저장 중 오류 발생:", error);
      toast.error("새 버전 저장에 실패했습니다.");
      return null;
    }
  };

  // 특정 버전의 데이터 업데이트
  const updateVersionData = (version: string, data: any[]) => {
    if (!versions.includes(version)) {
      console.error(`업데이트할 버전이 존재하지 않습니다: ${version}`);
      toast.error(`${version} 버전이 존재하지 않아 데이터를 업데이트할 수 없습니다.`);
      return;
    }
    
    try {
      // 깊은 복사를 통해 데이터 업데이트
      setVersionData(prev => ({
        ...prev,
        [version]: JSON.parse(JSON.stringify(data))
      }));
    } catch (error) {
      console.error(`${version} 버전 데이터 업데이트 중 오류 발생:`, error);
      toast.error(`${version} 버전 데이터 업데이트에 실패했습니다.`);
    }
  };

  return {
    versions,
    currentVersion,
    setCurrentVersion,
    versionData,
    saveNewVersion,
    updateVersionData
  };
}
