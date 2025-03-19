
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
        
        /* 레벨별 스타일 업데이트 - 새로운 색상 스키마 */
        /* Level 1: 총 합계 */
        .sales-performance-table .level-1-row {
          background-color: #5A6E8B !important; /* 딥 블루 */
          color: #FFFFFF !important; /* 밝은 화이트 */
          font-weight: bold !important;
        }
        
        /* Level 1: 총 합계 모델 */
        .sales-performance-table .level-1-model {
          background-color: #6B7D97 !important; /* 약간 밝은 딥 블루 */
          color: #FFFFFF !important; /* 밝은 화이트 */
          font-weight: bold !important;
        }
        
        /* Level 2: 지역 그룹 */
        .sales-performance-table .level-2-row {
          background-color: #BCC3D4 !important; /* 중간 블루-그레이 */
          color: #3E4C63 !important; /* 다크 그레이 */
          font-weight: bold !important;
        }
        
        /* Level 2: 지역 모델 */
        .sales-performance-table .level-2-model {
          background-color: #CDD3E0 !important; /* 약간 밝은 중간 블루-그레이 */
          color: #3E4C63 !important; /* 다크 그레이 */
          font-weight: bold !important;
        }
        
        /* Level 3: 국가 그룹 */
        .sales-performance-table .level-3-row {
          background-color: #D6DBE9 !important; /* 밝은 블루-그레이 */
          color: #3E4C63 !important; /* 다크 그레이 */
          font-weight: bold !important;
        }
        
        /* Level 4: 실제 데이터 (모델별 세부 데이터) */
        .sales-performance-table .level-3-model {
          background-color: #FFFFFF !important; /* 기본 화이트 */
          color: #3E4C63 !important; /* 다크 그레이 */
        }
        
        /* 헤더 스타일 */
        .sales-performance-table th {
          background-color: #F0F2F7 !important; /* 연한 파스텔 블루-그레이 */
          color: #3E4C63 !important; /* 다크 그레이 */
          text-align: center !important;
          font-weight: bold !important;
        }
      `}} />
    </div>
  );
};

export default SalesHotTable;
