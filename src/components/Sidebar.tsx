import { Car, Home, Map, Settings, Music, Phone } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Car, label: 'Vehicle', active: false },
    { icon: Map, label: 'Navigation', active: false },
    { icon: Music, label: 'Media', active: false },
    { icon: Phone, label: 'Phone', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="w-24 h-full bg-dashboard-card border-r border-dashboard-border flex flex-col items-center py-8 gap-8 z-10">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vinfast-cyan to-vinfast-blue flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
        <span className="font-bold text-xl tracking-tighter">VF</span>
      </div>
      
      <div className="flex flex-col gap-6 flex-1">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
              item.active 
                ? 'bg-white/10 text-vinfast-cyan shadow-[inset_0_0_0_1px_rgba(6,182,212,0.3)]' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="text-xs font-mono text-gray-500">24°C</div>
        <div className="text-xs font-mono text-gray-500">14:30</div>
      </div>
    </div>
  );
}
