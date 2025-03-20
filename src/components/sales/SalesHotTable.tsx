
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
      cursor: pointer !important;
    }
    .editable-cell:hover {
      background-color: #f0f0f0 !important;
    }
  ` }), []);

  // 성능 최적화 설정 메모이제이션
  const hotSettings = useMemo(() => ({
    licenseKey: "non-commercial-and-evaluation",
    rowHeaders: false,
    colHeaders: true,
    width: "100%",
    height: "calc(100vh - 280px)", // 헤더 버튼들 추가된 크기 고려하여 조정
    colWidths: [120, ...Array(12 * 11).fill(60)], // 첫 번째 열은 넓게, 나머지는 균일하게
    fixedColumnsLeft: 1,
    manualColumnResize: true,
    contextMenu: isEditMode,
    copyPaste: isEditMode,
    wordWrap: false,
    stretchH: "none" as const, // 타입 캐스팅을 사용하여 문제 해결
    rowHeights: 28,
    outsideClickDeselects: false,
    autoWrapRow: true,
    autoWrapCol: true,
    selectionMode: "range" as const, // 타입 캐스팅을 사용하여 문제 해결
    allowInvalid: false, // 유효하지 않은 데이터 입력 방지
    className: "sales-performance-table text-center",
    tableClassName: "aria-rowindex=3", // 세로 스크롤시 행 고정
    // 성능 최적화를 위한 추가 옵션
    renderAllRows: false,
    viewportColumnRenderingOffset: 10,
    viewportRowRenderingOffset: 20,
    // 더 높은 성능을 위한 추가 설정
    fragmentSelection: true,
    autoColumnSize: false,
    autoRowSize: false,
    maxRows: data.length, // 최대 행 제한으로 성능 최적화
    observeDOMVisibility: true, // DOM 가시성 관찰로 최적화
    preventOverflow: 'horizontal' as const, // 타입 캐스팅을 사용하여 문제 해결
    // 셀 편집 관련 설정 추가
    enterBeginsEditing: true, // Enter키로 편집 시작
    enterMoves: { row: 1, col: 0 }, // Enter키 누르면 아래 셀로 이동
    tabMoves: { row: 0, col: 1 }, // Tab키 누르면 오른쪽 셀로 이동
    autoWrapCol: true, // 열 끝에서 자동으로 다음 행으로 이동
    allowInsertRow: false, // 행 삽입 허용 안함
    allowRemoveRow: false, // 행 삭제 허용 안함
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

// 컴포넌트 이름 명시적 설정
SalesHotTable.displayName = 'SalesHotTable';

export default SalesHotTable;
