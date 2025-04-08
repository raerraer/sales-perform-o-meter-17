
import { query } from '../client';
import type { ModelSchema } from '../schema';

/**
 * 모델 관련 함수들
 */
export const modelService = {
  // 모든 모델 조회
  async getAllModels(): Promise<ModelSchema[]> {
    const result = await query(`
      SELECT * FROM models
      ORDER BY display_order
    `);
    
    return result.rows;
  },
  
  // 특정 모델 조회
  async getModelById(id: string): Promise<ModelSchema | null> {
    const result = await query(`
      SELECT * FROM models WHERE id = $1
    `, [id]);
    
    return result.rows.length ? result.rows[0] : null;
  }
};
