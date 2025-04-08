
import { query, transaction } from '../client';
import type { VersionSchema } from '../schema';

/**
 * 버전 관련 함수들
 */
export const versionService = {
  // 모든 버전 조회
  async getAllVersions(): Promise<VersionSchema[]> {
    const result = await query('SELECT * FROM versions ORDER BY created_at DESC');
    return result.rows;
  },
  
  // 특정 버전 조회
  async getVersionById(id: string): Promise<VersionSchema | null> {
    const result = await query('SELECT * FROM versions WHERE id = $1', [id]);
    return result.rows.length ? result.rows[0] : null;
  },
  
  // 최신 버전 조회
  async getLatestVersion(): Promise<VersionSchema | null> {
    const result = await query('SELECT * FROM versions WHERE is_latest = true');
    return result.rows.length ? result.rows[0] : null;
  },
  
  // 버전 생성
  async createVersion(version: Omit<VersionSchema, 'id' | 'created_at'>): Promise<VersionSchema> {
    // 최신 버전으로 설정하면 트리거에 의해 다른 버전은 is_latest = false로 변경됨
    const result = await query(
      `INSERT INTO versions 
      (name, year, month, week, is_latest, is_editable, description, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        version.name, 
        version.year, 
        version.month, 
        version.week, 
        version.is_latest, 
        version.is_editable, 
        version.description, 
        version.created_by
      ]
    );
    
    return result.rows[0];
  },
  
  // 버전 복제 (이전 버전 데이터를 새 버전으로 복사)
  async cloneVersion(sourceVersionId: string, newVersion: Omit<VersionSchema, 'id' | 'created_at'>): Promise<VersionSchema | null> {
    return await transaction(async (client) => {
      // 1. 새 버전 생성
      const versionResult = await client.query(
        `INSERT INTO versions 
        (name, year, month, week, is_latest, is_editable, description, created_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [
          newVersion.name, 
          newVersion.year, 
          newVersion.month, 
          newVersion.week, 
          newVersion.is_latest, 
          newVersion.is_editable, 
          newVersion.description, 
          newVersion.created_by
        ]
      );
      
      const newVersionId = versionResult.rows[0].id;
      
      // 2. 소스 버전 데이터 복사
      // 최상위 행부터 복사하고 ID 맵핑을 유지하여 계층 구조 보존
      const idMap = new Map();
      
      // 2.1 총합계 행 복사
      const totalRows = await client.query(
        'SELECT * FROM sales_data WHERE version_id = $1 AND row_type = $2 AND parent_id IS NULL',
        [sourceVersionId, 'total']
      );
      
      for (const row of totalRows.rows) {
        const result = await client.query(
          `INSERT INTO sales_data 
          (version_id, row_type, display_order, created_by) 
          VALUES ($1, $2, $3, $4) 
          RETURNING id`,
          [newVersionId, row.row_type, row.display_order, newVersion.created_by]
        );
        
        // 원본 ID -> 새 ID 맵핑
        idMap.set(row.id, result.rows[0].id);
      }
      
      // 2.2 지역 행 복사
      const regionRows = await client.query(
        'SELECT * FROM sales_data WHERE version_id = $1 AND row_type = $2',
        [sourceVersionId, 'region']
      );
      
      for (const row of regionRows.rows) {
        const newParentId = idMap.get(row.parent_id);
        
        const result = await client.query(
          `INSERT INTO sales_data 
          (version_id, row_type, parent_id, display_order, created_by) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING id`,
          [newVersionId, row.row_type, newParentId, row.display_order, newVersion.created_by]
        );
        
        idMap.set(row.id, result.rows[0].id);
      }
      
      // 2.3 국가 행 복사
      const countryRows = await client.query(
        'SELECT * FROM sales_data WHERE version_id = $1 AND row_type = $2',
        [sourceVersionId, 'country']
      );
      
      for (const row of countryRows.rows) {
        const newParentId = idMap.get(row.parent_id);
        
        const result = await client.query(
          `INSERT INTO sales_data 
          (version_id, country_id, row_type, parent_id, display_order, created_by) 
          VALUES ($1, $2, $3, $4, $5, $6) 
          RETURNING id`,
          [newVersionId, row.country_id, row.row_type, newParentId, row.display_order, newVersion.created_by]
        );
        
        idMap.set(row.id, result.rows[0].id);
      }
      
      // 2.4 모델 행 복사
      const modelRows = await client.query(
        'SELECT * FROM sales_data WHERE version_id = $1 AND row_type = $2',
        [sourceVersionId, 'model']
      );
      
      for (const row of modelRows.rows) {
        const newParentId = idMap.get(row.parent_id);
        
        const result = await client.query(
          `INSERT INTO sales_data 
          (version_id, country_id, model_id, row_type, parent_id, display_order, month, category, qty, amt, remarks, created_by) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
          RETURNING id`,
          [
            newVersionId, row.country_id, row.model_id, row.row_type, newParentId, 
            row.display_order, row.month, row.category, row.qty, row.amt, row.remarks, 
            newVersion.created_by
          ]
        );
        
        idMap.set(row.id, result.rows[0].id);
      }
      
      // 3. 모든 데이터 복사 후 월별/카테고리별 실적 데이터 복사
      // (parent_id 맵핑에 따라 이미 복사된 행에 데이터 업데이트)
      const dataRows = await client.query(
        'SELECT * FROM sales_data WHERE version_id = $1 AND month IS NOT NULL AND category IS NOT NULL',
        [sourceVersionId]
      );
      
      for (const row of dataRows.rows) {
        const newId = idMap.get(row.id);
        if (newId) {
          await client.query(
            `UPDATE sales_data 
            SET month = $1, category = $2, qty = $3, amt = $4, remarks = $5
            WHERE id = $6`,
            [row.month, row.category, row.qty, row.amt, row.remarks, newId]
          );
        }
      }
      
      return versionResult.rows[0];
    });
  }
};
