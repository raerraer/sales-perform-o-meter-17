
const { Client } = require('pg');
require('dotenv').config();

// 마스터 DB 연결
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: 'postgres', // 기본 DB
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('PostgreSQL 서버에 연결되었습니다.');
    
    // DB 존재 여부 확인
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'sales_performance_db']
    );
    
    if (checkResult.rows.length === 0) {
      // DB 생성
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'sales_performance_db'}`);
      console.log(`${process.env.DB_NAME || 'sales_performance_db'} 데이터베이스가 생성되었습니다.`);
    } else {
      console.log(`${process.env.DB_NAME || 'sales_performance_db'} 데이터베이스가 이미 존재합니다.`);
    }
  } catch (error) {
    console.error('데이터베이스 생성 중 오류 발생:', error);
  } finally {
    await client.end();
  }
}

// 실행
createDatabase();
