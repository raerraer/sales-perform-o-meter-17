
import { query } from '../client';
import type { UserSchema } from '../schema';

/**
 * 사용자 관련 함수들
 */
export const userService = {
  // 로그인
  async login(email: string, password: string): Promise<UserSchema | null> {
    // 실제 구현에서는 비밀번호 검증 로직 필요
    const result = await query(`
      SELECT id, username, email, role, created_at, updated_at, last_login
      FROM users
      WHERE email = $1
    `, [email]);
    
    if (result.rows.length) {
      // 로그인 성공 시 마지막 로그인 시간 업데이트
      await query(`
        UPDATE users SET last_login = NOW() WHERE id = $1
      `, [result.rows[0].id]);
      
      return result.rows[0];
    }
    
    return null;
  },
  
  // 사용자 조회
  async getUserById(id: string): Promise<UserSchema | null> {
    const result = await query(`
      SELECT id, username, email, role, created_at, updated_at, last_login
      FROM users
      WHERE id = $1
    `, [id]);
    
    return result.rows.length ? result.rows[0] : null;
  },
  
  // 사용자 생성
  async createUser(user: Omit<UserSchema, 'id' | 'created_at' | 'updated_at' | 'last_login'>): Promise<UserSchema> {
    // 비밀번호 해시 처리는 실제 구현에서 추가 필요
    const result = await query(`
      INSERT INTO users
      (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, created_at, updated_at
    `, [
      user.username,
      user.email,
      user.password_hash,
      user.role
    ]);
    
    return result.rows[0];
  },
  
  // 사용자 업데이트
  async updateUser(id: string, data: Partial<UserSchema>): Promise<UserSchema | null> {
    // 업데이트할 필드 구성
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    // 업데이트 가능한 필드 목록
    const updatableFields = ['username', 'email', 'password_hash', 'role'];
    
    // 업데이트할 필드 구성
    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(data[field]);
        paramIndex++;
      }
    }
    
    // 마지막에 updated_at 추가
    fields.push(`updated_at = NOW()`);
    
    // id 파라미터 추가
    values.push(id);
    
    if (fields.length === 0) {
      return null; // 업데이트할 필드가 없음
    }
    
    const result = await query(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, username, email, role, created_at, updated_at, last_login
    `, values);
    
    return result.rows.length ? result.rows[0] : null;
  }
};
