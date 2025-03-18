
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

  // 새 버전 저장 핸들러 - 항상 새 버전으로 데이터 저장 (기존 버전 데이터 유지)
  const saveNewVersion = (data: any[]): string | null => {
    try {
      // 전달받은 데이터 깊은 복사 생성 (참조 문제 방지)
      const newVersionData = JSON.parse(JSON.stringify(data));
      
      // 새 버전 번호 생성
      const versionNum = versions.length + 1;
      const newVersion = `rev${versionNum}`;
      
      // 버전 데이터 업데이트 - 모든 기존 버전 데이터 유지하면서 새 버전 추가
      setVersionData(prev => {
        // 기존 데이터를 깊은 복사로 보존
        const updatedVersionData = JSON.parse(JSON.stringify(prev));
        // 새 버전 데이터 추가
        updatedVersionData[newVersion] = newVersionData;
        return updatedVersionData;
      });
      
      // 버전 목록에 새 버전 추가
      setVersions(prev => [...prev, newVersion]);
      
      // 새 버전명 반환
      return newVersion;
    } catch (error) {
      console.error("새 버전 저장 중 오류 발생:", error);
      toast.error("새 버전 저장에 실패했습니다.");
      return null;
    }
  };

  // 특정 버전의 데이터 업데이트 (현재 선택된 버전의 데이터만 업데이트)
  const updateVersionData = (version: string, data: any[]) => {
    if (!versions.includes(version)) {
      console.error(`업데이트할 버전이 존재하지 않습니다: ${version}`);
      toast.error(`${version} 버전이 존재하지 않아 데이터를 업데이트할 수 없습니다.`);
      return;
    }
    
    try {
      // 깊은 복사를 통해 데이터 업데이트
      const updatedData = JSON.parse(JSON.stringify(data));
      
      setVersionData(prev => {
        // 기존 데이터 깊은 복사
        const updatedVersionData = JSON.parse(JSON.stringify(prev));
        // 특정 버전 데이터만 업데이트
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
    updateVersionData
  };
}
