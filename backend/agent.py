"""
VinFast In-Car AI Assistant — Agent Logic

Sử dụng OpenAI Chat Completions API với Function Calling (tools) để
agent tự quyết định khi nào cần gọi vehicle tool.
"""

import json
import os
from openai import OpenAI
from dotenv import load_dotenv
from tools import TOOL_FUNCTIONS

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """Bạn là trợ lý AI trên xe VinFast.
Bạn nói chuyện thân thiện, ngắn gọn, hữu ích. Trả lời bằng tiếng Việt.

Bạn có thể:
- Kiểm tra tình trạng xe bằng tools (pin, áp suất lốp)
- Điều khiển chức năng xe bằng tools (bật điều hoà)
- Gợi ý trạm sạc gần nhất khi pin thấp

Quy tắc:
- Nếu user hỏi về trạng thái xe → PHẢI gọi tool tương ứng.
- Nếu user yêu cầu thao tác xe → PHẢI gọi tool.
- Không được tự bịa trạng thái xe.
- Sau khi nhận kết quả tool, trả lời tự nhiên dựa trên dữ liệu thật.
- Nếu pin dưới 20%, chủ động gợi ý tìm trạm sạc.
"""

# ---------------------------------------------------------------------------
# OpenAI tool definitions (JSON schema cho Function Calling)
# ---------------------------------------------------------------------------

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "get_battery_status",
            "description": "Lấy phần trăm pin xe và quãng đường ước tính còn lại.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_tire_pressure",
            "description": "Lấy áp suất lốp của cả 4 bánh xe.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_charging_station",
            "description": "Tìm trạm sạc VinFast gần nhất.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "turn_on_ac",
            "description": "Bật điều hoà xe ở nhiệt độ chỉ định.",
            "parameters": {
                "type": "object",
                "properties": {
                    "temperature": {
                        "type": "integer",
                        "description": "Nhiệt độ điều hoà (°C), mặc định 24.",
                    }
                },
                "required": [],
            },
        },
    },
]


# ---------------------------------------------------------------------------
# Agent conversation handler
# ---------------------------------------------------------------------------

async def chat_with_agent(messages: list[dict]) -> dict:
    """
    Nhận list messages (OpenAI format) từ client,
    gọi OpenAI API, xử lý tool calls nếu có, trả về response cuối cùng.

    Returns:
        {
            "reply": str,           # Phản hồi text cuối cùng
            "tool_calls": list,     # Danh sách tools đã gọi (để frontend hiển thị)
        }
    """

    # Thêm system prompt vào đầu messages nếu chưa có
    if not messages or messages[0].get("role") != "system":
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    tool_call_log = []

    # Vòng lặp xử lý tool calling (tối đa 5 lần để tránh infinite loop)
    for _ in range(5):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
        )

        assistant_message = response.choices[0].message

        # Nếu model không gọi tool → trả về text phản hồi
        if not assistant_message.tool_calls:
            return {
                "reply": assistant_message.content or "",
                "tool_calls": tool_call_log,
            }

        # Nếu model gọi tool → thực thi và đưa kết quả vào messages
        # Serialize chỉ các field cần thiết để tránh lỗi API
        assistant_msg_dict = {
            "role": "assistant",
            "content": assistant_message.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in assistant_message.tool_calls
            ],
        }
        messages.append(assistant_msg_dict)

        for tool_call in assistant_message.tool_calls:
            fn_name = tool_call.function.name
            fn_args_str = tool_call.function.arguments

            # Parse arguments
            try:
                fn_args = json.loads(fn_args_str) if fn_args_str else {}
            except json.JSONDecodeError:
                fn_args = {}

            # Execute tool
            tool_fn = TOOL_FUNCTIONS.get(fn_name)
            if tool_fn:
                result = tool_fn(**fn_args)
            else:
                result = json.dumps({"error": f"Tool '{fn_name}' not found"})

            tool_call_log.append({
                "tool": fn_name,
                "args": fn_args,
                "result": json.loads(result),
            })

            # Append tool result message
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })

    # Fallback nếu vượt quá limit vòng lặp
    return {
        "reply": "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại.",
        "tool_calls": tool_call_log,
    }
