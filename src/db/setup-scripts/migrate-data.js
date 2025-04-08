
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// DB 연결
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sales_performance_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// 샘플 데이터 파일 경로
const dataFile = path.join(__dirname, '..', 'sample-data.json');

async function migrateData() {
  const client = await pool.connect();
  
  try {
    // 샘플 데이터 로드
    let sampleData = {};
    
    if (fs.existsSync(dataFile)) {
      sampleData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } else {
      console.log('샘플 데이터 파일이 없습니다. 기본 샘플 데이터를 생성합니다.');
      // 기본 샘플 데이터 생성 로직...
      // 실제 구현에서는 애플리케이션의 현재 데이터를 사용
    }
    
    console.log('DB 데이터 마이그레이션을 시작합니다...');
    
    // 트랜잭션 시작
    await client.query('BEGIN');
    
    // 사용자 확인
    const userResult = await client.query("SELECT id FROM users WHERE username = 'admin'");
    const adminId = userResult.rows[0]?.id || 1;
    
    // 1. 버전 생성
    const versionResult = await client.query(
      `INSERT INTO versions (name, year, month, week, is_latest, is_editable, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id`,
      ['rev1', '2023', '10', '1', true, false, '초기 데이터 마이그레이션', adminId]
    );
    
    const versionId = versionResult.rows[0].id;
    console.log(`버전 생성: rev1, ID: ${versionId}`);
    
    // 2. 지역 데이터 설정
    const regions = ['미주', '구주'];
    const regionIds = {};
    
    for (let i = 0; i < regions.length; i++) {
      const regionResult = await client.query(
        "SELECT id FROM regions WHERE name = $1",
        [regions[i]]
      );
      
      regionIds[regions[i]] = regionResult.rows[0]?.id;
      console.log(`${regions[i]} 지역 ID: ${regionIds[regions[i]]}`);
    }
    
    // 3. 국가 데이터 설정
    const countries = {
      '미국': { regionId: regionIds['미주'] },
      '캐나다': { regionId: regionIds['미주'] },
      '영국': { regionId: regionIds['구주'] },
      '이태리': { regionId: regionIds['구주'] }
    };
    
    const countryIds = {};
    
    for (const [country, data] of Object.entries(countries)) {
      const countryResult = await client.query(
        "SELECT id FROM countries WHERE name = $1",
        [country]
      );
      
      countryIds[country] = countryResult.rows[0]?.id;
      console.log(`${country} 국가 ID: ${countryIds[country]}`);
    }
    
    // 4. 모델 데이터 설정
    const models = ['모델1', '모델2'];
    const modelIds = {};
    
    for (const model of models) {
      const modelResult = await client.query(
        "SELECT id FROM models WHERE name = $1",
        [model]
      );
      
      modelIds[model] = modelResult.rows[0]?.id;
      console.log(`${model} 모델 ID: ${modelIds[model]}`);
    }
    
    // 5. 기본 데이터 구조 생성
    
    // 5.1 최상위 총합계 행 생성
    const totalRowResult = await client.query(
      `INSERT INTO sales_data (version_id, row_type, display_order, created_by)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [versionId, 'total', 1, adminId]
    );
    
    const totalRowId = totalRowResult.rows[0].id;
    console.log(`총합계 행 생성, ID: ${totalRowId}`);
    
    // 5.2 지역 행 생성
    const regionRowIds = {};
    
    for (let i = 0; i < regions.length; i++) {
      const regionRowResult = await client.query(
        `INSERT INTO sales_data (version_id, row_type, parent_id, display_order, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [versionId, 'region', totalRowId, i + 2, adminId]
      );
      
      regionRowIds[regions[i]] = regionRowResult.rows[0].id;
      console.log(`${regions[i]} 지역 행 생성, ID: ${regionRowIds[regions[i]]}`);
    }
    
    // 5.3 국가 행 생성
    const countryRowIds = {};
    let displayOrder = Object.keys(regions).length + 2;
    
    for (const [country, data] of Object.entries(countries)) {
      const region = Object.entries(regions).find(([, id]) => id === data.regionId)?.[0] || '미주';
      const regionRowId = regionRowIds[region === '미주' ? '미주' : '구주'];
      
      const countryRowResult = await client.query(
        `INSERT INTO sales_data (version_id, country_id, row_type, parent_id, display_order, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [versionId, countryIds[country], 'country', regionRowId, displayOrder++, adminId]
      );
      
      countryRowIds[country] = countryRowResult.rows[0].id;
      console.log(`${country} 국가 행 생성, ID: ${countryRowIds[country]}`);
      
      // 5.4 각 국가별 모델 행 생성
      for (const model of models) {
        const modelRowResult = await client.query(
          `INSERT INTO sales_data (version_id, country_id, model_id, row_type, parent_id, display_order, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [versionId, countryIds[country], modelIds[model], 'model', countryRowIds[country], displayOrder++, adminId]
        );
        
        console.log(`${country}의 ${model} 모델 행 생성, ID: ${modelRowResult.rows[0].id}`);
      }
    }
    
    // 5.5 샘플 실적 데이터 생성 (실제 구현에서는 클라이언트 데이터 사용)
    const categories = ['전년', '계획', '실행', '속보', '전망'];
    
    for (let month = 1; month <= 12; month++) {
      for (const category of categories) {
        // 총합계 행 데이터
        await client.query(
          `UPDATE sales_data
           SET month = $1, category = $2, qty = $3, amt = $4
           WHERE id = $5`,
          [month, category, 100 * month, 10000 * month, totalRowId]
        );
        
        // 지역 행 데이터
        for (const [region, regionRowId] of Object.entries(regionRowIds)) {
          const factor = region === '미주' ? 0.6 : 0.4;
          await client.query(
            `UPDATE sales_data
             SET month = $1, category = $2, qty = $3, amt = $4
             WHERE id = $5`,
            [month, category, 100 * month * factor, 10000 * month * factor, regionRowId]
          );
        }
        
        // 국가 행 데이터
        for (const [country, countryRowId] of Object.entries(countryRowIds)) {
          const factor = country === '미국' || country === '영국' ? 0.7 : 0.3;
          const regionFactor = country === '미국' || country === '캐나다' ? 0.6 : 0.4;
          
          await client.query(
            `UPDATE sales_data
             SET month = $1, category = $2, qty = $3, amt = $4
             WHERE id = $5`,
            [
              month, 
              category, 
              100 * month * regionFactor * factor, 
              10000 * month * regionFactor * factor, 
              countryRowId
            ]
          );
        }
      }
    }
    
    // 트랜잭션 커밋
    await client.query('COMMIT');
    
    console.log('데이터 마이그레이션이 완료되었습니다.');
  } catch (error) {
    // 오류 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('데이터 마이그레이션 중 오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
migrateData();
