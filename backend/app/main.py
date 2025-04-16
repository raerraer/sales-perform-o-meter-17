
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import versions, sales_data, change_history, regions, countries, models, users, auth

# 데이터베이스 테이블 생성
# 실제 프로덕션에서는 Alembic 마이그레이션 사용 권장
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sales Performance API", 
              description="Sales Performance Management System API",
              version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(versions.router)
app.include_router(sales_data.router)
app.include_router(change_history.router)
app.include_router(regions.router)
app.include_router(countries.router)
app.include_router(models.router)
app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Sales Performance API"}
