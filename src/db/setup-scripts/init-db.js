
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  // DB 연결
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'sales_performance_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // 여러 SQL 문장을 한 번에 실행할 수 있게 함
  });
  
  try {
    console.log('데이터베이스 초기화를 시작합니다...');
    
    // SQL 스크립트 로드
    const sqlPath = path.join(__dirname, '..', 'sql', 'init-schema.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // SQL 실행
    await connection.query(sqlScript);
    
    console.log('데이터베이스 스키마가 성공적으로 초기화되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
  } finally {
    await connection.end();
  }
}

// 실행
initializeDatabase();
