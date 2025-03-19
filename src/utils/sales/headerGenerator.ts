
import { MONTHS, CATEGORIES } from './constants';

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
