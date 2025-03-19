
// 데이터베이스 스키마 설계

interface SalesDataTableSchema {
  // 기본 정보
  id: string;           // 고유 ID (PK)
  version_id: string;   // 버전 ID (FK)
  country_id: string;   // 국가 ID (FK)
  model_id: string;     // 모델 ID (FK - null 가능, 국가/지역/전체 합계 행인 경우)
  row_type: 'country' | 'model' | 'region' | 'total';  // 행 타입 (국가, 모델, 지역, 전체 합계)
  parent_id: string;    // 부모 행 ID (국가/지역/전체에 속한 모델의 경우 해당 부모 ID)
  display_order: number; // 표시 순서
  
  // 실적 데이터
  month: number;        // 월 (1-12)
  category: string;     // 카테고리 (전년, 계획, 실행, 속보, 전망)
  qty: number;          // 수량
  amt: number;          // 금액 (정수형으로 저장)
  remarks: string;      // 비고 (선택 사항)
  
  // 메타데이터
  created_at: Date;     // 생성 일시
  updated_at: Date;     // 수정 일시
  created_by: string;   // 생성자 ID (FK)
}

interface VersionSchema {
  id: string;           // 고유 ID (PK)
  name: string;         // 버전명 (예: rev1, rev2, ...)
  year: string;         // 연도
  month: string;        // 월
  week: string;         // 주차
  is_latest: boolean;   // 최신 버전 여부
  is_editable: boolean; // 편집 가능 여부 (rev1은 편집 불가)
  description: string;  // 버전 설명 (선택 사항)
  created_at: Date;     // 생성 일시
  created_by: string;   // 생성자 ID (FK)
}

interface RegionSchema {
  id: string;           // 고유 ID (PK)
  name: string;         // 지역명 (예: 미주, 구주)
  code: string;         // 지역 코드
  display_order: number;// 표시 순서
}

interface CountrySchema {
  id: string;           // 고유 ID (PK)
  name: string;         // 국가명 (예: 미국, 캐나다, 영국, 이태리)
  code: string;         // 국가 코드 (예: US, CA, UK, IT)
  region_id: string;    // 소속 지역 ID (FK)
  display_order: number;// 표시 순서
}

interface ModelSchema {
  id: string;           // 고유 ID (PK)
  name: string;         // 모델명 (예: 모델1, 모델2)
  code: string;         // 모델 코드
  display_order: number;// 표시 순서
}

interface ChangeHistorySchema {
  id: string;           // 고유 ID (PK)
  version_id: string;   // 변경된 버전 ID (FK)
  row: number;          // 변경된 행 인덱스
  col: number;          // 변경된 열 인덱스
  old_value: string;    // 이전 값
  new_value: string;    // 변경된 값
  sales_data_id: string;// 변경된 영업 데이터 ID (FK, 선택 사항)
  changed_at: Date;     // 변경 일시
  changed_by: string;   // 변경자 ID (FK)
}

interface UserSchema {
  id: string;           // 고유 ID (PK)
  username: string;     // 사용자명
  email: string;        // 이메일 (유니크)
  password_hash: string;// 비밀번호 해시 (인증 시 필요)
  role: string;         // 역할 (관리자, 에디터, 뷰어 등)
  created_at: Date;     // 생성 일시
  updated_at: Date;     // 수정 일시
  last_login: Date;     // 마지막 로그인 시간
}

// 실제 데이터베이스 환경에 맞게 수정 필요
export type {
  SalesDataTableSchema,
  VersionSchema,
  RegionSchema,
  CountrySchema,
  ModelSchema,
  ChangeHistorySchema,
  UserSchema
};
