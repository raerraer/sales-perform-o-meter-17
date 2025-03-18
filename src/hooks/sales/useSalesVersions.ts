
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
  saveNewVersion: (data: any[], changedCells: Set<string>) => string;
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
    }
  }, [currentVersion, versionData]);

  // 새 버전 저장 핸들러 - 버전명 반환하도록 수정
  const saveNewVersion = (data: any[], changedCells: Set<string>): string => {
    if (changedCells.size === 0) {
      toast.info("변경된 내용이 없습니다.");
      return currentVersion; // 현재 버전 반환
    }
    
    // 새 버전 번호 생성
    const versionNum = versions.length + 1;
    const newVersion = `rev${versionNum}`;
    
    // 버전 데이터 저장 (깊은 복사)
    setVersionData(prev => ({
      ...prev,
      [newVersion]: JSON.parse(JSON.stringify(data))
    }));
    
    // 버전 추가
    setVersions(prev => [...prev, newVersion]);
    
    // 새 버전명 반환
    return newVersion;
  };

  // 특정 버전의 데이터 업데이트
  const updateVersionData = (version: string, data: any[]) => {
    setVersionData(prev => ({
      ...prev,
      [version]: JSON.parse(JSON.stringify(data))
    }));
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
