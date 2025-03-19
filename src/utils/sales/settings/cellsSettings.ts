
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

/**
 * 메인 셀 설정 함수
 * @param data 데이터 배열
 * @param isEditMode 편집 모드 여부
 * @param originalData 원본 데이터 배열
 * @returns 셀 설정 함수
 */
export const createCellsSettingsFunction = (data: any[][], isEditMode: boolean, originalData: any[][]) => {
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
      }
    }

    // 숫자 형식 설정 추가
    Object.assign(settings, getNumericFormat(col));

    // 셀 정렬 설정
    settings.className = `${settings.className.replace(/cell-(center|left|right)/, '')} ${getCellAlignmentClass(col, row, data)}`.trim();

    return settings;
  };
};
