'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import WinstonChat from '@/components/WinstonChat';
import TodoManagerCard from '@/components/TodoManagerCard';
import DailyTracksCard from '@/components/DailyTracksCard';
import { MessageSquare, CheckSquare, Target } from 'lucide-react';

export type ActiveTab = 'chat' | 'todos' | 'tracks';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  return (
    <div className="relative min-h-screen bg-[#040711] text-white selection:bg-[#e38b6c]/30 selection:text-white font-sans flex flex-col">
      <ServiceWorkerRegister />

      {/* Sleek Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 pt-3 pb-8 flex flex-col space-y-3">
        {/* Clean Mode Switcher Tabs (ChatGPT / Gemini Style) */}
        <div className="p-1.5 rounded-xl bg-[#111111] border border-white/10 flex items-center justify-between gap-1 shadow-lg">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'blick-gradient-bg text-white shadow-md shadow-[#e38b6c]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WINSTON AI</span>
          </button>

          <button
            onClick={() => setActiveTab('todos')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'todos'
                ? 'blick-gradient-bg text-white shadow-md shadow-[#e38b6c]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>TODO MATRIX</span>
          </button>

          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'tracks'
                ? 'blick-gradient-bg text-white shadow-md shadow-[#e38b6c]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>DAILY DRILLS</span>
          </button>
        </div>

        {/* Dynamic Viewport */}
        <div className="flex-1">
          {activeTab === 'chat' && <WinstonChat />}
          {activeTab === 'todos' && <TodoManagerCard />}
          {activeTab === 'tracks' && <DailyTracksCard />}
        </div>

        {/* Minimal Footer */}
        <footer className="pt-2 text-center text-[10px] font-mono text-gray-500">
          <p>WINSTON // SYNTHETIC TACTICAL INTELLIGENCE • EDMOND KIRSCH PROTOCOL</p>
        </footer>
      </main>
    </div>
  );
}
