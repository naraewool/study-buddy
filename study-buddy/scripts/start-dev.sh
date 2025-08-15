#!/bin/bash

# 개발 환경 시작 스크립트

echo "🚀 학습 도우미 개발 환경을 시작합니다..."

# 환경 변수 파일 확인
check_env_file() {
    if [ ! -f "$1" ]; then
        echo "⚠️  $1 파일이 없습니다. $1.example을 복사해서 설정하세요."
        return 1
    fi
    return 0
}

# 백엔드 환경 변수 확인
if ! check_env_file "backend/.env"; then
    echo "백엔드 환경 변수 파일을 생성합니다..."
    cp backend/.env.example backend/.env
fi

# 학생 앱 환경 변수 확인
if ! check_env_file "student-app/.env"; then
    echo "학생 앱 환경 변수 파일을 생성합니다..."
    cp student-app/.env.example student-app/.env
fi

# 부모 앱 환경 변수 확인
if ! check_env_file "parent-app/.env"; then
    echo "부모 앱 환경 변수 파일을 생성합니다..."
    cp parent-app/.env.example parent-app/.env
fi

# MongoDB 시작 (Docker)
echo "🗄️  MongoDB를 시작합니다..."
docker-compose up -d mongodb

# 잠시 대기 (MongoDB 초기화)
echo "⏳ MongoDB 초기화를 기다립니다..."
sleep 10

# 백엔드 시작
echo "🔧 백엔드 서버를 시작합니다..."
cd backend && npm run dev &
BACKEND_PID=$!

# 잠시 대기 (백엔드 시작)
sleep 5

# 학생 앱 시작
echo "👨‍🎓 학생 앱을 시작합니다..."
cd ../student-app && BROWSER=none npm start &
STUDENT_PID=$!

# 부모 앱 시작
echo "👨‍👩‍👧‍👦 부모 앱을 시작합니다..."
cd ../parent-app && BROWSER=none npm start &
PARENT_PID=$!

echo ""
echo "✅ 모든 서비스가 시작되었습니다!"
echo ""
echo "📱 학생 앱: http://localhost:3001"
echo "👨‍👩‍👧‍👦 부모 앱: http://localhost:3002"
echo "🔧 백엔드 API: http://localhost:3000"
echo ""
echo "테스트 계정:"
echo "- 부모: parent@example.com / password123"
echo "- 학생: student@example.com / password123"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

# 시그널 핸들러
cleanup() {
    echo ""
    echo "🛑 서비스를 종료합니다..."
    kill $BACKEND_PID $STUDENT_PID $PARENT_PID 2>/dev/null
    docker-compose stop
    exit 0
}

trap cleanup SIGINT SIGTERM

# 백그라운드 프로세스가 종료될 때까지 대기
wait