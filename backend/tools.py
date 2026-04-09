"""
VinFast In-Car AI Assistant — Vehicle Tools (Mock API)

Các mock tools mô phỏng vehicle API thật.
Mỗi tool trả về dữ liệu giả lập trạng thái xe.
"""

import json
import random

# ---------------------------------------------------------------------------
# Vehicle state (in-memory mock)
# ---------------------------------------------------------------------------

_vehicle_state = {
    "battery_percent": 42,
    "estimated_range_km": 120,
    "tire_pressure": {
        "front_left": 2.3,
        "front_right": 2.3,
        "rear_left": 2.2,
        "rear_right": 2.2,
    },
    "ac_on": False,
    "ac_temperature": 24,
}


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

def get_battery_status() -> str:
    """Return vehicle battery percentage and estimated range."""
    pct = _vehicle_state["battery_percent"]
    rng = _vehicle_state["estimated_range_km"]
    return json.dumps({
        "battery_percent": pct,
        "estimated_range_km": rng,
        "status": "low" if pct < 20 else "normal",
    }, ensure_ascii=False)


def get_tire_pressure() -> str:
    """Return tire pressure for all four tires (unit: bar)."""
    tp = _vehicle_state["tire_pressure"]
    warnings = []
    for pos, val in tp.items():
        if val < 2.0:
            warnings.append(pos)
    return json.dumps({
        "tire_pressure": tp,
        "unit": "bar",
        "warnings": warnings,
        "status": "warning" if warnings else "normal",
    }, ensure_ascii=False)


def find_charging_station() -> str:
    """Find nearest VinFast charging stations."""
    stations = [
        {"name": "VinFast Charging - Vinhomes Grand Park", "distance_km": 1.2, "available_slots": 3},
        {"name": "VinFast Charging - AEON Mall", "distance_km": 3.5, "available_slots": 5},
        {"name": "VinFast Charging - Landmark 81", "distance_km": 5.1, "available_slots": 2},
    ]
    return json.dumps({
        "nearest_stations": stations,
        "total_found": len(stations),
    }, ensure_ascii=False)


def turn_on_ac(temperature: int = 24) -> str:
    """Turn on the air conditioning system at the specified temperature."""
    _vehicle_state["ac_on"] = True
    _vehicle_state["ac_temperature"] = temperature
    return json.dumps({
        "ac_on": True,
        "temperature": temperature,
        "message": f"Điều hoà đã được bật ở {temperature}°C",
    }, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Tool registry — maps tool name → callable
# ---------------------------------------------------------------------------

TOOL_FUNCTIONS = {
    "get_battery_status": get_battery_status,
    "get_tire_pressure": get_tire_pressure,
    "find_charging_station": find_charging_station,
    "turn_on_ac": turn_on_ac,
}


def get_vehicle_state_snapshot() -> dict:
    """Return a copy of the current mock vehicle state (used by frontend dashboard)."""
    return dict(_vehicle_state)
