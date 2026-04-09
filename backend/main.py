"""
VinFast In-Car AI Assistant — FastAPI Server

Endpoints:
  POST /api/chat         — Gửi tin nhắn đến agent, nhận phản hồi
  GET  /api/vehicle      — Lấy trạng thái xe hiện tại (cho dashboard)
  GET  /health           — Health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import chat_with_agent
from tools import get_vehicle_state_snapshot

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="VinFast In-Car AI Assistant API",
    version="1.0.0",
    description="Backend API cho trợ lý AI trên xe VinFast",
)

# CORS — cho phép Frontend (Vite dev server) gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production nên giới hạn lại
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ToolCallInfo(BaseModel):
    tool: str
    args: dict
    result: dict


class ChatResponse(BaseModel):
    reply: str
    tool_calls: list[ToolCallInfo]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "vinfast-ai-assistant"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Gửi lịch sử hội thoại đến agent.
    Agent sẽ tự quyết định gọi tool nếu cần, rồi trả về phản hồi.
    """
    try:
        # Chuyển đổi sang format OpenAI messages
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        result = await chat_with_agent(messages)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vehicle")
async def vehicle_status():
    """
    Trả về snapshot trạng thái xe hiện tại.
    Frontend dashboard sẽ poll endpoint này để cập nhật UI.
    """
    return get_vehicle_state_snapshot()


# ---------------------------------------------------------------------------
# Run with: uvicorn main:app --reload --port 8000
# ---------------------------------------------------------------------------
