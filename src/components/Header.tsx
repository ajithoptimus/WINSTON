'use client';

import { useState, useEffect } from 'react';
import { Bell, ShieldCheck, History, Radio } from 'lucide-react';
import AlarmModal from './AlarmModal';

interface HeaderProps {
  onOpenHistory: () => void;
  completedCount: number;
}

export default function Header({ onOpenHistory, completedCount }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-[#07090E]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          
          {/* Brand & Telemetry */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-wider text-white">DIRECTIVE OS</h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {completedCount}/5 ACTIVE
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                <span>{currentDate}</span>
                <span className="text-gray-600">•</span>
                <span className="text-cyan-300 font-bold">{currentTime}</span>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
              title="Debrief Vault Archive"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Vault</span>
            </button>

            <button
              onClick={() => setIsAlarmOpen(true)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-cyan-400 transition relative"
              title="Alarm & Telemetry Settings"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>
          </div>

        </div>
      </header>

      <AlarmModal isOpen={isAlarmOpen} onClose={() => setIsAlarmOpen(false)} />
    </>
  );
}
