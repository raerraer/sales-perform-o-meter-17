
import Handsontable from 'handsontable';
import { COUNTRIES, GROUPS, MODELS } from './constants';

// 셀 스타일 설정 함수 (하이라이팅 기능 추가)
export const createCellsSettingsFunction = (data: any[][], isEditMode: boolean, originalData: any[][], changedCells?: Set<string>) => {
  return function(row: number, col: number) {
    // 기본 설정
    const settings: any = {
      readOnly: !isEditMode,
      className: 'cell-center' // 모든 셀에 중앙 정렬 클래스 추가
    };

    // 그룹 행 스타일링
    if (GROUPS.includes(data[row][0])) {
      settings.className = 'group-row cell-center';
      settings.readOnly = true; // 그룹 행은 항상 읽기 전용
    }
    // 모델 그룹 행 스타일링
    else if (MODELS.includes(data[row][0]) && row > 0) {
      // 이전 행이 그룹 행이거나 모델 그룹 행인 경우
      const prevRowIsGroup = row > 0 && (GROUPS.includes(data[row-1][0]) || MODELS.includes(data[row-1][0]));
      if (prevRowIsGroup) {
        settings.className = 'model-group-row cell-center';
        settings.readOnly = true; // 모델 그룹 행은 항상 읽기 전용
      }
    }
    // 국가 행 특별 스타일링
    else if (COUNTRIES.includes(data[row][0])) {
      settings.className = 'country-row cell-center';
      settings.readOnly = true; // 국가 행은 항상 읽기 전용
    }
    // 일반 모델 행 (국가 아래의 모델1, 모델2) - 편집 가능하도록 설정
    else if (MODELS.includes(data[row][0])) {
      settings.className = 'cell-center';
      
      // 국가 아래에 있는 모델 행만 편집 가능하도록 설정
      let prevRow = row - 1;
      let isUnderCountry = false;
      
      while (prevRow >= 0) {
        // 상위 행 중 국가가 나오면 편집 가능하도록 설정
        if (COUNTRIES.includes(data[prevRow][0])) {
          isUnderCountry = true;
          settings.readOnly = !isEditMode; // isEditMode가 true일 때만 편집 가능
          break;
        }
        // 상위 행 중 그룹이 나오면 편집 불가
        if (GROUPS.includes(data[prevRow][0])) {
          isUnderCountry = false;
          settings.readOnly = true;
          break;
        }
        prevRow--;
      }
      
      // 모델2가 국가 아래에 있을 때 편집 가능하도록 명시적으로 설정
      if (isUnderCountry && data[row][0] === '모델2') {
        settings.readOnly = !isEditMode;
      }
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
      
      // 국가 행과 그룹 행의 첫 번째 열은 중앙 정렬
      if (COUNTRIES.includes(data[row][0]) || GROUPS.includes(data[row][0])) {
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
