import { Car, Sparkles } from 'lucide-react'

export default function Header() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <header className="flex items-center justify-between px-6 py-3">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vinfast-accent to-vinfast-cyan flex items-center justify-center shadow-lg shadow-vinfast-accent/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-vinfast-green rounded-full border-2 border-vinfast-dark animate-pulse-glow" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            VinFast <span className="text-vinfast-accent">AI</span>
          </h1>
          <p className="text-[10px] text-vinfast-text-muted font-medium tracking-widest uppercase">Smart Cockpit</p>
        </div>
      </div>

      {/* Center — Status */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-vinfast-card/50 border border-vinfast-border/50">
        <Sparkles className="w-3.5 h-3.5 text-vinfast-green animate-pulse-glow" />
        <span className="text-xs text-vinfast-text-muted font-medium">AI Agent Online</span>
      </div>

      {/* Right — Clock */}
      <div className="text-right">
        <p className="text-lg font-semibold tabular-nums text-white">{timeStr}</p>
        <p className="text-[10px] text-vinfast-text-muted capitalize">{dateStr}</p>
      </div>
    </header>
  )
}
