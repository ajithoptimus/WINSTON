'use client';

import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import ConnectPCModal from './ConnectPCModal';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isPCModalOpen, setIsPCModalOpen] = useState(false);
  const [desktopOnline, setDesktopOnline] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll heartbeat
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/pc/heartbeat');
        if (res.ok) {
          const data = (await res.json()) as { online: boolean; lastHeartbeat: string | null };
          setDesktopOnline(data.online);
          setLastHeartbeat(data.lastHeartbeat);
        }
      } catch {
        setDesktopOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3 bg-[#040711]/90 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/20">
              <div className="w-full h-full bg-[#040711] rounded-[7px] flex items-center justify-center font-extrabold text-[#f0f0f0] text-sm">
                W
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm tracking-wider text-[#f0f0f0] blick-gradient-text">
                  WINSTON
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/[0.05] text-[#e38b6c] border border-[#e38b6c]/30">
                  PERSONAL AI
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#a0a0a0] flex items-center gap-1.5">
                <span>{currentDate}</span>
                <span className="text-[#444444]">•</span>
                <span className="text-[#e38b6c] font-bold">{currentTime}</span>
              </p>
            </div>
          </div>

          {/* Quick Connect PC Button in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPCModalOpen(true)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-2 transition ${
                desktopOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold hidden sm:inline">
                {desktopOnline ? 'Desktop Linked' : 'Connect PC'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  desktopOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Connect PC Modal */}
      <ConnectPCModal
        isOpen={isPCModalOpen}
        onClose={() => setIsPCModalOpen(false)}
        onInspectScreen={async () => {
          // Handled via chat API or trigger
          try {
            await fetch('/api/pc/capture', { method: 'POST' });
          } catch (e) {
            console.error(e);
          }
        }}
        isCapturing={false}
        desktopOnline={desktopOnline}
        lastHeartbeat={lastHeartbeat}
      />
    </>
  );
}
