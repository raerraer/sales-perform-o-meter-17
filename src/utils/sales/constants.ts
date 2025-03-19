
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
    background: '#F0F3F4', // 총 합계 밝은 회색
    font: '#000000',      // 검정색
    fontWeight: 'bold'
  },
  LEVEL1_MODEL: {
    background: '#ffffff', // 총 합계 모델 흰색
    font: '#000000',      // 검정
    fontWeight: 'bold'
  },
  LEVEL2_AMERICA: {
    background: '#375E97', // 미주 지역 짙은 파란색
    font: '#ffffff',      // 흰색
    fontWeight: 'bold'
  },
  LEVEL2_EUROPE: {
    background: '#FB6542', // 구주 지역 짙은 오렌지색
    font: '#ffffff',      // 흰색
    fontWeight: 'bold'
  },
  LEVEL2_MODEL: {
    background: '#ffffff', // 지역 모델 흰색
    font: '#000000',      // 검정
    fontWeight: 'bold'
  },
  LEVEL3_AMERICA: {
    background: '#89ABE3', // 미국, 캐나다 중간 파란색
    font: '#000000',      // 검정
    fontWeight: 'bold'
  },
  LEVEL3_EUROPE: {
    background: '#FFBB00', // 영국, 이태리 중간 오렌지색
    font: '#000000',      // 검정
    fontWeight: 'bold'
  },
  LEVEL3_MODEL: {
    background: '#ffffff', // 국가 모델 흰색
    font: '#000000',      // 검정
    fontWeight: 'normal'  // 볼드 없음
  }
};

// 하이라이팅 스타일
export const HIGHLIGHT_STYLE = {
  background: '#fffcd8', // 연한 노란색 배경
  font: '#000000',      // 검정색
  fontWeight: 'bold'    // 볼드
};
