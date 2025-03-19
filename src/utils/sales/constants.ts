
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
    background: '#6D7784', // 다크 그레이
    font: '#3E4C63',      // 네이비
    fontWeight: 'bold'
  },
  LEVEL2: {
    background: '#C9CFD6', // 중간 블루-그레이
    font: '#3E4C63',      // 네이비
    fontWeight: 'bold'
  },
  LEVEL3: {
    background: '#E1E5EB', // 밝은 블루-그레이
    font: '#3E4C63',      // 네이비
    fontWeight: 'bold'
  },
  LEVEL4: {
    background: '#F5F7FA', // 기본 화이트
    font: '#3E4C63',      // 네이비
    fontWeight: 'normal'
  }
};
