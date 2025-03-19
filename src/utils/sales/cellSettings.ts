
import Handsontable from 'handsontable';
import { COUNTRIES, LEVELS, LEVEL_STYLES, REGION_COUNTRIES } from './constants';

// 레벨별 셀 렌더러 함수
const createLevelRenderer = (levelStyle: any) => {
  return function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
    
    td.style.backgroundColor = levelStyle.background;
    td.style.color = levelStyle.font;
    td.style.fontWeight = levelStyle.fontWeight;
  };
};

// 변경된 셀 하이라이팅 렌더러
const createHighlightRenderer = (baseRenderer: Function) => {
  return function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
    // 기본 렌더러 호출
    baseRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
    
    // 하이라이팅 스타일 적용 (배경 노란색, 텍스트 굵게)
    td.style.backgroundColor = '#fffcd8';
    td.style.fontWeight = 'bold';
  };
};

// 셀 정렬 클래스 설정
const getCellAlignmentClass = (col: number, row: number, data: any[][]) => {
  // 비고 열은 왼쪽 정렬
  const isRemarksColumn = (col - 1) % 11 === 10;
  if (isRemarksColumn) {
    return 'cell-left';
  }
  
  // 첫 번째 열(국가/모델명)은 오른쪽 정렬
  if (col === 0) {
    // 국가/지역/총 합계 행의 첫 번째 열은 중앙 정렬
    if (COUNTRIES.includes(data[row][0]) || LEVELS.REGIONS.includes(data[row][0]) || data[row][0] === LEVELS.TOTAL) {
      return 'cell-center';
    }
    return 'cell-right';
  }
  
  // 기본값은 중앙 정렬
  return 'cell-center';
};

// 숫자 형식 설정
const getNumericFormat = (col: number) => {
  const isRemarksColumn = (col - 1) % 11 === 10;
  if (!isRemarksColumn && col > 0) {
    if ((col - 1) % 2 === 0) {
      // Qty 열: 숫자 형식
      return {
        type: 'numeric',
        numericFormat: {
          pattern: '0,0',
          culture: 'ko-KR'
        }
      };
    } else {
      // Amt 열: 통화 형식
      return {
        type: 'numeric',
        numericFormat: {
          pattern: '0,0',
          culture: 'ko-KR'
        }
      };
    }
  }
  return {};
};

// 총 합계 행 설정
const configureTotalRowSettings = (settings: any) => {
  settings.className = `level-1-row cell-center`;
  settings.readOnly = true; // 총 합계 행은 항상 읽기 전용
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL1);
  return settings;
};

// 지역 행 설정
const configureRegionRowSettings = (settings: any) => {
  settings.className = `level-2-row cell-center`;
  settings.readOnly = true; // 지역 행은 항상 읽기 전용
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL2);
  return settings;
};

// 국가 행 설정
const configureCountryRowSettings = (settings: any) => {
  settings.className = `level-3-row cell-center`;
  settings.readOnly = true; // 국가 행은 항상 읽기 전용
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3);
  return settings;
};

// 모델 행의 상위 레벨 찾기
const findParentLevel = (data: any[][], row: number) => {
  let parentRow = row - 1;
  
  while (parentRow >= 0) {
    const parentValue = data[parentRow][0];
    
    if (parentValue === LEVELS.TOTAL) {
      return { level: 'LEVEL1', readOnly: true };
    } else if (LEVELS.REGIONS.includes(parentValue)) {
      return { level: 'LEVEL2', readOnly: true };
    } else if (COUNTRIES.includes(parentValue)) {
      return { level: 'LEVEL3', readOnly: false }; // 국가 모델만 편집 가능
    }
    
    parentRow--;
  }
  
  return { level: 'DEFAULT', readOnly: false };
};

// 모델 행 설정
const configureModelRowSettings = (settings: any, data: any[][], row: number, isEditMode: boolean, changedCells?: Set<string>) => {
  const { level, readOnly } = findParentLevel(data, row);
  
  switch (level) {
    case 'LEVEL1':
      settings.className = 'level-1-model cell-center';
      settings.readOnly = true;
      settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL1_MODEL);
      break;
    case 'LEVEL2':
      settings.className = 'level-2-model cell-center';
      settings.readOnly = true;
      settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL2_MODEL);
      break;
    case 'LEVEL3':
      settings.className = 'level-3-model cell-center';
      settings.readOnly = !isEditMode;
      settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
        const baseRenderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_MODEL);
        baseRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
        
        // 변경된 셀 하이라이팅
        if (changedCells && changedCells.has(`${row},${col}`)) {
          td.style.backgroundColor = '#fffcd8'; // 연한 노란색 배경
          td.style.fontWeight = 'bold';
        }
      };
      break;
    default:
      // 기본 설정
      settings.readOnly = !isEditMode;
      break;
  }
  
  return settings;
};

// 메인 셀 설정 함수
export const createCellsSettingsFunction = (data: any[][], isEditMode: boolean, originalData: any[][], changedCells?: Set<string>) => {
  return function(row: number, col: number) {
    // 기본 설정
    const settings: any = {
      readOnly: !isEditMode,
      className: 'cell-center', // 모든 셀에 중앙 정렬 클래스 추가
      fontFamily: 'Pretendard',
      fontSize: '13px'
    };

    // 셀 종류에 따른 설정
    if (data[row][0] === LEVELS.TOTAL) {
      configureTotalRowSettings(settings);
    } 
    else if (LEVELS.REGIONS.includes(data[row][0])) {
      configureRegionRowSettings(settings);
    }
    else if (COUNTRIES.includes(data[row][0])) {
      configureCountryRowSettings(settings);
    }
    else {
      // 모델 행인지 확인 (모델1 또는 모델2)
      const modelValue = data[row][0];
      
      if (modelValue === '모델1' || modelValue === '모델2') {
        configureModelRowSettings(settings, data, row, isEditMode, changedCells);
      }
    }

    // 숫자 형식 설정 추가
    Object.assign(settings, getNumericFormat(col));

    // 셀 정렬 설정
    settings.className = `${settings.className.replace(/cell-(center|left|right)/, '')} ${getCellAlignmentClass(col, row, data)}`.trim();

    // 변경된 셀 하이라이팅 (이미 처리되지 않은 경우만)
    if (changedCells && changedCells.has(`${row},${col}`) && !settings.renderer) {
      // className에 highlight-cell 추가
      settings.className = `${settings.className} highlight-cell`;
      
      // 기본 렌더러가 이미 설정되어 있으면 그 위에 하이라이팅 추가
      if (typeof settings.renderer === 'function') {
        const baseRenderer = settings.renderer;
        settings.renderer = createHighlightRenderer(baseRenderer);
      } else {
        // 강조 효과를 위한 커스텀 렌더러
        settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
          // 기본 렌더러 호출
          Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
          
          // 하이라이팅 스타일 적용 (배경 노란색, 텍스트 굵게)
          td.style.backgroundColor = '#fffcd8';
          td.style.fontWeight = 'bold';
        };
      }
    }

    return settings;
  };
};
