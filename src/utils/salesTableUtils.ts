
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
    data.push([country, ...Array(72).fill('')]);
    
    // 각 국가별 모델 행 추가
    MODELS.forEach(model => {
      data.push([model, ...Array(72).fill('')]);
    });
  });
  
  return data;
};

// 헤더 생성 함수
export const generateComplexHeaders = () => {
  const headers = [];
  
  // 첫 번째 행: 월 헤더
  const monthHeaders = [{ label: '', colspan: 1 }]; // 첫 번째 열은 국가/모델명
  
  for (let month = 0; month < MONTHS.length; month++) {
    monthHeaders.push({
      label: `${MONTHS[month]}월`,
      colspan: 11 // 각 월별로 (5개 카테고리 x 2) + 비고 1 = 11개 열
    });
  }
  headers.push(monthHeaders);
  
  // 두 번째 행: 카테고리 헤더
  const categoryHeaders = [{ label: '', colspan: 1 }]; // 첫 번째 열은 국가/모델명
  
  for (let month = 0; month < MONTHS.length; month++) {
    for (let category = 0; category < CATEGORIES.length - 1; category++) {
      // 전년, 계획, 실행, 속보, 전망 각각 Qty, Amt 포함
      categoryHeaders.push({
        label: CATEGORIES[category],
        colspan: 2
      });
    }
    // 비고 컬럼
    categoryHeaders.push({
      label: CATEGORIES[5],
      colspan: 1
    });
  }
  headers.push(categoryHeaders);
  
  // 세 번째 행: Qty, Amt 헤더
  const detailHeaders = [{ label: '', colspan: 1 }]; // 첫 번째 열은 국가/모델명
  
  for (let month = 0; month < MONTHS.length; month++) {
    for (let category = 0; category < CATEGORIES.length - 1; category++) {
      detailHeaders.push({ label: 'Qty', colspan: 1 });
      detailHeaders.push({ label: 'Amt', colspan: 1 });
    }
    // 비고 컬럼
    detailHeaders.push({ label: '', colspan: 1 });
  }
  headers.push(detailHeaders);
  
  return headers;
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
    const isRemarksColumn = (col - 1) % 11 === 10; // 각 월의 11번째 열은 비고
    if (isRemarksColumn) {
      cellProperties.readOnly = false;
    } 
    // 수정 모드가 아닌 경우 비고 외 모든 셀을 읽기 전용으로 설정
    else if (!isEditMode) {
      cellProperties.readOnly = true;
    }

    // 변경된 셀에 하이라이트 적용
    if (isEditMode && originalData.length > 0 && originalData[row] && data[row]) {
      if (originalData[row][col] !== data[row][col] && data[row][col] !== '') {
        cellProperties.className = (cellProperties.className || '') + ' highlight-cell';
      }
    }
    
    return cellProperties;
  };
};
