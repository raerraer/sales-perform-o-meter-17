
import { MONTHS, CATEGORIES, MODELS, REGION_COUNTRIES } from './constants';
import { calculateCellSum } from './dataGeneratorUtils';

/**
 * 지역 모델 데이터 계산
 * @param region 지역명
 * @param countryModelData 국가별 모델 데이터
 * @returns 지역 모델 데이터
 */
export const calculateRegionModelData = (region: string, countryModelData: {[key: string]: any[][]}) => {
  const regionCountries = REGION_COUNTRIES[region];
  const regionModelData: any[][] = [
    [MODELS[0]], // 모델1
    [MODELS[1]]  // 모델2
  ];
  
  // 모델별 합계 계산
  MODELS.forEach((_, modelIndex) => {
    // 12개월 데이터 생성
    for (let month = 0; month < MONTHS.length; month++) {
      for (let category = 0; category < CATEGORIES.length - 1; category++) {
        const qtyIdx = 1 + month * 11 + category * 2;
        const amtIdx = qtyIdx + 1;
        
        // 해당 지역 내 국가들의 모델 데이터 추출
        const countryModelRows: any[] = [];
        regionCountries.forEach(country => {
          if (countryModelData[country] && countryModelData[country][modelIndex]) {
            countryModelRows.push(countryModelData[country][modelIndex]);
          }
        });
        
        // Qty 합계 계산
        regionModelData[modelIndex].push(
          calculateCellSum(countryModelRows, qtyIdx)
        );
        
        // Amt 합계 계산
        regionModelData[modelIndex].push(
          calculateCellSum(countryModelRows, amtIdx, true)
        );
      }
      // 비고 칼럼
      regionModelData[modelIndex].push('');
    }
  });
  
  return regionModelData;
};

/**
 * 지역 합계 행 생성
 * @param region 지역명
 * @param regionModelData 지역 모델 데이터
 * @returns 지역 합계 행
 */
export const generateRegionRow = (region: string, regionModelData: any[][]) => {
  const regionRow = [region];
  
  // 12개월에 대한 지역 합계 계산
  for (let month = 0; month < MONTHS.length; month++) {
    for (let category = 0; category < CATEGORIES.length - 1; category++) {
      const qtyIdx = 1 + month * 11 + category * 2;
      const amtIdx = qtyIdx + 1;
      
      // Qty 합계 계산 (지역 내 모든 모델의 합)
      regionRow.push(calculateCellSum(regionModelData, qtyIdx));
      
      // Amt 합계 계산 (지역 내 모든 모델의 합)
      regionRow.push(calculateCellSum(regionModelData, amtIdx, true));
    }
    // 비고 칼럼
    regionRow.push('');
  }
  
  return regionRow;
};

/**
 * 지역 데이터 생성 및 기존 데이터 삽입
 * @param region 지역명
 * @param countryModelData 국가별 모델 데이터
 * @param data 기존 데이터 배열
 * @returns 지역 모델 데이터, 업데이트된 데이터 배열
 */
export const generateAndInsertRegionData = (
  region: string, 
  countryModelData: {[key: string]: any[][]}, 
  data: any[]
) => {
  // 지역 모델 데이터 계산
  const regionModelData = calculateRegionModelData(region, countryModelData);
  
  // 지역 합계 행 생성
  const regionRow = generateRegionRow(region, regionModelData);
  
  // 지역 데이터 배열 생성
  const regionData = [regionRow, ...regionModelData];
  
  // 지역 데이터를 기존 데이터에 삽입
  const regionCountries = REGION_COUNTRIES[region];
  const firstCountryIndex = data.findIndex(row => row[0] === regionCountries[0]);
  
  if (firstCountryIndex !== -1) {
    data.splice(firstCountryIndex, 0, ...regionData);
  }
  
  return { regionModelData, updatedData: data };
};
