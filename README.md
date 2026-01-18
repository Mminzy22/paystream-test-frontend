# PayStream Test Frontend

PayStream Payment Service 테스트를 위한 프론트엔드 프로젝트입니다. 포트원 결제 연동 테스트 및 웹훅 테스트를 지원합니다.

## 기능

- 회원가입 / 로그인 / 로그아웃
- 결제 요청 및 승인
- 결제 목록 조회
- 결제 취소
- API 테스트 페이지

## 빠른 시작

### 0. 백엔드 서버 실행 (필수)

**⚠️ 중요: React 프론트엔드를 실행하기 전에 백엔드 서버를 먼저 실행해야 합니다.**

#### 방법 1: 자동 실행 스크립트 사용 (권장)

백엔드 프로젝트 루트 디렉토리에서:

```bash
# 모든 백엔드 서비스 일괄 실행
./dev-scripts/start.sh
```

이 스크립트는 다음 순서로 서비스를 실행합니다:
1. **Eureka Server** (포트: 8761) - 서비스 디스커버리
2. **API Gateway** (포트: 8000) - 프론트엔드 진입점
3. **User Service** (포트: 8085) - 로그인/회원가입
4. **Payment Service** (포트: 8084) - 결제 기능
5. 기타 서비스들...

**서비스 상태 확인:**
- Eureka Dashboard: http://localhost:8761
- API Gateway: http://localhost:8000
- Swagger UI: http://localhost:8000/swagger-ui.html

#### 방법 2: 수동 실행

각 서비스를 개별적으로 실행:

```bash
# 1. Eureka Server (터미널 1)
./gradlew :services:eureka-server:bootRun

# 2. API Gateway (터미널 2)
./gradlew :services:api-gateway:bootRun

# 3. User Service (터미널 3)
./gradlew :services:user-service:bootRun

# 4. Payment Service (터미널 4)
./gradlew :services:payment-service:bootRun
```

**필수 서비스:**
- ✅ Eureka Server (서비스 디스커버리)
- ✅ API Gateway (프론트엔드 진입점)
- ✅ User Service (로그인/회원가입)
- ✅ Payment Service (결제 기능)

**선택 서비스:**
- Inventory Service (재고 관리)
- Notification Service (알림)
- Order Service (주문)

#### 서비스 종료

```bash
# 모든 서비스 일괄 종료
./dev-scripts/stop.sh
```

### 1. 의존성 설치

```bash
npm install
```

**⚠️ 경고 메시지에 대해:**
- `npm install` 실행 시 많은 `deprecated` 경고가 나타날 수 있습니다
- 이것은 **정상적인 현상**입니다
- `react-scripts` 5.0.1이 오래된 의존성을 사용하기 때문입니다
- 패키지 설치가 완료되었으면 (`added 1308 packages`) 정상적으로 작동합니다
- 개발 환경에서는 문제가 없으며, 프로덕션 빌드에도 영향을 주지 않습니다

**취약점 경고:**
- `9 vulnerabilities` 경고가 나타날 수 있습니다
- 개발 환경에서는 큰 문제가 없습니다
- 프로덕션 배포 전에 `npm audit fix`를 실행하여 수정할 수 있습니다

### 2. 개발 서버 실행

**백엔드 서버가 실행 중인지 확인:**

```bash
# API Gateway가 실행 중인지 확인
curl http://localhost:8000/api/users/ping
```

응답이 정상적으로 오면 백엔드 서버가 실행 중입니다.

**React 개발 서버 실행:**

```bash
npm start
```

브라우저에서 자동으로 `http://localhost:3000`이 열립니다.

## API Gateway 설정

이 프론트엔드는 **API Gateway(`http://localhost:8000`)**를 통해 모든 백엔드 서비스에 접근합니다.

### API 엔드포인트

모든 API 요청은 `http://localhost:8000/api`를 기본 URL로 사용합니다:

- **User Service**: `/api/users/*`
  - `POST /api/users/signup` - 회원가입
  - `POST /api/users/login` - 로그인
  - `POST /api/users/logout` - 로그아웃

- **Payment Service**: `/api/payments/*`
  - `GET /api/payments/config` - 포트원 설정 정보 조회
  - `POST /api/payments/request` - 결제 요청 생성
  - `POST /api/payments/confirm` - 결제 승인
  - `GET /api/payments` - 결제 목록 조회
  - `GET /api/payments/{id}` - 결제 조회
  - `POST /api/payments/cancel/{impUid}` - 결제 취소

### 인증 흐름

1. 사용자가 로그인하면 `accessToken`과 `refreshToken`을 받습니다
2. 모든 API 요청에 `Authorization: Bearer {accessToken}` 헤더가 자동으로 추가됩니다
3. API Gateway가 토큰을 검증하고 사용자 ID를 `X-Auth-User-Id` 헤더로 전달합니다
4. 401 에러 발생 시 자동으로 로그인 페이지로 리다이렉트됩니다

