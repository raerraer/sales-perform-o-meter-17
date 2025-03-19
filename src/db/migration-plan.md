
# 데이터베이스 마이그레이션 계획

## 현재 상태

현재 애플리케이션은 클라이언트 측에서 모든 데이터를 메모리에 저장하고 관리합니다. 메인 데이터 구조는 다음과 같습니다:

1. 테이블 데이터: 2차원 배열 형태로 관리
2. 버전 관리: 각 버전별 데이터를 객체에 저장
3. 변경 이력: 객체 배열로 저장
4. 지역-국가 계층 구조: 객체로 관리 (REGION_COUNTRIES)
5. 모델 데이터: 상수 배열로 관리 (MODELS)

## 마이그레이션 단계

### 1단계: 데이터베이스 스키마 생성
- 업데이트된 SQL 스크립트를 사용하여 데이터베이스 테이블 생성
- 필요한 인덱스, 제약 조건 및 트리거 설정
- 새로 추가된 Region 테이블과 계층 구조 설정

### 2단계: 기본 데이터 설정
- 사용자, 지역, 국가, 모델 테이블에 기본 데이터 삽입
- 현재 애플리케이션의 상수값을 데이터베이스로 이전
  - COUNTRIES, MODELS, REGION_COUNTRIES 등을 DB 테이블로 변환

### 3단계: 초기 데이터 마이그레이션
- 기존 메모리 기반 데이터를 데이터베이스로 변환하는 스크립트 작성
- 변환 과정:
  1. 초기 버전(rev1) 생성 및 편집 불가능(is_editable=false) 설정
  2. 현재 2차원 배열 데이터를 계층 구조로 정규화:
     - 총 합계 행 생성 (row_type='total')
     - 지역 행 생성 (row_type='region')
     - 국가 행 생성 (row_type='country')
     - 모델 행 생성 (row_type='model')
     - 각 행에 parent_id 설정하여 계층 구조 유지
  3. 기존 변경 이력을 change_history 테이블에 삽입
  4. 각 행별 표시 순서(display_order) 설정

### 4단계: API 구현
- 다음 API 엔드포인트 구현:
  1. `/api/versions` - 버전 관리 API
     - GET /api/versions - 모든 버전 목록
     - GET /api/versions/:id - 특정 버전 조회
     - POST /api/versions - 새 버전 생성
     - PUT /api/versions/:id - 버전 업데이트
  2. `/api/sales-data` - 영업 데이터 CRUD API
     - GET /api/sales-data?version=:versionId - 특정 버전의 모든 데이터
     - POST /api/sales-data - 새 데이터 생성
     - PUT /api/sales-data/:id - 데이터 업데이트
     - POST /api/sales-data/batch - 배치 데이터 생성/업데이트
  3. `/api/change-history` - 변경 이력 API
     - GET /api/change-history?version=:versionId - 특정 버전의 변경 이력
     - POST /api/change-history - 변경 이력 추가
  4. `/api/regions` - 지역 데이터 API
  5. `/api/countries` - 국가 데이터 API
  6. `/api/models` - 모델 데이터 API
  7. `/api/users` - 사용자 관리 API
  8. `/api/auth` - 인증 API

### 5단계: UI 컴포넌트 수정
- 기존 메모리 기반 데이터 관리에서 API 기반으로 변경:
  1. `useSalesVersions` 훅 수정 - API 호출로 버전 데이터 관리
  2. `useSalesHistory` 훅 수정 - API 호출로 변경 이력 관리
  3. `useSalesDataCalculation` 훅 수정 - 백엔드에서 계산된 데이터 사용
  4. `useSalesPerformance` 훅 수정 - API 호출로 데이터 불러오기
  5. 인증 기능 추가 - 사용자 로그인/권한 관리

### 6단계: 데이터 정합성 검증 로직 구현
- 데이터 변경 시 계층 구조의 합계 일관성 유지:
  1. 백엔드에서 자동 계산 로직 구현
  2. 트리거 또는 저장 프로시저 사용
  3. 변경된 데이터에 따라 상위 행(부모)의 합계 업데이트
  4. 계산 오류에 대한 유효성 검사 및 수정 기능

### 7단계: 테스트 및 검증
- 각 단계별 테스트 케이스 작성 및 실행
- 데이터 마이그레이션 검증
- API 엔드포인트 테스트
- UI 컴포넌트 테스트
- 계층 구조 데이터 일관성 테스트

## 데이터 변환 예시

### 2차원 배열 데이터를 계층 구조로 변환

현재 데이터 구조:
```
[
  ['총 합계', '100', '10,000', '200', '20,000', ..., ''],
  ['모델1', '50', '5,000', '100', '10,000', ..., ''],
  ['모델2', '50', '5,000', '100', '10,000', ..., ''],
  ['미주', '60', '6,000', '120', '12,000', ..., ''],
  ['모델1', '30', '3,000', '60', '6,000', ..., ''],
  ['모델2', '30', '3,000', '60', '6,000', ..., ''],
  ['미국', '40', '4,000', '80', '8,000', ..., ''],
  ['모델1', '20', '2,000', '40', '4,000', ..., ''],
  ['모델2', '20', '2,000', '40', '4,000', ..., ''],
  ...
]
```

