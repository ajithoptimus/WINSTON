'use client';

import Header from '@/components/Header';
import OrbitalCountdownHUD from '@/components/OrbitalCountdownHUD';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import WinstonChat from '@/components/WinstonChat';
import TodoManagerCard from '@/components/TodoManagerCard';
import DailyTracksCard from '@/components/DailyTracksCard';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#040711] text-white selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <ServiceWorkerRegister />

      {/* Persistent Countdown HUD */}
      <OrbitalCountdownHUD />

      {/* Main Viewport */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-4 pb-20 space-y-4">
          {/* Section 1: Winston AI Personal Assistant Chat & Screen Inspector */}
          <WinstonChat />

          {/* Section 2: Todo & Notes Matrix */}
          <TodoManagerCard />

          {/* Section 3: Daily Protocol Tracks (AI Career, Mentalism, Physical) */}
          <DailyTracksCard />

          {/* Footer */}
          <footer className="pt-8 text-center text-[11px] font-mono text-gray-500">
            <p>WINSTON v2 // SYNTHETIC INTELLIGENCE &amp; PROTOCOL ENGINE</p>
            <p className="text-gray-600 mt-1">Inspired by Edmond Kirsch &apos;s Winston AI • JAN 01, 2027 TARGET</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
