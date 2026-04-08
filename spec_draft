# SPEC draft — Nhom01-E403

## Track: XanhSM

## Problem statement
Khách hàng của XanhSM gặp khó khăn và tốn thời gian khi cần xử lý các tác vụ phức tạp (như tìm đồ để quên trên xe, khiếu nại cước phí) hoặc muốn đặt xe với lộ trình nhiều điểm dừng. Hiện tại, khách hàng phải gọi tổng đài (mất 3-5 phút chờ đợi) hoặc thao tác qua nhiều màn hình UI phức tạp trên app. AI có thể nhận diện yêu cầu bằng ngôn ngữ tự nhiên (văn bản/giọng nói), tự động trích xuất thông tin từ chuyến đi gần nhất và đưa ra hướng xử lý hoặc điền sẵn form đặt xe.

## Canvas draft

| | Value | Trust | Feasibility |
|---|-------|-------|-------------|
| Trả lời | Khách hàng bận rộn hoặc đang bối rối vì sự cố. Pain: chờ tổng đài lâu, thao tác app rườm rà. AI giảm 80% thời gian tạo ticket hỗ trợ hoặc đặt xe lộ trình khó. | Nếu AI nhận diện sai địa chỉ đón/trả hoặc nhầm chuyến đi thất lạc đồ → gây bức xúc thêm. Phải có luồng fallback "Gọi nhân viên CSKH" và bắt buộc user "Xác nhận" trước khi action. | Dùng LLM API + Function Calling (kết nối database XanhSM). Latency < 2-3s. Risk: Lỗi nhận diện địa chỉ hẻm/ngách phức tạp, phương ngữ vùng miền (nếu có voice). |

**Auto hay aug?** Augmentation — AI đóng vai trò phân tích Intent (ý định) và tự động trích xuất dữ liệu (điền form, tìm chuyến đi gần nhất), nhưng người dùng (hoặc agent tổng đài) là người duyệt và quyết định cuối cùng.

**Learning signal:** 
Tỷ lệ người dùng phải chỉnh sửa lại thông tin (điểm đón/điểm đến) sau khi AI điền tự động.
Tỷ lệ người dùng bấm nút "Gọi tổng đài viên" ngay sau khi nhận phản hồi từ AI (Abandonment/Fallback rate).
Feedback explicit: Thumbs up/down cho các câu trả lời giải đáp thắc mắc.

## Hướng đi chính
- Prototype: Chatbot tích hợp trực tiếp trên app XanhSM. User nhập text (VD: "Tôi để quên túi xách trên chiếc VF8 lúc 8h sáng nay"). AI xác định Intent (Báo quên đồ) → Extract Entity (Thời gian: 8h, Vật dụng: túi xách) → Map với Trip ID gần nhất → Hiển thị thẻ thông tin tài xế và nút gọi.
- Eval: Intent classification accuracy ≥ 95%. Entity extraction & POI (Point of Interest) mapping ≥ 90%.
- Main failure mode: Người dùng nhập thông tin quá cảm xúc/lan man không rõ ý, hoặc cung cấp sai/thiếu thông tin (VD: "Hôm qua tôi đi xe màu xanh bị rớt đồ") khiến AI không thể khoanh vùng Trip ID chính xác.

## Phân công
- Hùng: Canvas + failure modes
- Thành: User stories 4 paths
- Tùng: Eval metrics + ROI
- Khánh: Prototype research +
- Hoàn: prompt test