## 환경 변수 설정

### 프론트엔드 환경 변수 (선택사항)

프로젝트 루트에 `.env` 파일을 생성하여 API Gateway URL을 변경할 수 있습니다:

```env
# API Gateway URL (선택사항)
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### 백엔드 환경 변수 (필수)

백엔드 프로젝트 루트의 `.env` 파일에 포트원 설정을 추가하세요:

```env
PORTONE_SECRET_KEY=your_v2_api_secret_here
PORTONE_STORE_ID=store-xxx-xxx-xxx
PORTONE_CHANNEL_KEY=channel-key-xxx-xxx-xxx
PORTONE_WEBHOOK_SECRET=your_webhook_secret_here
```

**주의사항:**
- Channel Key는 백엔드 `.env` 파일에 설정하면 프론트엔드에서 자동으로 로드됩니다
- 사용자가 직접 입력할 필요가 없습니다
- 백엔드 서버 재시작 후 적용됩니다

## ngrok 설정 가이드 (웹훅 테스트)

포트원 웹훅을 로컬에서 테스트하려면 ngrok을 사용하여 터널링이 필요합니다.

### 1. ngrok 설치

#### macOS

```bash
# Homebrew를 사용한 설치
brew install ngrok

# 또는 직접 다운로드
# https://ngrok.com/download
```

#### Windows

```powershell
# Scoop을 사용한 설치
scoop install ngrok

# 또는 직접 다운로드
# https://ngrok.com/download
```

### 2. ngrok 계정 생성 및 인증

1. https://ngrok.com 에서 계정 생성
2. 인증 토큰 확인: https://dashboard.ngrok.com/get-started/your-authtoken
3. 인증 토큰 설정:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 3. ngrok 터널 시작

API Gateway가 실행 중인 상태에서:

```bash
# API Gateway 포트(8000)로 터널 생성
ngrok http 8000
```

터널이 시작되면 다음과 같은 정보가 표시됩니다:

```
Forwarding  https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:8000
```

**중요:**
- `https://xxxx-xxxx-xxxx.ngrok-free.app` URL을 복사하세요
- 이 URL은 ngrok을 재시작할 때마다 변경됩니다

### 4. 포트원 웹훅 URL 설정

1. 포트원 관리자 페이지 접속: https://admin.portone.io
2. **연동 정보** → **웹훅 설정** 메뉴로 이동
3. 웹훅 URL 설정:
   ```
   https://xxxx-xxxx-xxxx.ngrok-free.app/api/payments/webhook
   ```
4. 웹훅 시크릿 설정 (백엔드 `.env`의 `PORTONE_WEBHOOK_SECRET`과 동일하게)
5. 저장

### 5. 웹훅 테스트

1. 프론트엔드에서 결제 요청 및 승인 진행
2. 포트원에서 웹훅이 전송되면 ngrok이 자동으로 로컬 서버로 전달
3. Payment Service 로그에서 웹훅 수신 확인:

```bash
# Payment Service 로그 확인
tail -f dev-scripts/pids/payment-service.log
```

**웹훅 수신 성공 시:**
```
웹훅 수신: paymentId=xxx, status=PAID
```

**웹훅 서명 검증 실패 시:**
```
웹훅 서명 검증 실패: webhookId=xxx
```
- 이는 개발 환경에서 정상적인 현상입니다
- 프로덕션 환경에서는 정상 동작합니다

### 6. ngrok 무료 플랜 제한사항

- ngrok 무료 플랜은 세션당 2시간 제한이 있습니다
- 2시간 후 자동으로 연결이 끊어지므로 재시작이 필요합니다
- URL이 변경되면 포트원 웹훅 URL도 다시 설정해야 합니다

### 7. ngrok 대안

로컬 웹훅 테스트를 위한 다른 옵션:

- **localtunnel**: 무료, 제한 없음
  ```bash
  npm install -g localtunnel
  lt --port 8000
  ```

- **serveo**: SSH 기반, 설치 불필요
  ```bash
  ssh -R 80:localhost:8000 serveo.net
  ```

## 사용 방법

### 1. 회원가입

1. `/signup` 페이지 접속
2. 이메일, 비밀번호, 이름, 전화번호 입력
3. 회원가입 완료 후 로그인 페이지로 이동

### 2. 로그인

1. `/login` 페이지 접속
2. 이메일과 비밀번호 입력
3. 로그인 성공 시 `/payments` 페이지로 이동

### 3. 결제 요청

