# Hướng dẫn Setup và Test

## 📋 Yêu cầu

- Node.js 18+ 
- pnpm (hoặc npm)
- AWS Account với các dịch vụ đã được setup:
  - AWS Cognito User Pool
  - AWS S3 Bucket
  - AWS SES (Simple Email Service)
  - AWS Lambda + API Gateway (cho IoT data)

## 🔧 Cài đặt Dependencies

```bash
pnpm install
```

## ⚙️ Environment Variables

Tạo file `.env` ở root project với các biến sau:

### Backend (Server) Environment Variables

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# S3 Configuration
S3_BUCKET_NAME=iot-reports-bucket

# SES Configuration
SES_FROM_EMAIL=noreply@yourdomain.com

# API Gateway (cho IoT data)
VITE_API_GATEWAY_URL=https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod

# MQTT Configuration (optional, cho realtime updates)
VITE_MQTT_URL=ws://localhost:9001
VITE_DEFAULT_TOPICS=device/+/telemetry,device/+/alerts
```

### Frontend Environment Variables

Các biến `VITE_*` sẽ được expose cho frontend. Tạo file `.env` hoặc `.env.local`:

```env
VITE_API_BASE_URL=/api
VITE_API_GATEWAY_URL=https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod
VITE_MQTT_URL=ws://localhost:9001
VITE_DEFAULT_TOPICS=device/+/telemetry,device/+/alerts
```

## 🚀 Chạy Development Server

### Option 1: Chỉ Frontend (nếu backend chạy riêng)

```bash
pnpm dev
```

### Option 2: Frontend + Backend (tích hợp)

Backend server sẽ chạy cùng với Vite dev server. Kiểm tra `vite.config.ts` để đảm bảo server được tích hợp đúng.

## 🧪 Testing

### 1. Test Authentication (Cognito)

#### Test Sign Up
1. Mở browser, điều hướng đến `/register`
2. Nhập email và password (tối thiểu 8 ký tự)
3. Submit form
4. Kiểm tra email để lấy verification code
5. Nhập code để verify account

#### Test Sign In
1. Điều hướng đến `/login`
2. Nhập email và password đã đăng ký
3. Sign in thành công sẽ redirect đến Dashboard

#### Test Forgot Password
1. Điều hướng đến `/forgot-password`
2. Nhập email
3. Kiểm tra email để lấy reset code
4. Nhập code và password mới

### 2. Test API Endpoints

#### Authentication APIs

```bash
# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Register
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"Test1234!"}'

# Get User Info (cần access token)
curl -X GET http://localhost:5173/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Alerts APIs

```bash
# Get Alerts
curl -X GET "http://localhost:5173/api/alerts?deviceId=iot-device-001&severity=HIGH" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get Alert Stats
curl -X GET http://localhost:5173/api/alerts/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Devices APIs

```bash
# Get Devices
curl -X GET http://localhost:5173/api/devices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get Device History
curl -X GET "http://localhost:5173/api/devices/iot-device-001/history?limit=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Send Command
curl -X POST http://localhost:5173/api/devices/iot-device-001/command \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command":"on","value":null}'
```

#### Reports APIs

```bash
# List Reports
curl -X GET http://localhost:5173/api/reports \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Generate Report
curl -X POST http://localhost:5173/api/reports/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "iot-device-001",
    "startTime": "2024-01-01T00:00:00Z",
    "endTime": "2024-01-07T23:59:59Z",
    "type": "summary"
  }'

# Download Report
curl -X GET "http://localhost:5173/api/reports/reports/report-1234567890-iot-device-001.json/download" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Notifications APIs

```bash
# Get Preferences
curl -X GET http://localhost:5173/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Update Preferences
curl -X PUT http://localhost:5173/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alerts":true,"reports":true,"weeklySummary":false}'

# Send Test Notification
curl -X POST http://localhost:5173/api/notifications/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Test Frontend Pages

1. **Dashboard** (`/`)
   - Kiểm tra hiển thị sensor data
   - Kiểm tra charts (Temperature, Gas, Humidity)
   - Kiểm tra realtime updates từ MQTT

2. **Alerts** (`/alerts`)
   - Kiểm tra danh sách alerts
   - Test filter theo severity và device
   - Test search message
   - Test mark as read

3. **Devices** (`/devices`)
   - Kiểm tra danh sách devices
   - Test click vào device để xem detail
   - Kiểm tra status (ONLINE/OFFLINE)

4. **Device Detail** (`/devices/:id`)
   - Kiểm tra charts cho device
   - Test send command
   - Kiểm tra alerts của device

5. **Reports** (`/reports`)
   - Test generate report
   - Test download report
   - Test delete report

6. **Notifications** (`/notifications`)
   - Test update preferences
   - Test send test email

7. **Settings** (`/settings`)
   - Kiểm tra dark mode toggle
   - Kiểm tra environment info

## 🔍 Troubleshooting

### Lỗi Cognito Authentication

- **Error: "User does not exist"**
  - Đảm bảo user đã được tạo trong Cognito User Pool
  - Kiểm tra `COGNITO_USER_POOL_ID` và `COGNITO_CLIENT_ID` trong `.env`

- **Error: "Invalid password"**
  - Kiểm tra password policy trong Cognito
  - Đảm bảo password đáp ứng yêu cầu (tối thiểu 8 ký tự, có chữ hoa, số, ký tự đặc biệt)

### Lỗi S3

- **Error: "Access Denied"**
  - Kiểm tra IAM permissions cho S3 bucket
  - Đảm bảo AWS credentials đúng
  - Kiểm tra bucket name trong `.env`

### Lỗi SES

- **Error: "Email address not verified"**
  - Nếu đang dùng SES sandbox, cần verify email addresses trước
  - Hoặc request production access từ AWS

### Lỗi API Gateway

- **Error: "Failed to fetch"**
  - Kiểm tra `VITE_API_GATEWAY_URL` trong `.env`
  - Đảm bảo API Gateway endpoint đang hoạt động
  - Kiểm tra CORS settings nếu cần

## 📝 Notes

- Backend server chạy trên cùng port với Vite dev server (thường là 5173)
- API routes được prefix với `/api`
- Frontend sử dụng React Query để cache và refetch data
- MQTT connection được tự động thiết lập sau khi login
- Access tokens được tự động refresh khi hết hạn

## 🎯 Next Steps

1. Setup AWS Cognito User Pool và Client
2. Setup S3 bucket với proper IAM permissions
3. Setup SES và verify email addresses
4. Configure API Gateway endpoints
5. Test tất cả các tính năng

