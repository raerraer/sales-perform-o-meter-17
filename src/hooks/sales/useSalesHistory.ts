
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
        if (!change.month) {
          change.month = getMonthFromColIndex(change.col);
        }
        return change;
      });
      
      // 업데이트된 변경사항으로 이력 추가
      setVersionHistory(prev => [...prev, {
        ...history,
        changes: updatedChanges
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
