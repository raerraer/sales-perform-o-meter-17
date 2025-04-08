
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

// Express 앱 생성
const app = express();
const PORT = process.env.API_PORT || 3001;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());

// 데이터베이스 클라이언트
const { testConnection } = require('../db/client');

// 라우터 가져오기
const versionRoutes = require('./routes/versions');
const salesDataRoutes = require('./routes/salesData');
const changeHistoryRoutes = require('./routes/changeHistory');
const regionRoutes = require('./routes/regions');
const countryRoutes = require('./routes/countries');
const modelRoutes = require('./routes/models');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

// 라우터 등록
app.use('/api/versions', versionRoutes);
app.use('/api/sales-data', salesDataRoutes);
app.use('/api/change-history', changeHistoryRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Sales Performance API' });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  
  // DB 연결 테스트
  try {
    const connected = await testConnection();
    if (connected) {
      console.log('데이터베이스에 성공적으로 연결되었습니다.');
    } else {
      console.error('데이터베이스 연결에 실패했습니다.');
    }
  } catch (error) {
    console.error('데이터베이스 연결 테스트 중 오류 발생:', error);
  }
});
