'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, ShieldAlert, Zap, Clock } from 'lucide-react';
import { getDaysToLaunch, getCurrentPhase, getLaunchProgressPercent, PhaseInfo } from '@/lib/countdown';

export default function OrbitalCountdownHUD() {
  const [daysRemaining, setDaysRemaining] = useState<number>(113);
  const [phase, setPhase] = useState<PhaseInfo>(getCurrentPhase());
  const [progressPercent, setProgressPercent] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const days = getDaysToLaunch();
      const currentP = getCurrentPhase();
      const pct = getLaunchProgressPercent();

      setDaysRemaining(days);
      setPhase(currentP);
      setProgressPercent(pct);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full px-4 pt-3 pb-3 bg-[#040711]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl"
    >
      <div className="max-w-xl mx-auto space-y-2.5">
        
        {/* Main Countdown Row */}
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0009] border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Rocket className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  T-{daysRemaining} DAYS TO LAUNCH
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <p className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
                <span>TARGET: JAN 01, 2027</span>
                <span className="text-gray-600">•</span>
                <span className="text-amber-400 font-bold">KONGAD PROTOCOL</span>
              </p>
            </div>
          </div>

          {/* Phase Badge */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {phase.badge}
            </span>
            <span className="text-[9px] font-mono text-gray-500 mt-0.5">{progressPercent}% ELAPSED</span>
          </div>
        </div>

        {/* Sub-badge for Mobile & Sleek Horizontal Progress Bar */}
        <div className="space-y-1">
          <div className="flex sm:hidden items-center justify-between text-[10px] font-mono">
            <span className="text-cyan-400 font-bold">{phase.badge}</span>
            <span className="text-gray-400">{progressPercent}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-black/60 border border-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
