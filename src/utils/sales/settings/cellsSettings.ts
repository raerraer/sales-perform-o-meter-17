
import Handsontable from 'handsontable';
import { COUNTRIES, LEVELS } from '../constants';
import { getCellAlignmentClass } from '../styles/cellAlignment';
import { getNumericFormat } from '../styles/numericFormats';
import { 
  configureTotalRowSettings, 
  configureRegionRowSettings, 
  configureCountryRowSettings, 
  configureModelRowSettings 
} from './rowLevelSettings';
import { applyHighlightStyle } from '../renderers/highlightRenderers';

/**
 * 메인 셀 설정 함수
 * @param data 데이터 배열
 * @param isEditMode 편집 모드 여부
 * @param originalData 원본 데이터 배열
 * @param isModifiedCell 셀이 수정되었는지 확인하는 함수
 * @returns 셀 설정 함수
 */
export const createCellsSettingsFunction = (
  data: any[][], 
  isEditMode: boolean, 
  originalData: any[][],
  isModifiedCell?: (row: number, col: number) => boolean
) => {
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
        configureModelRowSettings(settings, data, row, isEditMode);
        
        // 이태리 특별 처리 - 이태리의 모델 셀은 항상 편집 가능하도록
        if (isEditMode) {
          // 이태리 모델인지 확인
          let currentRow = row - 1;
          let parentCountry = '';
          
          while (currentRow >= 0) {
            if (COUNTRIES.includes(data[currentRow][0])) {
              parentCountry = data[currentRow][0];
              break;
            }
            currentRow--;
          }
          
          // 이태리 모델일 경우 읽기 전용 해제
          if (parentCountry === '이태리') {
            settings.readOnly = false;
            settings.className += ' editable-cell';
          }
        }
      }
    }

    // 숫자 형식 설정 추가
    Object.assign(settings, getNumericFormat(col));

    // 셀 정렬 설정
    settings.className = `${settings.className.replace(/cell-(center|left|right)/, '')} ${getCellAlignmentClass(col, row, data)}`.trim();

    // 하이라이팅 설정 - 실제로 셀이 수정된 경우에만 하이라이팅 적용
    if (isEditMode && isModifiedCell && isModifiedCell(row, col)) {
      const highlightSettings = applyHighlightStyle(true, settings.renderer);
      Object.assign(settings, highlightSettings);
    }

    return settings;
  };
};
