# Node.js 20 Alpine 이미지 사용
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치 (Expo CLI 및 React Native 개발에 필요)
RUN apk add --no-cache \
    git \
    curl \
    bash \
    python3 \
    make \
    g++

# npm을 최신 버전으로 업데이트 (Node.js 20과 호환)
RUN npm install -g npm@latest

# Expo CLI 전역 설치
RUN npm install -g @expo/cli

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 포트 노출 (Expo 기본 포트)
EXPOSE 8081

# 개발 서버 시작
CMD ["npx", "expo", "start", "--host", "tunnel"]