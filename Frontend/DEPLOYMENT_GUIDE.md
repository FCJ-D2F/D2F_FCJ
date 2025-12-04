# 🚀 Hướng dẫn Deploy Webapp lên AWS - Tổng hợp

Hướng dẫn tổng hợp để deploy webapp IoT Secure Monitor lên AWS với Amplify và Route53.

## 📚 Tài liệu liên quan

1. **[AMPLIFY_DEPLOYMENT.md](./AMPLIFY_DEPLOYMENT.md)** - Hướng dẫn deploy lên AWS Amplify
2. **[ROUTE53_SETUP.md](./ROUTE53_SETUP.md)** - Hướng dẫn setup Route53 và custom domain
3. **[AWS_SETUP.md](./AWS_SETUP.md)** - Hướng dẫn setup các AWS services (Cognito, S3, SES)

## 🎯 Quick Start - Checklist

### Bước 1: Chuẩn bị (5 phút)
- [ ] Code đã được push lên GitHub
- [ ] File `amplify.yml` đã có trong project (✅ đã tạo)
- [ ] Đã có AWS Account

### Bước 2: Deploy lên Amplify (15-20 phút)
- [ ] Tạo Amplify App trên AWS Console
- [ ] Kết nối GitHub repository
- [ ] Cấu hình Environment Variables
- [ ] Deploy và kiểm tra build thành công
- [ ] Test app qua Amplify URL

👉 **Xem chi tiết**: [AMPLIFY_DEPLOYMENT.md](./AMPLIFY_DEPLOYMENT.md)

### Bước 3: Setup Route53 và Custom Domain (20-30 phút)
- [ ] Có domain name (mua mới hoặc sử dụng domain có sẵn)
- [ ] Tạo Hosted Zone trong Route53
- [ ] Cập nhật Name Servers
- [ ] Kết nối domain với Amplify
- [ ] Verify domain và SSL certificate
- [ ] Test qua custom domain

👉 **Xem chi tiết**: [ROUTE53_SETUP.md](./ROUTE53_SETUP.md)

### Bước 4: Verify và Test (10 phút)
- [ ] Website load được qua custom domain
- [ ] HTTPS hoạt động đúng
- [ ] Authentication (Cognito) hoạt động
- [ ] API calls hoạt động đúng
- [ ] Tất cả pages/routes hoạt động

## 📋 Architecture Flow

Sau khi hoàn thành setup, flow sẽ như sau:

```
User → Route53 (DNS) → Amplify (Hosting) → Webapp
                                    ↓
                              Cognito (Auth)
                                    ↓
                              API Gateway (Backend)
                                    ↓
                    Lambda → DynamoDB/S3/SES
```

## 🔑 Environment Variables cần thiết

Khi setup Amplify, cần cấu hình các biến sau:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# S3
VITE_S3_BUCKET_NAME=iot-reports-bucket

# SES
VITE_SES_FROM_EMAIL=noreply@yourdomain.com

# API Gateway
VITE_API_GATEWAY_URL=https://your-api-gateway.execute-api.us-east-1.amazonaws.com/prod

# Frontend API
VITE_API_BASE_URL=/api

# MQTT (optional)
VITE_MQTT_URL=wss://your-mqtt-endpoint.iot.us-east-1.amazonaws.com/mqtt
VITE_DEFAULT_TOPICS=device/+/telemetry,device/+/alerts
```

**Lưu ý**: Tất cả biến cho frontend phải có prefix `VITE_`

## 📁 File Structure

```
Frontend/
├── amplify.yml              # ✅ Amplify build configuration
├── AMPLIFY_DEPLOYMENT.md    # ✅ Hướng dẫn deploy Amplify
├── ROUTE53_SETUP.md         # ✅ Hướng dẫn setup Route53
├── AWS_SETUP.md             # Hướng dẫn setup AWS services
├── DEPLOYMENT_GUIDE.md      # ✅ File này - tổng hợp
├── package.json
├── vite.config.ts
└── ...
```

## 🐛 Troubleshooting nhanh

### Build fails
- Kiểm tra `amplify.yml` có đúng không
- Kiểm tra environment variables
- Xem build logs trong Amplify Console

### Domain không hoạt động
- Kiểm tra DNS propagation: https://www.whatsmydns.net/
- Kiểm tra name servers đã đúng chưa
- Đợi 10-15 phút để DNS propagate

### SSL Certificate không được issue
- Đảm bảo domain đã verify
- Kiểm tra DNS records trong Route53
- Xóa và thêm lại domain nếu cần

### API calls bị lỗi
- Kiểm tra `VITE_API_GATEWAY_URL` đúng chưa
- Kiểm tra CORS settings trong API Gateway
- Kiểm tra network tab trong browser console

## 💰 Cost Estimation

### Amplify
- **Free tier**: 5GB served/month, 15GB stored/month, 1000 build minutes/month
- **Sau free tier**: ~$0.15/GB served, $0.025/GB stored

### Route53
- **Hosted zone**: $0.50/month
- **Queries**: $0.40 per million queries
- **Tổng**: ~$1-2/month cho small-medium traffic

### Tổng chi phí ước tính
- **Free tier**: $0-1/month (chỉ Route53)
- **Sau free tier**: ~$2-5/month cho small-medium projects

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra các file hướng dẫn chi tiết
2. Xem Troubleshooting section trong mỗi file
3. Kiểm tra AWS Console logs
4. Tham khảo AWS Documentation

## ✅ Final Checklist

Sau khi hoàn thành tất cả các bước:

- [ ] Amplify app đã được deploy thành công
- [ ] Custom domain đã được setup và hoạt động
- [ ] HTTPS/SSL đã được cấu hình
- [ ] Website có thể truy cập qua custom domain
- [ ] Authentication hoạt động đúng
- [ ] API calls hoạt động đúng
- [ ] Tất cả chức năng hoạt động bình thường
- [ ] Auto-deploy từ GitHub đã được cấu hình

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước, webapp của bạn sẽ:
- ✅ Được host trên AWS Amplify với CDN
- ✅ Có custom domain với HTTPS
- ✅ Tự động deploy khi push code lên GitHub
- ✅ Tích hợp với Cognito, S3, SES, API Gateway

Chúc bạn deploy thành công! 🚀

