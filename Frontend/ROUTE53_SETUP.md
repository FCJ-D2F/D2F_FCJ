# Hướng dẫn Setup Route53 cho Custom Domain

Hướng dẫn chi tiết để setup Route53 và kết nối custom domain với AWS Amplify.

## 📋 Tổng quan

Route53 là AWS DNS service cho phép:
- Quản lý DNS records cho domain
- Route traffic đến Amplify app
- Tự động cấu hình SSL certificate (qua Amplify)

## 🌐 Bước 1: Có Domain Name

Bạn cần có một domain name trước. Có 2 cách:

### Option 1: Mua Domain mới từ Route53

1. Vào [AWS Console](https://console.aws.amazon.com/)
2. Tìm kiếm **"Route53"**
3. Vào **"Registered domains"** → **"Register domain"**
4. Tìm kiếm domain bạn muốn (ví dụ: `iotmonitor.com`)
5. Chọn domain và click **"Add to cart"**
6. Điền thông tin:
   - **Contact information**: Thông tin của bạn
   - **Privacy protection**: Nên bật để ẩn thông tin cá nhân
7. Review và **"Complete purchase"**
8. Domain sẽ được active trong 5-15 phút

### Option 2: Sử dụng Domain đã có

Nếu bạn đã có domain từ nhà cung cấp khác (GoDaddy, Namecheap, etc.):
- Bạn có thể transfer domain sang Route53, hoặc
- Giữ domain ở nhà cung cấp hiện tại và chỉ cấu hình DNS records

## 🔧 Bước 2: Tạo Hosted Zone trong Route53

### 2.1. Tạo Hosted Zone

1. Vào [Route53 Console](https://console.aws.amazon.com/route53/)
2. Click **"Hosted zones"** ở sidebar bên trái
3. Click **"Create hosted zone"**
4. Điền thông tin:
   - **Domain name**: `yourdomain.com` (domain của bạn)
   - **Type**: **Public hosted zone** (cho production)
   - **Description**: (optional) Mô tả ngắn
5. Click **"Create hosted zone"**

### 2.2. Lưu Name Servers

Sau khi tạo hosted zone, Route53 sẽ tạo 4 name servers cho bạn:

```
ns-123.awsdns-12.com
ns-456.awsdns-45.net
ns-789.awsdns-78.org
ns-012.awsdns-01.co.uk
```

**QUAN TRỌNG**: Copy 4 name servers này lại, bạn sẽ cần chúng ở bước tiếp theo.

### 2.3. Cập nhật Name Servers ở Domain Registrar

#### Nếu domain được mua từ Route53:
- Name servers đã được tự động cấu hình, không cần làm gì thêm.

#### Nếu domain ở nhà cung cấp khác:

1. Đăng nhập vào account của nhà cung cấp domain (GoDaddy, Namecheap, etc.)
2. Vào phần quản lý DNS/Domain settings
3. Tìm **"Name Servers"** hoặc **"DNS Settings"**
4. Thay đổi name servers thành 4 name servers từ Route53 (bước 2.2)
5. Lưu thay đổi

**Lưu ý**: 
- Quá trình propagate DNS có thể mất 24-48 giờ, nhưng thường chỉ mất vài phút đến vài giờ
- Bạn có thể kiểm tra propagation tại: https://www.whatsmydns.net/

## 🚀 Bước 3: Kết nối Domain với Amplify

### 3.1. Vào Amplify Console

1. Vào [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Chọn app của bạn (đã deploy ở bước trước)
3. Vào **"App settings"** → **"Domain management"**

### 3.2. Thêm Custom Domain

1. Click **"Add domain"**
2. Nhập domain của bạn: `yourdomain.com`
3. Click **"Configure domain"**

### 3.3. Cấu hình Subdomain (Optional)

Bạn có thể chọn:
- **Root domain**: `yourdomain.com`
- **Subdomain**: `www.yourdomain.com` hoặc `app.yourdomain.com`

**Khuyến nghị**: Nên setup cả root domain và `www` subdomain.

1. Chọn **"Add subdomain"** nếu muốn thêm `www`
2. Chọn branch để map: `main` (hoặc branch production của bạn)
3. Click **"Save"**

### 3.4. Cấu hình DNS Records

Amplify sẽ tự động tạo DNS records cần thiết trong Route53:

1. Amplify sẽ hiển thị các DNS records cần thêm
2. Nếu domain của bạn đã ở Route53, Amplify sẽ tự động thêm records
3. Nếu domain ở nhà cung cấp khác, bạn cần thêm records thủ công:

**Records cần thêm** (ví dụ):
```
Type: CNAME
Name: _xxxxxxxxxxxxx.yourdomain.com
Value: _xxxxxxxxxxxxx.acm-validations.aws.

Type: A
Name: yourdomain.com
Value: (Amplify sẽ cung cấp IP addresses)

Type: AAAA
Name: yourdomain.com
Value: (Amplify sẽ cung cấp IPv6 addresses)
```

### 3.5. Verify Domain và SSL Certificate

1. Sau khi thêm DNS records, Amplify sẽ tự động:
   - Verify domain ownership
   - Request SSL certificate từ AWS Certificate Manager (ACM)
   - Cấu hình HTTPS

2. Quá trình này mất khoảng 10-30 phút

3. Bạn có thể theo dõi status trong **"Domain management"**:
   - **Status**: "Pending verification" → "Pending deployment" → "Available"

## ✅ Bước 4: Verify Setup

### 4.1. Kiểm tra DNS Propagation

1. Truy cập: https://www.whatsmydns.net/
2. Nhập domain của bạn
3. Chọn record type: **A** hoặc **CNAME**
4. Kiểm tra xem DNS đã propagate chưa

### 4.2. Test Domain

1. Sau khi status là **"Available"**, truy cập:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com` (nếu đã setup)

2. Kiểm tra:
   - ✅ Website load được
   - ✅ HTTPS hoạt động (có lock icon)
   - ✅ Tất cả assets load đúng (CSS, JS, images)

### 4.3. Test các chức năng

1. **Authentication**: Test đăng ký/đăng nhập
2. **API Calls**: Test các API calls
3. **Routing**: Test navigation giữa các pages

## 🔄 Bước 5: Cấu hình Redirects (Optional)

### 5.1. Redirect www to root (hoặc ngược lại)

Nếu bạn muốn redirect `www.yourdomain.com` → `yourdomain.com`:

1. Vào **"Domain management"** trong Amplify
2. Click vào domain
3. Trong **"Subdomains"**, chọn subdomain `www`
4. Chọn **"Redirect"** thay vì **"Branch"**
5. Chọn target: root domain
6. Click **"Save"**

## 📝 Bước 6: Cấu hình DNS Records bổ sung (Nếu cần)

### 6.1. Email Records (cho SES)

Nếu bạn dùng SES với custom domain, cần thêm records:

1. Vào **SES Console** → **Verified identities**
2. Chọn domain → **"View DNS records"**
3. Copy các DNS records (SPF, DKIM, DMARC)
4. Vào **Route53** → **Hosted zones** → Domain của bạn
5. Click **"Create record"**
6. Thêm từng record theo hướng dẫn từ SES

**Ví dụ records**:
```
Type: TXT
Name: _amazonses.yourdomain.com
Value: (từ SES)

Type: CNAME
Name: xxxxx._domainkey.yourdomain.com
Value: xxxxx.dkim.amazonses.com
```

### 6.2. API Gateway Custom Domain (Nếu cần)

Nếu bạn muốn custom domain cho API Gateway:

1. Vào **API Gateway Console**
2. Tạo **Custom domain name**
3. Request SSL certificate trong ACM
4. Thêm DNS record trong Route53:
   ```
   Type: A
   Name: api.yourdomain.com
   Value: (từ API Gateway)
   ```

## 🐛 Troubleshooting

### Domain không verify được

**Nguyên nhân**:
- DNS records chưa được thêm đúng
- DNS chưa propagate

**Giải pháp**:
1. Kiểm tra DNS records trong Route53 có đúng không
2. Đợi thêm 10-15 phút để DNS propagate
3. Kiểm tra tại https://www.whatsmydns.net/

### SSL Certificate không được issue

**Nguyên nhân**:
- Domain chưa verify
- DNS records chưa đúng

**Giải pháp**:
1. Đảm bảo domain đã verify
2. Kiểm tra DNS records trong Route53
3. Xóa và thêm lại domain trong Amplify nếu cần

### Website không load sau khi setup domain

**Nguyên nhân**:
- DNS chưa propagate
- Amplify app chưa được map đúng với domain

**Giải pháp**:
1. Kiểm tra DNS propagation
2. Kiểm tra trong Amplify Console xem domain đã được map với branch chưa
3. Kiểm tra build status của Amplify app

### Mixed Content Warning (HTTP/HTTPS)

**Nguyên nhân**:
- Một số resources đang load qua HTTP thay vì HTTPS

**Giải pháp**:
1. Kiểm tra code, đảm bảo tất cả URLs dùng HTTPS
2. Kiểm tra environment variables, đảm bảo API URLs dùng HTTPS
3. Sử dụng relative URLs cho internal resources

## 📋 Checklist

- [ ] Domain đã được mua/transfer
- [ ] Hosted zone đã được tạo trong Route53
- [ ] Name servers đã được cập nhật ở domain registrar
- [ ] DNS đã propagate (kiểm tra tại whatsmydns.net)
- [ ] Domain đã được thêm vào Amplify
- [ ] DNS records đã được cấu hình đúng
- [ ] Domain đã được verify
- [ ] SSL certificate đã được issue
- [ ] Website có thể truy cập qua custom domain
- [ ] HTTPS hoạt động đúng
- [ ] Tất cả chức năng hoạt động đúng

## 💰 Cost Estimation

Route53 pricing:
- **Hosted zone**: $0.50/zone/month
- **Queries**: 
  - First 1 billion queries/month: $0.40 per million
  - Over 1 billion: $0.20 per million
- **Free tier**: Không có free tier cho Route53

**Ví dụ**: 
- 1 hosted zone: $0.50/month
- 1 million queries: $0.40
- **Tổng**: ~$1-2/month cho small-medium traffic

## 📚 Tài liệu tham khảo

- [Route53 Documentation](https://docs.aws.amazon.com/route53/)
- [Amplify Custom Domains](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)
- [AWS Certificate Manager](https://docs.aws.amazon.com/acm/)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

## 🔗 Kết nối với Architecture Diagram

Theo diagram bạn đã cung cấp:
- **Users** → **Route53** (Bước này - DNS routing)
- **Route53** → **Amplify** (Bước 3 - Domain mapping)
- **Amplify** → **Cognito** (Authentication - đã setup trong AWS_SETUP.md)
- **Amplify** → **API Gateway** (API calls - đã có trong environment variables)

Sau khi hoàn thành các bước trên, flow sẽ hoàn chỉnh:
1. User truy cập `yourdomain.com`
2. Route53 resolve DNS → Amplify
3. Amplify serve webapp
4. Webapp authenticate với Cognito
5. Webapp gọi API qua API Gateway

