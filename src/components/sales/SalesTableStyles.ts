
// 테이블 스타일 정의
export const getSalesTableStyles = () => `
  .sales-performance-table .cell-center {
    text-align: center !important;
  }
  .sales-performance-table .cell-right {
    text-align: right !important;
  }
  .sales-performance-table .cell-left {
    text-align: left !important;
  }
  .sales-performance-table .highlight-cell {
    background-color: #fffcd8 !important;
    font-weight: bold !important;
  }
  
  /* 레벨별 스타일 업데이트 - 새로운 색상 스키마 */
  /* Level 1: 총 합계 */
  .sales-performance-table .level-1-row {
    background-color: #F0F3F4 !important; /* 총 합계 밝은 회색 */
    color: #000000 !important; /* 검정색 */
    font-weight: bold !important;
  }
  
  /* Level 1: 총 합계 모델 */
  .sales-performance-table .level-1-model {
    background-color: #ffffff !important; /* 흰색 */
    color: #000000 !important; /* 검정 */
    font-weight: bold !important;
  }
  
  /* Level 2: 미주 지역 */
  .sales-performance-table .level-2-america-row {
    background-color: #375E97 !important; /* 짙은 파란색 */
    color: #ffffff !important; /* 흰색 */
    font-weight: bold !important;
  }
  
  /* Level 2: 구주 지역 */
  .sales-performance-table .level-2-europe-row {
    background-color: #FB6542 !important; /* 짙은 오렌지색 */
    color: #ffffff !important; /* 흰색 */
    font-weight: bold !important;
  }
  
  /* Level 2: 지역 모델 */
  .sales-performance-table .level-2-model {
    background-color: #ffffff !important; /* 흰색 */
    color: #000000 !important; /* 검정 */
    font-weight: bold !important;
  }
  
  /* Level 3: 미주 국가 (미국, 캐나다) */
  .sales-performance-table .level-3-america-row {
    background-color: #89ABE3 !important; /* 중간 파란색 */
    color: #000000 !important; /* 검정 */
    font-weight: bold !important;
  }
  
  /* Level 3: 구주 국가 (영국, 이태리) */
  .sales-performance-table .level-3-europe-row {
    background-color: #FFBB00 !important; /* 중간 오렌지색 */
    color: #000000 !important; /* 검정 */
    font-weight: bold !important;
  }
  
  /* Level 3: 국가 모델 (기본 데이터) */
  .sales-performance-table .level-3-model {
    background-color: #ffffff !important; /* 흰색 */
    color: #000000 !important; /* 검정 */
    font-weight: normal !important; /* 볼드 없음 */
  }
  
  /* 헤더 스타일 */
  .sales-performance-table th {
    background-color: #EEF1F5 !important; /* 연한 파스텔 블루-그레이 */
    color: #3E4C63 !important; /* 네이비 */
    text-align: center !important;
    font-weight: bold !important;
  }
`;
