
import { MONTHS, CATEGORIES, MODELS } from './constants';
import { 
  initializeModelRow, 
  addMonthlyDataToModelRow, 
  calculateCellSum,
  getFixedCountryData
} from './dataGeneratorUtils';

/**
 * 국가별 데이터 생성
 * @param country 국가명
 * @returns 국가 및 해당 모델 데이터 객체
 */
export const generateCountryData = (country: string) => {
  // 국가별 모델 데이터
  const modelData: any[][] = [];
  const countryModelData: any[][] = [[], []]; // 모델1, 모델2
  
  // 고정된 국가 데이터 가져오기 (항상 고정 데이터 사용)
  const fixedData = getFixedCountryData(country);
  
  // 각 모델별 데이터 생성
  MODELS.forEach((model, modelIndex) => {
    // 모델 행 초기화
    const modelRow = initializeModelRow(model);
    
    // 고정된 데이터가 있으면 사용, 없으면 기본 데이터 생성
    const updatedModelRow = fixedData && fixedData[modelIndex] 
      ? [...modelRow, ...fixedData[modelIndex]]
      : addMonthlyDataToModelRow(modelRow, MONTHS.length, CATEGORIES.length - 1);
    
    modelData.push([...updatedModelRow]); // 깊은 복사로 저장
    countryModelData[modelIndex] = [...updatedModelRow]; // 모델별 저장
  });
  
  // 국가 합계 행 생성
  const countryRow = [country];
  
  // 12개월에 대한 국가 합계 계산
  for (let month = 0; month < MONTHS.length; month++) {
    for (let category = 0; category < CATEGORIES.length - 1; category++) {
      // 해당 월/카테고리의 Qty 열 인덱스
      const qtyIdx = 1 + month * 11 + category * 2;
      // 해당 월/카테고리의 Amt 열 인덱스
      const amtIdx = qtyIdx + 1;
      
      // Qty 합계 계산
      countryRow.push(calculateCellSum(modelData, qtyIdx));
      
      // Amt 합계 계산
      countryRow.push(calculateCellSum(modelData, amtIdx, true));
    }
    // 비고 칼럼
    countryRow.push('');
  }
  
  return {
    countryRow,
    modelRows: modelData,
    countryModelData
  };
};

/**
 * 다수의 국가 데이터 생성
 * @param countries 국가 목록
 * @returns 모든 국가 데이터 및 해당 모델 데이터
 */
export const generateMultipleCountriesData = (countries: string[]) => {
  const allData: any[] = [];
  const allCountryModelData: {[key: string]: any[][]} = {};
  
  countries.forEach(country => {
    // 국가별 데이터 생성
    const { countryRow, modelRows, countryModelData } = generateCountryData(country);
    
    // 국가 행 먼저 추가
    allData.push(countryRow);
    
    // 해당 국가의 모델 행들 추가
    modelRows.forEach(modelRow => {
      allData.push(modelRow);
    });
    
    // 국가별 모델 데이터 저장
    allCountryModelData[country] = countryModelData;
  });
  
  return { 
    countriesData: allData, 
    countryModelData: allCountryModelData 
  };
};
