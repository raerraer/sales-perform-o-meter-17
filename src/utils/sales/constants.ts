
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

// 레벨별 스타일 색상
export const LEVEL_STYLES = {
  LEVEL1: {
    background: '#f0e6ff', // 연한 보라색
    font: '#6E59A5',
    fontWeight: 'bold'
  },
  LEVEL2: {
    background: '#e6f2ff', // 연한 파란색
    font: '#0EA5E9',
    fontWeight: 'bold'
  },
  LEVEL3: {
    background: '#f3f4f6', // 기존 국가 행 색상
    font: '#1E293B',
    fontWeight: 'bold'
  }
};
