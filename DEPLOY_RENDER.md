# Hướng dẫn deploy lên Render (Free)

## Tổng quan
- **Web service (free)**: ngủ sau 15 phút không có traffic; request đầu sau khi ngủ mất ~50s để khởi động lại.
- **Database**: Render **không có MySQL free**, nên dùng **PostgreSQL free**. Code không cần đổi (Hibernate tự nhận dialect).
- **Ổ đĩa tạm thời**: ảnh trong thư mục `uploads/` **sẽ mất mỗi lần deploy/restart/ngủ dậy**. Muốn giữ ảnh lâu dài → dùng Cloudinary/S3 (xem cuối file).

---

## Cách 1 — Dùng Blueprint (render.yaml) — khuyến nghị

1. Push toàn bộ code (đã có `Dockerfile`, `render.yaml`) lên GitHub:
   ```
   git add .
   git commit -m "Config deploy Render"
   git push origin Deploy_Render
   ```
2. Vào https://dashboard.render.com → **New +** → **Blueprint** → chọn repo này → chọn nhánh `Deploy_Render` → **Apply**.
   - Render tự tạo **database `teaandcake-db`** và **web service**.
3. Render sẽ hỏi các biến `sync: false`. Điền:
   - `SPRING_DATASOURCE_URL`: lấy từ database (xem bước dưới).
   - `MAIL_USERNAME` / `MAIL_PASSWORD`: email Gmail + **App Password** (16 ký tự).
   - `APP_BASE_URL`: `https://<tên-service>.onrender.com` (điền sau khi biết URL, rồi Save → app tự deploy lại).
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD`: tài khoản admin bạn muốn.

### Lấy `SPRING_DATASOURCE_URL`
1. Mở database `teaandcake-db` trên Render → mục **Connections**.
2. Copy dòng **Internal Database URL**, dạng:
   ```
   postgresql://teaandcake:MẬT_KHẨU@dpg-xxxx-a/teaandcake
   ```
3. Đổi thành dạng JDBC (chỉ cần host + tên DB, bỏ user/pass vì đã set riêng):
   ```
   jdbc:postgresql://dpg-xxxx-a/teaandcake
   ```
   Dán chuỗi này vào biến `SPRING_DATASOURCE_URL`.

> Dùng **Internal** URL (nhanh, miễn phí nội bộ) vì web service và DB cùng nằm trên Render.

---

## Cách 2 — Tạo thủ công (không dùng render.yaml)

1. **Tạo Database**: New + → PostgreSQL → plan **Free** → Create. Ghi lại Internal Database URL.
2. **Tạo Web Service**: New + → Web Service → chọn repo → **Runtime: Docker** → plan **Free**.
3. Vào tab **Environment** của web service, thêm các biến:

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>/<db>` (từ Internal URL) |
   | `SPRING_DATASOURCE_USERNAME` | user của DB |
   | `SPRING_DATASOURCE_PASSWORD` | password của DB |
   | `APP_BASE_URL` | `https://<service>.onrender.com` |
   | `MAIL_USERNAME` | email Gmail |
   | `MAIL_PASSWORD` | Gmail App Password |
   | `ADMIN_USERNAME` | admin |
   | `ADMIN_PASSWORD` | (mật khẩu mạnh) |

4. Save → Render tự build & deploy.

---

## Gmail App Password
Mật khẩu Gmail thường không dùng được cho SMTP. Cần:
1. Bật **2-Step Verification** cho tài khoản Google.
2. Vào https://myaccount.google.com/apppasswords → tạo App Password → dùng chuỗi 16 ký tự đó cho `MAIL_PASSWORD`.

---

## Chạy local (không đổi gì)
App vẫn chạy MySQL ở máy như cũ nhờ giá trị mặc định trong `application.properties`.
Không cần set biến môi trường nào khi chạy local.

---

## (Tùy chọn) Lưu ảnh vĩnh viễn với Cloudinary
Ổ đĩa Render free là tạm thời nên ảnh upload sẽ mất. Giải pháp free phổ biến: **Cloudinary**.
Cần đăng ký Cloudinary, thêm SDK và sửa phần lưu file để upload lên Cloudinary thay vì ghi vào `uploads/`.
Nếu cần, mình có thể giúp tích hợp phần này.
