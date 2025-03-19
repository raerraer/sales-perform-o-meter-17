
# 데이터베이스 관계 설계

## 테이블 관계 다이어그램

```
User ─┐
      │
      ├─> Version <──┐
      │              │
      ├─> ChangeHistory
      │
Region ┐             ┌─> SalesData
       │             │
Country┼─────────────┤
       │             │
Model  ┘─────────────┘
```

## 관계 설명

1. **User - Version**: 1:N 관계
   - 한 사용자는 여러 버전을 생성할 수 있음
   - `Version` 테이블의 `created_by` 필드가 `User` 테이블의 `id`를 참조

2. **User - ChangeHistory**: 1:N 관계
   - 한 사용자는 여러 변경 이력을 생성할 수 있음
   - `ChangeHistory` 테이블의 `changed_by` 필드가 `User` 테이블의 `id`를 참조

3. **Version - SalesData**: 1:N 관계
   - 한 버전은 여러 영업 데이터를 포함할 수 있음
   - `SalesData` 테이블의 `version_id` 필드가 `Version` 테이블의 `id`를 참조

4. **Version - ChangeHistory**: 1:N 관계
   - 한 버전에는 여러 변경 이력이 있을 수 있음
   - `ChangeHistory` 테이블의 `version_id` 필드가 `Version` 테이블의 `id`를 참조

5. **Region - Country**: 1:N 관계
   - 한 지역은 여러 국가를 포함할 수 있음
   - `Country` 테이블의 `region_id` 필드가 `Region` 테이블의 `id`를 참조

6. **Region - SalesData**: 1:N 관계
   - 한 지역은 여러 영업 데이터를 가질 수 있음 (지역 합계 행)
   - `SalesData` 테이블의 `row_type`이 'region'이고 관련 지역 ID 참조

7. **Country - SalesData**: 1:N 관계
   - 한 국가는 여러 영업 데이터를 가질 수 있음
   - `SalesData` 테이블의 `country_id` 필드가 `Country` 테이블의 `id`를 참조

8. **Model - SalesData**: 1:N 관계
   - 한 모델은 여러 영업 데이터를 가질 수 있음
   - `SalesData` 테이블의 `model_id` 필드가 `Model` 테이블의 `id`를 참조
   - 국가/지역/전체 합계 행인 경우 model_id는 null일 수 있음

9. **SalesData - SalesData (계층구조)**: 1:N 관계
   - 한 합계 행(국가, 지역, 전체)은 여러 하위 행을 가질 수 있음
   - `SalesData` 테이블의 `parent_id` 필드가 상위 행의 `id`를 참조

## 인덱스 및 제약조건

1. 모든 테이블의 `id` 필드는 Primary Key
2. `Version` 테이블의 `name` 필드에 UNIQUE 제약조건
3. `Region` 테이블의 `code` 필드에 UNIQUE 제약조건
4. `Country` 테이블의 `code` 필드에 UNIQUE 제약조건
5. `Model` 테이블의 `code` 필드에 UNIQUE 제약조건
6. `User` 테이블의 `email` 필드에 UNIQUE 제약조건
7. `SalesData` 테이블에 (version_id, row_type, country_id, model_id, month, category) 조합에 UNIQUE 제약조건
8. `SalesData` 테이블의 version_id, row_type, country_id, model_id, month, category에 복합 인덱스 생성
9. `SalesData` 테이블의 parent_id에 인덱스 생성 (계층구조 쿼리 성능 향상)
10. `SalesData` 테이블의 display_order에 인덱스 생성 (정렬 성능 향상)

## 데이터 타입 권장사항

1. `id` 필드: UUID 또는 Auto-increment Integer
2. `qty`, `amt` 필드: Integer 또는 Decimal(12,2)
3. Text 필드: 적절한 길이 제한 설정 (VARCHAR)
4. 날짜 필드: TIMESTAMP WITH TIME ZONE

## 데이터 무결성

1. `SalesData` 테이블에서 부모-자식 관계의 일관성 유지를 위한 트리거 또는 비즈니스 로직 구현
   - 부모 행이 삭제될 때 자식 행도 삭제 또는 업데이트
   - 부모 행의 버전과 자식 행의 버전이 동일해야 함

2. `Version` 테이블에서 최신 버전 플래그(is_latest)의 일관성 유지
   - 한 번에 하나의 버전만 is_latest=true 가능
   - 새 버전 생성 시 이전 최신 버전의 플래그를 false로 변경하는 트리거 구현

3. 계산된 합계의 일관성 유지
   - 모델 행의 합이 국가 행과 일치해야 함
   - 국가 행의 합이 지역 행과 일치해야 함
   - 지역 행의 합이 총 합계 행과 일치해야 함
   - 데이터 저장/수정 시 자동 계산 로직 또는 트리거 구현
