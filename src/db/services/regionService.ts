
import type { RegionSchema } from '../schema';

/**
 * 지역 관련 함수들
 */
export const regionService = {
  // 모든 지역 조회
  async getAllRegions(): Promise<RegionSchema[]> {
    // DB 구현에 따라 실제 코드 작성 필요
    return [];
  },
  
  // 특정 지역 조회
  async getRegionById(id: string): Promise<RegionSchema | null> {
    // DB 구현에 따라 실제 코드 작성 필요
    return null;
  }
};
