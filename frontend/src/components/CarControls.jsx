import React from 'react';
import { BatteryCharging, Gauge, Navigation, ThermometerSnowflake, Lock, Unlock, Lightbulb } from 'lucide-react';
import { useStore } from '../store';
import { api } from '../api';

const CarControls = () => {
  const { carState, fetchCarState } = useStore();

  const handleToggleAC = async () => {
    await api.toggleAC(!carState.ac.is_on);
    fetchCarState();
  };

  const handleToggleLights = async () => {
    await api.toggleLights(!carState.lights.is_on);
    fetchCarState();
  };

  const handleToggleDoors = async () => {
    await api.toggleDoors(!carState.doors.is_locked);
    fetchCarState();
  };

  return (
    <div className="h-full w-full max-w-5xl flex flex-col gap-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.85fr] gap-6 flex-shrink-0">
        
        {/* Battery Card */}
        <div className="bg-[#12151B] rounded-[24px] p-7 border border-[#1e2329] shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="text-vf-cyan">
                   <BatteryCharging size={26} className="opacity-80" />
                </div>
                <div className="bg-[#0b282c] border border-[#134950] text-[#00D2FF] text-[10px] tracking-widest font-bold px-3 py-1.5 rounded bg-opacity-80 uppercase">
                    CHARGING
                </div>
            </div>
            <div className="mt-12">
                <p className="text-gray-400 text-[11px] font-bold tracking-widest uppercase mb-1">BATTERY LEVEL</p>
                <div className="flex items-baseline gap-1">
                   <h2 className="text-[56px] font-thin leading-none tracking-tight">42</h2>
                   <span className="text-2xl text-gray-400 opacity-60">%</span>
                </div>
                
                <div className="w-full bg-[#181C24] h-1.5 rounded-full mt-8 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-[#00D2FF] w-[42%]"></div>
                </div>
                
                <div className="flex justify-between items-end">
                    <span className="text-[#6B7280] text-xs font-mono tracking-tight">Est. Range</span>
                    <span className="font-mono text-sm tracking-tight text-white font-semibold">120 km</span>
                </div>
            </div>
        </div>

        {/* Right Stack */}
        <div className="flex flex-col gap-6">
            {/* Tire Pressure */}
            <div className="bg-[#12151B] rounded-[24px] p-7 border border-[#1e2329] shadow-lg flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-center w-full">
                   <div className="flex items-center gap-3 text-gray-400">
                       <Gauge size={16} className="opacity-70" />
                       <span className="text-[11px] font-bold tracking-widest uppercase">TIRE PRESSURE</span>
                   </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                    <div className="text-[28px] font-light leading-none">2.4 <span className="text-sm font-semibold text-gray-500 tracking-tight ml-1">bar</span></div>
                    <div className="flex items-center justify-center gap-2 text-[#31C48D] text-xs font-medium bg-[#1e2e26] border border-[#264535] px-3 py-1.5 rounded-full">
                        <div className="w-1.5 h-1.5 bg-[#31C48D] rounded-full shadow-[0_0_8px_#31C48D]"></div> Optimal
                    </div>
                </div>
            </div>

            {/* Next Station */}
            <div className="bg-[#12151B] rounded-[24px] p-7 border border-[#1e2329] shadow-lg flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-3 text-gray-400">
                    <Navigation size={16} className="opacity-70" />
                    <span className="text-[11px] font-bold tracking-widest uppercase">NEXT STATION</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                    <div>
                        <div className="text-lg font-semibold text-white tracking-tight leading-tight mb-1">VinFast Station</div>
                        <div className="text-[13px] text-gray-500 font-medium">Landmark 81</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-light text-vf-cyan leading-none mb-1">3.2</div>
                        <div className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">km away</div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Bottom Row: Quick Controls */}
      <div className="bg-[#12151B] rounded-[24px] p-8 border border-[#1e2329] shadow-lg w-full flex-1">
          <h3 className="text-gray-400 text-[11px] font-bold tracking-widest uppercase mb-6">QUICK CONTROLS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* AC Button */}
              <button 
                  onClick={handleToggleAC}
                  className={`relative p-6 h-[100px] rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border ${carState.ac.is_on ? 'bg-[#18263B] border-[#1f375a]' : 'bg-[#181C21] border-transparent hover:bg-[#1a1f25]'}`}
              >
                  {carState.ac.is_on && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-vf-cyan shadow-[0_0_8px_#00D2FF]"></div>}
                  <ThermometerSnowflake size={24} className={carState.ac.is_on ? 'text-vf-cyan' : 'text-gray-500'} strokeWidth={1.5} />
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className={`text-[11px] font-bold tracking-widest uppercase ${carState.ac.is_on ? 'text-white' : 'text-gray-500'}`}>A/C</span>
                     <span className={`text-[11px] font-semibold ${carState.ac.is_on ? 'text-vf-cyan' : 'text-gray-600'}`}>• {carState.ac.temperature.toFixed(0)}°C</span>
                  </div>
              </button>

              {/* Doors Button */}
              <button 
                  onClick={handleToggleDoors}
                  className={`relative p-6 h-[100px] rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors border ${!carState.doors.is_locked ? 'bg-[#311A1B] border-[#4e2222]' : 'bg-[#181C21] border-transparent hover:bg-[#1a1f25]'}`}
              >
                  {!carState.doors.is_locked && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#f05252] shadow-[0_0_8px_#F05252]"></div>}
                  {carState.doors.is_locked ? 
                      <Lock size={24} className="text-gray-500" strokeWidth={1.5} /> : 
                      <Unlock size={24} className="text-[#f05252]" strokeWidth={1.5} />
                  }
                  <span className={`text-[11px] font-bold tracking-widest uppercase ${!carState.doors.is_locked ? 'text-white' : 'text-gray-500'}`}>{carState.doors.is_locked ? 'LOCKED' : 'UNLOCKED'}</span>
              </button>

              {/* Lights Button */}
              <button 
                  onClick={handleToggleLights}
                  className={`relative p-6 h-[100px] rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors border ${carState.lights.is_on ? 'bg-[#332a13] border-[#4e3c15]' : 'bg-[#181C21] border-transparent hover:bg-[#1a1f25]'}`}
              >
                  {carState.lights.is_on && <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#e3a008] shadow-[0_0_8px_#E3A008]"></div>}
                  <Lightbulb size={26} className={carState.lights.is_on ? 'text-[#e3a008]' : 'text-gray-500'} strokeWidth={1.5} />
                  <span className={`text-[11px] font-bold tracking-widest uppercase ${carState.lights.is_on ? 'text-white' : 'text-gray-500'}`}>LIGHTS</span>
              </button>
          </div>

          <div className="mt-8 flex items-center justify-between pl-2 pb-2">
             <div className="flex items-center gap-3 text-gray-300">
                 <ThermometerSnowflake size={18} className="text-gray-400 stroke-[1.5]"/>
                 <span className="text-[13px] font-medium tracking-wide">Fan Speed</span>
             </div>
             <div className="flex gap-2 w-1/3">
                 <div className="h-1.5 flex-1 bg-vf-cyan rounded-full shadow-[0_0_5px_#00d2ff80]"></div>
                 <div className="h-1.5 flex-1 bg-vf-cyan rounded-full shadow-[0_0_5px_#00d2ff80]"></div>
                 <div className="h-1.5 flex-1 bg-vf-cyan rounded-full shadow-[0_0_5px_#00d2ff80]"></div>
                 <div className="h-1.5 flex-1 bg-[#2d3748] rounded-full"></div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default CarControls;
