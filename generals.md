# ĐẶC TẢ TÍNH NĂNG WEB PORTAL - PAWDAR PLATFORM

> Tài liệu tổng hợp chức năng phục vụ lộ trình phát triển Full-Stack (Next.js, Tailwind CSS, TypeScript).

---

## I. TÍNH NĂNG HỆ THỐNG DÙNG CHUNG (SYSTEM-WIDE FEATURES)

### 1. Quản lý Giao diện & Trải nghiệm (UI/UX Engine)

- **Chế độ Nền (Dynamic Theme):** Hỗ trợ Dark Mode và Light Mode đồng bộ toàn hệ thống qua Tailwind CSS.
- **Chuyển đổi Logo thông minh:** Tự động switch linh hoạt giữa Logo bản sáng (nền trắng, chữ tối) và Logo bản tối (nền tối, biểu tượng cam phát sáng) khi người dùng đổi chế độ theme.
- **Hiệu ứng Kính mờ (Glassmorphism):** Áp dụng hiệu ứng `backdrop-blur` cho thanh điều hướng (Sticky Navbar) và các thẻ hiển thị dữ liệu giúp giao diện lướt mượt mà khi cuộn trang.
- **Đa ngôn ngữ (Localization):** Hỗ trợ bộ chuyển đổi ngôn ngữ (Language Switcher) Tiếng Việt / Tiếng Anh (VN/EN) trên thanh Navbar.

---

## II. PHÂN HỆ TÍNH NĂNG CHI TIẾT (USER FEATURES MATRIX)

### 1. Phân hệ Khách Vãng Lai (Chưa Đăng Nhập) - Landing Page

- **Điều hướng cuộn trang (Anchor Navigation):** Người dùng bấm vào các tab (Tính năng, Về Pawdar, Dịch vụ, Đánh giá), web tự động cuộn mượt mà (`smooth scroll`) xuống phân đoạn tương ứng.
- **Khám phá nhanh (Quick Search Preview):** Thanh tìm kiếm rút gọn tại Hero Section cho phép gõ tên giống loài.
- **Chặn quyền truy cập sâu (Auth Guard / Paywall Gate):** Khi khách bấm vào các tính năng nâng cao (Xem chi tiết giống loài, Đăng tin radar), hệ thống tự động chặn lại và hiển thị **Login Modal** (hoặc chuyển hướng sang `/login`).
- **Đăng nhập / Đăng ký (Xác thực):** Trang đăng nhập thiết kế chia đôi màn hình (Split-screen), tích hợp form validate client-side và hình ảnh/animation 3D thú cưng.

### 2. Phân hệ Bách Khoa Toàn Thư (Pet Encyclopedia) - Đã Đăng Nhập

- **Trang Tổng quan & Bộ lọc (Filter Card Grid):**
  - **Tìm kiếm văn bản:** Tìm nhanh theo từ khóa tên giống loài (ví dụ: Husky, Poodle, Shorthair).
  - **Bộ lọc chỉ số (Smart Filters):** Lọc danh sách theo các thuộc tính sinh học (Mức độ thông minh, Mức độ rụng lông, Thân thiện với trẻ em, Mức độ kích động).
  - **Lưới hiển thị (Grid Layout):** Các Card hiển thị ảnh thú cưng, tên, và thanh tiến trình (Progress Bar) mô tả thang điểm 1-5 của từng chỉ số.
- **Trang Chi tiết Giống loài (`/encyclopedia/[breedId]`):**
  - **Tối ưu SEO (Server-Side Rendering):** Tự động render dữ liệu từ Server để các công cụ tìm kiếm dễ cào thông tin.
  - **Nội dung chi tiết:** Hiển thị ảnh lớn full-screen, nguồn gốc xuất xứ, tuổi thọ trung bình, cân nặng chuẩn và cẩm nang hướng dẫn nuôi dưỡng.
- **Tương tác yêu thích (Favorite List):**
  - **Giai đoạn 1:** Bấm icon trái tim để lưu giống loài vào danh sách yêu thích, dữ liệu lưu cục bộ tại `Local Storage` của trình duyệt.
  - **Giai đoạn 2:** Đồng bộ dữ liệu yêu thích về Cơ sở dữ liệu thông qua RESTful API của NestJS Backend.

### 3. Phân hệ Radar Tìm Kiếm Thú Cưng Thất Lạc (Lost & Found Radar) - Đã Đăng Nhập

- **Bản tin Cứu hộ Thời gian thực (Radar Dashboard):**
  - **Giao diện Bản đồ:** Hiển thị các chấm định vị (Pins) nhấp nháy tại các vị trí có thú cưng đi lạc (Giai đoạn 1 dùng bản đồ tĩnh/Mockup, Giai đoạn 2 tích hợp Mapbox tương tác).
  - **Danh sách bài đăng (Feed List):** Hiển thị các thẻ thông tin tìm thú lạc được sắp xếp theo thời gian mới nhất (Ảnh, Tên bé, khu vực lạc, số điện thoại chủ).
- **Đăng tin Khẩn cấp (Report Creation Form):**
  - **Tải ảnh kéo thả (Drag-and-Drop Image):** Component cho phép kéo thả hoặc chọn nhiều ảnh thú cưng, có preview ảnh trước khi đăng.
  - **Ghim vị trí (Geotagging):** Ghim tọa độ chính xác nơi bé bị lạc trên bản đồ.
  - **Nhập liệu thông tin:** Form điền đặc điểm nhận dạng, phần thưởng (nếu có), và thông tin liên hệ.
- **Đồng bộ Dữ liệu (Data Flow):**
  - **Giai đoạn 1:** Nhấn submit, bài đăng lập tức được lưu vào `Local Storage` và render ngược lại lên đầu Bản tin cứu hộ của chính trình duyệt đó.
  - **Giai đoạn 2 (WebSockets & RabbitMQ):** Khi nhấn submit, tin nhắn đẩy qua WebSocket Gateway của NestJS. Hệ thống lập tức "bắn" tin đăng mới xuống màn hình của TẤT CẢ các user khác đang mở web trong vòng vài mili-giây mà không cần reload trang. Đồng thời RabbitMQ sẽ đẩy thông báo ngầm (Push Notification) đến các user trong bán kính 2km.
