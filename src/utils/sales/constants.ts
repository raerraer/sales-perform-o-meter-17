
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

// 레벨별 스타일 색상 (업데이트됨)
export const LEVEL_STYLES = {
  LEVEL1: {
    background: '#2C3E50', // 다크 슬레이트 블루 계열
    font: '#FFFFFF',  // 흰색 폰트로 가독성 향상
    fontWeight: 'bold'
  },
  LEVEL2: {
    background: '#AED6F1', // 연한 파스텔 블루 계열
    font: '#2C3E50',  // 다크 슬레이트 블루 계열 폰트로 대비 효과
    fontWeight: 'bold'
  },
  LEVEL3: {
    background: '#FAD7A0', // 따뜻한 파스텔 피치 계열
    font: '#34495E',  // 짙은 슬레이트 블루 계열 폰트
    fontWeight: 'bold'
  },
  LEVEL4: {
    background: '#F8F9FA', // 아주 연한 그레이
    font: '#333333',  // 짙은 그레이 폰트
    fontWeight: 'normal'
  }
};
