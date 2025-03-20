
import type { ChangeHistorySchema } from '../schema';

/**
 * 변경 이력 관련 함수들
 */
export const changeHistoryService = {
  // 특정 버전의 변경 이력 조회
  async getHistoryByVersion(versionId: string): Promise<ChangeHistorySchema[]> {
    // DB 구현에 따라 실제 코드 작성 필요
    return [];
  },
  
  // 변경 이력 생성
  async createHistory(history: Omit<ChangeHistorySchema, 'id' | 'changed_at'>): Promise<ChangeHistorySchema> {
    // DB 구현에 따라 실제 코드 작성 필요
    return {} as ChangeHistorySchema;
  },
  
  // 변경 이력 배치 생성
  async createBatchHistory(historyList: Omit<ChangeHistorySchema, 'id' | 'changed_at'>[]): Promise<ChangeHistorySchema[]> {
    // DB 구현에 따라 실제 코드 작성 필요
    return [];
  }
};
