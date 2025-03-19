
# 데이터베이스 관계 설계

## 테이블 관계 다이어그램

```
User ─┐
      │
      ├─> Version <──┐
      │              │
      ├─> ChangeHistory
      │
Country ┐            ┌─> SalesData
        │            │
Model   ┘────────────┘
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

5. **Country - SalesData**: 1:N 관계
   - 한 국가는 여러 영업 데이터를 가질 수 있음
   - `SalesData` 테이블의 `country_id` 필드가 `Country` 테이블의 `id`를 참조

6. **Model - SalesData**: 1:N 관계
   - 한 모델은 여러 영업 데이터를 가질 수 있음
   - `SalesData` 테이블의 `model_id` 필드가 `Model` 테이블의 `id`를 참조
   - 국가 합계 행인 경우 model_id는 null일 수 있음

## 인덱스 및 제약조건

1. 모든 테이블의 `id` 필드는 Primary Key
2. `Version` 테이블의 `name` 필드에 UNIQUE 제약조건
3. `Country` 테이블의 `code` 필드에 UNIQUE 제약조건
4. `Model` 테이블의 `code` 필드에 UNIQUE 제약조건
5. `User` 테이블의 `email` 필드에 UNIQUE 제약조건
6. `SalesData` 테이블에 (version_id, country_id, model_id, month, category) 조합에 UNIQUE 제약조건
7. `SalesData` 테이블의 version_id, country_id, model_id, month, category에 복합 인덱스 생성

## 데이터 타입 권장사항

1. `id` 필드: UUID 또는 Auto-increment Integer
2. `qty`, `amt` 필드: Integer 또는 Decimal(12,2)
3. Text 필드: 적절한 길이 제한 설정 (VARCHAR)
4. 날짜 필드: TIMESTAMP WITH TIME ZONE
