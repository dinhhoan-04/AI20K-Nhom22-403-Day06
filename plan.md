Dưới đây là file **PLAN.md** cho dự án In-Car AI Assistant VinFast (bản MVP → Demo → Startup ready).

---

# 📄 VINFAST IN-CAR AI ASSISTANT – PROJECT PLAN

## 🎯 Vision

Xây dựng **AI trợ lý cá nhân trên xe điện VinFast** có thể:

* Trò chuyện tự nhiên với người trong xe
* Hiểu yêu cầu và gọi tool để thao tác xe
* Truy xuất trạng thái xe realtime
* Trở thành nền tảng Smart Cockpit AI

---

# 🧭 PRODUCT SCOPE (MVP)

## Core capabilities

Agent có thể thực hiện các nhiệm vụ sau:

### 1️⃣ Conversational AI

* Trò chuyện tự nhiên với người dùng
* Hỏi – đáp – gợi ý
* Hiểu intent liên quan đến xe

### 2️⃣ Vehicle status assistant

Agent có thể kiểm tra:

* 🔋 Battery level
* 🛞 Tire pressure
* ⚡ Charging station nearby

### 3️⃣ Vehicle control assistant

Agent có thể thao tác:

* ❄️ Turn on AC (tool mock)
* (Future: open trunk, lock car, seat mode…)

---

# 🧠 SYSTEM ARCHITECTURE

## High level architecture

```
User (Voice/Text)
        ↓
 Speech To Text (Whisper)
        ↓
    LLM Agent (Brain)
        ↓
   Tool Decision Layer
        ↓
 Vehicle Tools / APIs
        ↓
 Natural Response
        ↓
 Text To Speech (TTS)
```

Agent = **Reasoning + Tool calling**

---

# 🤖 AGENT DESIGN

## Agent persona (System Prompt)

```
Bạn là trợ lý AI trên xe VinFast.
Bạn nói chuyện thân thiện, ngắn gọn, hữu ích.

Bạn có thể:
- kiểm tra tình trạng xe bằng tools
- điều khiển chức năng xe bằng tools
- gợi ý trạm sạc khi pin thấp

Nếu user yêu cầu thao tác xe → phải gọi tool.
Không được tự bịa trạng thái xe.
```

---

# 🔧 TOOL DESIGN (MOCK VEHICLE API)

## Tool list

| Tool                  | Purpose         |
| --------------------- | --------------- |
| get_battery_status    | Lấy % pin       |
| get_tire_pressure     | Lấy áp suất lốp |
| find_charging_station | Tìm trạm sạc    |
| turn_on_ac            | Bật điều hoà    |

## Tool spec

### get_battery_status

```python
@tool
def get_battery_status():
    """Return vehicle battery percentage"""
    return "Pin còn 42%"
```

### get_tire_pressure

```python
@tool
def get_tire_pressure():
    """Return tire pressure status"""
    return "Áp suất lốp ổn định"
```

### find_charging_station

```python
@tool
def find_charging_station():
    """Find nearest charging station"""
    return "Trạm sạc VinFast cách 3km"
```

### turn_on_ac

```python
@tool
def turn_on_ac():
    """Turn on AC"""
    return "Đã bật điều hoà"
```

---

# 💬 EXPECTED USER FLOWS

## Flow 1 — Ask battery

User:

> Xe còn bao nhiêu pin?

Agent:

1. Detect intent → vehicle status
2. Call get_battery_status
3. Respond naturally

Response:

> Pin xe còn 42%. Bạn vẫn có thể đi khoảng 120km.

---

## Flow 2 — Turn on AC

User:

> Bật điều hoà giúp tôi

Agent:

1. Detect vehicle control intent
2. Call turn_on_ac
3. Confirm action

Response:

> Điều hoà đã được bật.

---

## Flow 3 — Charging suggestion

User:

> Pin yếu không?

Agent:

1. Call get_battery_status
2. Reason about battery level
3. Suggest charging station

Response:

> Pin còn 42%. Tôi có thể tìm trạm sạc gần nhất cho bạn.

---

# 🧱 TECH STACK

## AI & Agent

* LLM: GPT / Claude
* Framework: LangChain or LangGraph

## Voice layer

* Speech to text: Whisper
* Text to speech: ElevenLabs / Azure TTS

## Backend

* Python FastAPI
* Tool layer (mock vehicle API)

## Demo UI

* Streamlit / simple dashboard

---

# 🗺️ DEVELOPMENT ROADMAP

## 🟢 PHASE 1 — Text Agent (Week 1)

**Goal:** chạy agent trên terminal

Tasks:

* Setup LangChain agent
* Implement tools
* Create system prompt
* Test conversation flows

Deliverable:

* Chat terminal demo
* Tool calling working

---

## 🟡 PHASE 2 — Voice Agent (Week 2)

**Goal:** nói chuyện bằng giọng nói

Tasks:

* Integrate Whisper STT
* Integrate TTS
* Build voice loop

Deliverable:

* Voice assistant demo
* Speak ↔ reply loop

---

## 🔵 PHASE 3 — Smart Cockpit Demo (Week 3)

**Goal:** demo giống màn hình xe

Tasks:

* Build dashboard UI mockup
* Add buttons + voice trigger
* Show vehicle status UI

Deliverable:

* Demo video prototype
* Pitch-ready product

---

# 📈 FUTURE EXPANSION

## Vehicle integration

* Real CAN bus integration
* Real vehicle telemetry

## Advanced capabilities

* Route planning
* Driver mood detection
* Smart trip assistant
* Smart home integration

---

# 🚀 FINAL GOAL

Tạo nền tảng:

> **VinFast Smart Cockpit AI Platform**

Có thể mở rộng thành:

* SDK cho xe
* B2B automotive AI
* Smart mobility ecosystem

---

**Status:** Ready to build MVP 💪