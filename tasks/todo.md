# Kế hoạch thiết lập phân hệ Games & Sudoku ở Backend và Frontend

Nhiệm vụ: Cài đặt cơ sở dữ liệu, API Backend để quản lý các màn Sudoku theo độ khó (từ dễ đến khó), ghi nhận tiến độ người chơi, và kết nối với Frontend.

## Danh sách công việc (TODO)

- [x] **Bước 1: Cập nhật Database Schema & Migrations**
  - [x] Thêm các model `SudokuStage` và `SudokuRecord` vào `schema.prisma`.
  - [x] Thêm mối quan hệ `sudokuRecords` vào model `User` trong `schema.prisma`.
  - [x] Chạy migration bằng Prisma: `npx prisma migrate dev --name add_sudoku_stages`.
  - [x] Chạy phát sinh client Prisma: `npx prisma generate` (theo Lesson learned).

- [x] **Bước 2: Viết file Seed dữ liệu màn chơi Sudoku**
  - [x] Chuẩn bị bộ dữ liệu mẫu Sudoku (3 màn Dễ, 3 màn Vừa, 3 màn Khó). Mỗi màn gồm ma trận khởi đầu `board` (chứa số 0 cho ô trống) và ma trận đáp án `solution` (9x9).
  - [x] Tạo file seed hoặc cập nhật `prisma/seed.ts` để nạp các màn chơi này vào DB.
  - [x] Chạy lệnh seed: `npx prisma db seed`.

- [x] **Bước 3: Phát triển Module Game ở Backend**
  - [x] Thêm mã phản hồi thành công/thất bại mới trong `src/common/constants/response-codes.ts`.
  - [x] Tạo thư mục `src/modules/game` và các file:
    - [x] `game.module.ts`: Đăng ký Controller, Service, Prisma.
    - [x] `controllers/sudoku.controller.ts`: Các endpoint API:
      - `GET /games/sudoku/stages`: Lấy danh sách màn chơi kèm trạng thái đã hoàn thành của user.
      - `GET /games/sudoku/stages/:id`: Lấy chi tiết màn chơi (bao gồm board và solution).
      - `POST /games/sudoku/records`: Submit kết quả chơi (won/lost, mistakes, timeTaken).
      - `GET /games/sudoku/leaderboard`: Xem bảng xếp hạng thời gian hoàn thành nhanh nhất.
    - [x] `services/sudoku.service.ts`: Xử lý logic truy vấn DB, lưu trữ kết quả và tính toán bảng xếp hạng.
    - [x] Các file DTO tương ứng.
  - [x] Import `GameModule` vào `AppModule` (`src/app.module.ts`).

- [x] **Bước 4: Cập nhật Frontend kết nối API**
  - [x] Viết API client tích hợp trong Frontend để gọi các API game mới.
  - [x] Cập nhật trang danh sách game `/dashboard/games/page.tsx` và trang chơi `/dashboard/games/sudoku/page.tsx`:
    - Hiển thị danh sách màn chơi (Stage List) cho phép người chơi chọn màn thay vì tự động tạo ngẫu nhiên ở client.
    - Gửi kết quả (thắng/thua, thời gian, số lỗi) lên backend khi ván đấu kết thúc để lưu trữ lịch sử chơi.

- [x] **Bước 5: Xác minh hoạt động**
  - [x] Chạy kiểm tra biên dịch trên cả Backend và Frontend.
  - [x] Đảm bảo APIs hoạt động ổn định và các chức năng lưu trữ kết quả chạy tốt.

- [x] **Bước 6: Đồng bộ Padding lề & Cân đối Layout**
  - [x] Thay thế `max-w-6xl mx-auto` và `max-w-4xl mx-auto` bằng `w-full` để giao diện Sudoku có lề trùng khớp với thanh Topbar Header và các trang khác (như trang thú cưng).
  - [x] Đồng bộ hóa các góc bo tròn (`rounded-2xl` sang `rounded-3xl` cho phần Header và các panel của game) để nhất quán với ngôn ngữ thiết kế chung.
  - [x] Điều chỉnh lại tỷ lệ Grid trên Desktop để cân đối giữa các cột (màn chơi, bàn phím và bảng xếp hạng).
  - [x] Xác minh compile không lỗi.

- [x] **Bước 7: Tách chi tiết màn chơi (Gameplay) thành component riêng biệt**
  - [x] Tạo component [SudokuGame.tsx](file:///c:/Work/Pawdar/web/src/app/%28main%29/dashboard/games/sudoku/components/SudokuGame.tsx) để đóng gói toàn bộ logic chơi và giao diện bàn cờ.
  - [x] Rút gọn [page.tsx](file:///c:/Work/Pawdar/web/src/app/%28main%29/dashboard/games/sudoku/page.tsx) chỉ quản lý giao diện danh sách và lựa chọn màn chơi.

---

## Phần Đánh Giá Kết Quả (Review)

- **Backend**:
  - Đã cập nhật schema cơ sở dữ liệu để thêm `SudokuStage` và `SudokuRecord`.
  - Chạy migration và generate client thành công, nạp dữ liệu seed cho 9 màn chơi (3 Dễ, 3 Vừa, 3 Khó) hoạt động tốt.
  - Xây dựng NestJS `GameModule` hoàn thiện và đăng ký thành công vào `AppModule`.
- **Frontend**:
  - Tích hợp RTK Query slices cho `gameApi` để trao đổi thông tin màn chơi, lưu kết quả ván chơi và xem bảng xếp hạng.
  - Thiết kế lại trang chơi Sudoku `/dashboard/games/sudoku/page.tsx` thành dạng Stage Selection View, hiển thị danh sách màn, trạng thái vượt màn của tài khoản, bảng xếp hạng kỷ lục tốc độ giải đố. Khi nhấp chơi, client tự động tải ma trận từ server và tự động đồng bộ kết quả lên cơ sở dữ liệu khi thắng/thua.
  - Đồng bộ hóa lề padding (`w-full`) trùng khớp với các trang khác và nâng cấp góc bo tròn lên `rounded-3xl` để mang lại giao diện premium nhất quán.
  - Tách biệt hoàn hảo phần logic chơi game sang component [SudokuGame.tsx](file:///c:/Work/Pawdar/web/src/app/%28main%29/dashboard/games/sudoku/components/SudokuGame.tsx).
- **Biên dịch & Chạy thử**:
  - Đã chạy kiểm tra kiểu TypeScript (`npx tsc --noEmit`) trên cả hai dự án (client & server) và tất cả đều biên dịch thành công, không có bất kỳ lỗi nào. Giao diện mượt mà và đồng bộ hoàn hảo với dữ liệu trên DB PostgreSQL.
