'use client';

import { useState, useEffect } from 'react';
import { Bell, History, Radio } from 'lucide-react';
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
      <header className="sticky top-0 z-40 w-full px-6 py-4 bg-[#080808]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          
          {/* Logo & Telemetry */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/20">
              <div className="w-full h-full bg-[#080808] rounded-[7px] flex items-center justify-center font-extrabold text-[#f0f0f0] text-sm">
                D
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-wider text-[#f0f0f0] blick-gradient-text">
                  DIRECTIVE OS
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-[#e38b6c] border border-[#e38b6c]/30">
                  {completedCount}/5 COMPLETED
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#a0a0a0] flex items-center gap-1.5">
                <span>{currentDate}</span>
                <span className="text-[#444444]">•</span>
                <span className="text-[#e38b6c] font-bold">{currentTime}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 btn-blick-secondary flex items-center gap-1.5 text-xs font-mono"
              title="Debrief Vault Archive"
            >
              <History className="w-3.5 h-3.5 text-[#e38b6c]" />
              <span>Vault</span>
            </button>

            <button
              onClick={() => setIsAlarmOpen(true)}
              className="p-2 btn-blick-secondary text-[#a0a0a0] hover:text-white transition relative"
              title="Alarm Telemetry Settings"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e38b6c]" />
            </button>
          </div>

        </div>
      </header>

      <AlarmModal isOpen={isAlarmOpen} onClose={() => setIsAlarmOpen(false)} />
    </>
  );
}
