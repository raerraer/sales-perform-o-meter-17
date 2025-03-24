
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
 * 모델 행인지 빠르게 확인하는 함수 - 캐싱 로직 적용 및 모델 인식 개선
 */
const isModelRow = (value: string): boolean => {
  if (!value) return false;
  
  // 캐시된 결과가 있으면 바로 반환
  if (modelRowCache.has(value)) {
    return modelRowCache.get(value) || false;
  }
  
  // 캐시가 없으면 계산 후 캐싱 - 정확한 문자열 비교로 모델 행 인식 개선
  const result = value === '모델1' || value === '모델2';
  modelRowCache.set(value, result);
  
  // 디버깅용 로그
  if (result) {
    console.log(`모델 행 확인: "${value}" -> ${result}`);
  }
  
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
  
  // 이태리 국가 행 위치 찾기
  let italyRowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i][0] === '이태리') {
      italyRowIndex = i;
      break;
    }
  }
  
  // 셀 설정 함수 - 최적화 버전
  return function(row: number, col: number) {
    // 설정 객체 재사용으로 메모리 사용량 감소
    const settings: any = {
      readOnly: !isEditMode,
      className: 'cell-center',
      fontFamily: 'Pretendard',
      fontSize: '13px',
      // 명시적으로 텍스트 에디터 지정
      editor: Handsontable.editors.TextEditor
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
      // 모델 행 설정 - 편집 모드 정보 전달 확실히 함
      configureModelRowSettings(settings, data, row, isEditMode);
      
      // 이태리의 모델 행인 경우 특별히 처리 (특히 문제가 있는 부분)
      if (italyRowIndex > -1 && row > italyRowIndex && row <= italyRowIndex + 2) {
        // 이태리 모델 행은 편집 모드일 때 무조건 편집 가능하게 설정
        if (isEditMode && col > 0) {
          settings.readOnly = false;
          settings.className += ' editable-cell';
          console.log(`이태리 모델 셀 특별 처리: 행=${row}, 열=${col}, 읽기전용=${settings.readOnly}`);
        }
      }
      
      // 모델 셀이 편집 가능한지 설정에 추가 플래그
      settings.isEditable = !settings.readOnly;
    }

    // 숫자 형식 및 셀 정렬 설정
    Object.assign(settings, getNumericFormat(col));
    settings.className = `${settings.className.replace(/cell-(center|left|right)/, '')} ${getCellAlignmentClass(col, row, data)}`.trim();

    // 하이라이팅 설정 - 실제로 셀이 수정된 경우에만 하이라이팅 적용
    if (isEditMode && isModifiedCell && isModifiedCell(row, col)) {
      Object.assign(settings, applyHighlightStyle(true, settings.renderer));
    }
    
    // 편집 가능한 셀인 경우 별도 플래그 설정 (Handsontable이 인식하는 방식)
    if (!settings.readOnly && col > 0) {
      settings.isEditable = true;
      
      // 클래스 이름에 editable-cell 추가 확인
      if (!settings.className.includes('editable-cell')) {
        settings.className += ' editable-cell';
      }
    }

    return settings;
  };
};
