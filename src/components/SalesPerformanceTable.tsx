
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import SalesTableHeader from '@/components/sales/SalesTableHeader';
import useSalesPerformance from '@/hooks/useSalesPerformance';
import { generateComplexHeaders } from '@/utils/salesTableUtils';

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
    afterChange
  } = useSalesPerformance();

  return (
    <div className="w-full animate-fadeIn">
      <SalesTableHeader 
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        onSaveChanges={saveChanges}
      />

      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
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
    </div>
  );
};

export default SalesPerformanceTable;
