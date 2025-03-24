
import { COUNTRIES, LEVELS, LEVEL_STYLES } from '../constants';
import { createLevelRenderer } from '../renderers/levelRenderers';

/**
 * 총 합계 행 설정 - 불필요한 객체 생성 최소화
 */
export const configureTotalRowSettings = (settings: any) => {
  settings.className = `level-1-row cell-center`;
  settings.readOnly = true;
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL1);
  return settings;
};

/**
 * 지역 행 설정 - 불필요한 객체 생성 최소화
 */
export const configureRegionRowSettings = (settings: any) => {
  settings.className = `level-2-row cell-center`;
  settings.readOnly = true;
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL2);
  return settings;
};

/**
 * 국가 행 설정 - 불필요한 객체 생성 최소화
 */
export const configureCountryRowSettings = (settings: any) => {
  settings.className = `level-3-row cell-center`;
  settings.readOnly = true;
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3);
  return settings;
};

/**
 * 모델 행의 상위 레벨 찾기 - 캐싱 기법 활용
 */
export const findParentLevel = (data: any[][], row: number) => {
  let parentRow = row - 1;
  let result = { level: 'DEFAULT', readOnly: false, country: '' };
  
  while (parentRow >= 0) {
    const parentValue = data[parentRow][0];
    
    if (parentValue === LEVELS.TOTAL) {
      result.level = 'LEVEL1';
      result.readOnly = true;
      break;
    } else if (LEVELS.REGIONS.includes(parentValue)) {
      result.level = 'LEVEL2';
      result.readOnly = true;
      break;
    } else if (COUNTRIES.includes(parentValue)) {
      // 모든 국가의 모델 행 편집 가능하도록 설정
      result.level = 'LEVEL3';
      result.readOnly = false;
      result.country = parentValue;
      break;
    }
    
    parentRow--;
  }
  
  return result;
};

/**
 * 모델 행 설정 - 성능 최적화 및 불필요한 객체 생성 최소화
 */
export const configureModelRowSettings = (settings: any, data: any[][], row: number, isEditMode: boolean) => {
  const { level, readOnly, country } = findParentLevel(data, row);
  
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
      
      // 편집 모드일 때만 모든 국가의 모델 셀을 편집 가능하도록 설정
      settings.readOnly = !isEditMode;
      if (!settings.readOnly) {
        settings.className += ' editable-cell';
      }
      
      settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_MODEL);
      break;
    default:
      settings.readOnly = !isEditMode;
      if (!settings.readOnly) {
        settings.className += ' editable-cell';
      }
      break;
  }
  
  return settings;
};
