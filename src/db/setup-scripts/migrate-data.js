
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 샘플 데이터 파일 경로
const dataFile = path.join(__dirname, '..', 'sample-data.json');

async function migrateData() {
  // DB 연결
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'sales_performance_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  
  try {
    // 샘플 데이터 로드
    let sampleData = {};
    
    if (fs.existsSync(dataFile)) {
      sampleData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } else {
      console.log('샘플 데이터 파일이 없습니다. 기본 샘플 데이터를 생성합니다.');
    }
    
    console.log('DB 데이터 마이그레이션을 시작합니다...');
    
    // 트랜잭션 시작
    await connection.beginTransaction();
    
    try {
      // 사용자 확인
      const [userResult] = await connection.query("SELECT id FROM users WHERE username = 'admin'");
      const adminId = userResult.length > 0 ? userResult[0].id : 1;
      
      // 1. 버전 생성
      const [versionResult] = await connection.query(
        `INSERT INTO versions (name, year, month, week, is_latest, is_editable, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['rev1', '2023', '10', '1', true, false, '초기 데이터 마이그레이션', adminId]
      );
      
      const versionId = versionResult.insertId;
      console.log(`버전 생성: rev1, ID: ${versionId}`);
      
      // 2. 지역 데이터 설정
      const regions = ['미주', '구주'];
      const regionIds = {};
      
      for (let i = 0; i < regions.length; i++) {
        const [regionResult] = await connection.query(
          "SELECT id FROM regions WHERE name = ?",
          [regions[i]]
        );
        
        regionIds[regions[i]] = regionResult.length > 0 ? regionResult[0].id : null;
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
        const [countryResult] = await connection.query(
          "SELECT id FROM countries WHERE name = ?",
          [country]
        );
        
        countryIds[country] = countryResult.length > 0 ? countryResult[0].id : null;
        console.log(`${country} 국가 ID: ${countryIds[country]}`);
      }
      
      // 4. 모델 데이터 설정
      const models = ['모델1', '모델2'];
      const modelIds = {};
      
      for (const model of models) {
        const [modelResult] = await connection.query(
          "SELECT id FROM models WHERE name = ?",
          [model]
        );
        
        modelIds[model] = modelResult.length > 0 ? modelResult[0].id : null;
        console.log(`${model} 모델 ID: ${modelIds[model]}`);
      }
      
      // 5. 기본 데이터 구조 생성
      
      // 5.1 최상위 총합계 행 생성
      const [totalRowResult] = await connection.query(
        `INSERT INTO sales_data (version_id, row_type, display_order, created_by)
        VALUES (?, ?, ?, ?)`,
        [versionId, 'total', 1, adminId]
      );
      
      const totalRowId = totalRowResult.insertId;
      console.log(`총합계 행 생성, ID: ${totalRowId}`);
      
      // 5.2 지역 행 생성
      const regionRowIds = {};
      
      for (let i = 0; i < regions.length; i++) {
        const [regionRowResult] = await connection.query(
          `INSERT INTO sales_data (version_id, row_type, parent_id, display_order, created_by)
          VALUES (?, ?, ?, ?, ?)`,
          [versionId, 'region', totalRowId, i + 2, adminId]
        );
        
        regionRowIds[regions[i]] = regionRowResult.insertId;
        console.log(`${regions[i]} 지역 행 생성, ID: ${regionRowIds[regions[i]]}`);
      }
      
      // 5.3 국가 행 생성
      const countryRowIds = {};
      let displayOrder = Object.keys(regions).length + 2;
      
      for (const [country, data] of Object.entries(countries)) {
        const region = Object.entries(regionIds).find(([name, id]) => id === data.regionId)?.[0] || '미주';
        const regionRowId = regionRowIds[region === '미주' ? '미주' : '구주'];
        
        const [countryRowResult] = await connection.query(
          `INSERT INTO sales_data (version_id, country_id, row_type, parent_id, display_order, created_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [versionId, countryIds[country], 'country', regionRowId, displayOrder++, adminId]
        );
        
        countryRowIds[country] = countryRowResult.insertId;
        console.log(`${country} 국가 행 생성, ID: ${countryRowIds[country]}`);
        
        // 5.4 각 국가별 모델 행 생성
        for (const model of models) {
          const [modelRowResult] = await connection.query(
            `INSERT INTO sales_data (version_id, country_id, model_id, row_type, parent_id, display_order, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [versionId, countryIds[country], modelIds[model], 'model', countryRowIds[country], displayOrder++, adminId]
          );
          
          console.log(`${country}의 ${model} 모델 행 생성, ID: ${modelRowResult.insertId}`);
        }
      }
      
      // 5.5 샘플 실적 데이터 생성
      const categories = ['전년', '계획', '실행', '속보', '전망'];
      
      for (let month = 1; month <= 12; month++) {
        for (const category of categories) {
          // 총합계 행 데이터
          await connection.query(
            `UPDATE sales_data
            SET month = ?, category = ?, qty = ?, amt = ?
            WHERE id = ?`,
            [month, category, 100 * month, 10000 * month, totalRowId]
          );
          
          // 지역 행 데이터
          for (const [region, regionRowId] of Object.entries(regionRowIds)) {
            const factor = region === '미주' ? 0.6 : 0.4;
            await connection.query(
              `UPDATE sales_data
              SET month = ?, category = ?, qty = ?, amt = ?
              WHERE id = ?`,
              [month, category, 100 * month * factor, 10000 * month * factor, regionRowId]
            );
          }
          
          // 국가 행 데이터
          for (const [country, countryRowId] of Object.entries(countryRowIds)) {
            const factor = country === '미국' || country === '영국' ? 0.7 : 0.3;
            const regionFactor = country === '미국' || country === '캐나다' ? 0.6 : 0.4;
            
            await connection.query(
              `UPDATE sales_data
              SET month = ?, category = ?, qty = ?, amt = ?
              WHERE id = ?`,
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
      await connection.commit();
      console.log('데이터 마이그레이션이 완료되었습니다.');
    } catch (error) {
      // 오류 발생 시 롤백
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('데이터 마이그레이션 중 오류 발생:', error);
  } finally {
    await connection.end();
  }
}

// 실행
migrateData();
