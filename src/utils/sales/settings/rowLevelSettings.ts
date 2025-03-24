
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
      // 모든 국가의 모델 행은 편집 가능하도록 설정 - 중요!
      result.level = 'LEVEL3';
      result.readOnly = false; // 무조건 false로 설정
      result.country = parentValue;
      break;
    }
    
    parentRow--;
  }
  
  return result;
};

/**
 * 모델 행 설정 - 이태리 모델 행 특별 처리 추가
 */
export const configureModelRowSettings = (settings: any, data: any[][], row: number, isEditMode: boolean) => {
  const { level, country } = findParentLevel(data, row);
  
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
      
      // 중요 수정! - 편집 모드일 때 모든 국가의 모델 셀 편집 가능하도록 수정
      settings.readOnly = !isEditMode;
      
      // 편집 가능한 셀일 경우 스타일 적용
      if (!settings.readOnly) {
        settings.className += ' editable-cell';
      }
      
      settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_MODEL);
      
      // 이태리인 경우 특별 처리
      if (country === '이태리') {
        // 이태리 모델 행은 편집 모드일 때 항상 편집 가능하게 설정
        settings.readOnly = !isEditMode;
        settings.isEditable = isEditMode; // 명시적으로 편집 가능 설정
        settings.className += ' italy-model-cell'; // 특별 클래스 추가
        
        // 명시적으로 셀 속성 설정 (Handsontable이 인식하는 방식)
        settings.editor = 'text';
        
        // 디버깅을 위한 로그
        console.log(`이태리 모델 행 설정 적용: 행=${row}, 국가=${country}, 편집가능=${isEditMode}`);
      }
      break;
    default:
      settings.readOnly = !isEditMode;
      if (!settings.readOnly) {
        settings.className += ' editable-cell';
      }
      break;
  }
  
  // 명시적으로 편집 가능 여부 플래그 설정
  settings.isEditable = !settings.readOnly;
  
  return settings;
};
