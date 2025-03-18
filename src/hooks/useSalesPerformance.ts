
import { useState, useRef, useEffect } from 'react';
import { generateInitialData, createCellsSettingsFunction } from '@/utils/salesTableUtils';
import { toast } from "sonner";
import { useSalesVersions } from './sales/useSalesVersions';
import { useSalesHistory, type CellChange, type VersionHistory } from './sales/useSalesHistory';
import { handleDataChange } from './sales/useSalesDataCalculation';

const useSalesPerformance = () => {
  const hotRef = useRef<any>(null);
  const initialData = useRef(generateInitialData());
  const [data, setData] = useState(initialData.current);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // 현재 연도, 월, 주차 상태 관리
  const [currentYear, setCurrentYear] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState<string>("");

  // 훅 가져오기
  const { 
    versions, 
    currentVersion, 
    setCurrentVersion, 
    versionData, 
    saveNewVersion, 
    updateVersionData 
  } = useSalesVersions();
  
  const { 
    versionHistory, 
    addVersionHistory, 
    showHistoryDialog, 
    toggleHistoryDialog
  } = useSalesHistory();
  
  // 초기화 시 현재 날짜 정보 설정
  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear().toString());
    setCurrentMonth((now.getMonth() + 1).toString().padStart(2, '0'));
    
    // 현재 날짜의 주차 계산
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = `W${Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7)}`;
    setCurrentWeek(currentWeek);
  }, []);
  
  // 버전 변경 시 해당 버전의 데이터로 업데이트
  useEffect(() => {
    if (versionData[currentVersion]) {
      // 깊은 복사를 통해 새로운 데이터 객체 생성
      const deepCopyData = JSON.parse(JSON.stringify(versionData[currentVersion]));
      setData(deepCopyData);
      
      // 버전 변경 시 하이라이팅 초기화
      setChangedCells(new Set());
      
      // 최초 로드 시에만 토스트 메시지 표시
      if (!isInitialLoad) {
        toast.info(`${currentVersion} 버전 데이터를 불러왔습니다.`);
      } else {
        setIsInitialLoad(false);
      }
    } else {
      // 데이터가 없는 버전인 경우 rev1 데이터로 복구
      if (versionData["rev1"]) {
        const rev1Data = JSON.parse(JSON.stringify(versionData["rev1"]));
        setData(rev1Data);
        setChangedCells(new Set());
        toast.warning(`${currentVersion} 버전 데이터가 없어 rev1 데이터를 표시합니다.`);
      }
    }
  }, [currentVersion, versionData, isInitialLoad]);
  
  // 현재 보기 모드에 따라 셀 설정을 다르게 적용
  const getCellsSettings = () => {
    return createCellsSettingsFunction(data, isEditMode, originalData, changedCells);
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      // 편집 모드로 전환 시 현재 데이터를 백업
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setIsEditMode(true);
      toast.info("편집 모드로 전환되었습니다.");
    } else {
      // 편집 취소 시 원본 데이터로 복원하고 하이라이팅 제거
      setData(JSON.parse(JSON.stringify(originalData)));
      setIsEditMode(false);
      setOriginalData([]);
      setChangedCells(new Set()); // 하이라이팅 완전히 제거
      
      toast.info("편집이 취소되었습니다. 변경 내용이 취소되었습니다.");
    }
  };

  const saveChanges = () => {
    // 변경사항 확인
    const changes: CellChange[] = [];
    const newChangedCells = new Set<string>();
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell: any, colIndex: number) => {
        if (cell !== originalData[rowIndex][colIndex]) {
          changes.push({
            row: rowIndex,
            col: colIndex,
            oldValue: originalData[rowIndex][colIndex],
            newValue: cell
          });
          
          // 변경된 셀 좌표 추가 (수정된 셀만 하이라이팅)
          newChangedCells.add(`${rowIndex},${colIndex}`);
        }
      });
    });

    if (changes.length === 0) {
      toast.info("변경사항이 없습니다.");
      setIsEditMode(false);
      return;
    }

    // 실제 저장 전 사용자에게 확인
    if (confirm("변경사항을 저장하시겠습니까?")) {
      // 변경된 셀 하이라이팅 설정 (수정된 셀만 하이라이팅)
      setChangedCells(newChangedCells);
      
      // 변경 이력에 추가
      const newHistory: VersionHistory = {
        version: currentVersion,
        date: new Date().toISOString(),
        year: currentYear,
        month: currentMonth,
        week: currentWeek,
        changes
      };
      
      // 현재 버전의 데이터 업데이트
      updateVersionData(currentVersion, data);
      
      addVersionHistory(newHistory);
      toast.success("변경사항이 저장되었습니다.");
      setIsEditMode(false);
      setOriginalData([]);
    }
  };

  // 새 버전 저장 핸들러
  const handleSaveNewVersion = () => {
    // 새 버전 생성 및 저장
    const newVersion = saveNewVersion(data);
    
    if (newVersion) {
      // 새 버전으로 자동 전환
      setCurrentVersion(newVersion);
      
      // 새 버전 저장 시 하이라이팅 제거
      setChangedCells(new Set());
      toast.success(`새 버전(${newVersion})이 저장되었습니다.`);
    }
  };

  // 특정 버전으로 이동하는 함수
  const moveToVersion = (version: string) => {
    setCurrentVersion(version);
  };

  const afterChange = (changes: any, source: string) => {
    if (source === 'loadData' || !isEditMode) return;
    
    // 변경사항이 있을 때만 데이터 업데이트
    if (changes && changes.length > 0) {
      // 새로운 임시 변경 셀 집합 (기존 하이라이팅은 유지)
      const tmpChangedCells = new Set<string>(changedCells);
      
      changes.forEach(([row, prop, oldValue, newValue]: [number, any, any, any]) => {
        // 실제 값이 변경된 경우에만 하이라이팅 적용
        if (oldValue !== newValue) {
          // 원본 데이터와 비교하여 실제로 변경된 경우에만 하이라이팅
          if (originalData[row][prop] !== newValue) {
            tmpChangedCells.add(`${row},${prop}`);
          } else {
            // 원본 데이터와 같아지면 하이라이팅 제거
            tmpChangedCells.delete(`${row},${prop}`);
          }
        }
      });
      
      // 실시간으로 하이라이팅 적용
      setChangedCells(tmpChangedCells);
      
      const updatedData = handleDataChange(changes, data);
      setData(updatedData);
    }
  };

  return {
    hotRef,
    data,
    isEditMode,
    getCellsSettings,
    toggleEditMode,
    saveChanges,
    afterChange,
    versions,
    currentVersion,
    setCurrentVersion,
    saveNewVersion: handleSaveNewVersion,
    showHistoryDialog,
    toggleHistoryDialog,
    versionHistory,
    versionData,
    moveToVersion
  };
};

export default useSalesPerformance;
