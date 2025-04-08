
import { query } from '../client';
import type { RegionSchema } from '../schema';

/**
 * 지역 관련 함수들
 */
export const regionService = {
  // 모든 지역 조회
  async getAllRegions(): Promise<RegionSchema[]> {
    const result = await query(`
      SELECT * FROM regions
      ORDER BY display_order
    `);
    
    return result.rows;
  },
  
  // 특정 지역 조회
  async getRegionById(id: string): Promise<RegionSchema | null> {
    const result = await query(`
      SELECT * FROM regions WHERE id = $1
    `, [id]);
    
    return result.rows.length ? result.rows[0] : null;
  }
};
