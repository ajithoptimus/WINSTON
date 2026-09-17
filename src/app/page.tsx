'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import OrbitalCountdownHUD from '@/components/OrbitalCountdownHUD';
import MorningCrucibleCard from '@/components/MorningCrucibleCard';
import CoreMissionCard from '@/components/CoreMissionCard';
import ReconVectorCard from '@/components/ReconVectorCard';
import PhysicalArmorCard from '@/components/PhysicalArmorCard';
import NightlyTakhkirCard from '@/components/NightlyTakhkirCard';
import DebriefHistoryModal from '@/components/DebriefHistoryModal';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import TodoManagerCard from '@/components/TodoManagerCard';
import { db, getTodayDateStr } from '@/lib/db';
import { getDeterministicDirectives } from '@/lib/directives';

export default function Home() {
  const [todayStr, setTodayStr] = useState<string>('');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({
    crucible: false,
    mission: false,
    recon: false,
    physical: false,
    takhkir: false,
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyTrigger, setHistoryTrigger] = useState<number>(0);
  const [showFullProtocol, setShowFullProtocol] = useState<boolean>(false);

  const loadTodayState = useCallback(async () => {
    const today = getTodayDateStr();
    setTodayStr(today);

    // Fetch existing records for today
    const records = await db.directives.where({ dateStr: today }).toArray();
    const map: Record<string, boolean> = {
      crucible: false,
      mission: false,
      recon: false,
      physical: false,
      takhkir: false,
    };

    records.forEach((rec) => {
      map[rec.directiveId] = rec.completed;
    });

    setCompletedMap(map);
  }, []);

  useEffect(() => {
    loadTodayState();
  }, [loadTodayState]);

  const toggleDirective = async (directiveId: 'crucible' | 'mission' | 'recon' | 'physical' | 'takhkir') => {
    const today = getTodayDateStr();
    const newStatus = !completedMap[directiveId];

    const updated = { ...completedMap, [directiveId]: newStatus };
    setCompletedMap(updated);

    const existing = await db.directives.where({ dateStr: today, directiveId }).first();
    if (existing && existing.id) {
      await db.directives.update(existing.id, {
        completed: newStatus,
        completedAt: newStatus ? new Date().toISOString() : undefined,
      });
    } else {
      await db.directives.add({
        dateStr: today,
        directiveId,
        completed: newStatus,
        completedAt: newStatus ? new Date().toISOString() : undefined,
      });
    }
  };

  const { drill, recon } = getDeterministicDirectives(todayStr || '2026-09-11');
  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <div className="relative min-h-screen bg-[#040711] text-white selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      <ServiceWorkerRegister />

      {/* Top Orbital Countdown HUD */}
      <OrbitalCountdownHUD />

      {/* Main Content Viewport */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          onOpenHistory={() => setIsHistoryOpen(true)}
          completedCount={completedCount}
        />

        <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-4 pb-20 space-y-4">
          
          {/* Mode Switcher Banner */}
          <div className="p-3 rounded-xl blick-card flex items-center justify-between gap-3 text-xs border border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e38b6c] animate-pulse" />
              <span className="font-mono text-gray-300 font-bold">WINSTON // FOCUS MODE</span>
            </div>
            <button
              onClick={() => setShowFullProtocol(!showFullProtocol)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/10 transition"
            >
              {showFullProtocol ? 'Hide Protocol Cards' : 'View Protocol Cards'}
            </button>
          </div>

          {/* Primary View: Todo & Notes Matrix */}
          <TodoManagerCard />

          {/* Optional Protocol Cards View */}
          {showFullProtocol && (
            <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-300">
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                DAILY KONGAD PROTOCOL CARDS
              </h3>

              {/* Card 1 [08:00 AM]: Morning Crucible */}
              <MorningCrucibleCard
                drill={drill}
                completed={completedMap.crucible}
                onToggleComplete={() => toggleDirective('crucible')}
              />

              {/* Card 2 [10:00 AM]: Core Mission Directive (Kongad Dynamic Phase Tasks) */}
              <CoreMissionCard
                completed={completedMap.mission}
                onToggleComplete={() => toggleDirective('mission')}
              />

              {/* Card 3 [12:30 PM]: Daily Recon Vector */}
              <ReconVectorCard
                cue={recon}
                completed={completedMap.recon}
                onToggleComplete={() => toggleDirective('recon')}
              />

              {/* Card 4 [05:30 PM]: Physical Armor (Boxing / Gym) */}
              <PhysicalArmorCard
                completed={completedMap.physical}
                onToggleComplete={() => toggleDirective('physical')}
              />

              {/* Card 5 [09:30 PM]: Nightly Takhkir */}
              <NightlyTakhkirCard
                completed={completedMap.takhkir}
                onToggleComplete={() => toggleDirective('takhkir')}
                onRefreshHistory={() => setHistoryTrigger((prev) => prev + 1)}
              />
            </div>
          )}

          {/* Footer Stamp */}
          <footer className="pt-8 text-center text-[11px] font-mono text-gray-500">
            <p>WINSTON // TODO & NOTES MATRIX • SYNTHETIC INTELLIGENCE</p>
            <p className="text-gray-600 mt-1">Inspired by Edmond Kirsch &apos;s Winston AI • JAN 01, 2027 TARGET</p>
          </footer>
        </main>
      </div>

      {/* Debrief Vault Modal */}
      <DebriefHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        refreshTrigger={historyTrigger}
      />
    </div>
  );
}
