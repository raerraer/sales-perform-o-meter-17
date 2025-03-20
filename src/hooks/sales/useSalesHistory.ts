
import { useState } from 'react';
import { getMonthFromColIndex, getDirectChangesOnly } from '@/components/sales/history/historyUtils';

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
      console.log(`변경 이력 추가: 총 ${history.changes.length}개 변경사항`);
      
      // 변경 내역의 월 정보가 정확한지 확인하고 수정
      const updatedChanges = history.changes.map(change => {
        // 모든 변경 항목에 정확한 월 정보 설정 (누락된 경우만)
        if (!change.month) {
          const calculatedMonth = getMonthFromColIndex(change.col);
          change.month = calculatedMonth;
          console.log(`월 정보 계산: 셀(${change.row},${change.col}) => ${calculatedMonth}`);
        }
        return change;
      });
      
      // 직접 변경한 셀만 필터링 (계산된 합계 셀 제외)
      const directChanges = getDirectChangesOnly(updatedChanges);
      
      if (directChanges.length === 0) {
        console.log('직접 변경된 셀이 없어 이력 추가 취소');
        return;
      }
      
      // 필터링된 변경사항으로 이력 추가
      console.log(`최종 변경 이력 추가: ${directChanges.length}개 항목`);
      
      setVersionHistory(prev => [...prev, {
        ...history,
        changes: directChanges
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
