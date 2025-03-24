
import React, { memo, useMemo } from 'react';
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

// memo로 감싸 불필요한 리렌더링 방지
const SalesHotTable = memo(({
  hotRef,
  data,
  isEditMode,
  getCellsSettings,
  afterChange
}: SalesHotTableProps) => {
  // 헤더는 변경되지 않으므로 메모이제이션
  const nestedHeaders = useMemo(() => generateComplexHeaders(), []);
  
  // 테이블 스타일도 메모이제이션
  const tableStyles = useMemo(() => ({ __html: getSalesTableStyles() + `
    .editable-cell {
      background-color: #f9f9f9 !important;
      cursor: cell !important;
    }
    .editable-cell:hover {
      background-color: #f0f0f0 !important;
    }
    .modified-cell {
      background-color: #fffacd !important; /* 수정된 셀 하이라이트 */
    }
  ` }), []);

  // 성능 최적화 설정 메모이제이션
  const hotSettings = useMemo(() => ({
    licenseKey: "non-commercial-and-evaluation",
    rowHeaders: false,
    colHeaders: true,
    width: "100%",
    height: "calc(100vh - 280px)",
    colWidths: [120, ...Array(12 * 11).fill(60)],
    fixedColumnsLeft: 1,
    manualColumnResize: true,
    contextMenu: isEditMode,
    copyPaste: isEditMode,
    wordWrap: false,
    stretchH: "none" as const,
    rowHeights: 28,
    outsideClickDeselects: false,
    autoWrapRow: true,
    selectionMode: "range" as const,
    allowInvalid: false,
    className: "sales-performance-table text-center",
    tableClassName: "aria-rowindex=3",
    renderAllRows: false,
    viewportColumnRenderingOffset: 10,
    viewportRowRenderingOffset: 20,
    fragmentSelection: true,
    autoColumnSize: false,
    autoRowSize: false,
    maxRows: data.length,
    observeDOMVisibility: true,
    preventOverflow: 'horizontal' as const,
    enterBeginsEditing: true,
    enterMoves: { row: 1, col: 0 },
    tabMoves: { row: 0, col: 1 },
    autoWrapCol: true,
    allowInsertRow: false,
    allowRemoveRow: false,
    editor: 'text',
    fillHandle: false,
    doubleClickToEditor: true, // 더블클릭으로 편집 활성화
    // 편집 가능한 셀 처리 개선
    beforeOnCellMouseDown: function(event: any, coords: any) {
      if (isEditMode && coords.row >= 0 && coords.col > 0) {
        // 선택된 셀의 readOnly 속성 확인
        const cell = this.getCellMeta(coords.row, coords.col);
        if (!cell.readOnly) {
          // 클릭한 셀이 편집 가능한 경우 커서 스타일 변경
          event.target.style.cursor = 'cell';
        }
      }
    },
  }), [isEditMode, data.length]);
  
  return (
    <div className="relative overflow-auto" style={{ maxWidth: '100%' }}>
      <HotTable
        ref={hotRef}
        data={data}
        {...hotSettings}
        afterChange={afterChange}
        nestedHeaders={nestedHeaders}
        cells={getCellsSettings()}
      />
      <style dangerouslySetInnerHTML={tableStyles} />
    </div>
  );
});

SalesHotTable.displayName = 'SalesHotTable';

export default SalesHotTable;
