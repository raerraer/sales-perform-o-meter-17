
import Handsontable from 'handsontable';

/**
 * 변경된 셀에 하이라이팅 적용을 위한 렌더러 함수
 * @param instance Handsontable 인스턴스
 * @param td 셀 엘리먼트
 * @param row 행 인덱스
 * @param col 열 인덱스
 * @param prop 프로퍼티 이름
 * @param value 셀 값
 * @param cellProperties 셀 속성
 */
export const highlightModifiedCellRenderer = (
  instance: any, 
  td: HTMLElement, 
  row: number, 
  col: number, 
  prop: any, 
  value: any, 
  cellProperties: any
) => {
  // 기본 텍스트 렌더러 적용
  Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
  
  // 하이라이팅이 필요한 경우 클래스 추가
  if (cellProperties.isModified) {
    td.classList.add('modified-cell');
  } else {
    td.classList.remove('modified-cell');
  }
};

/**
 * 하이라이팅 스타일을 적용하는 함수
 * @param isModified 셀이 수정되었는지 여부
 * @param renderer 기존 렌더러
 * @returns 셀 속성 객체
 */
export const applyHighlightStyle = (isModified: boolean, renderer?: any) => {
  const cellProperties: any = {};
  
  cellProperties.isModified = isModified;
  
  // 기존 렌더러가 있는 경우 유지, 아니면 하이라이트 렌더러 사용
  if (renderer) {
    const originalRenderer = renderer;
    
    cellProperties.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProps: any) {
      // 원래 렌더러 호출
      originalRenderer.call(this, instance, td, row, col, prop, value, cellProps);
      
      // 수정된 셀인 경우 하이라이팅 적용
      if (cellProps.isModified) {
        td.classList.add('modified-cell');
      } else {
        td.classList.remove('modified-cell');
      }
    };
  } else {
    cellProperties.renderer = highlightModifiedCellRenderer;
  }
  
  return cellProperties;
};
