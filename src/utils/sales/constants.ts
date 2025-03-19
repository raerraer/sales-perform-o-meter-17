
// 테이블에 사용할 상수값 정의
export const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const CATEGORIES = ['전년', '계획', '실행', '속보', '전망', '비고'];
export const COUNTRIES = ['미국', '캐나다', '영국', '이태리'];
export const MODELS = ['모델1', '모델2'];

// 레벨별 그룹 정의
export const LEVELS = {
  TOTAL: '총 합계', // Level 1
  REGIONS: ['미주', '구주'], // Level 2
  COUNTRIES: ['미국', '캐나다', '영국', '이태리'] // Level 3
};

// 지역별 국가 매핑
export const REGION_COUNTRIES = {
  '미주': ['미국', '캐나다'],
  '구주': ['영국', '이태리']
};

// 레벨별 스타일 색상 (새로운 색상 스키마 적용)
export const LEVEL_STYLES = {
  LEVEL1: {
    background: '#1e2761', // 총 합계 다크 블루
    font: '#ffffff',      // 흰색
    fontWeight: 'bold'
  },
  LEVEL1_MODEL: {
    background: '#ffffff', // 총 합계 모델 흰색
    font: '#000000',      // 검정
    fontWeight: 'bold'
  },
  LEVEL2: {
    background: '#333333', // 지역(미주, 구주) 다크 그레이
    font: '#ffffff',      // 흰색
    fontWeight: 'bold'
  },
  LEVEL2_MODEL: {
    background: '#ffffff', // 지역 모델 흰색
    font: '#000000',      // 검정
    fontWeight: 'bold'
  },
  LEVEL3: {
    background: '#f2f2f2', // 국가(미국, 캐나다...) 연한 그레이
    font: '#000000',      // 검정
    fontWeight: 'bold'
  },
  LEVEL3_MODEL: {
    background: '#ffffff', // 국가 모델 흰색
    font: '#000000',      // 검정
    fontWeight: 'normal'  // 볼드 없음
  }
};
