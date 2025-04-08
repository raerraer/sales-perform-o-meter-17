
import { query } from '../client';
import type { CountrySchema } from '../schema';

/**
 * 국가 관련 함수들
 */
export const countryService = {
  // 모든 국가 조회
  async getAllCountries(): Promise<CountrySchema[]> {
    const result = await query(`
      SELECT c.*, r.name as region_name
      FROM countries c
      JOIN regions r ON c.region_id = r.id
      ORDER BY c.display_order
    `);
    
    return result.rows;
  },
  
  // 특정 국가 조회
  async getCountryById(id: string): Promise<CountrySchema | null> {
    const result = await query(`
      SELECT c.*, r.name as region_name
      FROM countries c
      JOIN regions r ON c.region_id = r.id
      WHERE c.id = $1
    `, [id]);
    
    return result.rows.length ? result.rows[0] : null;
  },
  
  // 특정 지역에 속한 국가 조회
  async getCountriesByRegion(regionId: string): Promise<CountrySchema[]> {
    const result = await query(`
      SELECT c.*, r.name as region_name
      FROM countries c
      JOIN regions r ON c.region_id = r.id
      WHERE c.region_id = $1
      ORDER BY c.display_order
    `, [regionId]);
    
    return result.rows;
  }
};
