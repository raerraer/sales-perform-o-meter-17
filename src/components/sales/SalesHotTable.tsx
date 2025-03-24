
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
      background-color: #f4f9ff !important;
      cursor: cell !important;
    }
    .editable-cell:hover {
      background-color: #e6f0ff !important;
    }
    .modified-cell {
      background-color: #fffacd !important; /* 수정된 셀 하이라이트 */
    }
    /* 편집 모드일 때 더 확실하게 표시 */
    .ht_master .htCore tbody tr td.current.editable-cell {
      background-color: #e6f0ff !important;
      box-shadow: inset 0 0 0 2px #4285f4 !important;
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
    fixedColumnsStart: 1,
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
    
    // F2 키 핸들러 추가 - 편집 시작
    beforeKeyDown: function(event: KeyboardEvent) {
      if (isEditMode && event.key === 'F2') {
        const selectedCell = this.getSelectedLast();
        if (selectedCell) {
          const [row, col] = selectedCell;
          const cellMeta = this.getCellMeta(row, col);
          
          // 읽기 전용이 아닌 경우만 편집 시작
          if (!cellMeta.readOnly) {
            this.getActiveEditor().beginEditing();
            event.preventDefault();
            
            // 디버그 로그
            console.log(`F2 편집 시작: 행=${row}, 열=${col}, 읽기전용=${cellMeta.readOnly}`);
          }
        }
      }
    },
    
    // 강화된 더블클릭 편집 처리
    afterOnCellMouseDown: function(event: MouseEvent, coords: any, TD: HTMLElement) {
      if (isEditMode && coords.row >= 0 && coords.col > 0 && event.detail === 2) {
        const cellMeta = this.getCellMeta(coords.row, coords.col);
        
        if (!cellMeta.readOnly) {
          // 더블클릭이면 즉시 편집 시작
          setTimeout(() => {
            this.getActiveEditor().beginEditing();
            console.log(`더블클릭 편집 시작: 행=${coords.row}, 열=${coords.col}`);
          }, 10);
        }
      }
    },
    
    // 편집 가능한 셀 처리 개선 - 더 엄격하게 편집 가능 셀 감지
    beforeOnCellMouseDown: function(event: any, coords: any) {
      if (isEditMode && coords.row >= 0 && coords.col > 0) {
        // 선택된 셀의 readOnly 속성 확인
        const cell = this.getCellMeta(coords.row, coords.col);
        
        // 디버깅용 로그
        console.log(`셀 클릭: 행=${coords.row}, 열=${coords.col}, 읽기전용=${cell.readOnly}, 값=${this.getDataAtCell(coords.row, coords.col)}`);
        
        if (!cell.readOnly) {
          // 클릭한 셀이 편집 가능한 경우 커서 스타일 변경
          event.target.style.cursor = 'cell';
          
          // 클래스 추가로 시각적 피드백 강화
          if (!event.target.classList.contains('editable-cell')) {
            event.target.classList.add('editable-cell');
          }
        }
      }
    },
    
    // 셀 호버 시 편집 가능한 셀 표시 강화
    beforeOnCellMouseOver: function(event: any, coords: any) {
      if (isEditMode && coords.row >= 0 && coords.col > 0) {
        const cell = this.getCellMeta(coords.row, coords.col);
        if (!cell.readOnly) {
          event.target.style.cursor = 'cell';
          if (!event.target.classList.contains('editable-cell')) {
            event.target.classList.add('editable-cell');
          }
        }
      }
    },
    
    // 선택한 셀 활성화 강화
    afterSelection: function(row: number, col: number) {
      if (isEditMode && col > 0) {
        const cell = this.getCellMeta(row, col);
        if (!cell.readOnly) {
          console.log(`셀 선택: 행=${row}, 열=${col}, 편집가능=true, 값=${this.getDataAtCell(row, col)}`);
          
          // 셀 시각적 피드백 강화를 위한 클래스 변경
          const td = this.getCell(row, col);
          if (td && !td.classList.contains('editable-cell')) {
            td.classList.add('editable-cell');
          }
        }
      }
    },
    
    // 이태리 모델 셀 편집을 위한 클릭 핸들러 강화
    afterBeginEditing: function(row: number, col: number) {
      console.log(`편집 시작: 행=${row}, 열=${col}, 값=${this.getDataAtCell(row, col)}`);
    },
    
    // 에디터 생성 전 처리
    beforeCreateEditor: function(row: number, col: number) {
      console.log(`에디터 생성 전: 행=${row}, 열=${col}, 값=${this.getDataAtCell(row, col)}`);
    }
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
