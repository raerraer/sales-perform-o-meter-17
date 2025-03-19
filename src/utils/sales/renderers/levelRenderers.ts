
import Handsontable from 'handsontable';
import { LEVEL_STYLES } from '../constants';

/**
 * 레벨별 셀 렌더러 함수 생성
 * @param levelStyle 적용할 레벨 스타일
 * @returns 커스텀 렌더러 함수
 */
export const createLevelRenderer = (levelStyle: any) => {
  return function(instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) {
    Handsontable.renderers.TextRenderer.apply(this, [instance, td, row, col, prop, value, cellProperties]);
    
    td.style.backgroundColor = levelStyle.background;
    td.style.color = levelStyle.font;
    td.style.fontWeight = levelStyle.fontWeight;
  };
};
