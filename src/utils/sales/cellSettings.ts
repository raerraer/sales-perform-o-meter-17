
import Handsontable from 'handsontable';
import { COUNTRIES } from './constants';

// 셀 스타일 설정 함수 (하이라이팅 기능 추가)
export const createCellsSettingsFunction = (data: any[][], isEditMode: boolean, originalData: any[][], changedCells?: Set<string>) => {
  return function(row: number, col: number) {
    // 기본 설정
    const settings: any = {
      readOnly: !isEditMode,
      className: 'cell-center' // 모든 셀에 중앙 정렬 클래스 추가
    };

    // 국가 행 특별 스타일링
    if (COUNTRIES.includes(data[row][0])) {
      settings.className = 'country-row cell-center';
      settings.readOnly = true; // 국가 행은 항상 읽기 전용
    }

    // 폰트 설정
    settings.fontFamily = 'Pretendard';
    settings.fontSize = '13px';

    // 비고 열이 아닌 경우 수치 데이터 포맷 적용
    const isRemarksColumn = (col - 1) % 11 === 10;
    if (!isRemarksColumn && col > 0) {
      if ((col - 1) % 2 === 0) {
        // Qty 열: 숫자 형식
        settings.type = 'numeric';
        settings.numericFormat = {
          pattern: '0,0',
          culture: 'ko-KR'
        };
      } else {
        // Amt 열: 통화 형식
        settings.type = 'numeric';
        settings.numericFormat = {
          pattern: '0,0',
          culture: 'ko-KR'
        };
      }
    }

    // 비고 열은 왼쪽 정렬
    if (isRemarksColumn) {
      settings.className = settings.className.replace('cell-center', 'cell-left');
    }

    // 첫 번째 열(국가/모델명)은 오른쪽 정렬
    if (col === 0) {
      settings.className = settings.className.replace('cell-center', 'cell-right');
      
      // 국가 행의 첫 번째 열은 중앙 정렬
      if (COUNTRIES.includes(data[row][0])) {
        settings.className = settings.className.replace('cell-right', 'cell-center');
      }
    }

    // 변경된 셀 하이라이팅
    if (changedCells && changedCells.has(`${row},${col}`)) {
      // className에 highlight-cell 추가
      settings.className = `${settings.className} highlight-cell`;
      
      // 강조 효과를 위한 커스텀 렌더러
      settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
        // 기본 렌더러 호출
        Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        
        // 하이라이팅 스타일 적용 (배경 노란색, 텍스트 굵게)
        td.style.backgroundColor = '#fffcd8';
        td.style.fontWeight = 'bold';
      };
    }

    return settings;
  };
};
