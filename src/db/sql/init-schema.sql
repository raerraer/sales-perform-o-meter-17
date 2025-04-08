
-- 테이블이 이미 존재하는 경우 삭제 (개발 환경용)
DROP TABLE IF EXISTS change_history CASCADE;
DROP TABLE IF EXISTS sales_data CASCADE;
DROP TABLE IF EXISTS versions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

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
  month INT CHECK (month BETWEEN 1 AND 12),
  category VARCHAR(50),
  qty INT DEFAULT 0,
  amt DECIMAL(12, 2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INT REFERENCES users(id)
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

-- 트리거 함수: 합계 자동 계산
CREATE OR REPLACE FUNCTION update_parent_totals()
RETURNS TRIGGER AS $$
DECLARE
  parent_record RECORD;
  current_parent_id INT;
BEGIN
  -- 모델 행이 변경된 경우에만 상위 행 업데이트
  IF NEW.row_type = 'model' AND (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') AND NEW.month IS NOT NULL AND NEW.category IS NOT NULL THEN
    current_parent_id := NEW.parent_id;
    
    -- 부모 행이 있는 경우 상위로 올라가며 합계 업데이트
    WHILE current_parent_id IS NOT NULL LOOP
      -- 부모 행의 월, 카테고리에 맞는 합계 업데이트
      UPDATE sales_data
      SET 
        qty = (
          SELECT COALESCE(SUM(qty), 0) 
          FROM sales_data 
          WHERE parent_id = current_parent_id
            AND month = NEW.month
            AND category = NEW.category
        ),
        amt = (
          SELECT COALESCE(SUM(amt), 0) 
          FROM sales_data 
          WHERE parent_id = current_parent_id
            AND month = NEW.month
            AND category = NEW.category
        ),
        updated_at = NOW()
      WHERE 
        id = current_parent_id;
      
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

-- 초기 데이터 삽입
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

-- 관리자 사용자 생성 (비밀번호: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2a$10$EJV8z3pFPMXSPSKjdQKKr.DkN6UW0ZHBdLOJ/g4a9xaPrirb1/qOy', 'admin');
