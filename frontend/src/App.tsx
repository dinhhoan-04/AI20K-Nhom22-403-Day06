import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import ChatBox from './components/ChatBox'
import Header from './components/Header'
import axios from 'axios'

interface VehicleState {
  battery_percent: number
  estimated_range_km: number
  tire_pressure: {
    front_left: number
    front_right: number
    rear_left: number
    rear_right: number
  }
  ac_on: boolean
  ac_temperature: number
}

const defaultVehicleState: VehicleState = {
  battery_percent: 0,
  estimated_range_km: 0,
  tire_pressure: { front_left: 0, front_right: 0, rear_left: 0, rear_right: 0 },
  ac_on: false,
  ac_temperature: 24,
}

export default function App() {
  const [vehicleState, setVehicleState] = useState<VehicleState>(defaultVehicleState)
  const [loading, setLoading] = useState(true)

  const fetchVehicleState = useCallback(async () => {
    try {
      const res = await axios.get('/api/vehicle')
      setVehicleState(res.data)
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehicleState()
    const interval = setInterval(fetchVehicleState, 5000)
    return () => clearInterval(interval)
  }, [fetchVehicleState])

  return (
    <div className="h-screen w-screen flex flex-col bg-vinfast-dark overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content — landscape split */}
      <main className="flex-1 flex gap-4 p-4 pt-0 min-h-0">
        {/* Left: Dashboard */}
        <div className="flex-1 min-w-0">
          <Dashboard vehicleState={vehicleState} loading={loading} />
        </div>

        {/* Right: Chat */}
        <div className="w-[420px] shrink-0">
          <ChatBox onToolExecuted={fetchVehicleState} />
        </div>
      </main>
    </div>
  )
}
