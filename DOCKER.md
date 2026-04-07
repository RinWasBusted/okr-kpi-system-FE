# Docker Deployment Guide - OKR KPI System Frontend

## 📋 Yêu cầu

**Local machine (build & push):**
- Docker cài đặt
- `.env` file với `VITE_SERVER_BASE_URL` được config
- Quyền access Docker Hub

**VPS (production):**
- Docker cài đặt
- Docker Swarm initialized (`docker swarm init`)
- Port 80, 443 khả dụng

---

## 🚀 Quy trình Deployment

### 1️⃣ LOCAL: Chuẩn bị và Build Image

#### 1.1 Setup `.env` file
```bash
# Copy từ template (nếu chưa có)
cp .env.example .env

# Edit config cho dev/staging/production
nano .env
```

**File `.env`:**
```env
VITE_SERVER_BASE_URL=https://api.yourdomain.com
```

#### 1.2 Build image với environment variables từ `.env`
```bash
# Build với build-arg từ .env file
docker build \
  --build-arg "VITE_SERVER_BASE_URL=$(grep VITE_SERVER_BASE_URL .env | cut -d '=' -f2 | tr -d '\r')" \
  -t tylerpham2708/okr-kpi-system-client:latest .

# Hoặc dùng shell script (dễ hơn)
chmod +x ./build.sh
./build.sh
```

**Script: `build.sh`**
```bash
#!/bin/bash

# Load .env
source .env

# Build image với env vars
docker build \
  --build-arg "VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL" \
  -t tylerpham2708/okr-kpi-system-client:latest .

echo "✅ Build completed: tylerpham2708/okr-kpi-system-client:latest"
```

#### 1.3 Verify image
```bash
# Test image locally
docker run -d \
  --name test-client \
  -p 3000:80 \
  tylerpham2708/okr-kpi-system-client:latest

# Test trong browser
curl http://localhost:3000

# Cleanup
docker stop test-client
docker rm test-client
```

### 2️⃣ LOCAL: Push lên Docker Hub

```bash
# Login Docker Hub (nếu chưa login)
docker login

# Push image
docker push tylerpham2708/okr-kpi-system-client:latest

# Verify
docker image ls | grep okr-kpi-system-client
```

**Output expected:**
```
tylerpham2708/okr-kpi-system-client   latest    xxx123   2 hours ago   45MB
```

---

### 3️⃣ VPS: Setup Docker Swarm

#### 3.1 Initialize Docker Swarm (nếu chưa)
```bash
# SSH vào VPS
ssh root@your-vps-ip

# Initialize swarm
docker swarm init

# Output:
# Swarm initialized: current node (xxx) is now a manager.
```

#### 3.2 Create stack file: `docker-stack.yml`

**File: `docker-stack.yml` (trên VPS)**
```yaml
version: '3.8'

services:
  okr-kpi-client:
    image: tylerpham2708/okr-kpi-system-client:latest
    ports:
      - "80:80"
    networks:
      - okr-kpi-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 2
      placement:
        constraints: [node.role == manager]
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      update_config:
        parallelism: 1
        delay: 10s

networks:
  okr-kpi-network:
    driver: overlay
```

### 4️⃣ VPS: Deploy lên Swarm

```bash
# Pull image mới nhất
docker pull tylerpham2708/okr-kpi-system-client:latest

# Deploy stack
docker stack deploy -c docker-stack.yml okr-kpi

# Verify deployment
docker stack ls
docker service ls
docker service ps okr-kpi_okr-kpi-client

# View logs
docker service logs -f okr-kpi_okr-kpi-client
```

**Expected output:**
```
ID             NAME                                  IMAGE                                            NODE      DESIRED STATE  CURRENT STATE
xxx            okr-kpi_okr-kpi-client.1              tylerpham2708/okr-kpi-system-client:latest      manager1  Running        Running 2 hours
yyy            okr-kpi_okr-kpi-client.2              tylerpham2708/okr-kpi-system-client:latest      manager2  Running        Running 1 hour
```

---

## 🔄 Update Deployment

### Khi có thay đổi code:

```bash
# LOCAL: Build & push version mới
./build.sh
docker push tylerpham2708/okr-kpi-system-client:latest

# VPS: Update service
docker service update --image tylerpham2708/okr-kpi-system-client:latest okr-kpi_okr-kpi-client

# Monitor update
docker service ps okr-kpi_okr-kpi-client --no-trunc
```

