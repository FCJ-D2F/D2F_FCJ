# Hướng dẫn Deploy Backend lên Lambda + API Gateway

## Bước 1: Build Backend TypeScript

```bash
cd Frontend
pnpm install
# Cần cài thêm TypeScript compiler nếu chưa có
pnpm add -D typescript @types/node
# Build TypeScript sang JavaScript
npx tsc --project tsconfig.json --outDir ../lambda-api/dist
```

## Bước 2: Copy files cần thiết vào lambda-api

```bash
# Copy compiled files
cp -r Frontend/server/* lambda-api/
# Copy node_modules dependencies
cp -r Frontend/node_modules/@aws-sdk lambda-api/node_modules/
cp -r Frontend/node_modules/express lambda-api/node_modules/
cp -r Frontend/node_modules/cors lambda-api/node_modules/
cp -r Frontend/node_modules/dotenv lambda-api/node_modules/
```

## Bước 3: Tạo Lambda Function trên AWS

1. Vào **AWS Console → Lambda**
2. **Create function** → "Author from scratch"
3. Settings:
   - Function name: `iot-backend-api`
   - Runtime: **Node.js 20.x**
   - Architecture: **x86_64**
4. **Upload** code:
   - Zip toàn bộ thư mục `lambda-api` (bao gồm `node_modules`)
   - Upload zip file
5. **Configuration**:
   - Handler: `index.handler`
   - Timeout: **30 seconds** (tăng từ 3s)
   - Memory: **512 MB** (tăng từ 128MB)
6. **Environment variables** (từ `Frontend/.env`):
   ```
   COGNITO_USER_POOL_ID=ap-southeast-1_xxxxx
   COGNITO_CLIENT_ID=xxxxx
   COGNITO_CLIENT_SECRET=xxxxx (nếu có)
   API_GATEWAY_URL=https://xxxxx.execute-api.ap-southeast-1.amazonaws.com/dev
   API_GATEWAY_API_KEY=xxxxx (nếu cần)
   DYNAMODB_TABLE_NAME=ESP32_data
   ```

## Bước 4: Tạo API Gateway

1. Vào **API Gateway → Create API → REST API**
2. **Create Resource**:
   - Resource Path: `/api`
   - Enable **API Gateway CORS**
3. **Create Resource** dưới `/api`:
   - Resource Path: `{proxy+}`
   - Enable **API Gateway CORS**
4. **Create Method** trên `{proxy+}`:
   - Method: **ANY**
   - Integration type: **Lambda Function**
   - Lambda Function: `iot-backend-api`
   - Enable **Lambda Proxy Integration**
5. **Deploy API**:
   - Stage: `dev`
   - Deploy
   - Copy **Invoke URL** (ví dụ: `https://abc123.execute-api.ap-southeast-1.amazonaws.com/dev`)

## Bước 5: Cấu hình CORS trên API Gateway

1. Chọn method **OPTIONS** trên resource `{proxy+}`
2. **Enable CORS**:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,Authorization`
   - Access-Control-Allow-Methods: `GET,POST,PUT,DELETE,OPTIONS`
3. **Deploy** lại API

## Bước 6: Cập nhật amplify.yml

Mở `amplify.yml` và thay `YOUR_API_GATEWAY_URL` bằng Invoke URL từ Bước 4:

```yaml
rewrites:
  - source: '/api/<*>'
    target: 'https://abc123.execute-api.ap-southeast-1.amazonaws.com/dev/api/<*>'
    status: '200'
    type: 'PROXY'
```

## Bước 7: Redeploy Amplify

```bash
git add .
git commit -m "Configure Amplify proxy to Lambda backend"
git push
```

Amplify sẽ tự động rebuild và deploy.

## Kiểm tra

1. Mở Amplify app URL
2. Thử đăng nhập
3. Kiểm tra Network tab trong DevTools:
   - Request tới `/api/auth/login` sẽ được proxy tới API Gateway
   - Response sẽ trả về từ Lambda function

## Troubleshooting

- **403 Forbidden**: Kiểm tra CORS configuration trên API Gateway
- **502 Bad Gateway**: Kiểm tra Lambda function logs trong CloudWatch
- **Timeout**: Tăng Lambda timeout lên 30s
- **Module not found**: Đảm bảo đã copy đủ `node_modules` vào zip


