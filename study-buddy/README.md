# 학습 도우미 애플리케이션 🎓

초등학생의 학습 습관을 도와주는 개인화된 학습 도우미 애플리케이션입니다.

## 📝 프로젝트 개요

이 애플리케이션은 아이가 집에서 혼자 있을 때 학습 계획을 잘 따를 수 있도록 도와주고, 부모님이 자녀의 학습 현황을 모니터링할 수 있는 도구입니다.

### 주요 기능

#### 학생용 앱
- 📚 오늘의 학습 계획 확인
- ▶️ 학습 시작/완료 체크
- 📝 학습 기록 작성 (요약, 사진 업로드)
- 🔔 학습 시간 알림
- 📊 학습 통계 확인

#### 부모용 앱
- 📋 자녀 학습 계획 생성/관리
- 👀 실시간 학습 현황 모니터링
- 📱 학습 완료 알림 수신
- 📈 일일/주간/월간 리포트
- 🖼️ 자녀 학습 기록 및 사진 확인

## 🛠️ 기술 스택

### 백엔드
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Multer
- **Scheduling**: node-cron

### 프론트엔드
- **Framework**: React 18 + TypeScript
- **Styling**: CSS3 + Flexbox/Grid
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📁 프로젝트 구조

```
study-buddy/
├── backend/          # Node.js API 서버
│   ├── models/       # MongoDB 스키마
│   ├── routes/       # API 라우트
│   ├── middleware/   # 인증 미들웨어
│   ├── services/     # 비즈니스 로직
│   ├── uploads/      # 이미지 파일 저장
│   └── server.js     # 서버 진입점
├── student-app/      # 학생용 React 앱
├── parent-app/       # 부모용 React 앱
└── shared/          # 공통 컴포넌트/유틸리티
```

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18+ 
- MongoDB 4.4+
- npm 또는 yarn

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 백엔드 설치
cd backend
npm install

# 학생용 앱 설치
cd ../student-app
npm install

# 부모용 앱 설치
cd ../parent-app
npm install
```

### 2. 환경 변수 설정

각 폴더에서 `.env.example` 파일을 복사하여 `.env` 파일을 만들고 설정을 조정하세요.

#### 백엔드 (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/studybuddy
JWT_SECRET=your-very-secure-jwt-secret-key-here
NODE_ENV=development
```

#### 프론트엔드 (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 3. 서버 실행

#### 백엔드 서버 실행
```bash
cd backend
npm run dev  # 개발 모드
# 또는
npm start   # 프로덕션 모드
```

#### 학생용 앱 실행
```bash
cd student-app
npm start
# http://localhost:3001에서 실행됨
```

#### 부모용 앱 실행
```bash
cd parent-app
npm start
# http://localhost:3002에서 실행됨
```

## 📊 데이터베이스 스키마

### User (사용자)
- 부모 및 학생 계정 정보
- 역할 기반 권한 관리

### StudyPlan (학습 계획)
- 제목, 설명, 과목, 난이도
- 예상 소요시간, 마감일
- 상태 (대기중/진행중/완료)

### StudyRecord (학습 기록)
- 실제 학습 시간
- 학습 내용 요약
- 난이도 평가 및 만족도
- 학습 사진 (선택사항)

### Notification (알림)
- 학습 시간 알림
- 완료 알림 (부모에게)
- 일일 요약 알림

### DailyReport (일일 리포트)
- 완료율 통계
- 과목별 학습 시간
- 전체 만족도

## 🔔 알림 시스템

### 자동 알림
- **학습 시간 알림**: 예정된 학습 30분 전
- **완료 알림**: 학생이 학습 완료 시 부모에게 즉시 전송
- **일일 요약**: 매일 저녁 8시에 부모에게 전송

### 알림 기능
- 읽음/읽지 않음 상태 관리
- 알림 히스토리
- 실시간 푸시 알림 (향후 구현)

## 🎯 사용 시나리오

### 학생 사용 시나리오
1. 앱 로그인
2. 오늘의 학습 계획 확인
3. 학습 시작 버튼 클릭
4. 학습 완료 후 "완료하기" 클릭
5. 학습 기록 작성 (시간, 요약, 사진)
6. 만족도 및 난이도 평가

### 부모 사용 시나리오
1. 앱 로그인
2. 자녀 학습 계획 생성
3. 실시간 학습 현황 모니터링
4. 완료 알림 수신
5. 학습 기록 및 사진 확인
6. 주간/월간 리포트 검토

## 🧪 테스트

### API 테스트
```bash
cd backend
npm test
```

### 프론트엔드 테스트
```bash
cd student-app  # 또는 parent-app
npm test
```

## 🔒 보안

- JWT 기반 인증
- 비밀번호 해시화 (bcrypt)
- 역할 기반 접근 제어
- 파일 업로드 제한 (크기, 확장자)
- CORS 설정

## 📈 향후 개선 사항

- [ ] 웹소켓을 통한 실시간 알림
- [ ] 모바일 푸시 알림 (Firebase FCM)
- [ ] 학습 분석 및 AI 추천
- [ ] 게이미피케이션 요소 추가
- [ ] 다중 자녀 관리 개선
- [ ] 학습 목표 설정 및 달성률
- [ ] 부모-자녀 메시징 기능

## 📞 문의

프로젝트에 대한 문의사항이나 기여하고 싶으시다면 이슈를 생성해 주세요.

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.