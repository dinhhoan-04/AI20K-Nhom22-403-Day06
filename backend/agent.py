from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from car_state import car_state

@tool
def turn_on_ac() -> str:
    """Bật điều hoà."""
    car_state.state.ac.is_on = True
    return "Đã bật điều hoà."

@tool
def turn_off_ac() -> str:
    """Tắt điều hoà."""
    car_state.state.ac.is_on = False
    return "Đã tắt điều hoà."

@tool
def set_ac_temperature(temperature: float) -> str:
    """Cài đặt nhiệt độ điều hoà (từ 16 đến 30)."""
    car_state.state.ac.temperature = temperature
    return f"Đã đặt nhiệt độ điều hoà ở mức {temperature}°C."

@tool
def get_ac_temperature() -> str:
    """Lấy trạng thái và nhiệt độ điều hoà hiện tại."""
    return f"Trạng thái điều hoà: {'Bật' if car_state.state.ac.is_on else 'Tắt'}, Nhiệt độ: {car_state.state.ac.temperature}°C."

@tool
def get_tire_pressure() -> str:
    """Lấy thông tin áp suất lốp xe. Ngưỡng thấp là dươí 2.1 bar."""
    tires = car_state.state.tires
    status = []
    if tires.front_left < 2.1: status.append(f"trước trái thấp ({tires.front_left} bar)")
    if tires.front_right < 2.1: status.append(f"trước phải thấp ({tires.front_right} bar)")
    if tires.rear_left < 2.1: status.append(f"sau trái thấp ({tires.rear_left} bar)")
    if tires.rear_right < 2.1: status.append(f"sau phải thấp ({tires.rear_right} bar)")
    
    msg = f"Áp suất lốp: Trước trái {tires.front_left}, Trước phải {tires.front_right}, Sau trái {tires.rear_left}, Sau phải {tires.rear_right}."
    if status:
        msg += " Cảnh báo lốp: " + ", ".join(status)
    return msg

@tool
def turn_on_lights() -> str:
    """Bật đèn xe."""
    car_state.state.lights.is_on = True
    return "Đã bật đèn xe."

@tool
def turn_off_lights() -> str:
    """Tắt đèn xe."""
    car_state.state.lights.is_on = False
    return "Đã tắt đèn xe."

@tool
def get_light_status() -> str:
    """Lấy trạng thái đèn xe."""
    return "Đèn xe đang bật." if car_state.state.lights.is_on else "Đèn xe đang tắt."

@tool
def lock_doors() -> str:
    """Khoá cửa xe."""
    car_state.state.doors.is_locked = True
    return "Đã khoá cửa xe."

@tool
def unlock_doors() -> str:
    """Mở khoá cửa xe."""
    car_state.state.doors.is_locked = False
    return "Đã mở khoá cửa xe."

@tool
def get_door_status() -> str:
    """Lấy trạng thái cửa xe."""
    return "Cửa xe đang khoá." if car_state.state.doors.is_locked else "Cửa xe đang mở."

@tool
def web_search(query: str) -> str:
    """Tìm kiếm thông tin tổng quát trên internet để cập nhật kiến thức, tin tức dự báo thời tiết hoặc bất cứ thông tin gì phục vụ cho việc trả lời câu hỏi của người dùng."""
    try:
        from duckduckgo_search import DDGS
        results = DDGS().text(query, max_results=3)
        if not results:
            return "Không tìm thấy kết quả phù hợp."
        
        response = "Kết quả tìm kiếm:\n"
        for i, res in enumerate(results):
            response += f"{i+1}. {res.get('title', '')} - {res.get('body', '')}\n"
        return response
    except Exception as e:
        return f"Lỗi khi tìm kiếm: {str(e)}"

tools = [
    turn_on_ac, turn_off_ac, set_ac_temperature, get_ac_temperature,
    get_tire_pressure, turn_on_lights, turn_off_lights, get_light_status,
    lock_doors, unlock_doors, get_door_status, web_search
]

system_message = """Bạn là trợ lý ảo thông minh trên xe ô tô VinFast.
Bạn đóng vai trò là một người bạn đồng hành, có khả năng điều khiển các hệ thống trên xe cũng như giải đáp mọi thông tin xung quanh.

YÊU CẦU HOẠT ĐỘNG VÀ SỬ DỤNG CÔNG CỤ (TOOLS):
1. QUẢN LÝ XE: Khi người dùng ra lệnh điều khiển hoặc kiểm tra trạng thái xe (điều hoà, đèn, cửa, áp suất lốp), BẮT BUỘC phải gọi các tool chuyên dụng tương ứng. KHÔNG BAO GIỜ tự bịa ra thông số xe nếu chưa gọi tool kiểm tra.
2. TRA CỨU INTERNET: Khi người dùng hỏi về thời tiết, tin tức, địa điểm, sự kiện thời sự, hoặc bất cứ kiến thức cơ bản nào, BẮT BUỘC phải dùng tool `web_search` để lấy thông tin thực tế (real-time) trước khi trả lời.
3. ĐA NHIỆM: Nếu người dùng yêu cầu nhiều việc cùng lúc (VD: "Bật đèn và kiểm tra xem lốp trước bên phải ổn không"), hãy gọi lần lượt tất cả các tool liên quan trước khi trả lời.
4. GIAO TIẾP: Đối với các câu chào hỏi bình thường (small talk), hãy trả lời trực tiếp mà không cần dùng tool.

PHONG CÁCH TRẢ LỜI:
- Xưng hô là bạn và tôi.
- Phải dùng tiếng Việt tự nhiên, ngắn gọn (do có giọng nói TTS đọc lên).
- Giọng văn thân thiện, chuyên nghiệp, sang trọng, mang lại cảm giác an toàn.
- Bạn cần đảm bảo trảm nghiệm tốt của người dùng bằng tính cá nhân hóa dựa trên thông tin cá nhân và sở thích của người dùng được cung cấp
"""

def read_markdown(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

# đọc user preferences
user_preferences = read_markdown("user_preferences.md")

# nối vào system message
system_message = system_message + user_preferences

# Khởi tạo mô hình
# gpt-5.4
# gpt-4o-mini
llm = ChatOpenAI(model="gpt-5.4", temperature=0)

# Bộ nhớ hỗ trợ ghi nhớ ngữ cảnh chat cục bộ
memory = MemorySaver()
config = {"configurable": {"thread_id": "car_session_001"}}

agent_executor = create_react_agent(
    model=llm,
    tools=tools,
    prompt=system_message,
    checkpointer=memory
)

def chat_with_agent(message: str) -> str:
    response = agent_executor.invoke({"messages": [HumanMessage(content=message)]}, config)
    return response["messages"][-1].content
