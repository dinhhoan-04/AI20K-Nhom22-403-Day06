import { BatteryCharging, Gauge, Navigation, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useVehicle } from '../context/VehicleContext';

export default function VehicleStatus() {
  const { state } = useVehicle();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Battery Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dashboard-card border border-dashboard-border rounded-3xl p-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-vinfast-cyan/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-vinfast-cyan/20"></div>
        
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-white/5 rounded-2xl">
            <BatteryCharging className="text-vinfast-cyan" size={24} />
          </div>
          <span className="text-xs font-mono text-vinfast-cyan uppercase tracking-widest bg-vinfast-cyan/10 px-3 py-1 rounded-full">Charging</span>
        </div>
        
        <div className="mt-8">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Battery Level</div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light tracking-tight">{state.battery}</span>
            <span className="text-xl text-gray-500">%</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-vinfast-blue to-vinfast-cyan rounded-full relative" style={{ width: `${state.battery}%` }}>
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-mono text-gray-500">
            <span>Est. Range</span>
            <span className="text-white">{state.range} km</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-rows-2 gap-4">
        {/* Tire Pressure Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dashboard-card border border-dashboard-border rounded-3xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl">
              <Gauge className="text-gray-300" size={20} />
            </div>
            <span className="text-sm text-gray-400 uppercase tracking-wider">Tire Pressure</span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light">{state.tirePressure}</span>
              <span className="text-xs text-gray-500">bar</span>
            </div>
            <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Optimal
            </div>
          </div>
        </motion.div>

        {/* Next Station Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dashboard-card border border-dashboard-border rounded-3xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl">
              <Navigation className="text-gray-300" size={20} />
            </div>
            <span className="text-sm text-gray-400 uppercase tracking-wider">Next Station</span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="text-lg font-medium">VinFast Station</div>
              <div className="text-xs text-gray-500">Landmark 81</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-light text-vinfast-cyan">3.2</div>
              <div className="text-xs text-gray-500">km away</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
