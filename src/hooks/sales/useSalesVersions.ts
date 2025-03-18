
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

  // 버전 변경 시 해당 버전의 데이터 존재 여부 확인
  useEffect(() => {
    if (!versionData[currentVersion]) {
      console.error(`버전 데이터가 없습니다: ${currentVersion}`);
      
      // 데이터가 없는 버전을 선택한 경우, rev1으로 돌아가기
      if (versionData["rev1"]) {
        setCurrentVersion("rev1");
        toast.error(`${currentVersion} 버전 데이터가 없습니다. rev1 버전으로 돌아갑니다.`);
      }
    }
  }, [currentVersion, versionData]);

  // 새 버전 저장 핸들러 - 항상 새 버전으로 데이터 저장 (기존 버전 데이터 유지)
  const saveNewVersion = (data: any[]): string | null => {
    try {
      // 새 버전 번호 생성
      const versionNum = versions.length + 1;
      const newVersion = `rev${versionNum}`;
      
      // 현재 버전과 데이터 비교 로직은 제거합니다
      // 하이라이팅된 셀이 있다면 이미 변경된 내용이 있는 것으로 간주하기 때문에
      // useVersionControl에서 이미 확인했으므로 여기서는 중복 체크하지 않습니다
      
      // 버전 데이터 저장 (깊은 복사)
      const newVersionData = JSON.parse(JSON.stringify(data));
      
      // 버전 데이터 업데이트 - 모든 기존 버전 데이터 유지하면서 새 버전 추가
      setVersionData(prev => ({
        ...prev,
        [newVersion]: newVersionData
      }));
      
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
