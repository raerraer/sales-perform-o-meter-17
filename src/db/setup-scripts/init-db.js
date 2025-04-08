
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// DB 연결
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sales_performance_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('데이터베이스 초기화를 시작합니다...');
    
    // SQL 스크립트 로드
    const sqlPath = path.join(__dirname, '..', 'sql', 'init-schema.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // 트랜잭션 시작
    await client.query('BEGIN');
    
    // SQL 실행
    await client.query(sqlScript);
    
    // 트랜잭션 커밋
    await client.query('COMMIT');
    
    console.log('데이터베이스 스키마가 성공적으로 초기화되었습니다.');
  } catch (error) {
    // 오류 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('데이터베이스 초기화 중 오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
initializeDatabase();
