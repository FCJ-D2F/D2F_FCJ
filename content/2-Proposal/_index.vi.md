---
title: "Đề xuất"
date: 2025-09-30
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Đề Xuất Dự Án Hệ Thống Giám Sát & Cảnh Báo An Toàn IoT

## 1. Tổng Quan Dự Án

### Tên Dự Án
**Hệ Thống Giám Sát & Cảnh Báo An Toàn IoT Cho Smart Home Trên Nền Tảng AWS**

### Mô Tả Dự Án
Phát triển hệ thống giám sát và cảnh báo an toàn IoT toàn diện cho ngôi nhà thông minh, kết hợp tích hợp sensor phần cứng, giao thức bảo mật tiên tiến, kiến trúc backend serverless và dashboard trực quan real-time. Hệ thống cung cấp khả năng giám sát end-to-end các thông số môi trường (nhiệt độ, độ ẩm, phát hiện khí gas, chuyển động) với các biện pháp bảo mật mạnh mẽ và phân tích dữ liệu trên cloud.

### Thông Tin Đội Ngũ
- **Quy Mô Đội**: 5 thành viên (sinh viên năm 3 đại học)
- **Cấu Trúc Đội**: 
  - 2 Kỹ Sư IC Design (Chuyên gia Hardware/Firmware)
  - 2 Kỹ Sư Phần Mềm (Chuyên gia Backend/Frontend)  
  - 1 Chuyên Gia Bảo Mật (Expert Cybersecurity & PKI)

### Thời Gian Thực Hiện
**3 tháng** (Tháng 9/2025 - Tháng 11/2025)

### Tổng Ngân Sách
**$600 USD** phân bổ cho ba thành phần chính:
- Phát triển WebApp: $200
- IoT Hardware & Firmware: $200  
- Hạ tầng Bảo mật: $200

### Quy Mô Ứng Dụng
**Smart Home** - Một ngôi nhà tiêu biểu với 8-12 sensor nodes phủ sóng các khu vực quan trọng

---

## 2. Mục Tiêu Dự Án

### Mục Tiêu Chính
1. **Phát triển hệ sinh thái IoT an toàn** với bảo mật hardware-level sử dụng HSM/PKI
2. **Triển khai hệ thống giám sát real-time** cho các thông số môi trường và an toàn
3. **Tạo backend serverless có khả năng mở rộng** sử dụng các dịch vụ AWS được quản lý
4. **Xây dựng giao diện dashboard trực quan** cho giám sát và quản lý thiết bị
5. **Thiết lập framework bảo mật toàn diện** với phát hiện mối đe dọa và ứng phó sự cố

### Chỉ Số Thành Công Chính
- **Kết Nối Thiết Bị**: 99.9% uptime cho kết nối thiết bị IoT
- **Tuân Thủ Bảo Mật**: Không có vi phạm bảo mật trong giai đoạn testing
- **Hiệu Suất Real-time**: <100ms độ trễ cho cảnh báo quan trọng
- **Trải Nghiệm Người Dùng**: Dashboard responsive có thể truy cập trên web và mobile
- **Hiệu Quả Chi Phí**: Giữ trong ngân sách $600 trong khi đạt được prototype sẵn sàng sản xuất

---

## 3. Kiến Trúc Kỹ Thuật

### 3.1 Lớp Phần Cứng (Thiết Bị IoT)
- **Vi Điều Khiển**: ESP32 với khả năng WiFi tích hợp
- **Cảm Biến**: Nhiệt độ/độ ẩm (DHT11), Phát hiện khí gas (MQ series), Cảm biến lửa MKE-S04 IR
- **Truyền Thông**: MQTT over TLS 1.3 cho truyền dữ liệu an toàn

### 3.2 Tích Hợp Dịch Vụ AWS Cloud
| Dịch Vụ | Mục Đích | Chi Phí Ước Tính Hàng Tháng |
|---------|----------|---------------------------|
| **AWS IoT Core** | Gateway thiết bị và messaging | $3-8 (cho smart home) |
| **AWS IoT Device Management** | Quản lý fleet và OTA updates | $1-3 |
| **AWS IoT Device Defender** | Giám sát bảo mật và phát hiện bất thường | $2-5 |
| **AWS IAM** | Quản lý danh tính và truy cập | Miễn phí |
| **AWS Certificate Manager** | Quản lý chứng chỉ SSL/TLS | Miễn phí |
| **AWS CloudTrail** | Audit logging bảo mật | $2-5 |
| **AWS Lambda** | Logic business serverless | $3-8 |
| **API Gateway** | Endpoints RESTful API | $1-3 |
| **Amazon DynamoDB** | Database NoSQL cho dữ liệu sensor | $3-8 |
| **Amazon SNS** | Push notifications và alerts | $1-2 |

