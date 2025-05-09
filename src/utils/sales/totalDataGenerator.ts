
import { MONTHS, CATEGORIES, MODELS, LEVELS } from './constants';
import { calculateCellSum } from './dataGeneratorUtils';
import { parseNumericValue, formatQtyValue, formatAmtValue } from './dataTransformers';

/**
 * 모델별 합계 데이터 계산
 * @param regionModelDataMap 지역별 모델 데이터 맵
 * @returns 총 합계 모델 데이터
 */
export const calculateTotalModelData = (regionModelDataMap: {[key: string]: any[][]}) => {
  const totalModelData: any[][] = [
    [MODELS[0]], // 모델1
    [MODELS[1]]  // 모델2
  ];
  
  // 모든 지역의 모델 데이터 순회
  LEVELS.REGIONS.forEach(region => {
    const regionModelData = regionModelDataMap[region];
    
    if (!regionModelData) return;
    
    // 각 모델별 처리
    MODELS.forEach((model, modelIndex) => {
      const regionModelRow = regionModelData[modelIndex];
      
      // 모델 데이터가 비어있으면 초기화
      if (totalModelData[modelIndex].length <= 1) {
        // 첫 번째 값(모델명)을 제외한 모든 값을 복사
        for (let i = 1; i < regionModelRow.length; i++) {
          totalModelData[modelIndex].push(regionModelRow[i]);
        }
      } else {
        // 이미 데이터가 있으면 합산
        for (let i = 1; i < regionModelRow.length; i++) {
          // 비고 열은 건너뜀
          const isRemark = (i - 1) % 11 === 10;
          if (isRemark) {
            // 비고 열은 그대로 유지
            continue;
          }
          
          // Amt 열인지 확인
          const isAmtColumn = (i - 1) % 2 === 1;
          
          // 기존 값과 새 값 파싱
          let value1 = 0;
          let value2 = 0;
          
          // 문자열 값 추출 및 수치화
          if (isAmtColumn) {
            // Amt 열은 콤마가 포함된 문자열
            value1 = parseNumericValue(totalModelData[modelIndex][i], 0);
            value2 = parseNumericValue(regionModelRow[i], 0);
          } else {
            // Qty 열은 일반 숫자 문자열
            value1 = parseNumericValue(totalModelData[modelIndex][i], 0);
            value2 = parseNumericValue(regionModelRow[i], 0);
          }
          
          // 합산 및 형식화
          const sum = value1 + value2;
          
          if (isAmtColumn) {
            totalModelData[modelIndex][i] = formatAmtValue(sum);
          } else {
            totalModelData[modelIndex][i] = formatQtyValue(sum);
          }
        }
      }
    });
  });
  
  return totalModelData;
};

/**
 * 총 합계 행 생성
 * @param totalModelData 총 합계 모델 데이터
 * @returns 총 합계 행
 */
export const generateTotalRow = (totalModelData: any[][]) => {
  const totalRow = [LEVELS.TOTAL];
  
  // 12개월에 대한 총 합계 계산
  for (let month = 0; month < MONTHS.length; month++) {
    for (let category = 0; category < CATEGORIES.length - 1; category++) {
      const qtyIdx = 1 + month * 11 + category * 2;
      const amtIdx = qtyIdx + 1;
      
      // Qty 합계 계산
      const qtySum = calculateCellSum(totalModelData, qtyIdx);
      totalRow.push(formatQtyValue(qtySum));
      
      // Amt 합계 계산
      const amtSum = calculateCellSum(totalModelData, amtIdx, true);
      totalRow.push(formatAmtValue(amtSum));
    }
    // 비고 칼럼
    totalRow.push('');
  }
  
  return totalRow;
};

/**
 * 총 합계 데이터 생성
 * @param regionModelDataMap 지역별 모델 데이터 맵
 * @returns 총 합계 데이터 (합계 행 + 모델 행들)
 */
export const generateTotalData = (regionModelDataMap: {[key: string]: any[][]}) => {
  // 모델별 합계 데이터 계산
  const totalModelData = calculateTotalModelData(regionModelDataMap);
  
  // 총 합계 행 생성
  const totalRow = generateTotalRow(totalModelData);
  
  // 총 합계 데이터 배열 생성
  return [totalRow, ...totalModelData];
};
