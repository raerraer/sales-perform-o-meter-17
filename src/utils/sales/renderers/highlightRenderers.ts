
import Handsontable from 'handsontable';

/**
 * 변경된 셀에 하이라이팅 적용을 위한 렌더러 함수 - 성능 최적화 버전
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
  
  // 하이라이팅이 필요한 경우 클래스 추가 - 성능 최적화를 위해 classList 직접 조작
  if (cellProperties.isModified) {
    if (!td.classList.contains('modified-cell')) {
      td.classList.add('modified-cell');
    }
  } else if (td.classList.contains('modified-cell')) {
    td.classList.remove('modified-cell');
  }
};

/**
 * 하이라이팅 스타일을 적용하는 함수 - 성능 최적화 버전
 */
export const applyHighlightStyle = (isModified: boolean, renderer?: any) => {
  // 성능 최적화: 불필요한 객체 생성 최소화
  const cellProperties: any = { isModified };
  
  // 기존 렌더러가 있는 경우 유지, 아니면 하이라이트 렌더러 사용
  if (renderer) {
    // 클로저 최소화로 성능 향상
    const originalRenderer = renderer;
    
    cellProperties.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProps: any) {
      // 원래 렌더러 호출
      originalRenderer.call(this, instance, td, row, col, prop, value, cellProps);
      
      // 수정된 셀인 경우 하이라이팅 적용 - 직접 DOM 조작 최소화
      if (cellProps.isModified) {
        if (!td.classList.contains('modified-cell')) {
          td.classList.add('modified-cell');
        }
      } else if (td.classList.contains('modified-cell')) {
        td.classList.remove('modified-cell');
      }
    };
  } else {
    cellProperties.renderer = highlightModifiedCellRenderer;
  }
  
  return cellProperties;
};