### 3.3 Framework Bảo Mật
- **Public Key Infrastructure (PKI)**: Xác thực thiết bị dựa trên chứng chỉ X.509
- **Mutual TLS (mTLS)**: Xác thực hai chiều giữa thiết bị và cloud
- **Hardware Security Module (HSM)**: Lưu trữ khóa an toàn và các thao tác mật mã
- **Zero Trust Architecture**: Xác minh liên tục danh tính và hành vi thiết bị
- **Tự Động Ứng Phó Mối Đe Dọa**: Phát hiện sự cố real-time và giảm thiểu

---

## 4. Phân Tích Ngân Sách

### 4.1 Phát Triển WebApp ($200)
- **Framework Frontend**: Công cụ phát triển React.js/Vue.js - $50
- **Công Cụ Thiết Kế UI/UX**: Figma Pro subscription (3 tháng) - $45
- **Testing & Deployment**: AWS S3/CloudFront hosting - $25
- **Thư Viện Phát Triển**: Chart.js, Material-UI, WebSocket libraries - $30
- **Giám Sát Hiệu Suất**: Công cụ performance monitoring - $25
- **Tài Liệu & Đào Tạo**: Tài nguyên technical writing - $25

### 4.2 IoT Hardware & Firmware ($200)
- **Board Phát Triển**: 12x ESP32 development kits cho smart home - $90
- **Cảm Biến & Linh Kiện**: Sensor nhiệt độ, độ ẩm, khí gas, chuyển động - $70
- **Prototyping PCB**: Custom sensor board fabrication (12 units) - $25
- **Hardware Security Module**: SoftHSM hoặc TPM module - $10
- **Công Cụ Phát Triển**: Firmware debugging tools và licenses - $5

### 4.3 Hạ Tầng Bảo Mật ($200)
- **Dịch Vụ AWS**: IoT Device Defender, CloudTrail, Certificate Manager - $80
- **Công Cụ Testing Bảo Mật**: Licenses phần mềm penetration testing - $40
- **Setup Certificate Authority**: Chi phí hạ tầng PKI - $30
- **Giám Sát Bảo Mật**: Chi phí CloudWatch và logging bổ sung - $30
- **Tài Liệu Tuân Thủ**: Công cụ security audit và documentation - $20

---

## 5. Kế Hoạch Thực Hiện

### Giai Đoạn 1: Nền Tảng (Tháng 1)
**Tuần 1-2: Kiến Trúc & Lập Kế Hoạch**
- Thiết kế kiến trúc hệ thống và tài liệu hóa
- Setup tài khoản AWS và cấu hình dịch vụ
- Chuẩn bị môi trường phát triển
- Đào tạo đội ngũ về AWS services và giao thức bảo mật

**Tuần 3-4: Phát Triển Cốt Lõi**
- Thiết kế sơ đồ hardware và sourcing linh kiện
- Phát triển firmware cơ bản cho tích hợp sensor
- Setup hạ tầng PKI và tạo certificate authority
- Thiết kế backend API và các Lambda function ban đầu

### Giai Đoạn 2: Tích Hợp (Tháng 2)
**Tuần 5-6: Tích Hợp Hardware-Software**
- Chế tạo PCB và lắp ráp linh kiện
- Triển khai communication từ thiết bị lên cloud
- Deploy certificate bảo mật cho thiết bị
- Phát triển pipeline dữ liệu real-time

**Tuần 7-8: Triển Khai Bảo Mật**
- Hệ thống xác thực Mutual TLS
- Cấu hình IoT Device Defender
- Setup giám sát bảo mật và cảnh báo
- Phát triển dashboard frontend

### Giai Đoạn 3: Testing & Deployment (Tháng 3)
**Tuần 9-10: Testing Tích Hợp Hệ Thống**
- Testing và validation hệ thống end-to-end
- Security penetration testing và đánh giá lỗ hổng
- Tối ưu hiệu suất và load testing
- User acceptance testing và tích hợp feedback

**Tuần 11-12: Chuẩn Bị Sản Xuất**
- Hoàn thiện tài liệu và tạo technical manual
- Production deployment và setup monitoring
- Security audit cuối cùng và xác minh tuân thủ
- Chuẩn bị presentation và demonstration dự án

---

## 6. Sản Phẩm Bàn Giao

### 6.1 Sản Phẩm Hardware
- **IoT Sensor Boards**: 12 prototype hoàn chính với sensor tích hợp cho smart home
- **Firmware Package**: Phần mềm nhúng hoàn chỉnh với khả năng OTA update
- **Tài Liệu Hardware**: Schematics, PCB layouts, và hướng dẫn lắp ráp
- **Hướng Dẫn Manufacturing**: Tài liệu sẵn sàng sản xuất để scale-up

### 6.2 Sản Phẩm Software
- **Backend API**: RESTful services với tài liệu toàn diện
- **Frontend Dashboard**: Ứng dụng web responsive với giám sát real-time
- **Mobile Interface**: Progressive Web App (PWA) cho truy cập mobile device
- **Database Schema**: Data models tối ưu cho dữ liệu time-series sensor

### 6.3 Sản Phẩm Bảo Mật
- **Hạ Tầng PKI**: Certificate authority hoàn chỉnh và hệ thống device certificate
- **Chính Sách Bảo Mật**: IAM roles, device policies, và cấu hình access control
- **Hệ Thống Giám Sát**: Phát hiện mối đe dọa tự động và ứng phó sự cố
- **Tài Liệu Bảo Mật**: Checklist tuân thủ và manual vận hành bảo mật

