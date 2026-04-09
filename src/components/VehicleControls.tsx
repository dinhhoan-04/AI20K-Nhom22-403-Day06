import { Wind, Lock, Unlock, Lightbulb, Fan, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export default function VehicleControls() {
  const [acOn, setAcOn] = useState(false);
  const [locked, setLocked] = useState(true);
  const [lightsOn, setLightsOn] = useState(false);

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-3xl p-6">
      <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-6">Quick Controls</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {/* AC Control */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAcOn(!acOn)}
          className={`relative overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
            acOn 
              ? 'bg-vinfast-blue/20 border border-vinfast-blue/50 text-white' 
              : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          {acOn && (
            <div className="absolute inset-0 bg-gradient-to-t from-vinfast-blue/20 to-transparent opacity-50"></div>
          )}
          <Wind size={28} className={acOn ? 'text-vinfast-cyan animate-pulse' : ''} />
          <span className="text-xs font-medium uppercase tracking-wide">A/C</span>
          {acOn && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-vinfast-cyan shadow-[0_0_8px_#06B6D4]"></div>}
        </motion.button>

        {/* Lock Control */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocked(!locked)}
          className={`relative overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
            locked 
              ? 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
              : 'bg-red-500/10 border border-red-500/30 text-white'
          }`}
        >
          {locked ? <Lock size={28} /> : <Unlock size={28} className="text-red-400" />}
          <span className="text-xs font-medium uppercase tracking-wide">{locked ? 'Locked' : 'Unlocked'}</span>
          {!locked && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]"></div>}
        </motion.button>

        {/* Lights Control */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLightsOn(!lightsOn)}
          className={`relative overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
            lightsOn 
              ? 'bg-yellow-500/10 border border-yellow-500/30 text-white' 
              : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Lightbulb size={28} className={lightsOn ? 'text-yellow-400' : ''} />
          <span className="text-xs font-medium uppercase tracking-wide">Lights</span>
          {lightsOn && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#FACC15]"></div>}
        </motion.button>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fan size={20} className="text-gray-400" />
          <span className="text-sm font-medium">Fan Speed</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div 
              key={level} 
              className={`w-8 h-2 rounded-full ${level <= 2 ? 'bg-vinfast-cyan' : 'bg-white/10'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