---

## 📊 Monitoring & Management

### View service status
```bash
# List services
docker service ls

# View service details
docker service inspect okr-kpi_okr-kpi-client

# View service logs
docker service logs okr-kpi_okr-kpi-client -f

# View running tasks
docker service ps okr-kpi_okr-kpi-client
```

### Scale service
```bash
# Increase replicas to 3
docker service scale okr-kpi_okr-kpi-client=3

# Check status
docker service ps okr-kpi_okr-kpi-client
```

### Remove service
```bash
# Remove stack
docker stack rm okr-kpi

# Verify
docker stack ls
```

---

## 🔧 Troubleshooting

### Build fails
```bash
# Check .env file exists và có VITE_SERVER_BASE_URL
cat .env

# Rebuild với verbose output
docker build --progress=plain \
  --build-arg "VITE_SERVER_BASE_URL=$(grep VITE_SERVER_BASE_URL .env | cut -d '=' -f2 | tr -d '\r')" \
  -t tylerpham2708/okr-kpi-system-client:latest .
```

### Service not starting
```bash
# Check service logs
docker service logs okr-kpi_okr-kpi-client

# Inspect service
docker service inspect okr-kpi_okr-kpi-client

# Check image exists
docker images | grep okr-kpi-system-client
```

### Pull fails trên VPS
```bash
# Login Docker Hub trên VPS
docker login

# Pull image manually
docker pull tylerpham2708/okr-kpi-system-client:latest

# Redeploy
docker stack deploy -c docker-stack.yml okr-kpi
```

### Health check fails
```bash
# Check endpoint /health accessible
docker exec <container_id> curl -f http://localhost/health

# Check nginx config
docker exec <container_id> nginx -t
```

---

## 🔐 Security Best Practices

1. **Use Private Registry** (nếu sensitive)
   ```bash
   docker build -t your-registry/okr-kpi-client:latest .
   docker push your-registry/okr-kpi-client:latest
   ```

2. **Rotate secrets** - Không hardcode API keys
   ```bash
   docker secret create api_key api_key.txt
   ```

3. **Use HTTPS** - Setup reverse proxy (Nginx/Traefik)
   ```bash
   # Use docker network overlay
   docker network create -d overlay okr-kpi-network
   ```

4. **Monitor logs** - Centralize logging
   ```bash
   docker service logs okr-kpi_okr-kpi-client
   ```

---

## 📈 Performance Tuning

### VPS Stack Optimization
```yaml
deploy:
  replicas: 3  # Adjust based on traffic
  resources:
    limits:
      cpus: '0.5'
      memory: 256M
    reservations:
      cpus: '0.25'
      memory: 128M
  restart_policy:
    condition: on-failure
    max_attempts: 5
```

### Image Size
- **Current**: ~45MB (Nginx Alpine + built assets)
- **Optimization**: 
  - Use `.dockerignore` to exclude unnecessary files
  - Multi-stage build (enabled)
  - Gzip compression (enabled in nginx.conf)

---

## 📝 Cheatsheet

```bash
# Build & Push
./build.sh
docker push tylerpham2708/okr-kpi-system-client:latest

# Deploy on VPS
docker stack deploy -c docker-stack.yml okr-kpi

# Monitor
docker service ls
docker service ps okr-kpi_okr-kpi-client
docker service logs okr-kpi_okr-kpi-client -f

# Update
docker service update --image tylerpham2708/okr-kpi-system-client:latest okr-kpi_okr-kpi-client

# Rollback
docker service rollback okr-kpi_okr-kpi-client

# Remove
docker stack rm okr-kpi
```

---

## 🚀 CI/CD Integration

### GitHub Actions (optional)
```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push
        run: |
          docker build \
            --build-arg "VITE_SERVER_BASE_URL=${{ secrets.VITE_SERVER_BASE_URL }}" \
            -t tylerpham2708/okr-kpi-system-client:latest .
          docker push tylerpham2708/okr-kpi-system-client:latest
```

---

## 📞 Support

- Check logs: `docker service logs -f okr-kpi_okr-kpi-client`
- Docker docs: https://docs.docker.com/engine/swarm/
- Docker Hub: https://hub.docker.com/r/tylerpham2708/okr-kpi-system-client

