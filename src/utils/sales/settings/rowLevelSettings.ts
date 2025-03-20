
import { COUNTRIES, LEVELS, LEVEL_STYLES } from '../constants';

/**
 * 총 합계 행 설정
 * @param settings 기존 설정 객체
 * @returns 업데이트된 설정 객체
 */
export const configureTotalRowSettings = (settings: any) => {
  settings.className = `level-1-row cell-center`;
  settings.readOnly = true; // 총 합계 행은 항상 읽기 전용
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL1);
  return settings;
};

/**
 * 지역 행 설정
 * @param settings 기존 설정 객체
 * @returns 업데이트된 설정 객체
 */
export const configureRegionRowSettings = (settings: any) => {
  settings.className = `level-2-row cell-center`;
  settings.readOnly = true; // 지역 행은 항상 읽기 전용
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL2);
  return settings;
};

/**
 * 국가 행 설정
 * @param settings 기존 설정 객체
 * @returns 업데이트된 설정 객체
 */
export const configureCountryRowSettings = (settings: any) => {
  settings.className = `level-3-row cell-center`;
  settings.readOnly = true; // 국가 행은 항상 읽기 전용
  settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3);
  return settings;
};

/**
 * 모델 행의 상위 레벨 찾기
 * @param data 데이터 배열
 * @param row 행 인덱스
 * @returns 부모 레벨 정보
 */
export const findParentLevel = (data: any[][], row: number) => {
  let parentRow = row - 1;
  
  while (parentRow >= 0) {
    const parentValue = data[parentRow][0];
    
    if (parentValue === LEVELS.TOTAL) {
      return { level: 'LEVEL1', readOnly: true };
    } else if (LEVELS.REGIONS.includes(parentValue)) {
      return { level: 'LEVEL2', readOnly: true };
    } else if (COUNTRIES.includes(parentValue)) {
      // 모든 국가의 모델 행 편집 가능하도록 설정
      return { level: 'LEVEL3', readOnly: false, country: parentValue };
    }
    
    parentRow--;
  }
  
  return { level: 'DEFAULT', readOnly: false };
};

/**
 * 모델 행 설정
 * @param settings 기존 설정 객체
 * @param data 데이터 배열
 * @param row 행 인덱스
 * @param isEditMode 편집 모드 여부
 * @returns 업데이트된 설정 객체
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
      if (isEditMode) {
        settings.readOnly = false;
        settings.className += ' editable-cell';
      } else {
        settings.readOnly = true;
      }
      
      settings.renderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_MODEL);
      break;
    default:
      // 기본 설정 - 편집 모드일 때 항상 편집 가능하도록
      settings.readOnly = !isEditMode;
      if (!settings.readOnly) {
        settings.className += ' editable-cell';
      }
      break;
  }
  
  return settings;
};
