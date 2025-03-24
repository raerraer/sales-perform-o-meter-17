
import Handsontable from 'handsontable';

/**
 * 변경된 셀에 하이라이팅 적용을 위한 렌더러 함수 - 성능 최적화 버전
 * 이태리 모델 셀 처리 로직 추가
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
  
  // 편집 가능한 셀 스타일 적용 (성능 최적화) - 모든 편집 가능 셀에 확실히 클래스 추가
  if (cellProperties.isEditable || !cellProperties.readOnly) {
    if (!td.classList.contains('editable-cell')) {
      td.classList.add('editable-cell');
    }
  }
  
  // 이태리 모델 셀인 경우 특별 처리
  if (cellProperties.isItalyModelCell) {
    if (!td.classList.contains('italy-model-cell')) {
      td.classList.add('italy-model-cell');
    }
  }
};

/**
 * 하이라이팅 스타일을 적용하는 함수 - 성능 최적화 버전
 * 이태리 모델 셀 처리 로직 추가
 */
export const applyHighlightStyle = (isModified: boolean, renderer?: any, isItalyModelCell: boolean = false) => {
  // 성능 최적화: 불필요한 객체 생성 최소화
  const cellProperties: any = { 
    isModified,
    // 편집 가능 여부를 확실히 표시
    isEditable: true,
    // 이태리 모델 셀 플래그 추가
    isItalyModelCell
  };
  
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
      
      // 편집 가능한 셀 스타일 적용 - 확실히 적용
      if (cellProps.isEditable || !cellProps.readOnly) {
        if (!td.classList.contains('editable-cell')) {
          td.classList.add('editable-cell');
        }
      }
      
      // 이태리 모델 셀인 경우 특별 클래스 추가
      if (cellProps.isItalyModelCell) {
        if (!td.classList.contains('italy-model-cell')) {
          td.classList.add('italy-model-cell');
        }
      }
    };
  } else {
    cellProperties.renderer = highlightModifiedCellRenderer;
  }
  
  return cellProperties;
};
