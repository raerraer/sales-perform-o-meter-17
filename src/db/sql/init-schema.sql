
-- 테이블이 이미 존재하는 경우 삭제 (개발 환경용)
DROP TABLE IF EXISTS change_history;
DROP TABLE IF EXISTS sales_data;
DROP TABLE IF EXISTS versions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS regions;

-- 지역 테이블
CREATE TABLE regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 국가 테이블
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  region_id INT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 모델 테이블
CREATE TABLE models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 테이블
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 버전 테이블
CREATE TABLE versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  year VARCHAR(10) NOT NULL,
  month VARCHAR(10) NOT NULL,
  week VARCHAR(10) NOT NULL,
  is_latest BOOLEAN NOT NULL DEFAULT FALSE,
  is_editable BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 영업실적 데이터 테이블
CREATE TABLE sales_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version_id INT NOT NULL,
  country_id INT NULL,
  model_id INT NULL,
  row_type ENUM('country', 'model', 'region', 'total') NOT NULL,
  parent_id INT NULL,
  display_order INT NOT NULL DEFAULT 0,
  month INT NULL CHECK (month BETWEEN 1 AND 12),
  category VARCHAR(50) NULL,
  qty INT DEFAULT 0,
  amt DECIMAL(12, 2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (version_id) REFERENCES versions(id),
  FOREIGN KEY (country_id) REFERENCES countries(id),
  FOREIGN KEY (model_id) REFERENCES models(id),
  FOREIGN KEY (parent_id) REFERENCES sales_data(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 변경 이력 테이블
CREATE TABLE change_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version_id INT NOT NULL,
  row INT NOT NULL,
  col INT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  sales_data_id INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by INT,
  FOREIGN KEY (version_id) REFERENCES versions(id),
  FOREIGN KEY (sales_data_id) REFERENCES sales_data(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인덱스 생성
CREATE INDEX idx_sales_data_lookup ON sales_data(version_id, row_type, country_id, model_id, month, category);
CREATE INDEX idx_sales_data_version ON sales_data(version_id);
CREATE INDEX idx_sales_data_parent ON sales_data(parent_id);
CREATE INDEX idx_sales_data_order ON sales_data(display_order);
CREATE INDEX idx_change_history_version ON change_history(version_id);
CREATE INDEX idx_change_history_sales_data ON change_history(sales_data_id);
CREATE INDEX idx_countries_region ON countries(region_id);

-- 최신 버전 관리를 위한 트리거
DELIMITER //
CREATE TRIGGER trg_manage_version_latest_flag
BEFORE INSERT ON versions
FOR EACH ROW
BEGIN
  IF NEW.is_latest = TRUE THEN
    UPDATE versions SET is_latest = FALSE WHERE id != NEW.id;
  END IF;
END //

CREATE TRIGGER trg_manage_version_latest_flag_update
BEFORE UPDATE ON versions
FOR EACH ROW
BEGIN
  IF NEW.is_latest = TRUE AND OLD.is_latest = FALSE THEN
    UPDATE versions SET is_latest = FALSE WHERE id != NEW.id;
  END IF;
END //
DELIMITER ;

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