변환 후 DB 구조:
```
sales_data 테이블:
id | version_id | country_id | model_id | row_type | parent_id | display_order | month | category | qty | amt | remarks
1  | 1          | NULL       | NULL     | total    | NULL      | 1             | 1     | 전년      | 100 | 10000 | 
2  | 1          | NULL       | 1        | model    | 1         | 2             | 1     | 전년      | 50  | 5000  | 
3  | 1          | NULL       | 2        | model    | 1         | 3             | 1     | 전년      | 50  | 5000  | 
4  | 1          | NULL       | NULL     | region   | 1         | 4             | 1     | 전년      | 60  | 6000  | 
5  | 1          | NULL       | 1        | model    | 4         | 5             | 1     | 전년      | 30  | 3000  | 
6  | 1          | NULL       | 2        | model    | 4         | 6             | 1     | 전년      | 30  | 3000  | 
7  | 1          | 1          | NULL     | country  | 4         | 7             | 1     | 전년      | 40  | 4000  | 
8  | 1          | 1          | 1        | model    | 7         | 8             | 1     | 전년      | 20  | 2000  | 
9  | 1          | 1          | 2        | model    | 7         | 9             | 1     | 전년      | 20  | 2000  | 
...
```

## 데이터베이스 쿼리 예시

### 특정 버전의 데이터를 계층 구조로 조회
```sql
WITH RECURSIVE data_hierarchy AS (
  -- 최상위 행 (총 합계) 선택
  SELECT 
    sd.id, 
    sd.parent_id,
    sd.row_type,
    sd.country_id,
    sd.model_id,
    sd.display_order,
    c.name as country_name,
    r.name as region_name,
    m.name as model_name,
    sd.month,
    sd.category,
    sd.qty,
    sd.amt,
    sd.remarks,
    1 as level,
    ARRAY[sd.display_order] as sort_path
  FROM 
    sales_data sd
  LEFT JOIN
    countries c ON sd.country_id = c.id
  LEFT JOIN
    regions r ON (sd.row_type = 'region' AND r.id = c.region_id)
  LEFT JOIN
    models m ON sd.model_id = m.id
  WHERE 
    sd.version_id = 1 
    AND sd.row_type = 'total'
  
  UNION ALL
  
  -- 재귀적으로 하위 행 선택
  SELECT 
    sd.id, 
    sd.parent_id,
    sd.row_type,
    sd.country_id,
    sd.model_id,
    sd.display_order,
    c.name as country_name,
    r.name as region_name,
    m.name as model_name,
    sd.month,
    sd.category,
    sd.qty,
    sd.amt,
    sd.remarks,
    dh.level + 1,
    dh.sort_path || sd.display_order
  FROM 
    sales_data sd
  JOIN 
    data_hierarchy dh ON sd.parent_id = dh.id
  LEFT JOIN
    countries c ON sd.country_id = c.id
  LEFT JOIN
    regions r ON (sd.row_type = 'region' AND c.region_id = r.id)
  LEFT JOIN
    models m ON sd.model_id = m.id
  WHERE 
    sd.version_id = 1
)
SELECT * FROM data_hierarchy
ORDER BY sort_path;
```

### 변경된 데이터에 따라 상위 행의 합계 업데이트 트리거
```sql
CREATE OR REPLACE FUNCTION update_parent_totals()
RETURNS TRIGGER AS $$
DECLARE
  parent_record RECORD;
  current_parent_id INT;
BEGIN
  -- 모델 행이 변경된 경우에만 상위 행 업데이트
  IF NEW.row_type = 'model' AND (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
    current_parent_id := NEW.parent_id;
    
    -- 부모 행이 있는 경우 상위로 올라가며 합계 업데이트
    WHILE current_parent_id IS NOT NULL LOOP
      -- 부모 행의 월, 카테고리에 맞는 합계 업데이트
      UPDATE sales_data
      SET 
        qty = (
          SELECT SUM(qty) 
          FROM sales_data 
          WHERE parent_id = current_parent_id
            AND month = NEW.month
            AND category = NEW.category
        ),
        amt = (
          SELECT SUM(amt) 
          FROM sales_data 
          WHERE parent_id = current_parent_id
            AND month = NEW.month
            AND category = NEW.category
        ),
        updated_at = NOW()
      WHERE 
        id = current_parent_id
        AND month = NEW.month
        AND category = NEW.category;
      
      -- 상위 부모 ID 가져오기
      SELECT parent_id INTO current_parent_id
      FROM sales_data
      WHERE id = current_parent_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결
CREATE TRIGGER trg_update_parent_totals
AFTER INSERT OR UPDATE ON sales_data
FOR EACH ROW
EXECUTE FUNCTION update_parent_totals();
```

### 데이터 변환 및 마이그레이션 작업 순서

1. 기존 형식 데이터 백업
2. 스키마 생성 및 마스터 데이터(지역, 국가, 모델) 등록
3. 계층 구조 변환 및 데이터 마이그레이션
4. 계층 구조 데이터 검증
5. 새 형식으로 API 개발
6. UI 컴포넌트 수정
7. 테스트 및 검증
8. 운영 환경 배포
