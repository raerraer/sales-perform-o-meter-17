
import SalesTableHeader from '@/components/sales/SalesTableHeader';
import SalesHotTable from '@/components/sales/SalesHotTable';
import SalesHistoryDialog from '@/components/sales/SalesHistoryDialog';
import useSalesPerformance from '@/hooks/useSalesPerformance';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, FilePlus } from 'lucide-react';

const SalesPerformanceTable = () => {
  const {
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
    showHistoryDialog,
    toggleHistoryDialog,
    versionHistory,
    versionData,
    moveToVersion,
    isLatestVersion
  } = useSalesPerformance();

  const [isRemarksVisible, setIsRemarksVisible] = useState(false);

  const toggleRemarksVisibility = () => {
    if (hotRef.current && hotRef.current.hotInstance) {
      const hot = hotRef.current.hotInstance;
      
      // 각 월별 비고 열 인덱스 계산
      const remarkColumns = Array.from({ length: 12 }, (_, i) => (i * 11) + 10 + 1); // +1은 첫 번째 열(모델명) 때문
      
      if (isRemarksVisible) {
        // 비고 열 숨기기
        hot.updateSettings({
          hiddenColumns: {
            columns: remarkColumns,
            indicators: true
          }
        });
      } else {
        // 비고 열 표시하기
        hot.updateSettings({
          hiddenColumns: {
            columns: [],
            indicators: true
          }
        });
      }
      
      setIsRemarksVisible(!isRemarksVisible);
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <SalesTableHeader 
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        onSaveChanges={saveChanges}
        versions={versions}
        currentVersion={currentVersion}
        onVersionChange={moveToVersion}
        onShowHistory={toggleHistoryDialog}
        isLatestVersion={isLatestVersion}
      />

      <div className="flex items-center justify-end gap-2 mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleRemarksVisibility}
          className="flex items-center gap-1"
        >
          {isRemarksVisible ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              비고 열 숨기기
            </>
          ) : (
            <>
              비고 열 표시하기
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto relative" style={{ zIndex: 10 }}>
        <SalesHotTable
          hotRef={hotRef}
          data={data}
          isEditMode={isEditMode}
          getCellsSettings={getCellsSettings}
          afterChange={afterChange}
        />
      </div>

      {/* 변경 이력 다이얼로그 컴포넌트 */}
      <SalesHistoryDialog
        showHistoryDialog={showHistoryDialog}
        toggleHistoryDialog={toggleHistoryDialog}
        versionHistory={versionHistory}
        versionData={versionData}
        moveToVersion={moveToVersion}
      />
    </div>
  );
};

export default SalesPerformanceTable;
