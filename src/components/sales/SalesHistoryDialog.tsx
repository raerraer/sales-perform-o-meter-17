
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VersionHistory } from '@/hooks/sales/useSalesHistory';
import HistoryVersionItem from './history/HistoryVersionItem';

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
            {versionHistory.map((history, index) => (
              <HistoryVersionItem
                key={index}
                history={history}
                index={index}
                moveToVersion={moveToVersion}
                toggleHistoryDialog={toggleHistoryDialog}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SalesHistoryDialog;
