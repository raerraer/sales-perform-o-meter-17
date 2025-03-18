
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import SalesTableHeader from '@/components/sales/SalesTableHeader';
import useSalesPerformance from '@/hooks/useSalesPerformance';
import { generateComplexHeaders } from '@/utils/salesTableUtils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// 모든 Handsontable 모듈 등록
registerAllModules();

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
    versionHistory
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
        <div className="relative overflow-auto" style={{ maxWidth: '100%' }}>
          <HotTable
            ref={hotRef}
            data={data}
            licenseKey="non-commercial-and-evaluation"
            rowHeaders={false}
            colHeaders={true}
            width="100%"
            height="calc(100vh - 280px)" // 헤더 버튼들 추가된 크기 고려하여 조정
            colWidths={[120, ...Array(12 * 11).fill(60)]} // 첫 번째 열은 넓게, 나머지는 균일하게
            fixedColumnsLeft={1}
            fixedRowsTop={3} // 3개의 헤더 행 고정
            manualColumnResize={true}
            contextMenu={isEditMode}
            copyPaste={isEditMode}
            afterChange={afterChange}
            nestedHeaders={generateComplexHeaders()}
            cells={getCellsSettings()}
            wordWrap={false}
            className="sales-performance-table"
            stretchH="none"
            rowHeights={28}
            outsideClickDeselects={false}
            autoWrapRow={true}
            autoWrapCol={true}
            selectionMode="range"
            allowInvalid={false} // 유효하지 않은 데이터 입력 방지
          />
        </div>
      </div>

      {/* 변경 이력 다이얼로그 */}
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
              {versionHistory.map((history, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{history.version}</h3>
                    <span className="text-sm text-gray-500">{history.date}</span>
                  </div>
                  <div className="text-sm border-t pt-2">
                    <h4 className="font-medium mb-1">변경사항 ({history.changes.length})</h4>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 text-left">위치</th>
                            <th className="px-2 py-1 text-left">이전 값</th>
                            <th className="px-2 py-1 text-left">변경 값</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.changes.map((change, changeIndex) => (
                            <tr key={changeIndex} className="border-t">
                              <td className="px-2 py-1">행 {change.row+1}, 열 {change.col+1}</td>
                              <td className="px-2 py-1">{change.oldValue || '(빈 값)'}</td>
                              <td className="px-2 py-1">{change.newValue || '(빈 값)'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPerformanceTable;
