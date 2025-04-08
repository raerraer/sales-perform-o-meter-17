
import { query, transaction } from '../client';
import type { ChangeHistorySchema } from '../schema';

/**
 * 변경 이력 관련 함수들
 */
export const changeHistoryService = {
  // 특정 버전의 변경 이력 조회
  async getHistoryByVersion(versionId: string): Promise<ChangeHistorySchema[]> {
    const result = await query(`
      SELECT ch.*, u.username as changed_by_username
      FROM change_history ch
      LEFT JOIN users u ON ch.changed_by = u.id
      WHERE ch.version_id = $1
      ORDER BY ch.changed_at DESC
    `, [versionId]);
    
    return result.rows;
  },
  
  // 변경 이력 생성
  async createHistory(history: Omit<ChangeHistorySchema, 'id' | 'changed_at'>): Promise<ChangeHistorySchema> {
    const result = await query(`
      INSERT INTO change_history
      (version_id, row, col, old_value, new_value, sales_data_id, changed_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      history.version_id,
      history.row,
      history.col,
      history.old_value,
      history.new_value,
      history.sales_data_id,
      history.changed_by
    ]);
    
    return result.rows[0];
  },
  
  // 변경 이력 배치 생성
  async createBatchHistory(historyList: Omit<ChangeHistorySchema, 'id' | 'changed_at'>[]): Promise<ChangeHistorySchema[]> {
    return await transaction(async (client) => {
      const results = [];
      
      for (const history of historyList) {
        const result = await client.query(`
          INSERT INTO change_history
          (version_id, row, col, old_value, new_value, sales_data_id, changed_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [
          history.version_id,
          history.row,
          history.col,
          history.old_value,
          history.new_value,
          history.sales_data_id,
          history.changed_by
        ]);
        
        results.push(result.rows[0]);
      }
      
      return results;
    });
  }
};
