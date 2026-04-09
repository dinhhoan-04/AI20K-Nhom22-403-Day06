# SPEC-FINAL: AI IN-CAR CONTROL AGENT

## 1. AI Product Canvas

| Trụ cột | Chi tiết chiến lược |
| :--- | :--- |
| **Value Proposition** | Chuyển đổi từ việc điều khiển thủ công sang "ra lệnh giọng nói. Người lái không cần tìm nút bấm, chỉ cần nêu ý định (Intent). |
| **User Trust** | **Explainability:** AI phản hồi trạng thái thực hiện ("Đang hạ cửa sổ bên phải..."). **Safety Guardrails:** Các lệnh can thiệp sâu (phanh, lái) bị chặn bởi hệ thống kiểm soát cơ học độc lập. |
| **Technical Feasibility** | Sử dụng LLM kết hợp Function Calling để mapping với API xe (CAN bus). Độ trễ mục tiêu < 500ms. |
| **Learning Signal** | Thu thập các lần người dùng nhấn "Hủy" hoặc tự tay chỉnh lại nút vật lý sau khi AI thực hiện. Đo lường tỷ lệ chấp nhận (Acceptance Rate) của các gợi ý chủ động. |

---

## 2. User Stories (4 Paths)

* **Happy Path (Thành công mỹ mãn):**
    * *User:* "Trời bắt đầu mưa to rồi."
    * *AI Agent:* Tự động kích hoạt gạt mưa tốc độ cao, đóng cửa sổ trời và chuyển chế độ lái sang 'Slippery'.
* **Low-confidence Path (Độ tự tin thấp):**
    * *User:* "Chỉnh cho tôi cái ghế."
    * *AI Agent:* (Nhận diện có nhiều profile ghế) "Bạn muốn chỉnh ghế lái về profile 1 hay profile 2"
* **Failure Path (Thất bại/Không hiểu):**
    * *User:* "Làm cho xe trông ngầu hơn đi."
    * *AI Agent:* "Tôi chưa hiểu ý bạn. Bạn muốn thay đổi màu đèn nội thất (Ambient Light)?"
* **Correction Path (Hiệu chỉnh):**
    * *User:* "Bật điều hòa 20 độ."
    * *AI Agent:* Đang chỉnh 20 độ.
    * *User:* "À không, lạnh quá, 24 độ đi."
    * *AI Agent:* Ngay lập tức ghi đè và điều chỉnh lên 24 độ.

---

## 3. Eval Metrics & Thresholds

| Metric | Mô tả | Loại | Ngưỡng đạt (Threshold) |
| :--- | :--- | :--- | :--- |
| **Intent Accuracy** | Tỷ lệ hiểu đúng ý định người dùng trong bối cảnh tiếng ồn cabin lớn. | **Precision** | > 95% |
| **Task Success Rate** | Tỷ lệ thực hiện thành công các API call sau khi hiểu intent. | **Recall** | > 98% |
| **Intervention Rate** | Số lần người dùng phải can thiệp thủ công bằng tay sau khi ra lệnh. | **Red Flag** | < 2% (Nếu >5%: Cần roll-back) |

---

## 4. Top 3 Failure Modes

1.  **Hallucination trong thực thi lệnh (Ảo giác):**
    * *Trigger:* Tiếng ồn từ nhạc hoặc gió lớn khiến AI nghe nhầm "Mở cửa sổ" thành "Mở cửa xe" khi đang chạy.
    * *Hậu quả:* Nguy hiểm tính mạng.
    * *Mitigation:* Thiết lập danh sách **"Locked Actions"** – các lệnh liên quan đến an toàn hệ thống phải có xác nhận voice hoặc bị khóa khi tốc độ xe > 5km/h.
2.  **Mất kết nối Cloud (Latency/Offline):**
    * *Trigger:* Xe đi vào hầm hoặc vùng sóng yếu.
    * *Hậu quả:* AI đứng hình, gây ức chế cho người dùng.
    * *Mitigation:* Sử dụng mô hình **Hybrid AI** (SLM chạy Local cho các lệnh điều khiển xe cơ bản; Cloud chỉ cho giải trí/tìm kiếm).
3.  **Conflict lệnh từ hành khách:**
    * *Trigger:* Trẻ em ở ghế sau ra lệnh linh tinh.
    * *Hậu quả:* AI thực hiện sai lệch ý chí của chủ xe.
    * *Mitigation:* Sử dụng công nghệ **Voice Biometrics** & **Sound Localization** để chỉ ưu tiên lệnh từ vị trí ghế lái.

---

## 5. ROI & Kill Criteria

* **Conservative (Thận trọng):** Giảm 20% số vụ va chạm do xao nhãng bấm nút; tăng điểm CSAT (hài lòng khách hàng) thêm 10%.
* **Realistic (Thực tế):** Trở thành tính năng "Must-have" giúp bán gói Premium Data/Service; tiết kiệm 15% năng lượng pin nhờ AI tối ưu điều hòa/nhiệt độ theo ngữ cảnh.
* **Optimistic (Lạc quan):** Xây dựng hệ sinh thái App Voice thứ 3; dữ liệu hành vi người dùng giúp bán chéo (cross-sell) bảo hiểm và dịch vụ bảo trì định kỳ.
* **Kill Criteria:** Dự án sẽ bị hủy nếu chi phí hạ tầng Cloud trên mỗi đầu xe vượt quá 2 USD/tháng hoặc tỷ lệ lỗi nghiêm trọng (Safety-related) không giảm xuống dưới 0.1% sau 6 tháng Beta.

---

## 6. Mini AI Spec

* **Tên dự án:** DriveMind AI Agent.
* **Mục tiêu:** Loại bỏ menu cảm ứng đa lớp, thay bằng trải nghiệm hội thoại không chạm.
* **Công nghệ lõi:**
    * *Input:* Multi-modal (Giọng nói).
    * *Processing:* LLM router để phân loại lệnh (Điều khiển xe vs. Giải trí).
    * *Output:* Thực thi qua CAN bus và phản hồi qua loa/màn hình HUD.
* **Rủi ro cao nhất:** Thực hiện nhầm các lệnh an toàn.