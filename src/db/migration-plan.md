
# 데이터베이스 마이그레이션 계획

## 현재 상태

현재 애플리케이션은 클라이언트 측에서 모든 데이터를 메모리에 저장하고 관리합니다. 메인 데이터 구조는 다음과 같습니다:

1. 테이블 데이터: 2차원 배열 형태로 관리
2. 버전 관리: 각 버전별 데이터를 객체에 저장
3. 변경 이력: 객체 배열로 저장

## 마이그레이션 단계

### 1단계: 데이터베이스 스키마 생성
- 위의 SQL 스크립트를 사용하여 데이터베이스 테이블 생성
- 필요한 인덱스 및 제약 조건 설정

### 2단계: 초기 데이터 마이그레이션
- 기존 메모리 기반 데이터를 데이터베이스로 변환하는 스크립트 작성
- 변환 과정:
  1. 국가, 모델 데이터 생성
  2. 초기 버전(rev1) 생성
  3. 현재 2차원 배열 데이터를 정규화하여 sales_data 테이블에 삽입
  4. 기존 변경 이력을 change_history 테이블에 삽입

### 3단계: API 구현
- 다음 API 엔드포인트 구현:
  1. `/api/versions` - 버전 관리 API
  2. `/api/sales-data` - 영업 데이터 CRUD API
  3. `/api/change-history` - 변경 이력 API
  4. `/api/users` - 사용자 관리 API
  5. `/api/auth` - 인증 API

### 4단계: UI 컴포넌트 수정
- 기존 메모리 기반 데이터 관리에서 API 기반으로 변경:
  1. `useSalesVersions` 훅 수정
  2. `useSalesHistory` 훅 수정
  3. `useSalesPerformance` 훅 수정
  4. 인증 기능 추가

### 5단계: 테스트 및 검증
- 각 단계별 테스트 케이스 작성 및 실행
- 데이터 마이그레이션 검증
- API 엔드포인트 테스트
- UI 컴포넌트 테스트

## 데이터 변환 예시

### 2차원 배열 데이터를 정규화된 DB 구조로 변환

현재 데이터 구조:
```
[
  ['미국', '10', '1,000', '20', '2,000', ..., '비고1'],
  ['모델1', '5', '500', '10', '1,000', ..., '비고2'],
  ...
]
```

변환 후 DB 구조:
```
sales_data 테이블:
id | version_id | country_id | model_id | month | category | qty | amt | remarks
1  | 1          | 1          | NULL     | 1     | 전년      | 10  | 1000 | 비고1
2  | 1          | 1          | 1        | 1     | 전년      | 5   | 500  | 비고2
...
```

## 데이터베이스 쿼리 예시

### 특정 버전의 데이터 조회
```sql
SELECT 
  c.name as country,
  m.name as model,
  s.month,
  s.category,
  s.qty,
  s.amt,
  s.remarks
FROM 
  sales_data s
LEFT JOIN 
  countries c ON s.country_id = c.id
LEFT JOIN 
  models m ON s.model_id = m.id
WHERE 
  s.version_id = (SELECT id FROM versions WHERE name = 'rev1')
ORDER BY 
  c.display_order, 
  CASE WHEN s.model_id IS NULL THEN 0 ELSE 1 END, 
  m.display_order,
  s.month,
  CASE 
    WHEN s.category = '전년' THEN 1
    WHEN s.category = '계획' THEN 2
    WHEN s.category = '실행' THEN 3
    WHEN s.category = '속보' THEN 4
    WHEN s.category = '전망' THEN 5
    ELSE 99
  END;
```

### 변경 이력 조회
```sql
SELECT 
  v.name as version,
  v.year,
  v.month,
  v.week,
  ch.row,
  ch.col,
  ch.old_value,
  ch.new_value,
  u.username as changed_by,
  ch.changed_at
FROM 
  change_history ch
JOIN 
  versions v ON ch.version_id = v.id
JOIN 
  users u ON ch.changed_by = u.id
ORDER BY 
  ch.changed_at DESC;
```
