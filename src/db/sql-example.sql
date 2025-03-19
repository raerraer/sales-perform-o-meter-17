
-- SQL 예제 (PostgreSQL 기준)

-- 국가 테이블
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
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
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INT REFERENCES users(id)
);

-- 영업실적 데이터 테이블
CREATE TABLE sales_data (
  id SERIAL PRIMARY KEY,
  version_id INT NOT NULL REFERENCES versions(id),
  country_id INT NOT NULL REFERENCES countries(id),
  model_id INT REFERENCES models(id), -- 국가 합계 행인 경우 NULL 허용
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  category VARCHAR(50) NOT NULL,
  qty INT NOT NULL DEFAULT 0,
  amt DECIMAL(12, 2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INT REFERENCES users(id),
  UNIQUE (version_id, country_id, model_id, month, category)
);

-- 변경 이력 테이블
CREATE TABLE change_history (
  id SERIAL PRIMARY KEY,
  version_id INT NOT NULL REFERENCES versions(id),
  row INT NOT NULL,
  col INT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by INT REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX idx_sales_data_lookup ON sales_data(version_id, country_id, model_id, month, category);
CREATE INDEX idx_sales_data_version ON sales_data(version_id);
CREATE INDEX idx_change_history_version ON change_history(version_id);

-- 초기 데이터 삽입 예시
-- 국가 데이터 삽입
INSERT INTO countries (name, code, display_order) VALUES
('미국', 'US', 1),
('캐나다', 'CA', 2),
('영국', 'UK', 3),
('이태리', 'IT', 4);

-- 모델 데이터 삽입
INSERT INTO models (name, code, display_order) VALUES
('모델1', 'M1', 1),
('모델2', 'M2', 2);

-- 관리자 사용자 생성 (비밀번호는 해시 처리해야 함)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', 'hashed_password_here', 'admin');

-- 초기 버전 생성
INSERT INTO versions (name, year, month, week, is_latest, created_by) VALUES
('rev1', '2023', '10', '1', TRUE, 1);
