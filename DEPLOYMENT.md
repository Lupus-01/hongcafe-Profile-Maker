# Profile Builder 배포 가이드

이 문서는 아이윈브 Ubuntu 22.04 LTS + SSH + Nginx + Node.js 환경에서 현재 프로젝트를 실제 서비스로 올리는 순서입니다.

## 1. 배포 방식

이 프로젝트는 다음 구조로 배포하는 것을 권장합니다.

- Nginx: 외부 요청 수신
- Node.js: `server.js` 실행
- 정적 프론트: 같은 Node 서버에서 함께 제공
- AI API 호출: Node 서버에서 Gemini API 호출

즉, 프론트와 API를 따로 나누지 않고 하나의 Node 앱으로 운영합니다.

## 2. 서버 접속

로컬 터미널에서 SSH 접속:

```bash
ssh 사용자명@서버IP
```

예시:

```bash
ssh ubuntu@123.123.123.123
```

## 3. 서버 폴더 생성

기존 서비스 폴더 아래 새 폴더를 만들어도 되고, 아래처럼 앱 전용 폴더를 만들어도 됩니다.

```bash
mkdir -p ~/apps/profile-builder
cd ~/apps/profile-builder
```

## 4. 프로젝트 업로드

방법 1. Git으로 서버에서 직접 가져오기

```bash
git clone <원격저장소주소> .
```

또는 이미 리포지토리가 있으면:

```bash
git pull origin main
```

방법 2. 로컬에서 파일 업로드

- SFTP
- WinSCP
- VS Code Remote SSH
- `scp`

예시:

```bash
scp -r ./profile-builder/* ubuntu@서버IP:~/apps/profile-builder/
```

## 5. Node 버전 확인

```bash
node -v
npm -v
```

Node가 없으면 설치합니다.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 6. 의존성 설치

프로젝트 폴더에서 실행:

```bash
cd ~/apps/profile-builder
npm install
```

## 7. 환경변수 파일 생성

```bash
cp .env.example .env
nano .env
```

기본 예시:

```env
PORT=3100
GEMINI_API_KEY=여기에_실제_API_KEY
TEXT_MODEL=gemini-3.1-flash-lite-preview
IMAGE_MODEL=gemini-2.5-flash-image
DAILY_PROFILE_LIMIT=50
FRONTEND_ORIGIN=
```

설명:

- `PORT`: Node 서버 포트
- `GEMINI_API_KEY`: Gemini API 키
- `TEXT_MODEL`: 텍스트 생성 모델
- `IMAGE_MODEL`: 대표 이미지 생성 모델
- `DAILY_PROFILE_LIMIT`: 하루 생성 제한
- `FRONTEND_ORIGIN`: 필요 시 CORS 허용 도메인

같은 Node 서버에서 프론트와 API를 함께 제공하면 `FRONTEND_ORIGIN`은 비워둬도 됩니다.

## 8. 로컬 서버 실행 테스트

```bash
npm run start
```

정상 실행되면 이런 식으로 나옵니다.

```bash
Profile builder server running on http://localhost:3100
```

다른 SSH 창에서 확인:

```bash
curl http://127.0.0.1:3100/api/health
```

정상 예시:

```json
{"ok":true,"dailyLimit":50,"usedToday":0,"hasApiKey":true}
```

## 9. PM2로 백그라운드 실행

PM2가 없다면 설치:

```bash
sudo npm install -g pm2
```

앱 실행:

```bash
cd ~/apps/profile-builder
pm2 start server.js --name profile-builder
pm2 save
pm2 startup
```

상태 확인:

```bash
pm2 list
pm2 logs profile-builder
```

재시작:

```bash
pm2 restart profile-builder
```

중지:

```bash
pm2 stop profile-builder
```

## 10. Nginx 설정

Nginx 사이트 파일 생성:

```bash
sudo nano /etc/nginx/sites-available/profile-builder
```

예시 설정:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

심볼릭 링크 연결:

```bash
sudo ln -s /etc/nginx/sites-available/profile-builder /etc/nginx/sites-enabled/profile-builder
```

기존 기본 설정이 충돌하면 제거:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

설정 검사:

```bash
sudo nginx -t
```

재시작:

```bash
sudo systemctl reload nginx
```

## 11. HTTPS 설정

도메인이 서버를 향하고 있다면 Certbot으로 HTTPS 적용:

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

적용 후 확인:

```bash
curl https://your-domain.com/api/health
```

## 12. 배포 후 확인 순서

1. 브라우저에서 메인 페이지 접속
2. `AI 프로필 생성` 버튼 클릭
3. `/api/health` 정상 응답 확인
4. PM2 로그 확인
5. Nginx 에러 로그 확인

로그 확인:

```bash
pm2 logs profile-builder
sudo tail -f /var/log/nginx/error.log
```

## 13. 업데이트 배포 방법

코드 수정 후 서버에서:

```bash
cd ~/apps/profile-builder
git pull origin main
npm install
pm2 restart profile-builder
```

Nginx 설정을 바꿨다면:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 14. 자주 발생하는 문제

### 1) API 키 미설정

증상:

- `GEMINI_API_KEY가 설정되지 않았습니다` 오류

확인:

```bash
cat .env
```

### 2) 포트 충돌

증상:

- Node 서버 실행 실패

확인:

```bash
sudo lsof -i :3100
```

### 3) Nginx 502 Bad Gateway

의미:

- Node 앱이 죽었거나 포트가 다름

확인:

```bash
pm2 list
pm2 logs profile-builder
```

### 4) 하루 제한 초과

설정:

- `.env`의 `DAILY_PROFILE_LIMIT=50`

카운트 파일:

- `.profile-usage.json`

테스트 중 초기화가 필요하면:

```bash
rm -f .profile-usage.json
pm2 restart profile-builder
```

운영 중에는 함부로 지우지 않는 것을 권장합니다.
