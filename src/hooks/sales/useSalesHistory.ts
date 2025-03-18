
import { useState } from 'react';

export interface CellChange {
  row: number;
  col: number;
  oldValue: any;
  newValue: any;
}

export interface VersionHistory {
  version: string;
  date: string;
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

  // 변경 이력 추가
  const addVersionHistory = (history: VersionHistory) => {
    setVersionHistory(prev => [...prev, history]);
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
