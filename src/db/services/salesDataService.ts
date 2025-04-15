import { query, transaction } from '../client';
import type { 
  SalesDataTableSchema, 
  RegionSchema, 
  CountrySchema, 
  ModelSchema 
} from '../schema';

/**
 * 영업 데이터 관련 함수들
 */
export const salesDataService = {
  // 특정 버전의 모든 데이터 조회
  async getDataByVersion(versionId: string): Promise<SalesDataTableSchema[]> {
    const result = await query(`
      WITH RECURSIVE data_hierarchy AS (
        -- 최상위 행 (총 합계) 선택
        SELECT 
          sd.id, 
          sd.parent_id,
          sd.row_type,
          sd.country_id,
          sd.model_id,
          sd.display_order,
          c.name as country_name,
          r.name as region_name,
          m.name as model_name,
          sd.month,
          sd.category,
          sd.qty,
          sd.amt,
          sd.remarks,
          sd.created_at,
          sd.updated_at,
          sd.created_by,
          1 as level,
          sd.display_order as sort_path
        FROM 
          sales_data sd
        LEFT JOIN
          countries c ON sd.country_id = c.id
        LEFT JOIN
          regions r ON (c.region_id = r.id)
        LEFT JOIN
          models m ON sd.model_id = m.id
        WHERE 
          sd.version_id = ?
          AND sd.row_type = 'total'
        
        UNION ALL
        
        -- 재귀적으로 하위 행 선택
        SELECT 
          sd.id, 
          sd.parent_id,
          sd.row_type,
          sd.country_id,
          sd.model_id,
          sd.display_order,
          c.name as country_name,
          r.name as region_name,
          m.name as model_name,
          sd.month,
          sd.category,
          sd.qty,
          sd.amt,
          sd.remarks,
          sd.created_at,
          sd.updated_at,
          sd.created_by,
          dh.level + 1,
          dh.sort_path * 1000 + sd.display_order
        FROM 
          sales_data sd
        JOIN 
          data_hierarchy dh ON sd.parent_id = dh.id
        LEFT JOIN
          countries c ON sd.country_id = c.id
        LEFT JOIN
          regions r ON (c.region_id = r.id)
        LEFT JOIN
          models m ON sd.model_id = m.id
        WHERE 
          sd.version_id = ?
      )
      SELECT * FROM data_hierarchy
      ORDER BY sort_path
    `, [versionId, versionId]);
    
    return result.rows;
  },
  
  // 데이터 생성
  async createData(data: Omit<SalesDataTableSchema, 'id' | 'created_at' | 'updated_at'>): Promise<SalesDataTableSchema> {
    const result = await query(`
      INSERT INTO sales_data
      (version_id, country_id, model_id, row_type, parent_id, display_order, month, category, qty, amt, remarks, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.version_id,
      data.country_id,
      data.model_id,
      data.row_type,
      data.parent_id,
      data.display_order,
      data.month,
      data.category,
      data.qty,
      data.amt,
      data.remarks,
      data.created_by
    ]);
    
    // 새로 삽입된 ID로 데이터 다시 조회
    const newDataResult = await query(`
      SELECT * FROM sales_data WHERE id = LAST_INSERT_ID()
    `);
    
    return newDataResult.rows[0];
  },
  
  // 데이터 배치 생성
  async createBatchData(dataList: Omit<SalesDataTableSchema, 'id' | 'created_at' | 'updated_at'>[]): Promise<SalesDataTableSchema[]> {
    return await transaction(async (client) => {
      const results = [];
      
      for (const data of dataList) {
        const result = await client.query(`
          INSERT INTO sales_data
          (version_id, country_id, model_id, row_type, parent_id, display_order, month, category, qty, amt, remarks, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          data.version_id,
          data.country_id,
          data.model_id,
          data.row_type,
          data.parent_id,
          data.display_order,
          data.month,
          data.category,
          data.qty,
          data.amt,
          data.remarks,
          data.created_by
        ]);
        
        // 새로 삽입된 ID로 데이터 다시 조회
        const newRow = await client.query(`
          SELECT * FROM sales_data WHERE id = ?
        `, [result[0].insertId]);
        
        results.push(newRow[0]);
      }
      
      return results;
    });
  },
  
  // 데이터 업데이트
  async updateData(id: string, data: Partial<SalesDataTableSchema>): Promise<SalesDataTableSchema | null> {
    // 업데이트할 필드 구성
    const fields = [];
    const values = [];
    
    // 업데이트 가능한 필드 목록
    const updatableFields = [
      'country_id', 'model_id', 'row_type', 'parent_id', 'display_order',
      'month', 'category', 'qty', 'amt', 'remarks'
    ];
    
    // 업데이트할 필드 구성
    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    
    if (fields.length === 0) {
      return null; // 업데이트할 필드가 없음
    }
    
    // id 파라미터 추가
    values.push(id);
    
    const queryText = `
      UPDATE sales_data
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    await query(queryText, values);
    
    // 업데이트된 레코드 조회
    const result = await query('SELECT * FROM sales_data WHERE id = ?', [id]);
    
    return result.rows.length ? result.rows[0] : null;
  },
  
  // 버전 데이터를 다른 버전으로 복사
  async copyVersionData(sourceVersionId: string, targetVersionId: string): Promise<boolean> {
    return await transaction(async (client) => {
      // 소스 버전 데이터 가져오기
      const [sourceDataResult] = await client.query(
        'SELECT * FROM sales_data WHERE version_id = ? ORDER BY id',
        [sourceVersionId]
      );
      
      const sourceData = sourceDataResult;
      
      // ID 매핑 객체 (원본 ID -> 새 ID)
      const idMap = {};
      
      // 첫 번째 패스: 모든 행 복제 (parent_id는 아직 매핑되지 않음)
      for (const row of sourceData) {
        const [result] = await client.query(`
          INSERT INTO sales_data
          (version_id, country_id, model_id, row_type, display_order, month, category, qty, amt, remarks, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          targetVersionId,
          row.country_id,
          row.model_id,
          row.row_type,
          row.display_order,
          row.month,
          row.category,
          row.qty,
          row.amt,
          row.remarks,
          row.created_by
        ]);
        
        // 원본 ID -> 새 ID 매핑 저장
        idMap[row.id] = result.insertId;
      }
      
      // 두 번째 패스: parent_id 업데이트
      for (const row of sourceData) {
        if (row.parent_id) {
          const newParentId = idMap[row.parent_id];
          const newId = idMap[row.id];
          
          if (newParentId && newId) {
            await client.query(
              'UPDATE sales_data SET parent_id = ? WHERE id = ?',
              [newParentId, newId]
            );
          }
        }
      }
      
      return true;
    });
  },
  
  // 2차원 배열로 데이터 변환 (UI 표시용)
  transformToTableFormat(data: SalesDataTableSchema[], regions: RegionSchema[], countries: CountrySchema[], models: ModelSchema[]): any[][] {
    const tableData = [];
    const rowNameMap = new Map();
    
    // 행 이름 맵핑 설정
    for (const region of regions) {
      rowNameMap.set(`region-${region.id}`, region.name);
    }
    
    for (const country of countries) {
      rowNameMap.set(`country-${country.id}`, country.name);
    }
    
    for (const model of models) {
      rowNameMap.set(`model-${model.id}`, model.name);
    }
    
    // 행 정렬
    const sortedData = [...data].sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return 0;
    });
    
    // 계층 구조에 따라 2차원 배열 생성
    for (const row of sortedData) {
      // 월별 데이터가 없는 경우 스킵 (구조 행만 처리)
      if (!row.month || !row.category) continue;
      
      // 새 행이면 초기화
      const rowKey = `${row.row_type}-${row.row_type === 'total' ? 'total' : row.id}`;
      
      if (!tableData[rowKey]) {
        // 행 이름 결정
        let rowName;
        if (row.row_type === 'total') {
          rowName = '총 합계';
        } else if (row.row_type === 'region') {
          rowName = rowNameMap.get(`region-${row.id}`) || '지역';
        } else if (row.row_type === 'country') {
          rowName = rowNameMap.get(`country-${row.country_id}`) || '국가';
        } else if (row.row_type === 'model') {
          rowName = rowNameMap.get(`model-${row.model_id}`) || '모델';
        }
        
        // 새 행 초기화 (12개월 * 5개 카테고리 * 2(qty,amt) + 비고 + 이름)
        tableData[rowKey] = [rowName, ...Array(12 * 11).fill('')];
      }
      
      // 월/카테고리에 따른 데이터 위치 계산
      const categories = ['전년', '계획', '실행', '속보', '전망'];
      const categoryIndex = categories.indexOf(row.category);
      
      if (categoryIndex === -1) continue;
      
      const colIndex = 1 + (row.month - 1) * 11 + categoryIndex * 2;
      
      // 데이터 설정
      tableData[rowKey][colIndex] = row.qty?.toString() || '';
      tableData[rowKey][colIndex + 1] = row.amt?.toString() || '';
    }
    
    // 객체를 배열로 변환
    return Object.values(tableData);
  },
  
  // 2차원 배열에서 DB 형식으로 데이터 변환 (저장용)
  transformFromTableFormat(tableData: any[][], versionId: string, userId: string): Omit<SalesDataTableSchema, 'id' | 'created_at' | 'updated_at'>[] {
    const result = [];
    
    // 카테고리 정의
    const categories = ['전년', '계획', '실행', '속보', '전망'];
    
    // 각 행 처리
    for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
      const row = tableData[rowIndex];
      const rowName = row[0];
      
      // 행 타입 및 관련 ID 결정
      let rowType, countryId, modelId, parentId;
      
      if (rowName === '총 합계') {
        rowType = 'total';
      } else if (rowName === '미주' || rowName === '구주') {
        rowType = 'region';
        parentId = 1; // 총합계 ID
      } else if (['미국', '캐나다', '영국', '이태리'].includes(rowName)) {
        rowType = 'country';
        // 지역 결정
        if (['미국', '캐나다'].includes(rowName)) {
          parentId = 2; // 미주 ID
        } else {
          parentId = 3; // 구주 ID
        }
        // 국가 ID 결정 (실제 구현에서는 DB 조회 필요)
        countryId = ['미국', '캐나다', '영국', '이태리'].indexOf(rowName) + 1;
      } else if (rowName === '모델1' || rowName === '모델2') {
        rowType = 'model';
        modelId = rowName === '모델1' ? 1 : 2;
        
        // 부모 행 찾기 (이전 행이 국가나 지역이면 그것이 부모)
        if (rowIndex > 0) {
          const prevRowName = tableData[rowIndex - 1][0];
          if (['미국', '캐나다', '영국', '이태리'].includes(prevRowName)) {
            // 부모는 국가
            const countryIndex = ['미국', '캐나다', '영국', '이태리'].indexOf(prevRowName);
            parentId = countryIndex + 4; // 국가 ID (가정)
          } else if (prevRowName === '미주' || prevRowName === '구주') {
            // 부모는 지역
            parentId = prevRowName === '미주' ? 2 : 3;
          } else {
            // 부모는 총합계
            parentId = 1;
          }
        }
      }
      
      // 월별/카테고리별 데이터 추출
      for (let month = 1; month <= 12; month++) {
        for (let catIndex = 0; catIndex < categories.length; catIndex++) {
          const category = categories[catIndex];
          
          // 2차원 배열에서 해당 월/카테고리의 열 인덱스 계산
          const colIndex = 1 + (month - 1) * 11 + catIndex * 2;
          
          // qty, amt 값 추출
          const qtyStr = row[colIndex]?.toString() || '';
          const amtStr = row[colIndex + 1]?.toString() || '';
          
          // 숫자로 변환 (콤마 제거)
          const qty = parseInt(qtyStr.replace(/,/g, '')) || 0;
          const amt = parseFloat(amtStr.replace(/,/g, '')) || 0;
          
          // 비고 (마지막 열)
          const remarks = row[(month - 1) * 11 + 11] || '';
          
          // 데이터 객체 생성
          result.push({
            version_id: versionId,
            country_id: countryId,
            model_id: modelId,
            row_type: rowType,
            parent_id: parentId,
            display_order: rowIndex + 1,
            month,
            category,
            qty,
            amt,
            remarks,
            created_by: userId
          });
        }
      }
    }
    
    return result;
  },

  // 회계연도별 합계 계산 (년간 실적 요약용)
  async calculateFiscalYearTotals(data: SalesDataTableSchema[]): Promise<{[key: string]: {qty: number, amt: number}}> {
    // 카테고리별 합계
    const totals = {};
    const categories = ['전년', '계획', '실행', '속보', '전망'];
    
    for (const category of categories) {
      totals[category] = { qty: 0, amt: 0 };
    }
    
    // 모든 월에 대해 총합계 행의 데이터 합산
    for (const row of data) {
      if (row.row_type === 'total' && row.category && categories.includes(row.category)) {
        totals[row.category].qty += row.qty || 0;
        totals[row.category].amt += row.amt || 0;
      }
    }
    
    return totals;
  }
};
