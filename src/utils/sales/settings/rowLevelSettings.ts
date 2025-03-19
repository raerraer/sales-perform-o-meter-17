
import { COUNTRIES, LEVELS, LEVEL_STYLES } from '../constants';
import { createLevelRenderer } from '../renderers/levelRenderers';
import { createModelHighlightRenderer } from '../renderers/highlightRenderers';

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
      return { level: 'LEVEL3', readOnly: false }; // 국가 모델만 편집 가능
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
 * @param changedCells 변경된 셀 목록
 * @returns 업데이트된 설정 객체
 */
export const configureModelRowSettings = (settings: any, data: any[][], row: number, isEditMode: boolean, changedCells?: Set<string>) => {
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
      
      // 기본 렌더러
      let baseRenderer = createLevelRenderer(LEVEL_STYLES.LEVEL3_MODEL);
      
      // 변경된 셀 하이라이팅 적용을 위한 커스텀 렌더러
      if (changedCells) {
        settings.renderer = createModelHighlightRenderer(baseRenderer, changedCells);
      } else {
        settings.renderer = baseRenderer;
      }
      break;
    default:
      // 기본 설정
      settings.readOnly = !isEditMode;
      break;
  }
  
  return settings;
};
