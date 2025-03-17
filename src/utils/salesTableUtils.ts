
// 테이블에 사용할 상수값 정의
export const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const CATEGORIES = ['전년', '계획', '실행', '속보', '전망', '비고'];
export const COUNTRIES = ['미국', '캐나다', '영국', '이태리'];
export const MODELS = ['모델1', '모델2'];

// 기본 데이터 구조 생성
export const generateInitialData = () => {
  const data: any[] = [];
  
  COUNTRIES.forEach(country => {
    // 국가 행 추가
    data.push([country, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    
    // 각 국가별 모델 행 추가
    MODELS.forEach(model => {
      data.push([model, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    });
  });
  
  return data;
};

// 헤더 생성 함수
export const generateComplexHeaders = () => {
  const monthHeaders = [];
  
  for (let month = 0; month < 12; month++) {
    const categoryHeaders = [];
    
    for (let category = 0; category < CATEGORIES.length; category++) {
      if (category < 5) { // 전년, 계획, 실행, 속보, 전망
        categoryHeaders.push({
          label: CATEGORIES[category],
          colspan: 2
        });
      } else { // 비고
        categoryHeaders.push({
          label: CATEGORIES[category],
          colspan: 1
        });
      }
    }
    
    monthHeaders.push({
      label: `${MONTHS[month]}월`,
      colspan: categoryHeaders.reduce((acc, curr) => acc + curr.colspan, 0)
    });
  }
  
  // 모든 월에 대한 헤더 생성
  const allColumnHeaders: any[] = [];
  for (let month = 0; month < 12; month++) {
    // 각 월별로 카테고리 헤더 추가
    for (let category = 0; category < 5; category++) {
      allColumnHeaders.push({label: 'Qty', colspan: 1});
      allColumnHeaders.push({label: 'Amt', colspan: 1});
    }
    // 비고 열 추가
    allColumnHeaders.push({label: '', colspan: 1});
  }
  
  return [
    monthHeaders,
    allColumnHeaders
  ];
};

// 셀 설정 함수 생성기
export const createCellsSettingsFunction = (data: any[], isEditMode: boolean, originalData: any[]) => {
  return (row: number, col: number, prop: any) => {
    const cellProperties: any = {};
    
    // 국가 행 스타일 (첫번째 열이 국가명이고 col이 0인 경우)
    if (col === 0 && COUNTRIES.includes(data[row][0])) {
      cellProperties.className = 'font-bold bg-gray-200';
    }
    
    // 비고 열은 항상 수정 가능 (읽기 모드에서도)
    if ((col - 1) % 11 === 10) { // 각 월의 비고 열 (11번째 열)
      cellProperties.readOnly = false;
    } 
    // 수정 모드가 아닌 경우 모든 셀을 읽기 전용으로 설정
    else if (!isEditMode) {
      cellProperties.readOnly = true;
    }

    // 변경된 셀에 하이라이트 적용
    if (isEditMode && originalData.length > 0 && originalData[row] && data[row]) {
      if (originalData[row][col] !== data[row][col] && data[row][col] !== '') {
        cellProperties.className = 'highlight-cell';
      }
    }
    
    return cellProperties;
  };
};
