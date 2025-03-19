
/**
 * 변경된 셀 하이라이팅을 위한 렌더러 생성
 * @param baseRenderer 기본 렌더러 함수
 * @returns 하이라이팅이 적용된 렌더러 함수
 */
export const createHighlightRenderer = (baseRenderer: Function) => {
  return function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
    // 기본 렌더러 호출
    baseRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
    
    // 하이라이팅 스타일 적용
    td.style.backgroundColor = '#fffcd8'; // 연한 노란색 배경
    td.style.fontWeight = 'bold';
  };
};

/**
 * 모델 행에 대한 하이라이팅 렌더러 생성
 * @param baseRenderer 기본 렌더러 함수
 * @param changedCells 변경된 셀 목록
 * @returns 커스텀 렌더러 함수
 */
export const createModelHighlightRenderer = (baseRenderer: Function, changedCells: Set<string>) => {
  return function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
    // 기본 스타일 적용
    baseRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
    
    // 변경된 셀 하이라이팅 적용
    if (changedCells.has(`${row},${col}`)) {
      td.style.backgroundColor = '#fffcd8'; // 연한 노란색 배경
      td.style.fontWeight = 'bold';
    }
  };
};
