
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

// 캐싱을 위한 Map 객체 사용
const modelRowCache = new Map<string, boolean>();

/**
 * 모델 행인지 빠르게 확인하는 함수 - 캐싱 로직 적용
 */
const isModelRow = (value: string): boolean => {
  if (!value) return false;
  
  // 캐시된 결과가 있으면 바로 반환
  if (modelRowCache.has(value)) {
    return modelRowCache.get(value) || false;
  }
  
  // 캐시가 없으면 계산 후 캐싱
  const result = value === '모델1' || value === '모델2';
  modelRowCache.set(value, result);
  return result;
};

/**
 * 메인 셀 설정 함수 - 성능 최적화 버전
 */
export const createCellsSettingsFunction = (
  data: any[][], 
  isEditMode: boolean, 
  originalData: any[][],
  isModifiedCell?: (row: number, col: number) => boolean
) => {
  // 국가 데이터 캐싱 (행 인덱스 -> 국가명)
  const countryRowCache = new Map<number, string>();
  
  // 사전에 국가 행 인덱스 캐싱하여 반복 검색 최소화
  for (let i = 0; i < data.length; i++) {
    if (data[i] && COUNTRIES.includes(data[i][0])) {
      countryRowCache.set(i, data[i][0]);
    }
  }
  
  // 셀 설정 함수 - 최적화 버전
  return function(row: number, col: number) {
    // 설정 객체 재사용으로 메모리 사용량 감소
    const settings: any = {
      readOnly: !isEditMode,
      className: 'cell-center',
      fontFamily: 'Pretendard',
      fontSize: '13px'
    };

    // 첫 번째 열(항목 이름)은 항상 읽기 전용
    if (col === 0) {
      settings.readOnly = true;
    }

    // 셀 종류에 따른 설정
    const cellValue = data[row]?.[0];
    
    if (cellValue === LEVELS.TOTAL) {
      configureTotalRowSettings(settings);
    } 
    else if (LEVELS.REGIONS.includes(cellValue)) {
      configureRegionRowSettings(settings);
    }
    else if (COUNTRIES.includes(cellValue)) {
      configureCountryRowSettings(settings);
    }
    else if (isModelRow(cellValue)) {
      // 모델 행 설정
      configureModelRowSettings(settings, data, row, isEditMode);
    }

    // 숫자 형식 및 셀 정렬 설정
    Object.assign(settings, getNumericFormat(col));
    settings.className = `${settings.className.replace(/cell-(center|left|right)/, '')} ${getCellAlignmentClass(col, row, data)}`.trim();

    // 하이라이팅 설정 - 실제로 셀이 수정된 경우에만 하이라이팅 적용
    if (isEditMode && isModifiedCell && isModifiedCell(row, col)) {
      Object.assign(settings, applyHighlightStyle(true, settings.renderer));
    }

    return settings;
  };
};
