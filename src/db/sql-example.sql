
-- SQL 예제 (PostgreSQL 기준)

-- 지역 테이블
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0
);

-- 국가 테이블
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  region_id INT NOT NULL REFERENCES regions(id),
  display_order INT NOT NULL DEFAULT 0
);

-- 모델 테이블
CREATE TABLE models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0
);

-- 사용자 테이블
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 버전 테이블
CREATE TABLE versions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  year VARCHAR(10) NOT NULL,
  month VARCHAR(10) NOT NULL,
  week VARCHAR(10) NOT NULL,
  is_latest BOOLEAN NOT NULL DEFAULT FALSE,
  is_editable BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INT REFERENCES users(id)
);

-- 영업실적 데이터 테이블
CREATE TABLE sales_data (
  id SERIAL PRIMARY KEY,
  version_id INT NOT NULL REFERENCES versions(id),
  country_id INT REFERENCES countries(id), -- 국가 ID (지역/총합계 행은 NULL 가능)
  model_id INT REFERENCES models(id), -- 모델 ID (국가/지역/전체 합계 행은 NULL 가능)
  row_type VARCHAR(20) NOT NULL CHECK (row_type IN ('country', 'model', 'region', 'total')),
  parent_id INT REFERENCES sales_data(id), -- 계층 구조를 위한 부모 행 참조
  display_order INT NOT NULL DEFAULT 0,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  category VARCHAR(50) NOT NULL,
  qty INT NOT NULL DEFAULT 0,
  amt DECIMAL(12, 2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INT REFERENCES users(id),
  UNIQUE (version_id, row_type, country_id, model_id, month, category)
);

-- 변경 이력 테이블
CREATE TABLE change_history (
  id SERIAL PRIMARY KEY,
  version_id INT NOT NULL REFERENCES versions(id),
  row INT NOT NULL,
  col INT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  sales_data_id INT REFERENCES sales_data(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by INT REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX idx_sales_data_lookup ON sales_data(version_id, row_type, country_id, model_id, month, category);
CREATE INDEX idx_sales_data_version ON sales_data(version_id);
CREATE INDEX idx_sales_data_parent ON sales_data(parent_id);
CREATE INDEX idx_sales_data_order ON sales_data(display_order);
CREATE INDEX idx_change_history_version ON change_history(version_id);
CREATE INDEX idx_change_history_sales_data ON change_history(sales_data_id);
CREATE INDEX idx_countries_region ON countries(region_id);

-- 트리거 함수: 최신 버전 플래그 관리
CREATE OR REPLACE FUNCTION manage_version_latest_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_latest = TRUE THEN
    UPDATE versions SET is_latest = FALSE WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 버전 테이블에 적용
CREATE TRIGGER trg_manage_version_latest_flag
BEFORE INSERT OR UPDATE OF is_latest ON versions
FOR EACH ROW
WHEN (NEW.is_latest = TRUE)
EXECUTE FUNCTION manage_version_latest_flag();

-- 초기 데이터 삽입 예시
-- 지역 데이터 삽입
INSERT INTO regions (name, code, display_order) VALUES
('미주', 'NA', 1),
('구주', 'EU', 2);

-- 국가 데이터 삽입
INSERT INTO countries (name, code, region_id, display_order) VALUES
('미국', 'US', 1, 1),
('캐나다', 'CA', 1, 2),
('영국', 'UK', 2, 3),
('이태리', 'IT', 2, 4);

-- 모델 데이터 삽입
INSERT INTO models (name, code, display_order) VALUES
('모델1', 'M1', 1),
('모델2', 'M2', 2);

-- 관리자 사용자 생성 (비밀번호는 해시 처리해야 함)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', 'hashed_password_here', 'admin');

-- 초기 버전 생성
INSERT INTO versions (name, year, month, week, is_latest, is_editable, created_by) VALUES
('rev1', '2023', '10', '1', TRUE, FALSE, 1);

-- 총 합계 행 생성 (예시)
INSERT INTO sales_data (version_id, row_type, display_order, month, category, qty, amt, created_by)
VALUES
(1, 'total', 1, 1, '전년', 0, 0, 1);

-- 지역 행 생성 (예시)
INSERT INTO sales_data (version_id, row_type, parent_id, display_order, month, category, qty, amt, created_by)
VALUES
(1, 'region', 1, 2, 1, '전년', 0, 0, 1);  -- 미주 지역, 부모는 총 합계 행

-- 국가 행 생성 (예시)
INSERT INTO sales_data (version_id, country_id, row_type, parent_id, display_order, month, category, qty, amt, created_by)
VALUES
(1, 1, 'country', 2, 3, 1, '전년', 0, 0, 1);  -- 미국, 부모는 미주 지역 행

-- 모델 행 생성 (예시)
INSERT INTO sales_data (version_id, country_id, model_id, row_type, parent_id, display_order, month, category, qty, amt, created_by)
VALUES
(1, 1, 1, 'model', 3, 4, 1, '전년', 0, 0, 1);  -- 미국의 모델1, 부모는 미국 행

-- 쿼리 예시: 특정 버전의 모든 데이터를 계층 구조로 조회
WITH RECURSIVE data_tree AS (
  -- 최상위 행 (총 합계) 선택
  SELECT 
    sd.id, 
    sd.parent_id,
    sd.row_type,
    sd.country_id,
    sd.model_id,
    sd.display_order,
    c.name as country_name,
    m.name as model_name,
    sd.month,
    sd.category,
    sd.qty,
    sd.amt,
    sd.remarks,
    1 as level,
    ARRAY[sd.display_order] as path
  FROM 
    sales_data sd
  LEFT JOIN
    countries c ON sd.country_id = c.id
  LEFT JOIN
    models m ON sd.model_id = m.id
  WHERE 
    sd.version_id = 1 
    AND sd.row_type = 'total'
    AND sd.parent_id IS NULL
  
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
    m.name as model_name,
    sd.month,
    sd.category,
    sd.qty,
    sd.amt,
    sd.remarks,
    dt.level + 1,
    dt.path || sd.display_order
  FROM 
    sales_data sd
  JOIN 
    data_tree dt ON sd.parent_id = dt.id
  LEFT JOIN
    countries c ON sd.country_id = c.id
  LEFT JOIN
    models m ON sd.model_id = m.id
  WHERE 
    sd.version_id = 1
)
SELECT * FROM data_tree
ORDER BY path;
