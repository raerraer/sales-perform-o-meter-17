
# 파이썬 백엔드 마이그레이션 계획

## 현재 상태

현재 애플리케이션은 클라이언트 측에서 모든 데이터를 메모리에 저장하고 관리합니다. 메인 데이터 구조는 다음과 같습니다:

1. 테이블 데이터: 2차원 배열 형태로 관리
2. 버전 관리: 각 버전별 데이터를 객체에 저장
3. 변경 이력: 객체 배열로 저장
4. 지역-국가 계층 구조: 객체로 관리 (REGION_COUNTRIES)
5. 모델 데이터: 상수 배열로 관리 (MODELS)

## 파이썬 백엔드 마이그레이션 계획

### 1단계: 파이썬 백엔드 환경 설정
- Python 3.9+ 및 필요한 패키지 설치
  - FastAPI: 고성능 백엔드 API 프레임워크
  - SQLAlchemy: ORM 라이브러리
  - Pydantic: 데이터 검증 및 설정 관리
  - Uvicorn: ASGI 서버
  - MySQL Connector: 데이터베이스 연결
- 프로젝트 구조 설정
  - 가상 환경 설정 (venv 또는 conda)
  - 패키지 의존성 관리 (requirements.txt)
  - 폴더 구조 설정 (app/, models/, routes/, services/, etc.)

### 2단계: 데이터베이스 스키마 생성
- SQLAlchemy 모델 정의
  - Version 모델: 영업 실적 버전 관리
  - SalesData 모델: 계층형 영업 데이터 저장
  - ChangeHistory 모델: 데이터 변경 이력 관리
  - Region 모델: 지역 정보
  - Country 모델: 국가 정보
  - Model 모델: 제품 모델 정보
  - User 모델: 사용자 정보
- Alembic을 사용한 마이그레이션 스크립트 생성
- 데이터베이스 관계 설정 및 인덱스 최적화

### 3단계: FastAPI 엔드포인트 구현
다음 API 엔드포인트 구현:
1. `/api/versions` - 버전 관리 API
2. `/api/sales-data` - 영업 데이터 CRUD API
3. `/api/change-history` - 변경 이력 API
4. `/api/regions` - 지역 데이터 API
5. `/api/countries` - 국가 데이터 API
6. `/api/models` - 모델 데이터 API
7. `/api/users` - 사용자 관리 API
8. `/api/auth` - 인증 API

### 4단계: 데이터 마이그레이션
- 기존 메모리 기반 데이터를 Python 스크립트를 사용하여 데이터베이스로 마이그레이션
- 데이터 변환 및 정합성 검증
- 계층 구조 데이터의 올바른 변환 확인

### 5단계: 비즈니스 로직 구현
- 서비스 계층 구현
  - 계층형 데이터 관리 로직
  - 데이터 집계 및 계산 로직
  - 버전 관리 및 비교 로직
- 보안 및 인증 구현
  - JWT 기반 인증
  - 사용자 권한 관리
- 데이터 유효성 검증 및 비즈니스 규칙 적용

### 6단계: 성능 최적화
- 쿼리 최적화
  - 인덱스 설정
  - 복잡한 쿼리 최적화
- 캐싱 전략 구현
  - Redis 또는 메모리 캐싱
  - 자주 사용되는 데이터 캐싱
- 비동기 처리
  - 대용량 데이터 처리를 위한 백그라운드 작업
  - 이벤트 기반 아키텍처 고려

### 7단계: 프론트엔드 통합
- 기존 React 프론트엔드와 새로운 Python 백엔드 연결
- API 호출 로직 업데이트
- 에러 처리 및 사용자 피드백 개선

### 8단계: 테스트 및 배포
- 단위 테스트 구현
  - pytest를 사용한 API 엔드포인트 테스트
  - 데이터 처리 로직 테스트
- 통합 테스트
  - 엔드투엔드 테스트
  - 부하 테스트
- 배포 준비
  - Docker 컨테이너화
  - CI/CD 파이프라인 설정
  - 모니터링 및 로깅 구현

## 파이썬 코드 예시

### FastAPI 라우터 예시 (버전 관리)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.version import Version
from ..schemas.version import VersionCreate, VersionResponse

router = APIRouter(prefix="/api/versions", tags=["versions"])

@router.get("/", response_model=List[VersionResponse])
def get_all_versions(db: Session = Depends(get_db)):
    """모든 버전 목록 조회"""
    versions = db.query(Version).order_by(Version.created_at.desc()).all()
    return versions

@router.get("/{version_id}", response_model=VersionResponse)
def get_version(version_id: int, db: Session = Depends(get_db)):
    """특정 버전 조회"""
    version = db.query(Version).filter(Version.id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="버전을 찾을 수 없습니다")
    return version

@router.post("/", response_model=VersionResponse, status_code=201)
def create_version(version: VersionCreate, db: Session = Depends(get_db)):
    """새 버전 생성"""
    new_version = Version(**version.dict())
    db.add(new_version)
    db.commit()
    db.refresh(new_version)
    return new_version
```

### SQLAlchemy 모델 예시 (영업 데이터)
```python
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base

class SalesData(Base):
    __tablename__ = "sales_data"

    id = Column(Integer, primary_key=True, index=True)
    version_id = Column(Integer, ForeignKey("versions.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)
    row_type = Column(String(20), nullable=False)  # 'total', 'region', 'country', 'model'
    parent_id = Column(Integer, ForeignKey("sales_data.id"), nullable=True)
    display_order = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    category = Column(String(20), nullable=False)  # '전년', '당년', '달성률', etc.
    qty = Column(Float, nullable=True)
    amt = Column(Float, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # 관계 설정
    version = relationship("Version", back_populates="sales_data")
    country = relationship("Country", back_populates="sales_data")
    model = relationship("Model", back_populates="sales_data")
    parent = relationship("SalesData", remote_side=[id], backref="children")
```

### 계층 구조 쿼리 예시 (CTE 사용)
```python
from sqlalchemy import text
from fastapi import Depends
from sqlalchemy.orm import Session

from ..database import get_db

def get_hierarchical_data(version_id: int, db: Session = Depends(get_db)):
    """계층 구조 데이터 조회 (CTE 사용)"""
    query = text("""
    WITH RECURSIVE data_hierarchy AS (
      -- 최상위 행 선택
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
        1 as level,
        CAST(sd.display_order AS CHAR(200)) as path
      FROM 
        sales_data sd
      LEFT JOIN
        countries c ON sd.country_id = c.id
      LEFT JOIN
        regions r ON c.region_id = r.id
      LEFT JOIN
        models m ON sd.model_id = m.id
      WHERE 
        sd.version_id = :version_id 
        AND sd.parent_id IS NULL
      
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
        dh.level + 1,
        CONCAT(dh.path, ',', sd.display_order) as path
      FROM 
        sales_data sd
      JOIN 
        data_hierarchy dh ON sd.parent_id = dh.id
      LEFT JOIN
        countries c ON sd.country_id = c.id
      LEFT JOIN
        regions r ON c.region_id = r.id
      LEFT JOIN
        models m ON sd.model_id = m.id
      WHERE 
        sd.version_id = :version_id
    )
    SELECT * FROM data_hierarchy
    ORDER BY path;
    """)
    
    result = db.execute(query, {"version_id": version_id}).fetchall()
    return result
```
