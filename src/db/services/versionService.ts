
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
    const result = await query('SELECT * FROM versions WHERE id = ?', [id]);
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
    
    // MySQL에서는 insertId로 새로 삽입된 ID를 가져옴
    const newVersionId = result.rows.insertId;
    
    // 삽입된 버전 조회
    const newVersion = await this.getVersionById(newVersionId);
    return newVersion!;
  },
  
  // 버전 복제 (이전 버전 데이터를 새 버전으로 복사)
  async cloneVersion(sourceVersionId: string, newVersion: Omit<VersionSchema, 'id' | 'created_at'>): Promise<VersionSchema | null> {
    return await transaction(async (client) => {
      // 1. 새 버전 생성
      const [versionResult] = await client.query(
        `INSERT INTO versions 
        (name, year, month, week, is_latest, is_editable, description, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      
      const newVersionId = versionResult.insertId;
      
      // 2. 소스 버전 데이터 복사
      // 최상위 행부터 복사하고 ID 맵핑을 유지하여 계층 구조 보존
      const idMap = new Map();
      
      // 2.1 총합계 행 복사
      const [totalRows] = await client.query(
        'SELECT * FROM sales_data WHERE version_id = ? AND row_type = ? AND parent_id IS NULL',
        [sourceVersionId, 'total']
      );
      
      for (const row of totalRows) {
        const [result] = await client.query(
          `INSERT INTO sales_data 
          (version_id, row_type, display_order, created_by) 
          VALUES (?, ?, ?, ?) `,
          [newVersionId, row.row_type, row.display_order, newVersion.created_by]
        );
        
        // 원본 ID -> 새 ID 맵핑
        idMap.set(row.id, result.insertId);
      }
      
      // 2.2 지역 행 복사
      const [regionRows] = await client.query(
        'SELECT * FROM sales_data WHERE version_id = ? AND row_type = ?',
        [sourceVersionId, 'region']
      );
      
      for (const row of regionRows) {
        const newParentId = idMap.get(row.parent_id);
        
        const [result] = await client.query(
          `INSERT INTO sales_data 
          (version_id, row_type, parent_id, display_order, created_by) 
          VALUES (?, ?, ?, ?, ?)`,
          [newVersionId, row.row_type, newParentId, row.display_order, newVersion.created_by]
        );
        
        idMap.set(row.id, result.insertId);
      }
      
      // 2.3 국가 행 복사
      const [countryRows] = await client.query(
        'SELECT * FROM sales_data WHERE version_id = ? AND row_type = ?',
        [sourceVersionId, 'country']
      );
      
      for (const row of countryRows) {
        const newParentId = idMap.get(row.parent_id);
        
        const [result] = await client.query(
          `INSERT INTO sales_data 
          (version_id, country_id, row_type, parent_id, display_order, created_by) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [newVersionId, row.country_id, row.row_type, newParentId, row.display_order, newVersion.created_by]
        );
        
        idMap.set(row.id, result.insertId);
      }
      
      // 2.4 모델 행 복사
      const [modelRows] = await client.query(
        'SELECT * FROM sales_data WHERE version_id = ? AND row_type = ?',
        [sourceVersionId, 'model']
      );
      
      for (const row of modelRows) {
        const newParentId = idMap.get(row.parent_id);
        
        const [result] = await client.query(
          `INSERT INTO sales_data 
          (version_id, country_id, model_id, row_type, parent_id, display_order, month, category, qty, amt, remarks, created_by) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newVersionId, row.country_id, row.model_id, row.row_type, newParentId, 
            row.display_order, row.month, row.category, row.qty, row.amt, row.remarks, 
            newVersion.created_by
          ]
        );
        
        idMap.set(row.id, result.insertId);
      }
      
      // 3. 모든 데이터 복사 후 월별/카테고리별 실적 데이터 복사
      const [dataRows] = await client.query(
        'SELECT * FROM sales_data WHERE version_id = ? AND month IS NOT NULL AND category IS NOT NULL',
        [sourceVersionId]
      );
      
      for (const row of dataRows) {
        const newId = idMap.get(row.id);
        if (newId) {
          await client.query(
            `UPDATE sales_data 
            SET month = ?, category = ?, qty = ?, amt = ?, remarks = ?
            WHERE id = ?`,
            [row.month, row.category, row.qty, row.amt, row.remarks, newId]
          );
        }
      }
      
      // 새 버전 정보 반환
      const [newVersionData] = await client.query('SELECT * FROM versions WHERE id = ?', [newVersionId]);
      return newVersionData[0];
    });
  }
};
