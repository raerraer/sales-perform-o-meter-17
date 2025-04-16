
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sales_performance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 연결 풀 생성
const pool = mysql.createPool(dbConfig);

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 테스트 실패:', error);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery: async (sql, params) => {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('쿼리 실행 에러:', error);
      throw error;
    }
  }
};
