// 테이블에 사용할 상수값 정의
export const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const CATEGORIES = ['전년', '계획', '실행', '속보', '전망', '비고'];
export const COUNTRIES = ['미국', '캐나다', '영국', '이태리'];
export const MODELS = ['모델1', '모델2'];

// 랜덤 데이터 생성 함수 (qty는 2자리, amt는 3자리로 생성)
const generateRandomData = () => {
  const qty = Math.floor(Math.random() * 90) + 10; // 10-99 범위의 2자리 숫자
  const amt = Math.floor(Math.random() * 900) + 100; // 100-999 범위의 3자리 숫자
  return { qty, amt: amt.toLocaleString() }; // amt는 천 단위 구분자(,) 포함
};

// 기본 데이터 구조 생성
export const generateInitialData = () => {
  const data: any[] = [];
  
  COUNTRIES.forEach(country => {
    // 각 모델별 데이터 생성을 위한 저장소
    const modelData: any[][] = [];
    
    // 각 국가별 모델 데이터 생성
    MODELS.forEach(model => {
      const row = [model];
      
      // 12개월 데이터 생성
      for (let month = 0; month < MONTHS.length; month++) {
        // 5개 카테고리(전년, 계획, 실행, 속보, 전망)에 대해 Qty, Amt 생성
        for (let category = 0; category < CATEGORIES.length - 1; category++) {
          const { qty, amt } = generateRandomData();
          row.push(qty.toString());
          row.push(amt);
        }
        // 비고 칼럼 추가
        row.push('');
      }
      
      modelData.push([...row]); // 깊은 복사로 저장
    });
    
    // 국가 합계 행 생성
    const countryRow = [country];
    
    // 12개월에 대한 국가 합계 계산
    for (let month = 0; month < MONTHS.length; month++) {
      for (let category = 0; category < CATEGORIES.length - 1; category++) {
        // 해당 월/카테고리의 Qty 합계 계산 (각 모델의 해당 위치 값 합산)
        const qtySum = modelData.reduce((sum, modelRow) => {
          const idx = 1 + month * 11 + category * 2;
          return sum + Number(modelRow[idx] || 0);
        }, 0);
        
        // 해당 월/카테고리의 Amt 합계 계산
        const amtSum = modelData.reduce((sum, modelRow) => {
          const idx = 1 + month * 11 + category * 2 + 1;
          const amtValue = modelRow[idx] ? modelRow[idx].replace(/,/g, '') : '0';
          return sum + Number(amtValue);
        }, 0);
        
        countryRow.push(qtySum.toString());
        countryRow.push(amtSum.toLocaleString());
      }
      // 비고 칼럼
      countryRow.push('');
    }
    
    // 국가 행을 먼저 추가
    data.push(countryRow);
    
    // 해당 국가의 모델 행들 추가
    modelData.forEach(modelRow => {
      data.push(modelRow);
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

// 셀 스타일 설정 함수 (하이라이팅 기능 추가)
export const createCellsSettingsFunction = (data: any[][], isEditMode: boolean, originalData: any[][], changedCells?: Set<string>) => {
  return function(row: number, col: number) {
    // 기본 설정
    const settings: any = {
      readOnly: !isEditMode
    };

    // 국가 행 특별 스타일링
    if (COUNTRIES.includes(data[row][0])) {
      settings.className = 'country-row';
      settings.readOnly = true; // 국가 행은 항상 읽기 전용
    }

    // 폰트 설정
    settings.fontFamily = 'Pretendard';
    settings.fontSize = '13px';

    // 비고 열이 아닌 경우 수치 데이터 포맷 적용
    const isRemarksColumn = (col - 1) % 11 === 10;
    if (!isRemarksColumn && col > 0) {
      if ((col - 1) % 2 === 0) {
        // Qty 열: 숫자 형식
        settings.type = 'numeric';
        settings.numericFormat = {
          pattern: '0,0',
          culture: 'ko-KR'
        };
      } else {
        // Amt 열: 통화 형식
        settings.type = 'numeric';
        settings.numericFormat = {
          pattern: '0,0',
          culture: 'ko-KR'
        };
      }
    }

    // 변경된 셀 하이라이팅
    if (changedCells && changedCells.has(`${row},${col}`)) {
      settings.className = settings.className 
        ? `${settings.className} highlight-cell` 
        : 'highlight-cell';
    }

    return settings;
  };
};
