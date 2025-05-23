
// 테이블 스타일 정의 - 성능 최적화
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
  
  /* 레벨별 스타일 업데이트 - 새로운 색상 스키마 */
  /* Level 1: 총 합계 */
  .sales-performance-table .level-1-row {
    background-color: #1e2761 !important; /* 총 합계 다크 블루 */
    color: #ffffff !important; /* 흰색 */
    font-weight: bold !important;
  }
  
  /* Level 1: 총 합계 모델 */
  .sales-performance-table .level-1-model {
    background-color: #ffffff !important; /* 흰색 */
    color: #000000 !important; /* 검정 */
    font-weight: bold !important;
  }
  
  /* Level 2: 지역 그룹 */
  .sales-performance-table .level-2-row {
    background-color: #333333 !important; /* 지역 다크 그레이 */
    color: #ffffff !important; /* 흰색 */
    font-weight: bold !important;
  }
  
  /* Level 2: 지역 모델 */
  .sales-performance-table .level-2-model {
    background-color: #ffffff !important; /* 흰색 */
    color: #000000 !important; /* 검정 */
    font-weight: bold !important;
  }
  
  /* Level 3: 국가 그룹 */
  .sales-performance-table .level-3-row {
    background-color: #f2f2f2 !important; /* 국가 연한 그레이 */
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
  
  /* 수정된 셀 하이라이팅 스타일 - 성능 최적화 */
  .sales-performance-table .modified-cell {
    background-color: #FEF7CD !important; /* 연한 노란색 배경 */
    position: relative;
    will-change: transform, opacity; /* 렌더링 성능 최적화 */
    transition: background-color 0.15s ease-in-out; /* 부드러운 전환 효과 */
  }
  
  /* 수정된 셀에 작은 표시자 추가 - will-change 속성 추가로 렌더링 최적화 */
  .sales-performance-table .modified-cell::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 6px 6px 0;
    border-color: transparent #FFA500 transparent transparent;
    will-change: transform;
  }
`;
