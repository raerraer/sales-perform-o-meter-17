
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { VersionHistory } from '@/hooks/sales/useSalesHistory';

interface SalesHistoryDialogProps {
  showHistoryDialog: boolean;
  toggleHistoryDialog: () => void;
  versionHistory: VersionHistory[];
  versionData: Record<string, any[]>;
  moveToVersion: (version: string) => void;
}

const SalesHistoryDialog = ({
  showHistoryDialog,
  toggleHistoryDialog,
  versionHistory,
  versionData,
  moveToVersion
}: SalesHistoryDialogProps) => {
  // 접기/펼치기 상태 관리
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});

  // 접기/펼치기 토글 함수
  const toggleExpand = (versionId: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
  };

  return (
    <Dialog open={showHistoryDialog} onOpenChange={toggleHistoryDialog}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>변경 이력</DialogTitle>
          <DialogDescription>
            영업실적표의 변경 이력을 확인합니다.
          </DialogDescription>
        </DialogHeader>
        
        {versionHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            변경 이력이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {versionHistory.map((history, index) => {
              const isExpanded = expandedVersions[history.version] || false;
              const formattedDate = new Date(history.date).toLocaleString('ko-KR', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div 
                      className="flex items-center cursor-pointer flex-1" 
                      onClick={() => toggleExpand(history.version)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 mr-2 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                      )}
                      <div className="flex-1 grid grid-cols-5 gap-2">
                        <div>{history.year}년</div>
                        <div>{history.month}월</div>
                        <div>{history.week}</div>
                        <div className="font-semibold">{history.version}</div>
                        <div className="text-sm text-gray-500">{formattedDate}</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="ml-2 flex items-center gap-1"
                      onClick={() => {
                        moveToVersion(history.version);
                        toggleHistoryDialog();
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      확인하기
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="text-sm border-t pt-2">
                      <h4 className="font-medium mb-1">변경사항 ({history.changes.length})</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-1 text-left">국가</th>
                              <th className="px-2 py-1 text-left">모델</th>
                              <th className="px-2 py-1 text-left">구분</th>
                              <th className="px-2 py-1 text-left">이전 값</th>
                              <th className="px-2 py-1 text-left">변경 값</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.changes.map((change, changeIndex) => {
                              // 셀 위치로부터 국가와 모델 정보 추출
                              const rowData = versionData[history.version] && 
                                              versionData[history.version][change.row];
                              
                              const item = rowData ? rowData[0] : '알 수 없음';
                              
                              // 열 인덱스로부터 QTY/AMT 구분 추출
                              const isAmtColumn = change.col % 2 === 0;
                              const valueType = isAmtColumn ? 'AMT' : 'QTY';
                              
                              return (
                                <tr key={changeIndex} className="border-t">
                                  <td className="px-2 py-1">{item}</td>
                                  <td className="px-2 py-1">-</td>
                                  <td className="px-2 py-1">{valueType}</td>
                                  <td className="px-2 py-1">{change.oldValue || '(빈 값)'}</td>
                                  <td className="px-2 py-1">{change.newValue || '(빈 값)'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SalesHistoryDialog;
