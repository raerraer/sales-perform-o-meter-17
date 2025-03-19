
import Handsontable from 'handsontable';
import { COUNTRIES, LEVELS, LEVEL_STYLES, REGION_COUNTRIES, HIGHLIGHT_STYLE } from './constants';

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
    td.style.backgroundColor = HIGHLIGHT_STYLE.background;
    td.style.fontWeight = HIGHLIGHT_STYLE.fontWeight;
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
const configureRegionRowSettings = (settings: any, data: any[][], row: number) => {
  const regionName = data[row][0];
  
  if (regionName === '미주') {
    settings.className = `level-2-america-row cell-center`;
    settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL2_AMERICA);
  } else if (regionName === '구주') {
    settings.className = `level-2-europe-row cell-center`;
    settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL2_EUROPE);
  } else {
    settings.className = `level-2-row cell-center`;
  }
  
  settings.readOnly = true; // 지역 행은 항상 읽기 전용
  return settings;
};

// 국가 행 설정
const configureCountryRowSettings = (settings: any, data: any[][], row: number) => {
  const countryName = data[row][0];
  
  // 미주 국가인지 구주 국가인지 확인
  if (REGION_COUNTRIES['미주'].includes(countryName)) {
    settings.className = `level-3-america-row cell-center`;
    settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_AMERICA);
  } else if (REGION_COUNTRIES['구주'].includes(countryName)) {
    settings.className = `level-3-europe-row cell-center`;
    settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_EUROPE);
  } else {
    settings.className = `level-3-row cell-center`;
  }
  
  settings.readOnly = true; // 국가 행은 항상 읽기 전용
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
      // 미주인지 구주인지 구분
      if (parentValue === '미주') {
        return { level: 'LEVEL2_AMERICA', readOnly: true };
      } else if (parentValue === '구주') {
        return { level: 'LEVEL2_EUROPE', readOnly: true };
      }
      return { level: 'LEVEL2', readOnly: true };
    } else if (COUNTRIES.includes(parentValue)) {
      // 미주 국가인지 구주 국가인지 구분
      if (REGION_COUNTRIES['미주'].includes(parentValue)) {
        return { level: 'LEVEL3_AMERICA', readOnly: false };
      } else if (REGION_COUNTRIES['구주'].includes(parentValue)) {
        return { level: 'LEVEL3_EUROPE', readOnly: false };
      }
      return { level: 'LEVEL3', readOnly: false }; // 국가 모델만 편집 가능
    }
    
    parentRow--;
  }
  
  return { level: 'DEFAULT', readOnly: false };
};

// 모델 행 설정
const configureModelRowSettings = (settings: any, data: any[][], row: number, isEditMode: boolean, changedCells?: Set<string>, col?: number) => {
  const { level, readOnly } = findParentLevel(data, row);
  
  switch (level) {
    case 'LEVEL1':
      settings.className = 'level-1-model cell-center';
      settings.readOnly = true;
      settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL1_MODEL);
      break;
    case 'LEVEL2_AMERICA':
    case 'LEVEL2_EUROPE':
    case 'LEVEL2':
      settings.className = 'level-2-model cell-center';
      settings.readOnly = true;
      settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL2_MODEL);
      break;
    case 'LEVEL3_AMERICA':
    case 'LEVEL3_EUROPE':
      settings.className = `level-3-model cell-center`;
      settings.readOnly = !isEditMode;
      
      // 셀 렌더러 함수 설정
      if (col !== undefined && changedCells && changedCells.has(`${row},${col}`)) {
        // 하이라이팅이 필요한 경우
        const baseRenderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_MODEL);
        settings.renderer = createHighlightRenderer(baseRenderer);
      } else {
        settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_MODEL);
      }
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
      configureRegionRowSettings(settings, data, row);
    }
    else if (COUNTRIES.includes(data[row][0])) {
      configureCountryRowSettings(settings, data, row);
    }
    else {
      // 모델 행인지 확인 (모델1 또는 모델2)
      const modelValue = data[row][0];
      
      if (modelValue === '모델1' || modelValue === '모델2') {
        configureModelRowSettings(settings, data, row, isEditMode, changedCells, col);
      }
    }

    // 숫자 형식 설정 추가
    Object.assign(settings, getNumericFormat(col));

    // 셀 정렬 설정
    settings.className = `${settings.className.replace(/cell-(center|left|right)/, '')} ${getCellAlignmentClass(col, row, data)}`.trim();

    // 변경된 셀 하이라이팅 (모델 행이 아닌 경우)
    if (changedCells && changedCells.has(`${row},${col}`) && !settings.renderer) {
      // 하이라이팅 스타일 적용
      settings.renderer = function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
        // 기본 렌더러 호출
        Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
        
        // 하이라이팅 스타일 적용
        td.style.backgroundColor = HIGHLIGHT_STYLE.background;
        td.style.fontWeight = HIGHLIGHT_STYLE.fontWeight;
      };
    }

    return settings;
  };
};