### 6.4 Tài Liệu & Đào Tạo
- **Tài Liệu Kỹ Thuật**: Kiến trúc hệ thống, API documentation, deployment guides
- **Hướng Dẫn Người Dùng**: Guide cho người dùng cuối về vận hành dashboard
- **Manual Bảo Mật**: Chính sách bảo mật, quy trình ứng phó sự cố, và hướng dẫn tuân thủ
- **Tài Liệu Đào Tạo**: Video tutorials

---

## 7. Đánh Giá Rủi Ro & Giảm Thiểu

### 7.1 Rủi Ro Kỹ Thuật
| Rủi Ro | Tác Động | Xác Suất | Chiến Lược Giảm Thiểu |
|--------|----------|----------|---------------------|
| Delay linh kiện hardware | Cao | Trung bình | Order sớm, duy trì backup suppliers |
| Vượt chi phí AWS service | Trung bình | Thấp | Monitoring chi phí, sử dụng free tier hiệu quả |
| Phát hiện lỗ hổng bảo mật | Cao | Thấp | Testing bảo mật thường xuyên, follow AWS best practices |
| Độ phức tạp integration | Trung bình | Trung bình | Integration từng bước, comprehensive testing |

### 7.2 Rủi Ro Quản Lý Dự Án
| Rủi Ro | Tác Động | Xác Suất | Chiến Lược Giảm Thiểu |
|--------|----------|----------|---------------------|
| Thành viên team không có sẵn | Trung bình | Thấp | Cross-training, documentation, backup assignments |
| Delay timeline | Trung bình | Trung bình | Buffer time allocation, milestone tracking |
| Scope creep | Thấp | Trung bình | Clear requirements documentation, change control |
| Ràng buộc ngân sách | Cao | Thấp | Weekly budget tracking, cost optimization |

---

## 8. Kết Quả Mong Đợi & Tác Động

### 8.1 Thành Tựu Kỹ Thuật
- **Hệ Thống IoT Hoạt Động**: Prototype sẵn sàng sản xuất thể hiện tất cả tính năng chính
- **Xuất Sắc Về Bảo Mật**: Hệ thống zero-vulnerability với practices bảo mật chuẩn ngành
- **Kiến Trúc Scalable**: Thiết kế cloud-native có khả năng xử lý 100+ thiết bị cho smart home
- **Hiệu Suất Real-time**: Thời gian phản hồi dưới giây cho cảnh báo và thông báo quan trọng

### 8.2 Kết Quả Học Tập
- **Kiến Trúc Cloud**: Trải nghiệm thực tế với AWS services và serverless computing
- **IoT Security**: Hiểu biết sâu về bảo mật hardware-level và triển khai PKI
- **Full-Stack Development**: Trải nghiệm complete software development lifecycle
- **Quản Lý Dự Án**: Kinh nghiệm thực tế trong agile development và team collaboration

### 8.3 Ứng Dụng Tương Lai
- **Quản Lý Smart Home**: Giám sát môi trường cho nhà ở thông minh
- **IoT Thương Mại**: Hệ thống giám sát thiết bị và predictive maintenance
- **Healthcare Monitoring**: Tracking môi trường bệnh nhân và thiết bị y tế
- **Giám Sát Môi Trường**: Mạng giám sát chất lượng không khí và khí hậu

---

## 9. Kết Luận

Dự án Hệ Thống Giám Sát & Cảnh Báo An Toàn IoT này thể hiện cách tiếp cận toàn diện đến phát triển IoT hiện đại, kết hợp thiết kế hardware tiên tiến, giao thức bảo mật mạnh mẽ, và kiến trúc cloud có khả năng mở rộng. Với ngân sách $600 và timeline 3 tháng, đội ngũ 5 sinh viên tận tụy sẽ giao một prototype sẵn sàng sản xuất thể hiện best practices trong IoT security, cloud computing, và full-stack development.

Dự án không chỉ phục vụ như một trải nghiệm học tập xuất sắc mà còn tạo ra nền tảng cho các ứng dụng thực tế trong smart home, giám sát công nghiệp, và bảo vệ môi trường. Bằng cách tận dụng AWS managed services và tập trung vào nguyên tắc thiết kế security-first, chúng tôi hướng đến tạo ra một hệ thống đáp ứng cả nhu cầu hiện tại và yêu cầu scalability tương lai.

**Thông Tin Liên Hệ Dự Án:**
- **Project Manager**: Trần Quang Huy  
- **Security Lead**: Trần Quang Huy
- **Email**: huytqse182122@fpt.edu.vn
- **Project Repository**: [GitHub repository URL]

---

*Đề xuất này được gửi để xem xét và phê duyệt. Chúng tôi mong được cơ hội thể hiện khả năng kỹ thuật và giao kết quả xuất sắc trong timeline và ngân sách đề xuất.*