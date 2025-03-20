
import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { VersionHistory } from '@/hooks/sales/useSalesHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import HistoryChangeTable from './HistoryChangeTable';
import { filterChanges, getDirectChangesOnly } from './historyUtils';

interface HistoryVersionItemProps {
  history: VersionHistory;
  index: number;
  moveToVersion: (version: string) => void;
  toggleHistoryDialog: () => void;
}

const HistoryVersionItem = ({
  history,
  index,
  moveToVersion,
  toggleHistoryDialog
}: HistoryVersionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 접기/펼치기 토글 함수
  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  // 직접 변경한 셀만 추출
  const directChanges = getDirectChangesOnly(history.changes);
  // 최종적으로 변경된 내용만 필터링
  const filteredChanges = filterChanges(directChanges);
  
  const formattedDate = history.formattedDate || 
    new Date(history.date).toLocaleString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

  return (
    <Card key={index} className="border rounded-lg overflow-hidden">
      <div className="bg-slate-50 p-4 border-b">
        <div className="flex items-center">
          <div 
            className="flex items-center cursor-pointer flex-1" 
            onClick={toggleExpand}
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
          <HistoryChangeTable changes={filteredChanges} />
        </CardContent>
      )}
    </Card>
  );
};

export default HistoryVersionItem;
