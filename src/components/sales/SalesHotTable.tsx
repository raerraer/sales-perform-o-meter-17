
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { generateComplexHeaders } from '@/utils/salesTableUtils';

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
      <style dangerouslySetInnerHTML={{ __html: `
        .sales-performance-table .cell-center {
          text-align: center !important;
        }
        .sales-performance-table .cell-right {
          text-align: right !important;
        }
        .sales-performance-table .cell-left {
          text-align: left !important;
        }
        .sales-performance-table .highlight-cell {
          background-color: #fffcd8 !important;
          font-weight: bold !important;
        }
        
        /* 레벨별 스타일 */
        .sales-performance-table .level-1-row {
          background-color: #f0e6ff !important; /* 연한 보라색 */
          color: #6E59A5 !important;
          font-weight: bold !important;
        }
        
        .sales-performance-table .level-2-row {
          background-color: #e6f2ff !important; /* 연한 파란색 */
          color: #0EA5E9 !important;
          font-weight: bold !important;
        }
        
        .sales-performance-table .level-3-row {
          background-color: #f3f4f6 !important; /* 기존 국가 행 색상 */
          font-weight: bold !important;
        }
        
        .sales-performance-table .level-1-model {
          background-color: #f8f2ff !important; /* 더 연한 보라색 */
        }
        
        .sales-performance-table .level-2-model {
          background-color: #f0f8ff !important; /* 더 연한 파란색 */
        }
        
        /* 헤더 스타일 */
        .sales-performance-table th {
          background-color: #e5e7eb !important;
          text-align: center !important;
          font-weight: bold !important;
        }
      `}} />
    </div>
  );
};

export default SalesHotTable;
