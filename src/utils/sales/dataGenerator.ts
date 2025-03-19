
import { LEVELS, REGION_COUNTRIES } from './constants';
import { generateMultipleCountriesData } from './countryDataGenerator';
import { generateAndInsertRegionData } from './regionDataGenerator';
import { generateTotalData } from './totalDataGenerator';

/**
 * 전체 데이터 생성 함수
 * @returns 초기 테이블 데이터
 */
export const generateInitialData = () => {
  // 1. 국가별 데이터 생성
  const { countriesData, countryModelData } = generateMultipleCountriesData(LEVELS.COUNTRIES);
  const data = [...countriesData];
  
  // 2. 지역별 합계 생성 및 데이터에 삽입
  const regionModelDataMap: {[key: string]: any[][]} = {};
  
  LEVELS.REGIONS.forEach(region => {
    const { regionModelData, updatedData } = generateAndInsertRegionData(
      region, 
      countryModelData, 
      data
    );
    
    // 지역별 모델 데이터 저장
    regionModelDataMap[region] = regionModelData;
  });
  
  // 3. 총 합계 생성
  const totalData = generateTotalData(regionModelDataMap);
  
  // 총 합계 데이터를 맨 앞에 추가
  data.unshift(...totalData);
  
  return data;
};
