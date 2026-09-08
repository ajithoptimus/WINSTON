'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import MorningCrucibleCard from '@/components/MorningCrucibleCard';
import ReconVectorCard from '@/components/ReconVectorCard';
import PhysicalArmorCard from '@/components/PhysicalArmorCard';
import SystemsSprintCard from '@/components/SystemsSprintCard';
import NightlyTakhkirCard from '@/components/NightlyTakhkirCard';
import DebriefHistoryModal from '@/components/DebriefHistoryModal';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { db, getTodayDateStr } from '@/lib/db';
import { getDeterministicDirectives } from '@/lib/directives';

export default function Home() {
  const [todayStr, setTodayStr] = useState<string>('');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({
    crucible: false,
    recon: false,
    physical: false,
    systems: false,
    takhkir: false,
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyTrigger, setHistoryTrigger] = useState<number>(0);

  const loadTodayState = useCallback(async () => {
    const today = getTodayDateStr();
    setTodayStr(today);

    // Fetch existing records for today
    const records = await db.directives.where({ dateStr: today }).toArray();
    const map: Record<string, boolean> = {
      crucible: false,
      recon: false,
      physical: false,
      systems: false,
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

  const toggleDirective = async (directiveId: 'crucible' | 'recon' | 'physical' | 'systems' | 'takhkir') => {
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

  const { drill, recon, systems } = getDeterministicDirectives(todayStr || '2026-09-08');
  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      <ServiceWorkerRegister />

      {/* Drifting Ambient Luminescence Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] animate-orb-1" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-[130px] animate-orb-2" />
        <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full bg-amber-500/15 blur-[140px] animate-orb-3" />
      </div>

      {/* Main Content Viewport */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          onOpenHistory={() => setIsHistoryOpen(true)}
          completedCount={completedCount}
        />

        <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-4 pb-16 space-y-4">
          
          {/* Daily Protocol Status Banner */}
          <div className="p-3.5 rounded-2xl glass-surface flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-gray-300">DAILY PROTOCOL CHECKLIST</span>
            </div>
            <span className="font-mono text-cyan-400 font-bold">
              {completedCount} OF 5 DIRECTIVES COMPLETE
            </span>
          </div>

          {/* Card 1: Morning Crucible */}
          <MorningCrucibleCard
            drill={drill}
            completed={completedMap.crucible}
            onToggleComplete={() => toggleDirective('crucible')}
          />

          {/* Card 2: Daily Recon Vector */}
          <ReconVectorCard
            cue={recon}
            completed={completedMap.recon}
            onToggleComplete={() => toggleDirective('recon')}
          />

          {/* Card 3: Physical Armor */}
          <PhysicalArmorCard
            completed={completedMap.physical}
            onToggleComplete={() => toggleDirective('physical')}
          />

          {/* Card 4: Systems Sprint */}
          <SystemsSprintCard
            systems={systems}
            completed={completedMap.systems}
            onToggleComplete={() => toggleDirective('systems')}
          />

          {/* Card 5: Nightly Takhkir */}
          <NightlyTakhkirCard
            completed={completedMap.takhkir}
            onToggleComplete={() => toggleDirective('takhkir')}
            onRefreshHistory={() => setHistoryTrigger((prev) => prev + 1)}
          />

          {/* Footer Telemetry Stamp */}
          <footer className="pt-6 text-center text-[10px] font-mono text-gray-500">
            <p>DIRECTIVE OS • SINGLE-USER DETERMINISTIC ENGINE v1.0</p>
            <p className="text-gray-600 mt-0.5">IndexedDB Offline-First Architecture • Weightless Anti-Gravity UX</p>
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
