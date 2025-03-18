
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
  isLatestVersion: boolean;
}

export function useSalesVersions(): SalesVersionsHookReturn {
  // 초기 데이터를 한 번만 생성하도록 수정
  const [initialData] = useState(() => {
    const data = generateInitialData();
    return JSON.parse(JSON.stringify(data)); // 깊은 복사로 초기 데이터 저장
  });

  const [versions, setVersions] = useState<string[]>(["rev1"]);
  const [currentVersion, setCurrentVersion] = useState<string>("rev1");
  const [versionData, setVersionData] = useState<VersionData>(() => ({
    "rev1": JSON.parse(JSON.stringify(initialData)) // 깊은 복사로 초기 데이터 저장
  }));
  
  // 현재 버전이 최신 버전인지 확인
  const isLatestVersion = currentVersion === versions[versions.length - 1];

  // 새 버전 저장 핸들러 - 기존 버전 데이터를 보존하면서 새 버전 데이터 저장
  const saveNewVersion = (data: any[]): string | null => {
    try {
      // 전달받은 데이터 깊은 복사 생성
      const newVersionData = JSON.parse(JSON.stringify(data));
      
      // 새 버전 번호 생성
      const versionNum = versions.length + 1;
      const newVersion = `rev${versionNum}`;
      
      setVersionData(prev => {
        const updatedVersionData = { ...prev };
        updatedVersionData[newVersion] = newVersionData;
        return updatedVersionData;
      });
      
      setVersions(prev => [...prev, newVersion]);
      return newVersion;
    } catch (error) {
      console.error("새 버전 저장 중 오류 발생:", error);
      toast.error("새 버전 저장에 실패했습니다.");
      return null;
    }
  };

  // 특정 버전의 데이터 업데이트 (현재 선택된 버전의 데이터만 업데이트)
  const updateVersionData = (version: string, data: any[]) => {
    // rev1은 수정 불가능
    if (version === 'rev1') {
      console.error('초기 버전(rev1)은 수정할 수 없습니다.');
      toast.error('초기 버전(rev1)은 수정할 수 없습니다.');
      return;
    }

    if (!versions.includes(version)) {
      console.error(`업데이트할 버전이 존재하지 않습니다: ${version}`);
      toast.error(`${version} 버전이 존재하지 않아 데이터를 업데이트할 수 없습니다.`);
      return;
    }
    
    try {
      // 깊은 복사를 통해 데이터 업데이트
      const updatedData = JSON.parse(JSON.stringify(data));
      
      setVersionData(prev => {
        const updatedVersionData = { ...prev };
        updatedVersionData[version] = updatedData;
        return updatedVersionData;
      });
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
    updateVersionData,
    isLatestVersion
  };
}
