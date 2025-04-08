
import { query, transaction } from './client';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * 데이터베이스 초기화 함수
 * SQL 스크립트를 실행하여 테이블 생성 및 초기 데이터 삽입
 */
export const initializeDatabase = async () => {
  try {
    console.log('데이터베이스 초기화 시작...');
    
    // SQL 파일 읽기
    const sqlFilePath = join(__dirname, 'sql', 'init-schema.sql');
    const sqlScript = readFileSync(sqlFilePath, 'utf8');
    
    // 스크립트를 단일 트랜잭션으로 실행
    await transaction(async (client) => {
      console.log('테이블 및 초기 데이터 생성 중...');
      await client.query(sqlScript);
    });
    
    console.log('데이터베이스 초기화 완료!');
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    return false;
  }
};

/**
 * 기존 클라이언트 데이터를 데이터베이스로 마이그레이션
 * @param versionData 클라이언트 버전 데이터
 * @param userId 사용자 ID
 */
export const migrateClientData = async (versionData: Record<string, any[][]>, userId: string = '1') => {
  try {
    console.log('클라이언트 데이터 마이그레이션 시작...');
    
    await transaction(async (client) => {
      // 1. 첫 버전(rev1) 생성
      const versionResult = await client.query(
        'INSERT INTO versions (name, year, month, week, is_latest, is_editable, description, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        ['rev1', '2023', '10', '1', true, false, '초기 데이터 마이그레이션', userId]
      );
      
      const versionId = versionResult.rows[0].id;
      console.log(`버전 생성 완료: rev1, ID: ${versionId}`);
      
      // 2. 총 합계 행 생성 (최상위 행)
      const totalRowResult = await client.query(
        'INSERT INTO sales_data (version_id, row_type, display_order, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
        [versionId, 'total', 1, userId]
      );
      
      const totalRowId = totalRowResult.rows[0].id;
      console.log(`총 합계 행 생성 완료, ID: ${totalRowId}`);
      
      // 3. 각 지역 행 생성
      const regions = ['미주', '구주'];
      const regionIds = {};
      
      for (let i = 0; i < regions.length; i++) {
        const regionName = regions[i];
        const regionResult = await client.query(
          'INSERT INTO sales_data (version_id, row_type, parent_id, display_order, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [versionId, 'region', totalRowId, i + 2, userId]
        );
        
        regionIds[regionName] = regionResult.rows[0].id;
        console.log(`${regionName} 지역 행 생성 완료, ID: ${regionIds[regionName]}`);
      }
      
      // 4. 각 국가 및 모델 행 생성
      const countryRegionMap = {
        '미국': '미주',
        '캐나다': '미주',
        '영국': '구주',
        '이태리': '구주'
      };
      
      const countryIds = {};
      let displayOrder = regions.length + 2;
      
      for (const [country, region] of Object.entries(countryRegionMap)) {
        // 국가 ID 조회
        const countryResult = await client.query(
          'SELECT id FROM countries WHERE name = $1',
          [country]
        );
        
        let countryId;
        if (countryResult.rows.length > 0) {
          countryId = countryResult.rows[0].id;
        } else {
          // 국가 정보 없으면 생성
          const newCountryResult = await client.query(
            'INSERT INTO countries (name, code, region_id, display_order) VALUES ($1, $2, $3, $4) RETURNING id',
            [country, country.substring(0, 2).toUpperCase(), region === '미주' ? 1 : 2, displayOrder]
          );
          countryId = newCountryResult.rows[0].id;
        }
        
        // 국가 행 생성
        const countryRowResult = await client.query(
          'INSERT INTO sales_data (version_id, country_id, row_type, parent_id, display_order, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [versionId, countryId, 'country', regionIds[region], displayOrder, userId]
        );
        
        countryIds[country] = countryRowResult.rows[0].id;
        console.log(`${country} 국가 행 생성 완료, ID: ${countryIds[country]}`);
        displayOrder++;
        
        // 모델 행 생성
        const models = ['모델1', '모델2'];
        for (let j = 0; j < models.length; j++) {
          const modelResult = await client.query(
            'SELECT id FROM models WHERE name = $1',
            [models[j]]
          );
          
          let modelId;
          if (modelResult.rows.length > 0) {
            modelId = modelResult.rows[0].id;
          } else {
            const newModelResult = await client.query(
              'INSERT INTO models (name, code, display_order) VALUES ($1, $2, $3) RETURNING id',
              [models[j], `M${j+1}`, j+1]
            );
            modelId = newModelResult.rows[0].id;
          }
          
          // 모델 행 생성
          await client.query(
            'INSERT INTO sales_data (version_id, country_id, model_id, row_type, parent_id, display_order, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [versionId, countryId, modelId, 'model', countryIds[country], displayOrder, userId]
          );
          
          console.log(`${country}의 ${models[j]} 모델 행 생성 완료`);
          displayOrder++;
        }
      }
      
      // 5. 월별/카테고리별 데이터 마이그레이션
      if (versionData && versionData.rev1) {
        const data = versionData.rev1;
        const categories = ['전년', '계획', '실행', '속보', '전망'];
        
        // 간단한 2차원 배열 파싱 (실제로는 더 복잡한 파싱 로직 필요)
        for (let row = 0; row < data.length; row++) {
          const rowData = data[row];
          const rowType = rowData[0]; // 첫 번째 열은 행 이름 (총 합계, 지역, 국가, 모델 등)
          
          // 행 타입 식별 및 parent_id 결정
          let parentId = null;
          let currentRowId = null;
          let currentCountryId = null;
          let currentModelId = null;
          
          // 행 타입에 따라 처리
          if (rowType === '총 합계') {
            currentRowId = totalRowId;
          } else if (rowType === '미주' || rowType === '구주') {
            currentRowId = regionIds[rowType];
          } else if (countryIds[rowType]) {
            currentRowId = countryIds[rowType];
            currentCountryId = rowType;
          } else if (rowType === '모델1' || rowType === '모델2') {
            // 모델 행의 부모 식별 (이전 행 기준)
            const modelParent = row > 0 ? data[row-1][0] : null;
            if (countryIds[modelParent]) {
              parentId = countryIds[modelParent];
              currentCountryId = modelParent;
            } else if (regionIds[modelParent]) {
              parentId = regionIds[modelParent];
            } else {
              parentId = totalRowId;
            }
            
            currentModelId = rowType === '모델1' ? 1 : 2;
          }
          
          // 월별/카테고리별 데이터 저장 (12개월 x 5개 카테고리)
          for (let month = 1; month <= 12; month++) {
            for (let c = 0; c < categories.length; c++) {
              const category = categories[c];
              
              // 2차원 배열에서 해당 월/카테고리의 Qty, Amt 인덱스 계산
              const colIndex = 1 + (month - 1) * 11 + c * 2;
              const qty = parseFloat(rowData[colIndex].replace(/,/g, '')) || 0;
              const amt = parseFloat(rowData[colIndex + 1].replace(/,/g, '')) || 0;
              
              // sales_data 테이블에 실적 데이터 삽입
              if (currentRowId) {
                await client.query(
                  `UPDATE sales_data 
                  SET month = $1, category = $2, qty = $3, amt = $4
                  WHERE id = $5 AND version_id = $6`,
                  [month, category, qty, amt, currentRowId, versionId]
                );
              }
            }
          }
        }
      }
      
      console.log('데이터 마이그레이션 완료!');
    });
    
    return true;
  } catch (error) {
    console.error('클라이언트 데이터 마이그레이션 실패:', error);
    return false;
  }
};

// 명령줄에서 직접 실행되었을 때 초기화 실행
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        console.log('데이터베이스가 성공적으로 초기화되었습니다.');
        process.exit(0);
      } else {
        console.error('데이터베이스 초기화에 실패했습니다.');
        process.exit(1);
      }
    });
}
