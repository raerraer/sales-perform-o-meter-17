
import mysql from 'mysql2/promise';

// 데이터베이스 연결 풀 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'sales_performance_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

/**
 * 쿼리 실행 헬퍼 함수
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const [rows, fields] = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('쿼리 실행:', { text, duration, rows: Array.isArray(rows) ? rows.length : 1 });
    return { rows };
  } catch (error) {
    console.error('쿼리 실행 에러:', error);
    throw error;
  }
};

/**
 * 트랜잭션 실행 헬퍼 함수
 */
export const transaction = async (callback: (connection: any) => Promise<any>) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('트랜잭션 실행 에러:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * DB 연결 테스트 함수
 */
export const testConnection = async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() as now');
    console.log('DB 연결 성공:', rows);
    return true;
  } catch (error) {
    console.error('DB 연결 실패:', error);
    return false;
  }
};

export default pool;
