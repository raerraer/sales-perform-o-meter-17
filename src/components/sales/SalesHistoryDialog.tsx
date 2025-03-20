
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
  Eye, 
  ArrowRight
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

  // 변경 내역 그룹화 함수 - 같은 국가, 월, 모델별로 묶기
  const groupChanges = (changes: any[]) => {
    const groups: Record<string, any[]> = {};
    
    changes.forEach(change => {
      const country = change.country || '알 수 없음';
      const month = change.month || '알 수 없음';
      const model = change.model || '알 수 없음';
      const category = change.category || '';
      
      const key = `${country}|${month}|${model}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(change);
    });
    
    return groups;
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
              
              const groupedChanges = groupChanges(history.changes);
              
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
                        변경사항 ({history.changes.length}건)
                      </h4>
                      <div className="overflow-auto">
                        <table className="w-full text-xs divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 py-2 text-left font-medium">국가</th>
                              <th className="px-2 py-2 text-left font-medium">월</th>
                              <th className="px-2 py-2 text-left font-medium">구분</th>
                              <th className="px-2 py-2 text-left font-medium">모델</th>
                              <th className="px-2 py-2 text-center font-medium">변경 전</th>
                              <th className="px-2 py-2 text-center font-medium">변경 후</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(groupedChanges).map(([key, changes], idx) => {
                              const [country, month, model] = key.split('|');
                              
                              return changes.map((change, changeIdx) => (
                                <tr 
                                  key={`${idx}-${changeIdx}`} 
                                  className="hover:bg-gray-50 border-t border-gray-100"
                                >
                                  <td className="px-2 py-1.5">{country}</td>
                                  <td className="px-2 py-1.5">{month}</td>
                                  <td className="px-2 py-1.5">{change.category}</td>
                                  <td className="px-2 py-1.5">{model}</td>
                                  <td className="px-2 py-1.5 text-center">
                                    {change.oldValue || '(빈 값)'}
                                  </td>
                                  <td className="px-2 py-1.5 text-center">
                                    <span className="flex items-center justify-center">
                                      <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                                      <span className="text-blue-600 font-medium">
                                        {change.newValue || '(빈 값)'}
                                      </span>
                                    </span>
                                  </td>
                                </tr>
                              ));
                            })}
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
