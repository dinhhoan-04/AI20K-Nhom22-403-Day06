from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Tải biến môi trường (như OPENAI_API_KEY)
load_dotenv()

from models import ChatRequest, ChatResponse, CarStateModel
from car_state import car_state
from agent import chat_with_agent

app = FastAPI(title="VinFast AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chat Endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response = chat_with_agent(request.message)
    return ChatResponse(response=response)

# State Sync Endpoint
@app.get("/api/car/state", response_model=CarStateModel)
async def get_state():
    return car_state.get_state()

# Manual Controls Endpoints

class TempRequest(BaseModel):
    temperature: float

@app.post("/api/car/ac/on")
async def ac_on():
    car_state.state.ac.is_on = True
    return {"status": "success"}

@app.post("/api/car/ac/off")
async def ac_off():
    car_state.state.ac.is_on = False
    return {"status": "success"}

@app.post("/api/car/ac/set-temperature")
async def ac_set_temp(req: TempRequest):
    car_state.state.ac.temperature = req.temperature
    return {"status": "success"}

@app.get("/api/car/tires")
async def get_tires():
    return car_state.state.tires

class TiresUpdateRequest(BaseModel):
    front_left: float | None = None
    front_right: float | None = None
    rear_left: float | None = None
    rear_right: float | None = None

@app.post("/api/car/tires/mock-update")
async def mock_update_tires(req: TiresUpdateRequest):
    if req.front_left is not None: car_state.state.tires.front_left = req.front_left
    if req.front_right is not None: car_state.state.tires.front_right = req.front_right
    if req.rear_left is not None: car_state.state.tires.rear_left = req.rear_left
    if req.rear_right is not None: car_state.state.tires.rear_right = req.rear_right
    return {"status": "success"}

@app.post("/api/car/lights/on")
async def lights_on():
    car_state.state.lights.is_on = True
    return {"status": "success"}

@app.post("/api/car/lights/off")
async def lights_off():
    car_state.state.lights.is_on = False
    return {"status": "success"}

@app.post("/api/car/doors/lock")
async def doors_lock():
    car_state.state.doors.is_locked = True
    return {"status": "success"}

@app.post("/api/car/doors/unlock")
async def doors_unlock():
    car_state.state.doors.is_locked = False
    return {"status": "success"}
