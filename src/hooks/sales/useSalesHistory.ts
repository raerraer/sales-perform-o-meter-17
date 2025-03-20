
import { useState } from 'react';
import { getMonthFromColIndex } from '@/components/sales/history/historyUtils';

export interface CellChange {
  row: number;
  col: number;
  oldValue: any;
  newValue: any;
  country?: string;
  model?: string;
  month?: string;
  category?: string;
  isDirectChange?: boolean; // 직접 변경 여부를 나타내는 필드
}

export interface VersionHistory {
  version: string;
  date: string;
  formattedDate: string; // 추가된 필드: 표시용 포맷팅된 날짜
  year: string;
  month: string;
  week: string;
  changes: CellChange[];
}

export interface SalesHistoryHookReturn {
  versionHistory: VersionHistory[];
  addVersionHistory: (history: VersionHistory) => void;
  showHistoryDialog: boolean;
  toggleHistoryDialog: () => void;
}

export function useSalesHistory(): SalesHistoryHookReturn {
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  // 변경 이력 추가 - 변경된 값이 있는 경우만 추가
  const addVersionHistory = (history: VersionHistory) => {
    // 변경사항이 있는 경우만 이력 추가
    if (history.changes && history.changes.length > 0) {
      // 변경 내역의 월 정보가 정확한지 확인하고 수정
      const updatedChanges = history.changes.map(change => {
        // 모든 변경 항목에 정확한 월 정보 설정
        // 이미 설정된 것을 덮어쓰지 않고, 누락된 경우만 계산
        if (!change.month) {
          const calculatedMonth = getMonthFromColIndex(change.col);
          change.month = calculatedMonth;
          console.log(`월 정보 계산: 셀(${change.row},${change.col}) => ${calculatedMonth}`);
        }
        
        return change;
      });
      
      // 중복 제거된 변경사항으로 이력 추가
      // 동일한 셀 위치에 대한 변경은 마지막 항목만 유지
      const uniqueChanges: CellChange[] = [];
      const seenCells = new Set<string>();
      
      // 역순으로 순회하여 동일 셀에 대한 첫 번째 변경만 유지
      for (let i = updatedChanges.length - 1; i >= 0; i--) {
        const change = updatedChanges[i];
        const cellKey = `${change.row}:${change.col}`;
        
        if (!seenCells.has(cellKey)) {
          uniqueChanges.unshift(change); // 원래 순서 유지를 위해 앞에 추가
          seenCells.add(cellKey);
        }
      }
      
      // 정렬된 변경사항으로 이력 추가
      setVersionHistory(prev => [...prev, {
        ...history,
        changes: uniqueChanges
      }]);
    }
  };

  // 변경 이력 다이얼로그 토글
  const toggleHistoryDialog = () => {
    setShowHistoryDialog(prev => !prev);
  };

  return {
    versionHistory,
    addVersionHistory,
    showHistoryDialog,
    toggleHistoryDialog
  };
}
