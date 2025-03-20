
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye
} from 'lucide-react';
import { VersionHistory } from '@/hooks/sales/useSalesHistory';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";

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
  // 접기/펼치기 상태 관리 - 기본값은 모두 접기
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});

  // 접기/펼치기 토글 함수
  const toggleExpand = (versionId: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
  };

  // 변경 내역 그룹화 및 필터링 함수 - 실제 변경된 값만 추출
  const filterChanges = (changes: any[]) => {
    // 실제 변경된 값만 필터링
    return changes.filter(change => {
      // 숫자로 변환하여 비교 (콤마 제거 후)
      const oldValueNormalized = String(change.oldValue || '').replace(/,/g, '');
      const newValueNormalized = String(change.newValue || '').replace(/,/g, '');
      return oldValueNormalized !== newValueNormalized;
    });
  };
  
  // 직접 변경한 셀만 추출하는 함수
  const getDirectChangesOnly = (changes: any[]) => {
    if (!changes || changes.length === 0) return [];
    
    // 직접 수정된 셀만 추출 (자동 계산된 합계 등은 제외)
    return changes.filter(change => change.isDirectChange === true);
  };

  // 변경사항 월 정보를 정확히 가져오는 함수
  const getMonthFromColIndex = (colIndex: number) => {
    // 월 인덱스 계산 (2개 열마다 1개월): 1,2열은 1월, 3,4열은 2월, ...
    const monthIndex = Math.floor(colIndex / 2) + 1;
    return `${monthIndex}월`;
  };

  return (
    <Dialog open={showHistoryDialog} onOpenChange={toggleHistoryDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">변경 이력</DialogTitle>
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
              const formattedDate = history.formattedDate || 
                new Date(history.date).toLocaleString('ko-KR', {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
              
              // 직접 변경한 셀만 필터링 (isDirectChange가 true인 항목만)
              const directChanges = getDirectChangesOnly(history.changes);
              // 최종적으로 변경된 내용만 필터링
              const filteredChanges = filterChanges(directChanges);
              
              return (
                <Card key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b">
                    <div className="flex items-center">
                      <div 
                        className="flex items-center cursor-pointer flex-1" 
                        onClick={() => toggleExpand(history.version)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 mr-2 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                        )}
                        <div className="flex-1 grid grid-cols-5 gap-2 items-center">
                          <div className="text-sm">{history.year}년</div>
                          <div className="text-sm">{history.month}월</div>
                          <div className="text-sm">{history.week}</div>
                          <div className="font-semibold">{history.version}</div>
                          <div className="text-sm text-gray-600">{formattedDate}</div>
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
                        바로가기
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3 text-sm flex items-center">
                        변경사항 ({filteredChanges.length}건)
                      </h4>
                      <div className="overflow-auto">
                        <table className="w-full text-xs divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-2 text-left font-medium">국가</th>
                              <th className="px-2 py-2 text-left font-medium">월</th>
                              <th className="px-2 py-2 text-left font-medium">구분</th>
                              <th className="px-2 py-2 text-left font-medium">모델</th>
                              <th className="px-2 py-2 text-left font-medium">항목</th>
                              <th className="px-2 py-2 text-center font-medium">변경 전</th>
                              <th className="px-2 py-2 text-center font-medium">변경 후</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredChanges.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-2 py-4 text-center text-gray-500">
                                  실제 변경된 내용이 없습니다.
                                </td>
                              </tr>
                            ) : (
                              filteredChanges.map((change, changeIdx) => {
                                // 월 정보를 colIndex로부터 정확히 계산
                                const month = getMonthFromColIndex(change.col);
                                
                                // QTY/AMT 구분 (홀수 열은 QTY, 짝수 열은 AMT)
                                const itemType = change.col % 2 === 1 ? 'QTY' : 'AMT';
                                
                                return (
                                  <tr 
                                    key={changeIdx} 
                                    className="hover:bg-gray-50 border-t border-gray-100"
                                  >
                                    <td className="px-2 py-1.5">{change.country || '-'}</td>
                                    <td className="px-2 py-1.5">{month}</td>
                                    <td className="px-2 py-1.5">{change.category || '전망'}</td>
                                    <td className="px-2 py-1.5">{change.model || '-'}</td>
                                    <td className="px-2 py-1.5">{itemType}</td>
                                    <td className="px-2 py-1.5 text-center">
                                      {change.oldValue || '-'}
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                      <span className="text-blue-600 font-medium">
                                        {change.newValue || '-'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SalesHistoryDialog;
