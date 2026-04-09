import React from 'react';
import { Home, Car, Map, Music, Phone, Settings } from 'lucide-react';
import { useStore } from '../store';

const Sidebar = () => {
  const { carState } = useStore();
  
  return (
    <div className="w-[84px] bg-[#0c1015] border-r border-[#1e2329] flex flex-col items-center py-6 justify-between h-full shrink-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
      <div className="w-[42px] h-[42px] bg-vf-cyan/20 rounded-full shadow-[0_0_15px_rgba(0,210,255,0.2)] flex items-center justify-center cursor-pointer mb-10">
        <span className="text-vf-cyan font-bold text-sm tracking-widest">VF</span>
      </div>
      
      <div className="flex flex-col gap-7 flex-1">
        {[Home, Car, Map, Music, Phone, Settings].map((Icon, idx) => (
          <button key={idx} className={`p-3 rounded-2xl transition-all ${idx === 0 ? 'bg-[#182a36] text-vf-cyan border border-vf-cyan/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Icon size={22} className="stroke-[1.5]" />
          </button>
        ))}
      </div>
      
    </div>
  );
};
export default Sidebar;
