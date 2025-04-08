
import { Pool } from 'pg';

// 데이터베이스 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sales_performance_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // 최대 클라이언트 수
  idleTimeoutMillis: 30000, // 연결 유지 시간
  connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 이벤트 리스너
pool.on('error', (err) => {
  console.error('PostgreSQL 클라이언트 에러:', err);
  process.exit(-1);
});

/**
 * 쿼리 실행 헬퍼 함수
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('쿼리 실행:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('쿼리 실행 에러:', error);
    throw error;
  }
};

/**
 * 트랜잭션 실행 헬퍼 함수
 */
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('트랜잭션 실행 에러:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * DB 연결 테스트 함수
 */
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('DB 연결 성공:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('DB 연결 실패:', error);
    return false;
  }
};

export default pool;
