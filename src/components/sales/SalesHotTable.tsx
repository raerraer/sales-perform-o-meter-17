
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
        fixedRowsTop={3} // 3개의 헤더 행 고정 (월, 카테고리, Qty/Amt)
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
        tableClassName="fixed-header" // 클래스 이름 변경
        renderAllRows={false} // 필요한 행만 렌더링하도록 설정
        viewportRowRenderingOffset={20} // 뷰포트 렌더링 최적화
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
        
        /* 레벨별 스타일 업데이트 - 새로운 색상 스키마 */
        /* Level 1: 총 합계 */
        .sales-performance-table .level-1-row {
          background-color: #1e2761 !important; /* 총 합계 다크 블루 */
          color: #ffffff !important; /* 흰색 */
          font-weight: bold !important;
        }
        
        /* Level 1: 총 합계 모델 */
        .sales-performance-table .level-1-model {
          background-color: #ffffff !important; /* 흰색 */
          color: #000000 !important; /* 검정 */
          font-weight: bold !important;
        }
        
        /* Level 2: 지역 그룹 */
        .sales-performance-table .level-2-row {
          background-color: #333333 !important; /* 지역 다크 그레이 */
          color: #ffffff !important; /* 흰색 */
          font-weight: bold !important;
        }
        
        /* Level 2: 지역 모델 */
        .sales-performance-table .level-2-model {
          background-color: #ffffff !important; /* 흰색 */
          color: #000000 !important; /* 검정 */
          font-weight: bold !important;
        }
        
        /* Level 3: 국가 그룹 */
        .sales-performance-table .level-3-row {
          background-color: #f2f2f2 !important; /* 국가 연한 그레이 */
          color: #000000 !important; /* 검정 */
          font-weight: bold !important;
        }
        
        /* Level 3: 국가 모델 (기본 데이터) */
        .sales-performance-table .level-3-model {
          background-color: #ffffff !important; /* 흰색 */
          color: #000000 !important; /* 검정 */
          font-weight: normal !important; /* 볼드 없음 */
        }
        
        /* 헤더 스타일 */
        .sales-performance-table th {
          background-color: #EEF1F5 !important; /* 연한 파스텔 블루-그레이 */
          color: #3E4C63 !important; /* 네이비 */
          text-align: center !important;
          font-weight: bold !important;
        }
        
        /* 헤더 행 고정을 위한 추가 스타일 */
        .handsontable .wtSpreader {
          position: relative;
        }
        
        .handsontable .ht_clone_top {
          z-index: 101;
        }
        
        .handsontable .ht_clone_left {
          z-index: 102;
        }
        
        .handsontable .ht_clone_top_left_corner {
          z-index: 103;
        }
        
        /* 3행만 고정되도록 추가 스타일 */
        .handsontable .ht_master .wtHolder {
          overflow: auto;
        }
        
        .handsontable .ht_clone_top .wtHolder {
          overflow: hidden;
          height: 84px !important; /* 3행 고정을 위한 높이 설정 (28px * 3) */
        }
      `}} />
    </div>
  );
};

export default SalesHotTable;
