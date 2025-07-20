# PokeRaid - Backend

PokeRaid는 NestJS 기반의 게임 서버 백엔드입니다. 사용자 인증, Redis 기반 세션, 게임방 구조 등을 포함하며 웹소켓 기반 실시간 통신을 지원합니다.

---

## ✅ 기술 스택

- **언어/프레임워크**: Node.js, NestJS
- **데이터베이스**: MySQL (TypeORM)
- **세션 저장소**: Redis (ioredis)
- **인증 방식**: Redis 세션 ID 기반 (express-session 제거)
- **웹소켓**: Socket.IO (세션 ID 인증 방식)
- **인프라**: Docker / docker-compose

---

## ✅ 주요 기능

### 1. 사용자 인증

- 회원가입 (`POST /users/register`): username, password
- 로그인 (`POST /users/login`):
  - 비밀번호 비교 (bcrypt)
  - 세션 중복 체크 및 TTL 기반 Redis 세션 저장
  - 클라이언트에 `sessionId` 발급

### 2. Redis 기반 세션 구조

- `session:{sessionId}`: 사용자 정보 (TTL 1시간)
- `user_session:{userId}`: 해당 유저의 sessionId 저장
- 로그인 시 기존 세션 제거 후 새로운 세션 등록

### 3. 웹소켓 인증

- 클라이언트는 `sessionId`를 WebSocket 연결 시 쿼리로 전달
- 서버는 Redis에서 세션 조회 후 인증
- express-session 미사용, 쿠키 비활성화

### 4. 테스트

- 단위 테스트: `UserController` 테스트 (`user.controller.spec.ts`)
- E2E 테스트: 실제 HTTP 테스트 (`user.e2e-spec.ts`)

---

## ✅ 실행 방법

### 1. Docker로 Redis & MySQL 실행

```bash
docker-compose -f ./docker-compose.yml up -d
```

### 2. 프로젝트 실행

```bash
yarn install
yarn start:dev
```

### ✅ 테스트 실행

#### 1. 단위 테스트

```bash
yarn test
```

#### 2. 엔드투엔드 테스트

```bash
yarn test:e2e
```

### ✅ RedisInsight 접속

- 웹 UI: http://localhost:8001
- Redis 주소: redis:6379 (도커 내부 기준)

### ✅ 향후 구현 예정

- 게임방 구조 설계 및 실시간 동기화
- WebSocket 이벤트 인증 처리
- 세션 TTL 갱신 로직
- 유저 상태 관리 (대기/게임중)

### ✅ 폴더 구조 (일부)

```pgsql
src/
  ├── user/
  │   ├── user.controller.ts
  │   ├── user.service.ts
  │   ├── user.dto.ts
  │   └── user.entity.ts
  ├── redis/
  │   ├── redis.module.ts
  │   ├── redis.service.ts
  └── main.ts
```

### ✅ 기타

- Redis TTL을 활용하여 세션 만료 자동 처리
- 중복 로그인 시 기존 세션 제거
- WebSocket 중심 인증 구조로 JWT 없이 상태 유지