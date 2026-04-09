from pydantic import BaseModel
from typing import Optional

class ACState(BaseModel):
    is_on: bool = False
    temperature: float = 24.0

class TiresState(BaseModel):
    front_left: float = 2.4
    front_right: float = 2.4
    rear_left: float = 2.4
    rear_right: float = 2.4

class LightsState(BaseModel):
    is_on: bool = False

class DoorsState(BaseModel):
    is_locked: bool = True

class CarStateModel(BaseModel):
    ac: ACState = ACState()
    tires: TiresState = TiresState()
    lights: LightsState = LightsState()
    doors: DoorsState = DoorsState()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
