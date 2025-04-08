
const fs = require('fs');
const path = require('path');

// .env 파일 생성
const envContent = `
# PostgreSQL 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sales_performance_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# API 설정
API_PORT=3001
API_SECRET=your_secret_key_here
`;

// 루트 디렉토리에 .env 파일 생성
fs.writeFileSync(path.join(process.cwd(), '.env'), envContent.trim());

console.log('.env 파일이 생성되었습니다.');
console.log('DB_PASSWORD와 API_SECRET 값을 적절히 수정해주세요.');