1. 로그인 후 `/payments/request` 페이지 접속
2. **Channel Key 입력** (포트원 관리자에서 확인)
   - 포트원 관리자 → 연동 정보 → 채널 관리 → Channel Key
   - 또는 백엔드 `.env` 파일에 설정 시 자동 입력됨
3. 상품명, 금액 등 결제 정보 입력
4. "결제 요청" 버튼 클릭
5. 포트원 결제창에서 테스트 카드 정보 입력:
   - 카드번호: `1234-5678-9012-3456` 또는 `4111-1111-1111-1111`
   - 유효기간: `12/34`
   - CVC: `123`
   - 비밀번호: `123456`
6. 결제 완료 후 결제 목록 페이지로 이동

### 4. 결제 목록 조회

1. `/payments` 페이지에서 모든 결제 내역 확인
2. "새로고침" 버튼으로 최신 내역 업데이트
3. "결제 취소" 버튼으로 결제 완료된 건 취소 가능

### 5. API 테스트

1. `/payments/test` 페이지 접속
2. 다양한 Payment Service API를 직접 테스트
3. 요청/응답 확인

## 프로젝트 구조

```
paystream-test-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── Navbar.js
│   │   └── PrivateRoute.js
│   ├── context/          # Context API
│   │   └── AuthContext.js
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── PaymentList.js
│   │   ├── PaymentRequest.js
│   │   └── PaymentTest.js
│   ├── services/         # API 서비스
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 문제 해결

### npm install 경고 메시지

**증상:**
- `npm install` 실행 시 많은 `deprecated` 경고가 나타남
- `9 vulnerabilities` 경고가 나타남

**원인:**
- `react-scripts` 5.0.1이 오래된 의존성을 사용하기 때문
- 정상적인 현상이며, 개발에는 문제 없음

**해결 방법:**
1. **무시하고 사용** (권장)
   - 개발 환경에서는 문제 없음
   - 프로덕션 빌드에도 영향 없음

2. **취약점 수정** (선택사항)
   ```bash
   npm audit fix
   ```
   - 일부 취약점을 자동으로 수정
   - `--force` 옵션은 사용하지 않는 것을 권장 (breaking changes 발생 가능)

3. **최신 버전으로 업데이트** (선택사항)
   ```bash
   npm install react-scripts@latest
   ```
   - 최신 버전으로 업데이트하면 경고가 줄어들 수 있음
   - 하지만 호환성 문제가 발생할 수 있음

### 백엔드 서버가 실행되지 않은 경우

**증상:**
- `Network Error` 또는 `Failed to fetch` 오류
- API 요청이 실패함

**해결 방법:**
1. 백엔드 서버가 실행 중인지 확인:
   ```bash
   curl http://localhost:8000/api/users/ping
   ```
2. 백엔드 서버 실행:
   ```bash
   ./dev-scripts/start.sh
   ```
3. Eureka Dashboard에서 서비스 등록 확인:
   - http://localhost:8761 접속
   - 모든 서비스가 "UP" 상태인지 확인

### CORS 오류

- API Gateway가 실행 중인지 확인
- API Gateway의 CORS 설정이 `http://localhost:3000`을 허용하는지 확인

### 401 Unauthorized 오류

- 로그인 상태 확인
- 토큰이 만료되었는지 확인 (자동으로 로그인 페이지로 이동)

### 결제 실패

- Channel Key가 올바른지 확인
- 포트원 관리자에서 Store ID와 Channel Key 설정 확인
- 환경 변수 `PORTONE_STORE_ID`가 설정되어 있는지 확인

### 웹훅이 수신되지 않는 경우

1. **ngrok이 실행 중인지 확인**
   ```bash
   # ngrok 대시보드 확인
   http://localhost:4040
   ```

2. **포트원 웹훅 URL이 올바른지 확인**
   - 포트원 관리자 → 연동 정보 → 웹훅 설정
   - URL 형식: `https://xxxx-xxxx-xxxx.ngrok-free.app/api/payments/webhook`

3. **API Gateway가 실행 중인지 확인**
   ```bash
   curl http://localhost:8000/api/payments/ping
   ```

4. **웹훅 시크릿이 일치하는지 확인**
   - 포트원 관리자 웹훅 시크릿
   - 백엔드 `.env`의 `PORTONE_WEBHOOK_SECRET`

5. **ngrok 세션이 만료되지 않았는지 확인**
   - ngrok 무료 플랜은 2시간 제한
   - 재시작 후 URL이 변경되면 포트원 웹훅 URL도 업데이트 필요

## 참고 자료

- [포트원 개발자 문서](https://developers.portone.io/opi/ko/readme?v=v2)
- [ngrok 공식 문서](https://ngrok.com/docs)
- [PayStream 백엔드 프로젝트](https://github.com/Mminzy22/PayStream)
