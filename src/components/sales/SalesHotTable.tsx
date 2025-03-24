
import React, { memo, useMemo, useEffect, useRef } from 'react';
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
  // 이태리 모델 셀 편집 관련 참조 값
  const italyModelsProcessed = useRef<boolean>(false);

  // 이태리 모델 셀 편집 가능하도록 수동 처리
  useEffect(() => {
    if (hotRef.current && isEditMode && !italyModelsProcessed.current) {
      console.log('이태리 모델 셀 편집 설정 적용 시도');
      
      // 이태리 국가 및 모델 행 찾기
      const hot = hotRef.current.hotInstance;
      let italyRowIndex = -1;
      
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i][0] === '이태리') {
          italyRowIndex = i;
          break;
        }
      }
      
      if (italyRowIndex > -1) {
        // 모델 행 인덱스
        const model1Index = italyRowIndex + 1;
        const model2Index = italyRowIndex + 2;
        
        // 열 설정 강제 갱신
        if (hot) {
          for (let col = 1; col < 12 * 11; col++) {
            if (model1Index < data.length) {
              hot.setCellMeta(model1Index, col, 'readOnly', false);
              hot.setCellMeta(model1Index, col, 'isEditable', true);
              hot.setCellMeta(model1Index, col, 'editor', 'text');
            }
            
            if (model2Index < data.length) {
              hot.setCellMeta(model2Index, col, 'readOnly', false);
              hot.setCellMeta(model2Index, col, 'isEditable', true);
              hot.setCellMeta(model2Index, col, 'editor', 'text');
            }
          }
          
          // 변경사항 렌더링 적용
          hot.render();
          console.log('이태리 모델 셀 메타데이터 갱신 완료');
        }
        
        italyModelsProcessed.current = true;
      }
    }
    
    // 편집 모드가 꺼질 때 상태 초기화
    if (!isEditMode) {
      italyModelsProcessed.current = false;
    }
  }, [hotRef, data, isEditMode]);

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
    /* 이태리 모델 셀 특별 스타일 */
    .italy-model-cell {
      background-color: #e6fffa !important;
      cursor: cell !important;
    }
    .italy-model-cell:hover {
      background-color: #d1fff5 !important;
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
    fillHandle: false,
    doubleClickToEditor: true, // 더블클릭으로 편집 활성화
    
    // F2 키 핸들러 완전히 개선 - F2 키로 편집 시작
    beforeKeyDown: function(event: KeyboardEvent) {
      if (isEditMode && event.key === 'F2') {
        const selectedCell = this.getSelectedLast();
        if (selectedCell) {
          const [row, col] = selectedCell;
          
          console.log(`F2 키 누름: 행=${row}, 열=${col}, 데이터=${this.getDataAtCell(row, col)}`);
          
          // 이태리 모델 행 확인
          let isItalyModel = false;
          for (let i = 0; i < data.length; i++) {
            if (data[i] && data[i][0] === '이태리') {
              if ((row === i + 1 || row === i + 2) && col > 0) {
                isItalyModel = true;
                break;
              }
            }
          }
          
          // 읽기 전용이 아니거나 이태리 모델 셀인 경우 편집 시작
          const cellMeta = this.getCellMeta(row, col);
          if (!cellMeta.readOnly || isItalyModel) {
            // 셀 메타데이터 강제 업데이트
            this.setCellMeta(row, col, 'readOnly', false);
            this.setCellMeta(row, col, 'isEditable', true);
            
            console.log(`F2 편집 시작: 행=${row}, 열=${col}, 읽기전용=${cellMeta.readOnly}, 이태리모델=${isItalyModel}`);
            
            // 약간의 지연 후 편집 시작 (이벤트 처리 안정성 위해)
            setTimeout(() => {
              this.getActiveEditor().beginEditing();
            }, 10);
            
            event.preventDefault();
          }
        }
      }
    },
    
    // 강화된 더블클릭 편집 처리
    afterOnCellMouseDown: function(event: MouseEvent, coords: any) {
      if (isEditMode && coords.row >= 0 && coords.col > 0 && event.detail === 2) {
        console.log(`더블클릭 감지: 행=${coords.row}, 열=${coords.col}`);
        
        // 이태리 모델 행 확인
        let isItalyModel = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i][0] === '이태리') {
            if ((coords.row === i + 1 || coords.row === i + 2) && coords.col > 0) {
              isItalyModel = true;
              break;
            }
          }
        }
        
        const cellMeta = this.getCellMeta(coords.row, coords.col);
        if (!cellMeta.readOnly || isItalyModel) {
          // 셀 메타데이터 강제 업데이트
          this.setCellMeta(coords.row, coords.col, 'readOnly', false);
          this.setCellMeta(coords.row, coords.col, 'isEditable', true);
          
          console.log(`더블클릭 편집 시작: 행=${coords.row}, 열=${coords.col}, 이태리모델=${isItalyModel}`);
          
          // 약간의 지연 후 편집 시작 (이벤트 처리 안정성 위해)
          setTimeout(() => {
            this.getActiveEditor().beginEditing();
          }, 10);
        }
      }
    },
    
    // 셀 클릭 처리 개선
    beforeOnCellMouseDown: function(event: any, coords: any) {
      if (isEditMode && coords.row >= 0 && coords.col > 0) {
        // 이태리 모델 행 여부 확인
        let isItalyModel = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i][0] === '이태리') {
            if ((coords.row === i + 1 || coords.row === i + 2) && coords.col > 0) {
              isItalyModel = true;
              break;
            }
          }
        }
        
        // 이태리 모델 셀이거나 일반 편집 가능 셀인 경우
        const cell = this.getCellMeta(coords.row, coords.col);
        if (!cell.readOnly || isItalyModel) {
          // 클릭한 셀이 편집 가능한 경우 커서 스타일 변경
          event.target.style.cursor = 'cell';
          
          // 클래스 추가로 시각적 피드백 강화
          if (isItalyModel) {
            if (!event.target.classList.contains('italy-model-cell')) {
              event.target.classList.add('italy-model-cell');
            }
          } else if (!event.target.classList.contains('editable-cell')) {
            event.target.classList.add('editable-cell');
          }
          
          // 디버깅 로그
          console.log(`셀 클릭: 행=${coords.row}, 열=${coords.col}, 이태리모델=${isItalyModel}, 값=${this.getDataAtCell(coords.row, coords.col)}`);
        }
      }
    },
    
    // 셀 호버 처리 개선
    beforeOnCellMouseOver: function(event: any, coords: any) {
      if (isEditMode && coords.row >= 0 && coords.col > 0) {
        // 이태리 모델 행 여부 확인
        let isItalyModel = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i][0] === '이태리') {
            if ((coords.row === i + 1 || coords.row === i + 2) && coords.col > 0) {
              isItalyModel = true;
              break;
            }
          }
        }
        
        const cell = this.getCellMeta(coords.row, coords.col);
        if (!cell.readOnly || isItalyModel) {
          event.target.style.cursor = 'cell';
          
          // 적절한 클래스 추가
          if (isItalyModel) {
            if (!event.target.classList.contains('italy-model-cell')) {
              event.target.classList.add('italy-model-cell');
            }
          } else if (!event.target.classList.contains('editable-cell')) {
            event.target.classList.add('editable-cell');
          }
        }
      }
    },
    
    // 선택한 셀 활성화 강화
    afterSelection: function(row: number, col: number) {
      if (isEditMode && col > 0) {
        // 이태리 모델 행 여부 확인
        let isItalyModel = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i][0] === '이태리') {
            if ((row === i + 1 || row === i + 2) && col > 0) {
              isItalyModel = true;
              break;
            }
          }
        }
        
        const cell = this.getCellMeta(row, col);
        if (!cell.readOnly || isItalyModel) {
          // 이태리 모델 셀인 경우 readOnly 속성 강제 해제
          if (isItalyModel) {
            this.setCellMeta(row, col, 'readOnly', false);
            this.setCellMeta(row, col, 'isEditable', true);
          }
          
          console.log(`셀 선택: 행=${row}, 열=${col}, 이태리모델=${isItalyModel}, 값=${this.getDataAtCell(row, col)}`);
          
          // 셀 시각적 피드백 강화를 위한 클래스 변경
          const td = this.getCell(row, col);
          if (td) {
            if (isItalyModel) {
              if (!td.classList.contains('italy-model-cell')) {
                td.classList.add('italy-model-cell');
              }
            } else if (!td.classList.contains('editable-cell')) {
              td.classList.add('editable-cell');
            }
          }
        }
      }
    },
    
    // 편집 시작 전 처리
    beforeBeginEditing: function(row: number, col: number) {
      // 이태리 모델 행 여부 확인
      let isItalyModel = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i][0] === '이태리') {
          if ((row === i + 1 || row === i + 2) && col > 0) {
            isItalyModel = true;
            break;
          }
        }
      }
      
      // 이태리 모델 셀인 경우 편집 가능으로 설정
      if (isItalyModel) {
        this.setCellMeta(row, col, 'readOnly', false);
        this.setCellMeta(row, col, 'isEditable', true);
        console.log(`편집 시작 전 설정: 행=${row}, 열=${col}, 이태리모델=${isItalyModel}`);
        return true; // 편집 계속 진행
      }
      
      return true; // 기본적으로 편집 진행
    },
    
    // 에디터 생성 전 처리
    beforeCreateEditor: function(row: number, col: number) {
      // 이태리 모델 행 여부 확인
      let isItalyModel = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i][0] === '이태리') {
          if ((row === i + 1 || row === i + 2) && col > 0) {
            isItalyModel = true;
            break;
          }
        }
      }
      
      // 이태리 모델 셀인 경우 로그
      if (isItalyModel) {
        console.log(`에디터 생성 전: 행=${row}, 열=${col}, 이태리모델=true, 값=${this.getDataAtCell(row, col)}`);
      }
    },
    
    // 에디터 열릴 때 로그
    afterBeginEditing: function(row: number, col: number) {
      // 이태리 모델 행 여부 확인
      let isItalyModel = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i][0] === '이태리') {
          if ((row === i + 1 || row === i + 2) && col > 0) {
            isItalyModel = true;
            break;
          }
        }
      }
      
      console.log(`편집 시작: 행=${row}, 열=${col}, 이태리모델=${isItalyModel}, 값=${this.getDataAtCell(row, col)}`);
    }
  }), [isEditMode, data.length, data]);
  
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
