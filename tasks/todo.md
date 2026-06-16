# Task Checklist: Thêm API Login trả về Access & Refresh Token

- [x] Cài đặt gói thư viện `@nestjs/jwt` (`npm install @nestjs/jwt`)
- [x] Thêm biến môi trường JWT vào `.env` và `.env.example`
- [x] Đăng ký các mã phản hồi mới trong `src/common/constants/response-codes.ts`
- [x] Định nghĩa `login.dto.ts` trong `src/modules/auth/dto/`
- [x] Đăng ký `JwtModule` trong `src/modules/auth/auth.module.ts`
- [x] Thêm logic xác thực và sinh token trong `src/modules/auth/services/auth.service.ts`
- [x] Thêm endpoint `login` và tài liệu Swagger mẫu trong `src/modules/auth/controllers/auth.controller.ts`
- [x] Chạy kiểm thử và xác minh kết quả hoạt động
