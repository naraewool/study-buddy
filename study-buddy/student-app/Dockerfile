# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx 설정 (SPA를 위한)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]