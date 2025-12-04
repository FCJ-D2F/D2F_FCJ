# Hướng dẫn Deploy Webapp lên AWS Amplify

Hướng dẫn chi tiết để deploy webapp IoT Secure Monitor lên AWS Amplify và kết nối với Route53.

## 📋 Tổng quan

AWS Amplify sẽ:
- Host static frontend (React/Vite build)
- Tự động deploy từ GitHub repository
- Cung cấp HTTPS và CDN
- Tích hợp với Route53 để sử dụng custom domain

## 🔧 Bước 1: Chuẩn bị Repository

### 1.1. Đảm bảo code đã được push lên GitHub

```bash
# Kiểm tra git status
git status

# Nếu chưa commit, commit code
git add .
git commit -m "Prepare for Amplify deployment"

# Push lên GitHub
git push origin main
```

### 1.2. Kiểm tra file `amplify.yml`

File `amplify.yml` đã được tạo ở root của Frontend folder với cấu hình:
- Sử dụng pnpm để install dependencies
- Build command: `pnpm run build`
- Output directory: `dist`

## 🚀 Bước 2: Tạo Amplify App trên AWS Console

### 2.1. Truy cập AWS Amplify Console

1. Đăng nhập vào [AWS Console](https://console.aws.amazon.com/)
2. Tìm kiếm **"Amplify"** trong search bar
3. Click vào **"AWS Amplify"** service

### 2.2. Tạo Amplify App mới

1. Click **"New app"** → **"Host web app"**
2. Chọn **"GitHub"** (hoặc GitLab, Bitbucket tùy bạn)
3. Click **"Authorize"** để kết nối GitHub account với AWS
4. Chọn repository: `D2F_FCJ` (hoặc tên repo của bạn)
5. Chọn branch: `main` (hoặc branch bạn muốn deploy)
6. Click **"Next"**

### 2.3. Cấu hình Build Settings

Amplify sẽ tự động detect file `amplify.yml`. Kiểm tra:

- **App name**: `iot-secure-monitor` (hoặc tên bạn muốn)
- **Environment name**: `main` (hoặc tên branch)
- **Build settings**: Sẽ tự động detect từ `amplify.yml`

**Lưu ý**: Nếu file `amplify.yml` nằm trong folder `Frontend`, bạn cần:
1. Click **"Edit"** trong Build settings
2. Thay đổi **"Root directory"** thành `Frontend`
3. Hoặc di chuyển `amplify.yml` lên root của repository

### 2.4. Cấu hình Environment Variables

Trong màn hình **"Configure build settings"**, scroll xuống **"Environment variables"** và thêm:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Cognito Configuration
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# S3 Configuration
VITE_S3_BUCKET_NAME=iot-reports-bucket

# SES Configuration
VITE_SES_FROM_EMAIL=noreply@yourdomain.com

# API Gateway
VITE_API_GATEWAY_URL=https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod

# Frontend API Base URL (sẽ được proxy bởi Amplify)
VITE_API_BASE_URL=/api

# MQTT Configuration (nếu cần)
VITE_MQTT_URL=wss://your-mqtt-endpoint.iot.us-east-1.amazonaws.com/mqtt
VITE_DEFAULT_TOPICS=device/+/telemetry,device/+/alerts
```

**⚠️ Lưu ý quan trọng**:
- Tất cả biến môi trường cho frontend phải có prefix `VITE_` để Vite có thể expose chúng
- `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` chỉ cần nếu backend chạy trên Amplify (nếu bạn dùng Lambda/API Gateway thì không cần)

### 2.5. Review và Deploy

1. Review lại tất cả settings
2. Click **"Save and deploy"**
3. Amplify sẽ bắt đầu build và deploy
4. Quá trình này mất khoảng 5-10 phút

## 🔍 Bước 3: Kiểm tra Deployment

### 3.1. Xem Build Logs

1. Trong Amplify Console, click vào app vừa tạo
2. Vào tab **"Deployments"**
3. Click vào deployment đầu tiên để xem logs
4. Kiểm tra xem build có thành công không

### 3.2. Truy cập App

Sau khi deploy thành công, bạn sẽ có URL dạng:
```
https://main.xxxxxxxxxxxx.amplifyapp.com
```

Click vào URL này để test app.

### 3.3. Test các chức năng

1. **Authentication**: Test đăng ký/đăng nhập với Cognito
2. **API Calls**: Test các API calls đến backend
3. **Static Assets**: Kiểm tra images, CSS load đúng chưa

## 🌐 Bước 4: Cấu hình Custom Domain với Route53

Xem file `ROUTE53_SETUP.md` để biết cách setup Route53 và kết nối với Amplify.

## ⚙️ Bước 5: Cấu hình Rewrites và Redirects (Nếu cần)

Nếu app của bạn sử dụng client-side routing (React Router), bạn cần cấu hình redirects:

### 5.1. Tạo file `amplify.yml` với redirects

Cập nhật file `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - corepack enable
        - corepack prepare pnpm@latest --activate
        - pnpm install
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .pnpm-store/**/*
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'X-Content-Type-Options'
          value: 'nosniff'
        - key: 'X-Frame-Options'
          value: 'DENY'
        - key: 'X-XSS-Protection'
          value: '1; mode=block'
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains'
  customRedirects:
    - source: '/api/<*>'
      target: 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod/<*>'
      status: '200'
      condition: null
  rewrites:
    - source: '/<*>'
      target: '/index.html'
      status: '200'
```

**Lưu ý**: 
- `rewrites` giúp React Router hoạt động đúng (tất cả routes đều serve `index.html`)
- `customRedirects` để proxy API calls đến API Gateway (nếu cần)

## 🔄 Bước 6: Cấu hình Auto Deploy

Amplify mặc định sẽ tự động deploy khi có push mới lên branch đã kết nối.

### 6.1. Kiểm tra Auto Deploy

1. Vào Amplify Console → App → **"App settings"** → **"General"**
2. Kiểm tra **"Connected branches"** có branch của bạn chưa
3. **"Auto deploy"** nên là **"Yes"**

### 6.2. Cấu hình Branch-specific Environment Variables

Nếu bạn có nhiều branches (dev, staging, prod):

1. Vào **"App settings"** → **"Environment variables"**
2. Click **"Manage variables"**
3. Có thể set variables khác nhau cho từng branch

## 🐛 Troubleshooting

### Build fails với lỗi "pnpm not found"

**Giải pháp**: File `amplify.yml` đã được cấu hình để enable corepack và pnpm. Nếu vẫn lỗi, thử:

```yaml
preBuild:
  commands:
    - npm install -g pnpm
    - pnpm install
```

### Build fails với lỗi "Cannot find module"

**Giải pháp**: 
- Kiểm tra `package.json` có đầy đủ dependencies
- Đảm bảo `node_modules` không bị gitignore (không cần commit, Amplify sẽ install)

### App không load được sau khi deploy

**Giải pháp**:
- Kiểm tra build logs xem có lỗi gì không
- Kiểm tra `baseDirectory` trong `amplify.yml` có đúng với output của Vite không
- Kiểm tra console trong browser xem có lỗi JavaScript không

### API calls bị CORS error

**Giải pháp**:
- Đảm bảo API Gateway đã cấu hình CORS đúng
- Kiểm tra `VITE_API_BASE_URL` có đúng không
- Nếu dùng custom redirects, đảm bảo target URL đúng

### Environment variables không hoạt động

**Giải pháp**:
- Đảm bảo tất cả biến cho frontend có prefix `VITE_`
- Sau khi thêm/sửa environment variables, cần trigger build mới
- Vào **"App settings"** → **"Environment variables"** → Click **"Redeploy this version"**

## 📝 Checklist

- [ ] Code đã được push lên GitHub
- [ ] File `amplify.yml` đã được tạo và cấu hình đúng
- [ ] Amplify App đã được tạo trên AWS Console
- [ ] Repository đã được kết nối với Amplify
- [ ] Environment variables đã được cấu hình
- [ ] Build thành công
- [ ] App có thể truy cập được qua Amplify URL
- [ ] Authentication hoạt động đúng
- [ ] API calls hoạt động đúng
- [ ] Custom domain đã được setup (xem ROUTE53_SETUP.md)

## 💰 Cost Estimation

AWS Amplify pricing:
- **Hosting**: $0.15/GB served, $0.025/GB stored
- **Build minutes**: $0.01/build minute
- **Free tier**: 5GB served/month, 15GB stored/month, 1000 build minutes/month

Với small-medium projects, thường nằm trong free tier.

## 📚 Tài liệu tham khảo

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Amplify Build Settings](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
- [Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [Amplify Custom Domains](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)

