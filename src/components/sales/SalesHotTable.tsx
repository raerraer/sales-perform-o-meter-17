
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { generateComplexHeaders } from '@/utils/salesTableUtils';
import { getSalesTableStyles } from './SalesTableStyles';

interface SalesHotTableProps {
  hotRef: React.RefObject<any>;
  data: any[][];
  isEditMode: boolean;
  getCellsSettings: () => (row: number, col: number) => object;
  afterChange: (changes: any, source: string) => void;
}

const SalesHotTable = ({
  hotRef,
  data,
  isEditMode,
  getCellsSettings,
  afterChange
}: SalesHotTableProps) => {
  return (
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
        stretchH="none"
        rowHeights={28}
        outsideClickDeselects={false}
        autoWrapRow={true}
        autoWrapCol={true}
        selectionMode="range"
        allowInvalid={false} // 유효하지 않은 데이터 입력 방지
        className="sales-performance-table text-center"
        tableClassName="aria-rowindex=3" // 세로 스크롤시 행 고정
      />
      <style dangerouslySetInnerHTML={{ __html: getSalesTableStyles() }} />
    </div>
  );
};

export default SalesHotTable;
