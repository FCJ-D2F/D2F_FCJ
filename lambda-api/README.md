# Lambda Backend API

Lambda function wrapper cho Express backend để deploy lên AWS Lambda + API Gateway.

## Setup

1. **Deploy lên Lambda:**
   ```bash
   # Install dependencies
   cd lambda-api
   npm install
   
   # Zip the function (bao gồm node_modules)
   zip -r function.zip . -x "*.git*" "*.md"
   ```

2. **Tạo Lambda function trên AWS:**
   - Vào AWS Console → Lambda
   - Create function → "Author from scratch"
   - Runtime: Node.js 20.x
   - Upload `function.zip`
   - Handler: `index.handler`
   - Environment variables: Copy từ `Frontend/.env`:
     - `COGNITO_USER_POOL_ID`
     - `COGNITO_CLIENT_ID`
     - `API_GATEWAY_URL` (cho sensor route)
     - `API_GATEWAY_API_KEY` (nếu cần)
     - `DYNAMODB_TABLE_NAME` (nếu cần)

3. **Tạo API Gateway:**
   - Vào API Gateway → Create API → REST API
   - Create Resource: `/api`
   - Create Resource: `{proxy+}` under `/api`
   - Create Method: `ANY` → Integration type: Lambda Function
   - Select Lambda function vừa tạo
   - Deploy API → Stage: `dev`
   - Copy Invoke URL (ví dụ: `https://abc123.execute-api.ap-southeast-1.amazonaws.com/dev`)

4. **Cập nhật amplify.yml:**
   - Thay `YOUR_API_GATEWAY_URL` bằng Invoke URL từ bước 3
   - Ví dụ: `https://abc123.execute-api.ap-southeast-1.amazonaws.com`

5. **Redeploy Amplify:**
   - Commit và push code
   - Amplify sẽ tự động rebuild và deploy

## Lưu ý

- Lambda có timeout limit (mặc định 3s, có thể tăng lên 30s)
- Lambda có memory limit (mặc định 128MB, có thể tăng)
- Cần cấu hình CORS trên API Gateway nếu cần
- Environment variables cần được set trên Lambda function


