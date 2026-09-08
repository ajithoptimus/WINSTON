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
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg.080808]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          
          {/* Blick-Inspired Logo Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-sm shadow-md">
              D
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-wider text-white">DIRECTIVE OS</h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-gray-300 border border-white/15">
                  v1.0 BETA
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                <span>{currentDate}</span>
                <span className="text-gray-600">•</span>
                <span className="text-cyan-400 font-bold">{currentTime}</span>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-xl blick-btn-secondary flex items-center gap-1.5 text-xs font-mono"
              title="Debrief Vault Archive"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Vault</span>
            </button>

            <button
              onClick={() => setIsAlarmOpen(true)}
              className="p-2 rounded-xl blick-btn-secondary text-gray-300 hover:text-cyan-400 transition relative"
              title="Alarm & Telemetry Settings"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
            </button>
          </div>

        </div>
      </header>

      <AlarmModal isOpen={isAlarmOpen} onClose={() => setIsAlarmOpen(false)} />
    </>
  );
}
