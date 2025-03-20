
import type { ModelSchema } from '../schema';

/**
 * 모델 관련 함수들
 */
export const modelService = {
  // 모든 모델 조회
  async getAllModels(): Promise<ModelSchema[]> {
    // DB 구현에 따라 실제 코드 작성 필요
    return [];
  },
  
  // 특정 모델 조회
  async getModelById(id: string): Promise<ModelSchema | null> {
    // DB 구현에 따라 실제 코드 작성 필요
    return null;
  }
};
