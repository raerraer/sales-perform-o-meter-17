
import SalesTableHeader from '@/components/sales/SalesTableHeader';
import SalesHotTable from '@/components/sales/SalesHotTable';
import SalesHistoryDialog from '@/components/sales/SalesHistoryDialog';
import useSalesPerformance from '@/hooks/useSalesPerformance';

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
    saveNewVersion,
    showHistoryDialog,
    toggleHistoryDialog,
    versionHistory,
    versionData,
    moveToVersion
  } = useSalesPerformance();

  return (
    <div className="w-full animate-fadeIn">
      <SalesTableHeader 
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        onSaveChanges={saveChanges}
        versions={versions}
        currentVersion={currentVersion}
        onVersionChange={setCurrentVersion}
        onSaveNewVersion={saveNewVersion}
        onShowHistory={toggleHistoryDialog}
      />

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
