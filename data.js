/**
 * Dữ liệu quy trình mẫu mặc định (Tiếng Việt)
 */
const defaultCategories = [
  "CNTT & Kỹ thuật",
  "Hành chính Nhân sự",
  "Hỗ trợ Khách hàng",
  "Kinh doanh & Marketing"
];

const defaultProcesses = [
  {
    id: "proc-1",
    title: "Xử lý Sự cố Mất kết nối Internet Văn phòng",
    category: "CNTT & Kỹ thuật",
    priority: "high",
    pinned: true,
    tags: ["mạng", "internet", "khẩn cấp", "it"],
    description: "Các bước chuẩn đoán nhanh và xử lý khi văn phòng bị mất kết nối Internet đột ngột.",
    steps: [
      { id: "step-1-1", text: "Kiểm tra đèn nguồn và đèn tín hiệu (PON/LOS) trên Modem chính của nhà mạng.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-1-2", text: "Nếu đèn LOS nhấp nháy đỏ: Liên hệ ngay tổng đài nhà mạng để báo hỏng cáp quang.", completed: false, image: null, linkUrl: "https://hotro.viettel.vn", linkName: "Cổng Hỗ trợ Viettel" },
      { id: "step-1-3", text: "Nếu các đèn bình thường nhưng không có mạng: Thực hiện ngắt điện Modem và Router phụ, đợi 30 giây rồi cắm điện lại.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-1-4", text: "Kiểm tra cổng kết nối dây LAN từ modem vào router trung tâm xem có lỏng không.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-1-5", text: "Gửi thông báo lên nhóm chat nội bộ của công ty về tình trạng mạng và thời gian dự kiến khắc phục xong.", completed: false, image: null, linkUrl: "", linkName: "" }
    ],
    author: "Nguyễn Văn An (IT Leader)",
    createdAt: "2026-07-01T08:30:00.000Z",
    updatedAt: "2026-07-03T10:15:00.000Z"
  },
  {
    id: "proc-2",
    title: "Quy trình Đón nhận Nhân sự Mới (Onboarding)",
    category: "Hành chính Nhân sự",
    priority: "medium",
    pinned: false,
    tags: ["nhân sự", "onboarding", "tuyển dụng"],
    description: "Quy trình chuẩn bị thiết bị, tài khoản và hướng dẫn hội nhập cho nhân viên mới trong ngày đầu tiên đi làm.",
    steps: [
      { id: "step-2-1", text: "Chuẩn bị góc làm việc: Bàn ghế sạch sẽ, văn phòng phẩm cơ bản và thẻ đeo nhân viên.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-2-2", text: "Thiết lập máy tính làm việc: Cài đặt hệ điều hành, các phần mềm văn phòng, chat nội bộ và kiểm tra kết nối mạng.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-2-3", text: "Khởi tạo tài khoản email công ty (domain @company.com) và phân quyền vào các thư mục Drive chung.", completed: false, image: null, linkUrl: "https://admin.google.com", linkName: "Google Admin Console" },
      { id: "step-2-4", text: "Hướng dẫn nhân viên mới ký kết hợp đồng thử việc, điền thông tin nhân sự và nộp hồ sơ cá nhân.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-2-5", text: "Dẫn nhân viên đi giới thiệu với các phòng ban và giới thiệu Người hướng dẫn (Buddy/Mentor).", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-2-6", text: "Gửi tài liệu văn hóa doanh nghiệp và quy chế nội bộ qua email để nhân viên nghiên cứu.", completed: false, image: null, linkUrl: "https://drive.google.com", linkName: "Thư mục Tài liệu Onboarding" }
    ],
    author: "Trần Thị Bình (HR Manager)",
    createdAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-06-28T14:20:00.000Z"
  },
  {
    id: "proc-3",
    title: "Xử lý Yêu cầu Hoàn tiền của Khách hàng",
    category: "Hỗ trợ Khách hàng",
    priority: "high",
    pinned: false,
    tags: ["chăm sóc khách hàng", "tài chính", "hoàn tiền", "quy trình"],
    description: "Quy trình các bước tiếp nhận thông tin, đối soát giao dịch và phê duyệt hoàn trả tiền cho khách hàng khi có khiếu nại hợp lệ.",
    steps: [
      { id: "step-3-1", text: "Tiếp nhận yêu cầu hoàn tiền qua Hotline/Email và kiểm tra mã đơn hàng trên hệ thống CRM.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-3-2", text: "Xác minh lý do hoàn tiền dựa trên chính sách của công ty (Lỗi sản phẩm, giao sai hàng, hoặc giao trễ quá hạn định).", completed: false, image: null, linkUrl: "https://company.com/policy", linkName: "Chính sách Hoàn trả" },
      { id: "step-3-3", text: "Yêu cầu khách hàng cung cấp hình ảnh minh chứng hoặc số tài khoản ngân hàng nhận tiền.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-3-4", text: "Chuyển thông tin giao dịch sang bộ phận Kế toán để thực hiện đối soát dòng tiền.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-3-5", text: "Kế toán thực hiện lệnh chuyển khoản hoàn tiền và gửi biên lai chuyển khoản thành công.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-3-6", text: "Nhân viên CSKH gửi email/tin nhắn xác nhận đã hoàn tiền kèm lời xin lỗi chân thành đến khách hàng.", completed: false, image: null, linkUrl: "", linkName: "" }
    ],
    author: "Lê Minh Cường (CS Lead)",
    createdAt: "2026-05-10T10:00:00.000Z",
    updatedAt: "2026-07-02T16:45:00.000Z"
  },
  {
    id: "proc-4",
    title: "Lên Kế hoạch và Đăng bài Mạng Xã hội Hàng tuần",
    category: "Kinh doanh & Marketing",
    priority: "low",
    pinned: false,
    tags: ["facebook", "marketing", "content", "lịch trình"],
    description: "Quy trình nghiên cứu chủ đề, viết bài, thiết kế hình ảnh và lên lịch đăng bài trên Fanpage công ty hàng tuần.",
    steps: [
      { id: "step-4-1", text: "Họp team đầu tuần để thống nhất chủ đề chính (Concept) và các chương trình khuyến mãi cần đẩy mạnh.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-4-2", text: "Lập bảng kế hoạch nội dung chi tiết (Content Calendar) gồm: Tiêu đề, thông điệp chính, ngày giờ đăng bài.", completed: false, image: null, linkUrl: "https://sheets.google.com", linkName: "Bảng Content Calendar" },
      { id: "step-4-3", text: "Viết nội dung chi tiết (copywriting) cho từng bài viết, tối ưu hóa các thẻ hashtag thương hiệu.", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-4-4", text: "Chuyển yêu cầu thiết kế hình ảnh/video sang bộ phận Designer (yêu cầu đúng size và guideline màu sắc).", completed: false, image: null, linkUrl: "https://canva.com", linkName: "Thư mục Canva Thiết kế" },
      { id: "step-4-5", text: "Kiểm duyệt lại nội dung và hình ảnh cuối cùng (Proofreading).", completed: false, image: null, linkUrl: "", linkName: "" },
      { id: "step-4-6", text: "Sử dụng công cụ Meta Business Suite để lên lịch đăng bài tự động cho cả tuần.", completed: false, image: null, linkUrl: "https://business.facebook.com", linkName: "Meta Business Suite" }
    ],
    author: "Phạm Hồng Đào (Marketing Specialist)",
    createdAt: "2026-06-01T11:00:00.000Z",
    updatedAt: "2026-06-30T09:30:00.000Z"
  }
];

const defaultAnnouncements = [
  {
    id: "ann-1",
    title: "Triển khai thử nghiệm Quy trình Trả hàng nhanh 2h",
    category: "Vận chuyển",
    status: "active", // active (Đang chạy), upcoming (Sắp chạy), stopped (Đã ngừng)
    content: "Từ ngày 05/07/2026, team CX sẽ bắt đầu chạy thử nghiệm quy trình hỗ trợ hoàn trả hàng siêu tốc trong 2h tại khu vực nội thành TP.HCM. Chi tiết các bước đối soát và giao nhận đã được cập nhật trong phần quy trình xử lý đơn hoàn.",
    author: "Lê Minh Cường (CS Lead)",
    createdAt: "2026-07-02T10:00:00.000Z",
    updatedAt: "2026-07-03T09:00:00.000Z"
  },
  {
    id: "ann-2",
    title: "Bảo trì nâng cấp Hệ thống CRM Hub toàn quốc",
    category: "Hệ thống IT",
    status: "upcoming",
    content: "Hệ thống quản lý khách hàng CRM Hub sẽ được bảo trì nâng cấp định kỳ nhằm tối ưu hóa tốc độ tải đơn. Thời gian bảo trì dự kiến: từ 23h00 ngày 05/07 đến 03h00 ngày 06/07. Toàn bộ tính năng tra cứu thông tin đơn hàng trên web portal sẽ tạm khóa.",
    author: "Nguyễn Văn An (IT Leader)",
    createdAt: "2026-07-03T02:30:00.000Z",
    updatedAt: "2026-07-03T02:30:00.000Z"
  },
  {
    id: "ann-3",
    title: "Ngừng hỗ trợ kênh Tổng đài cũ đầu số 190012xx",
    category: "Tổng đài CSKH",
    status: "stopped",
    content: "Đã hoàn tất chuyển đổi 100% cuộc gọi CSKH sang đầu số Hotline miễn cước mới 1800xxxx. Kênh tổng đài cũ 190012xx đã chính thức được ngắt kết nối và không tiếp nhận cuộc gọi kể từ ngày 01/07. Đề nghị các bạn khi liên hệ đối tác chỉ cung cấp Hotline mới.",
    author: "Lê Minh Cường (CS Lead)",
    createdAt: "2026-06-25T08:00:00.000Z",
    updatedAt: "2026-07-01T00:01:00.000Z"
  }
];

// Xuất các biến ra phạm vi toàn cục
window.defaultCategories = defaultCategories;
window.defaultProcesses = defaultProcesses;
window.defaultAnnouncements = defaultAnnouncements;

const defaultAccounts = [
  {
    id: "acc-admin",
    name: "Quản trị viên CX",
    role: "admin",
    status: "active",
    passcode: "1234",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z"
  },
  {
    id: "acc-editor",
    name: "Biên tập viên CX",
    role: "editor",
    status: "active",
    passcode: "1111",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z"
  },
  {
    id: "acc-viewer",
    name: "Thành viên CX",
    role: "viewer",
    status: "active",
    passcode: "0000",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z"
  }
];
window.defaultAccounts = defaultAccounts;
