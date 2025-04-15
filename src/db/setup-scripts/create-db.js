
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  // 마스터 DB 연결 (기본 정보)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log('MySQL 서버에 연결되었습니다.');
    
    // DB 존재 여부 확인
    const [rows] = await connection.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
      [process.env.DB_NAME || 'sales_performance_db']
    );
    
    if (rows.length === 0) {
      // DB 생성
      await connection.query(`CREATE DATABASE \`${process.env.DB_NAME || 'sales_performance_db'}\``);
      console.log(`${process.env.DB_NAME || 'sales_performance_db'} 데이터베이스가 생성되었습니다.`);
    } else {
      console.log(`${process.env.DB_NAME || 'sales_performance_db'} 데이터베이스가 이미 존재합니다.`);
    }
  } catch (error) {
    console.error('데이터베이스 생성 중 오류 발생:', error);
  } finally {
    await connection.end();
  }
}

// 실행
createDatabase();