## 🚀 Cách chạy

### Cách 1: Dùng docker-compose (khuyến nghị)
```bash
# Build image và chạy container
docker-compose up -d

# View logs
docker-compose logs -f okr-kpi-client

# Stop container
docker-compose down
```

### Cách 2: Build và chạy thủ công
```bash
# Build image
docker build -t okr-kpi-system-client:latest .

# Chạy container
docker run -d \
  --name okr-kpi-client \
  -p 80:80 \
  okr-kpi-system-client:latest

# View logs
docker logs -f okr-kpi-client

# Stop container
docker stop okr-kpi-client
```

### Cách 3: Push lên Docker Hub
```bash
# Build image
docker build -t tylerpham2708/okr-kpi-system-client:latest .

# Push
docker push tylerpham2708/okr-kpi-system-client:latest
```

## 📝 Chi tiết Dockerfile

**Multi-stage build:**
- **Builder stage**: Node 20 Alpine → build app với npm
- **Production stage**: Nginx Alpine → phục vụ static files

**Files cấu hình:**
- `nginx.conf`: Main nginx configuration (gzip, compression, logging)
- `nginx-default.conf`: Server block configuration (routing, headers, caching)

**Tối ưu:**
- ✅ Lightweight: Nginx Alpine (~50MB final image)
- ✅ Fast builds: Layer caching
- ✅ Small size: Multi-stage build
- ✅ Performance: Nginx efficient handling
- ✅ Health check: Tự động restart nếu app chết
- ✅ Security headers: X-Frame-Options, CSP, XSS Protection
- ✅ SPA routing: Tất cả requests đều về index.html cho React Router
- ✅ Gzip compression: Giảm 60-80% kích thước response
- ✅ Cache control: Tối ưu browser caching cho assets

## 🌐 Truy cập

Sau khi chạy, truy cập:
```
http://localhost
```

hoặc nếu sửa port trong docker-compose.yml:
```
http://localhost:3000
```

## 📦 Environment variables

Nếu cần thêm env vars, sửa `docker-compose.yml`:
```yaml
environment:
  - NODE_ENV=production
```

Note: Environment variables của Vite phải được build vào app (không thể inject runtime).

## 🔧 Troubleshooting

### Port 80 đã được sử dụng
```bash
# Option 1: Sửa docker-compose.yml
# "80:80" → "8080:80"

# Option 2: Chạy với sudo (Linux/Mac)
sudo docker-compose up -d
```

### Build fail
```bash
# Xóa cache và rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Container exit ngay
```bash
# Check logs
docker logs okr-kpi-client

# Inspect image
docker inspect okr-kpi-system-client:latest
```

## 📊 Kiểm tra container

```bash
# List containers
docker ps

# Check resource usage
docker stats okr-kpi-client

# Enter container
docker exec -it okr-kpi-client sh

# Check nginx status
docker exec okr-kpi-client nginx -t
```

## 🔍 Nginx Config Details

### SPA Routing
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
Tất cả requests được route về `index.html`, cho phép React Router xử lý.

### Asset Caching
```nginx
location ~* \.(js|css|png|jpg|...) {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```
Static assets được cache 1 năm.

### Security Headers
- `X-Frame-Options`: Chống clickjacking
- `X-Content-Type-Options`: Chống MIME sniffing
- `Content-Security-Policy`: XSS protection

### Gzip Compression
- Giảm kích thước JS/CSS lên đến 80%
- Tự động với tất cả requests

## 📈 Performance

- **Image size**: ~50MB (Nginx Alpine)
- **Startup time**: < 2 seconds
- **Memory usage**: ~10-20MB
- **Request latency**: < 10ms (local)

## 🚀 Deployment

### AWS ECS
```bash
# Tag image
docker build -t 123456789.dkr.ecr.us-east-1.amazonaws.com/okr-kpi-client:latest .

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/okr-kpi-client:latest
```

### Production Tips
1. Sửa `CLIENT_MAX_BODY_SIZE` trong nginx.conf nếu cần upload files lớn
2. Thêm `proxy_pass` cho API nếu frontend & backend khác domain
3. Kích hoạt HTTPS với reverse proxy (Traefik, Nginx, etc)
4. Sử dụng Docker secrets cho sensitive data
