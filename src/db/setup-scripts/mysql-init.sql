
-- MySQL 초기화 스크립트 (Docker Compose 등에서 사용)
CREATE DATABASE IF NOT EXISTS sales_performance_db;
USE sales_performance_db;

-- Docker Compose에서 설정한 사용자 권한 부여
GRANT ALL PRIVILEGES ON sales_performance_db.* TO 'sales_user'@'%';
FLUSH PRIVILEGES;
