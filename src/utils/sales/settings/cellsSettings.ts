
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
 * 모델 행인지 확인하는 함수
 * @param value 셀 값
 * @returns 모델 행 여부
 */
const isModelRow = (value: string): boolean => {
  return value === '모델1' || value === '모델2';
};

/**
 * 특정 행이 주어진 국가에 속한 모델 행인지 확인하는 함수
 * @param data 데이터 배열
 * @param row 현재 행 인덱스
 * @param country 확인할 국가명
 * @returns 해당 국가의 모델 행 여부
 */
const isCountryModelRow = (data: any[][], row: number, country: string): boolean => {
  if (!isModelRow(data[row][0])) return false;
  
  // 현재 행에서 위로 올라가면서 첫 번째 나오는 국가 확인
  let currentRow = row - 1;
  while (currentRow >= 0) {
    if (COUNTRIES.includes(data[currentRow][0])) {
      return data[currentRow][0] === country;
    }
    currentRow--;
  }
  
  return false;
};

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
      readOnly: !isEditMode,  // 기본적으로 편집 모드에 따라 읽기 전용 설정
      className: 'cell-center', // 모든 셀에 중앙 정렬 클래스 추가
      fontFamily: 'Pretendard',
      fontSize: '13px'
    };

    // 첫 번째 열(항목 이름)은 항상 읽기 전용
    if (col === 0) {
      settings.readOnly = true;
    }

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
      
      if (isModelRow(modelValue)) {
        // 모든 국가의 모델 셀 편집 가능하도록 설정
        configureModelRowSettings(settings, data, row, isEditMode);
        
        // 편집 모드일 때 모든 국가 모델 셀을 편집 가능하게 설정
        if (isEditMode && col > 0) {
          settings.readOnly = false;
          settings.className += ' editable-cell';
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
