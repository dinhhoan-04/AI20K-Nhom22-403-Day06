# Prototype — AI In-Car Control Agent (Smart Cabin)

## Mô tả

Hệ thống trợ lý ảo thế hệ mới giúp người lái điều khiển các chức năng vật lý trong xe thông qua ngôn ngữ tự nhiên. AI không chỉ thực hiện lệnh đơn mà còn có khả năng suy luận đa bước (Reasoning) để điều chỉnh nhiều thiết bị cùng lúc dựa trên ngữ cảnh (ví dụ: "Tôi thấy hơi nóng" -\> tự động hạ nhiệt độ, bật thông gió ghế và đóng rèm cửa).

## Level: Functional Prototype

- **UI:** Xây dựng bằng Antigravity(Dashboard giả lập bảng điều khiển trung tâm xe điện).
- **Core Logic:** Kết nối OpenAI API để thực hiện **Function Calling** (giả lập việc gọi xuống các API điều khiển phần cứng như Điều hòa, Cửa sổ, Chế độ lái).
- **Flow chính:** Người dùng nhập/nói ý định → AI phân tích thông số xe hiện tại → Xuất ra danh sách các hành động điều khiển kèm trạng thái xác nhận.

## Links

  <!-- - **Prototype:** [https://claude.site/artifacts/car-agent-v1](https://www.google.com/search?q=https://claude.site/artifacts/xxx)
  - **Prompt test log:** Xem tại file `prototype/prompt-tests.md` (bao gồm các bộ test case cho tiếng ồn và lệnh phức hợp).
  - **Video demo (backup):** [https://drive.google.com/car-ai-demo](https://drive.google.com/xxx) -->

## Tools

- **UI & Interaction:** Claude Artifacts (ReactJS, javascript, tailwind).
- **AI Brain:** OpenAI GPT 5.4 (Xử lý độ trễ thấp, hỗ trợ Function Calling).
- **Knowledge Base:** System Prompt chứa bộ danh mục API điều khiển xe (Mirror, Seat, HVAC, ADAS settings).
- **Voice (Simulated):** Web Speech API để minh họa khả năng nhận diện giọng nói.

## Phân công

| Thành viên | Phần                                      | Output                                       |
| :--------- | :---------------------------------------- | :------------------------------------------- |
| **Hùng**   | Canvas  + experiment version              | `spec/spec-final.md` phần 1, branch fe/be-for-fe|
| **Khánh**  | User stories 4 paths + Prompt Engineering | `spec/spec-final.md` phần 2                  |
| **Thành**  | Prototype backend                         |  Thư mục `demo/backend/main.py-car_state.py` |
| **Hoàn**   | UI Prototype + Demo Script                | Thư mục `demo/frontend/`                     |
| **Tùng**   | Prototype backend                         | Thư mục `demo/backend/`                      |
