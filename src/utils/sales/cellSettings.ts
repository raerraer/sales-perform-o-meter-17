
import Handsontable from 'handsontable';
import { COUNTRIES, LEVELS, LEVEL_STYLES, REGION_COUNTRIES } from './constants';

// 셀 스타일 설정 함수 (하이라이팅 기능 추가)
export const createCellsSettingsFunction = (data: any[][], isEditMode: boolean, originalData: any[][], changedCells?: Set<string>) => {
  return function(row: number, col: number) {
    // 기본 설정
    const settings: any = {
      readOnly: !isEditMode,
      className: 'cell-center' // 모든 셀에 중앙 정렬 클래스 추가
    };

    // 총 합계 스타일 (Level 1)
    if (data[row][0] === LEVELS.TOTAL) {
      settings.className = `level-1-row cell-center`;
      settings.readOnly = true; // 총 합계 행은 항상 읽기 전용
      
      // Level 1 스타일 적용
      settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
        Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        
        td.style.backgroundColor = LEVEL_STYLES.LEVEL1.background;
        td.style.color = LEVEL_STYLES.LEVEL1.font;
        td.style.fontWeight = LEVEL_STYLES.LEVEL1.fontWeight;
      };
    } 
    // 지역 스타일 (Level 2)
    else if (LEVELS.REGIONS.includes(data[row][0])) {
      settings.className = `level-2-row cell-center`;
      settings.readOnly = true; // 지역 행은 항상 읽기 전용
      
      // Level 2 스타일 적용
      settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
        Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        
        td.style.backgroundColor = LEVEL_STYLES.LEVEL2.background;
        td.style.color = LEVEL_STYLES.LEVEL2.font;
        td.style.fontWeight = LEVEL_STYLES.LEVEL2.fontWeight;
      };
    }
    // 국가 행 특별 스타일링 (Level 3)
    else if (COUNTRIES.includes(data[row][0])) {
      settings.className = `level-3-row cell-center`;
      settings.readOnly = true; // 국가 행은 항상 읽기 전용
      
      // Level 3 스타일 적용
      settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
        Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        
        td.style.backgroundColor = LEVEL_STYLES.LEVEL3.background;
        td.style.color = LEVEL_STYLES.LEVEL3.font;
        td.style.fontWeight = LEVEL_STYLES.LEVEL3.fontWeight;
      };
    }
    // 모델 행 아래의 레벨 확인 (총합계/지역/국가 모델인지 구분)
    else {
      // 모델 행인지 확인 (모델1 또는 모델2)
      const modelValue = data[row][0];
      
      if (modelValue === '모델1' || modelValue === '모델2') {
        // 모델 행의 상위 행을 확인하여 어떤 레벨에 속하는지 판단
        let parentRow = row - 1;
        
        while (parentRow >= 0) {
          const parentValue = data[parentRow][0];
          
          // 총 합계 모델인 경우
          if (parentValue === LEVELS.TOTAL) {
            settings.className = 'level-1-model cell-center';
            settings.readOnly = true; // 총 합계 모델은 항상 읽기 전용
            
            // Level 1 모델 스타일 적용
            settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
              
              // 총 합계 모델은 약간 밝은 Level 1 색상
              td.style.backgroundColor = '#6B7D97'; // 약간 밝은 딥 블루
              td.style.color = LEVEL_STYLES.LEVEL1.font;
              td.style.fontWeight = LEVEL_STYLES.LEVEL1.fontWeight;
            };
            
            break;
          }
          // 지역 모델인 경우
          else if (LEVELS.REGIONS.includes(parentValue)) {
            settings.className = 'level-2-model cell-center';
            settings.readOnly = true; // 지역 모델은 항상 읽기 전용
            
            // Level 2 모델 스타일 적용
            settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
              
              // 지역 모델은 약간 밝은 Level 2 색상
              td.style.backgroundColor = '#CDD3E0'; // 약간 밝은 중간 블루-그레이
              td.style.color = LEVEL_STYLES.LEVEL2.font;
              td.style.fontWeight = LEVEL_STYLES.LEVEL2.fontWeight;
            };
            
            break;
          }
          // 국가 모델인 경우
          else if (COUNTRIES.includes(parentValue)) {
            settings.className = 'level-3-model cell-center';
            settings.readOnly = !isEditMode; // 국가 모델만 편집 모드에서 수정 가능
            
            // Level 3 모델 스타일 적용 (기본 데이터 영역)
            settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
              Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
              
              // 국가 모델은 LEVEL4 스타일 적용 (기본 데이터)
              td.style.backgroundColor = LEVEL_STYLES.LEVEL4.background;
              td.style.color = LEVEL_STYLES.LEVEL4.font;
              td.style.fontWeight = LEVEL_STYLES.LEVEL4.fontWeight;
              
              // 변경된 셀 하이라이팅
              if (changedCells && changedCells.has(`${row},${col}`)) {
                td.style.backgroundColor = '#fffcd8'; // 연한 노란색 배경
                td.style.fontWeight = 'bold';
              }
            };
            
            break;
          }
          
          parentRow--;
        }
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
      
      // 국가/지역/총 합계 행의 첫 번째 열은 중앙 정렬
      if (COUNTRIES.includes(data[row][0]) || LEVELS.REGIONS.includes(data[row][0]) || data[row][0] === LEVELS.TOTAL) {
        settings.className = settings.className.replace('cell-right', 'cell-center');
      }
    }

    // 변경된 셀 하이라이팅 (이미 처리되지 않은 경우만)
    if (changedCells && changedCells.has(`${row},${col}`) && !settings.renderer) {
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
