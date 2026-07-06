# Hướng dẫn Đưa Cổng Thông Tin CX Droppii Portal Lên Mạng & Đồng Bộ Real-time

Tài liệu này hướng dẫn bạn cách thiết lập cơ sở dữ liệu đám mây **Firebase** hoàn toàn miễn phí để đồng bộ thời gian thực (Real-time) giữa các thành viên, và đưa website giao diện portal lên Internet để chạy chính thức.

---

## PHẦN 1: Thiết lập Đám mây Firebase Firestore (Real-time DB)

Hệ thống đã được lập trình sẵn mô-đun kết nối tự động với Firestore. Bạn chỉ cần lấy mã kết nối theo các bước sau:

1. **Tạo Dự án Firebase**:
   * Truy cập trang quản trị [Firebase Console](https://console.firebase.google.com/) và đăng nhập bằng tài khoản Google.
   * Bấm **Add project** (Tạo dự án mới). Nhập tên dự án (ví dụ: `cx-droppii-portal`) và bấm tiếp tục cho đến khi hoàn thành (bạn có thể tắt Google Analytics nếu không cần thiết).

2. **Tạo Cơ sở dữ liệu Firestore**:
   * Tại menu thanh bên trái, chọn **Build** -> **Firestore Database**.
   * Bấm nút **Create database** (Tạo cơ sở dữ liệu).
   * Chọn vùng máy chủ gần Việt Nam (ví dụ: `asia-southeast1` ở Singapore hoặc `asia-east1` ở Đài Loan) để đạt tốc độ tối đa.
   * Chọn chế độ bảo mật **Start in test mode** (Bắt đầu ở chế độ thử nghiệm - cho phép đọc ghi tự do trong 30 ngày đầu) để dễ dàng kết nối thử nghiệm.
   * Bấm **Create** và đợi Firestore khởi tạo xong.

3. **Lấy Mã Cấu hình (Config JSON)**:
   * Trở lại trang chủ Dashboard của Firebase Project, bấm vào biểu tượng **Web (`</>`)** dưới dòng tên dự án để đăng ký ứng dụng Web.
   * Nhập tên ứng dụng Web (ví dụ: `cx-portal-web`) và bấm **Register app**.
   * Firebase sẽ hiển thị đoạn mã script. Bạn chỉ cần copy đối tượng `firebaseConfig` nằm trong dấu `{ ... }`. Dưới đây là ví dụ về định dạng JSON bạn cần:
     ```json
     {
       "apiKey": "AIzaSyA-...",
       "authDomain": "cx-droppii-portal.firebaseapp.com",
       "projectId": "cx-droppii-portal",
       "storageBucket": "cx-droppii-portal.appspot.com",
       "messagingSenderId": "123456789012",
       "appId": "1:123456789012:web:abcdef123456"
     }
     ```

4. **Kết nối trên Portal**:
   * Mở giao diện CX Droppii Portal của bạn.
   * Đăng nhập bằng tài khoản **Quản trị viên CX** (mật mã mặc định: `1234`).
   * Bấm nút **Đồng bộ đám mây** ở góc trên cùng bên phải giao diện để mở bảng cài đặt Firebase.
   * Dán đoạn mã cấu hình JSON của bạn vào ô nhập liệu và bấm **Lưu cấu hình**.
   * Hệ thống sẽ tự động đồng bộ dữ liệu hiện tại lên Cloud. Trạng thái kết nối sẽ chuyển sang **Trực tuyến (Online)** màu xanh lá cây lá.

---

## PHẦN 2: Đưa Website Lên Mạng (Hosting Miễn phí)

Bạn có hai cách phổ biến nhất dưới đây để go live ứng dụng miễn phí:

### Cách 1: Sử dụng Netlify (Khuyên dùng - Cực nhanh, 10 giây có URL chạy thật)

Netlify cho phép bạn đưa website lên mạng mà không cần biết lập trình hay cài đặt phức tạp:

1. Truy cập trang web [Netlify Drop](https://app.netlify.com/drop). Bạn không cần đăng ký tài khoản trước.
2. Mở thư mục chứa dự án của bạn trên máy tính (`work-process-db`).
3. Kéo toàn bộ thư mục này (hoặc nén lại thành file `.zip` rồi kéo vào) và thả vào ô **"Drag and drop your site folder here"** trên trang Netlify.
4. Chờ 5 - 10 giây, Netlify sẽ tạo ra một đường dẫn URL công khai có dạng `https://ten-ngau-nhien.netlify.app/`.
5. Bạn có thể đăng ký tài khoản Netlify miễn phí để đổi tên miền ngẫu nhiên đó thành tên bạn muốn (ví dụ: `cx-droppii-portal.netlify.app`).

### Cách 2: Sử dụng GitHub Pages (Chuyên nghiệp - Tự động cập nhật khi sửa code)

Nếu bạn có tài khoản GitHub, đây là phương thức tốt nhất để quản lý mã nguồn và go live:

1. Truy cập [GitHub](https://github.com/) và tạo một Repository mới (ví dụ đặt tên: `cx-droppii-portal`).
2. Đẩy toàn bộ mã nguồn trong thư mục `work-process-db` lên Repository vừa tạo.
3. Vào phần **Settings** (Cài đặt) của Repository -> chọn mục **Pages** ở menu bên trái.
4. Tại phần **Build and deployment** -> **Source**, chọn **Deploy from a branch**.
5. Tại mục **Branch**, chọn nhánh chính (`main` hoặc `master`), mục folder chọn `/ (root)` và nhấn **Save**.
6. Đợi 1-2 phút, GitHub sẽ xuất bản trang web của bạn tại địa chỉ: `https://<ten-github-cua-ban>.github.io/cx-droppii-portal/`.
7. Mỗi khi bạn chỉnh sửa mã nguồn và đẩy lên GitHub, trang web live sẽ tự động cập nhật.

---

## PHẦN 3: Sử dụng Thực tế & Chia sẻ cho Đội ngũ

Sau khi đã Go Live thành công trên Netlify hoặc GitHub Pages và kết nối Firebase:

1. **Chia sẻ liên kết**: Gửi đường dẫn live (`.netlify.app` hoặc `.github.io`) cho các thành viên trong đội ngũ CX.
2. **Đăng nhập và hoạt động**:
   * Khi thành viên truy cập đường dẫn, họ sẽ tự chọn tài khoản của họ được Admin cấp (Viewer/Editor) và nhập mã PIN để vào hệ thống.
   * **Cập nhật tức thì (Real-time)**: Khi một Editor thêm quy trình mới hoặc một thành viên tích chọn hoàn thành bước, tất cả các máy tính khác đang mở Portal sẽ lập tức thấy sự thay đổi xuất hiện trên màn hình mà không cần tải lại trang (F5).
3. **Quản trị an toàn**: Admin có thể mở danh sách tài khoản để quản lý nhân viên, đổi mật khẩu hoặc khóa các tài khoản cũ trực tiếp từ đường link live đó. Dữ liệu sẽ luôn được bảo mật và đồng bộ tuyệt đối trên Firestore.
