import { motion } from 'framer-motion'
import {
  Battery,
  BatteryCharging,
  Gauge,
  Snowflake,
  MapPin,
  Zap,
  ThermometerSun,
  CircleDot,
} from 'lucide-react'

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

interface Props {
  vehicleState: VehicleState
  loading: boolean
}

/* ── helpers ── */

function batteryColor(pct: number) {
  if (pct > 60) return 'text-vinfast-green'
  if (pct > 20) return 'text-vinfast-amber'
  return 'text-vinfast-red'
}

function batteryGradient(pct: number) {
  if (pct > 60) return 'from-emerald-500 to-green-400'
  if (pct > 20) return 'from-amber-500 to-yellow-400'
  return 'from-red-500 to-rose-400'
}

function tireStatus(val: number) {
  if (val >= 2.0 && val <= 2.5) return { color: 'text-vinfast-green', label: 'OK' }
  if (val < 2.0) return { color: 'text-vinfast-red', label: 'Thấp' }
  return { color: 'text-vinfast-amber', label: 'Cao' }
}

/* ── Animated card wrapper ── */
const Card = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`glass-card p-5 ${className}`}
  >
    {children}
  </motion.div>
)

/* ── Main component ── */
export default function Dashboard({ vehicleState, loading }: Props) {
  const { battery_percent, estimated_range_km, tire_pressure, ac_on, ac_temperature } = vehicleState

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-vinfast-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-vinfast-text-muted text-sm">Đang kết nối xe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-3">

      {/* ─── Battery Card (top-left, large) ─── */}
      <Card delay={0.1} className="row-span-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vinfast-accent/10 flex items-center justify-center">
              <Battery className={`w-4 h-4 ${batteryColor(battery_percent)}`} />
            </div>
            <span className="text-sm font-medium text-vinfast-text-muted">Pin xe</span>
          </div>
          {battery_percent < 20 && (
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <BatteryCharging className="w-3 h-3" /> Cần sạc
            </span>
          )}
        </div>

        {/* Big percentage */}
        <div className="flex items-end gap-2">
          <motion.span
            key={battery_percent}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-extrabold tabular-nums ${batteryColor(battery_percent)}`}
          >
            {battery_percent}
          </motion.span>
          <span className="text-lg text-vinfast-text-muted font-medium mb-1">%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-vinfast-darker rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${battery_percent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${batteryGradient(battery_percent)}`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-vinfast-text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> ~{estimated_range_km} km còn lại
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" /> 150kW
          </span>
        </div>
      </Card>

      {/* ─── AC Card (top-right) ─── */}
      <Card delay={0.2} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ac_on ? 'bg-cyan-500/15' : 'bg-vinfast-border/30'}`}>
              <Snowflake className={`w-4 h-4 ${ac_on ? 'text-vinfast-cyan' : 'text-vinfast-text-muted'}`} />
            </div>
            <span className="text-sm font-medium text-vinfast-text-muted">Điều hoà</span>
          </div>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${ac_on ? 'bg-cyan-500/20 text-cyan-400' : 'bg-vinfast-border/50 text-vinfast-text-muted'}`}>
            {ac_on ? 'Đang bật' : 'Tắt'}
          </span>
        </div>

        <div className="flex items-end gap-2">
          <motion.span
            key={`${ac_on}-${ac_temperature}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-extrabold tabular-nums ${ac_on ? 'text-vinfast-cyan' : 'text-vinfast-text-muted'}`}
          >
            {ac_temperature}
          </motion.span>
          <span className="text-lg text-vinfast-text-muted font-medium mb-1">°C</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-vinfast-text-muted">
          <ThermometerSun className="w-3.5 h-3.5" />
          <span>{ac_on ? `Đang làm mát cabin` : 'Yêu cầu AI bật điều hoà'}</span>
        </div>
      </Card>

      {/* ─── Tire Pressure Card (bottom, spans full width) ─── */}
      <Card delay={0.3} className="col-span-2 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-vinfast-accent/10 flex items-center justify-center">
            <Gauge className="w-4 h-4 text-vinfast-accent" />
          </div>
          <span className="text-sm font-medium text-vinfast-text-muted">Áp suất lốp</span>
        </div>

        {/* Visual tire layout */}
        <div className="relative flex items-center justify-center py-2">
          {/* Car body silhouette */}
          <div className="relative w-48 h-28">
            {/* Car outline */}
            <div className="absolute inset-x-6 inset-y-2 rounded-2xl border-2 border-vinfast-border/40 bg-vinfast-darker/50" />

            {/* Front label */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-vinfast-text-muted/50 uppercase tracking-wider">Trước</div>

            {/* Wheels — corners */}
            {[
              { pos: 'top-0 left-0', label: 'TT', val: tire_pressure.front_left },
              { pos: 'top-0 right-0', label: 'TP', val: tire_pressure.front_right },
              { pos: 'bottom-0 left-0', label: 'ST', val: tire_pressure.rear_left },
              { pos: 'bottom-0 right-0', label: 'SP', val: tire_pressure.rear_right },
            ].map(({ pos, label, val }) => {
              const status = tireStatus(val)
              return (
                <motion.div
                  key={label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className={`absolute ${pos} flex flex-col items-center gap-0.5`}
                >
                  <div className={`w-11 h-11 rounded-xl border-2 flex flex-col items-center justify-center gap-0 ${status.color === 'text-vinfast-green' ? 'border-vinfast-green/30 bg-vinfast-green/5' : status.color === 'text-vinfast-red' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                    <CircleDot className={`w-3 h-3 ${status.color}`} />
                    <span className={`text-xs font-bold tabular-nums ${status.color}`}>{val}</span>
                  </div>
                  <span className="text-[9px] text-vinfast-text-muted">{label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="text-center text-[11px] text-vinfast-text-muted">
          Đơn vị: bar · Khuyến nghị: 2.0 – 2.5 bar
        </div>
      </Card>

      {/* ─── Quick Info Row ─── */}
      <Card delay={0.4} className="col-span-2 flex items-center justify-between text-sm py-3 px-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-vinfast-green animate-pulse-glow" />
            <span className="text-vinfast-text-muted text-xs">Xe đang hoạt động</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-vinfast-accent animate-pulse-glow" />
            <span className="text-vinfast-text-muted text-xs">AI kết nối</span>
          </div>
        </div>
        <span className="text-[10px] text-vinfast-text-muted/50 tabular-nums">VinFast VF 8 — 2025</span>
      </Card>
    </div>
  )
}
