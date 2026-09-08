'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Play, Pause, RotateCcw, CheckCircle2, Shield, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, getTodayDateStr, GymLogEntry } from '@/lib/db';
import { playBoxingChime, playCompletionChime } from '@/lib/audio';

interface PhysicalArmorCardProps {
  completed: boolean;
  onToggleComplete: () => void;
}

const DEFAULT_EXERCISES = [
  { exercise: 'Deadlift / Squat', sets: 4, reps: 5, weight: 140 },
  { exercise: 'Overhead Press', sets: 4, reps: 6, weight: 65 },
  { exercise: 'Weighted Pull-up', sets: 3, reps: 8, weight: 20 },
];

export default function PhysicalArmorCard({ completed, onToggleComplete }: PhysicalArmorCardProps) {
  const [mode, setMode] = useState<'boxing' | 'gym'>('boxing');

  // Boxing Interval Timer State
  const WORK_SECONDS = 3 * 60; // 3 min
  const REST_SECONDS = 1 * 60; // 1 min
  const TOTAL_ROUNDS = 5;

  const [round, setRound] = useState<number>(1);
  const [isRest, setIsRest] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(WORK_SECONDS);
  const [isBoxingRunning, setIsBoxingRunning] = useState<boolean>(false);

  const boxingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Gym Log State
  const [gymRows, setGymRows] = useState<GymLogEntry[]>([]);

  useEffect(() => {
    // Load today's gym logs from Dexie
    const today = getTodayDateStr();
    db.gymLogs.where({ dateStr: today }).toArray().then((logs) => {
      if (logs.length > 0) {
        setGymRows(logs);
      } else {
        const defaults = DEFAULT_EXERCISES.map(e => ({ dateStr: today, ...e }));
        setGymRows(defaults);
      }
    }).catch(console.error);
  }, []);

  // Boxing Interval Timer Logic
  useEffect(() => {
    if (isBoxingRunning) {
      boxingTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (!isRest) {
              // Transition to REST
              playBoxingChime(true);
              setIsRest(true);
              return REST_SECONDS;
            } else {
              // Transition to WORK or END
              if (round >= TOTAL_ROUNDS) {
                clearInterval(boxingTimerRef.current!);
                setIsBoxingRunning(false);
                playCompletionChime();
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                return 0;
              } else {
                playBoxingChime(false);
                setRound((r) => r + 1);
                setIsRest(false);
                return WORK_SECONDS;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (boxingTimerRef.current) {
      clearInterval(boxingTimerRef.current);
    }

    return () => {
      if (boxingTimerRef.current) clearInterval(boxingTimerRef.current);
    };
  }, [isBoxingRunning, isRest, round]);

  const resetBoxing = () => {
    setIsBoxingRunning(false);
    setRound(1);
    setIsRest(false);
    setTimeLeft(WORK_SECONDS);
  };

  const handleGymInputChange = (index: number, field: keyof GymLogEntry, value: string | number) => {
    const updated = [...gymRows];
    updated[index] = { ...updated[index], [field]: value };
    setGymRows(updated);

    // Save to Dexie
    const entry = updated[index];
    if (entry.id) {
      db.gymLogs.update(entry.id, entry).catch(console.error);
    } else {
      db.gymLogs.add(entry).then((id) => {
        updated[index].id = id;
        setGymRows([...updated]);
      }).catch(console.error);
    }
  };

  const handleCompleteSession = () => {
    if (!completed) {
      playCompletionChime();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    onToggleComplete();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={`rounded-2xl p-5 transition-all duration-300 ${
        completed
          ? 'glass-surface bg-emerald-950/10 border-emerald-500/20'
          : isRest && isBoxingRunning
          ? 'glass-surface-amber'
          : 'glass-surface-active'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            completed 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : isRest && isBoxingRunning
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            {mode === 'boxing' ? <Flame className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">05:30 PM • DIRECTIVE 03</span>
            </div>
            <h2 className="font-semibold text-base text-white tracking-wide">Physical Armor</h2>
          </div>
        </div>

        <button
          onClick={handleCompleteSession}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
            completed
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${completed ? 'text-emerald-400 fill-emerald-400/20' : 'text-cyan-400'}`} />
          <span>{completed ? 'COMPLETED' : 'COMPLETE'}</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="p-1 rounded-xl bg-black/40 border border-white/5 flex items-center mb-4">
        <button
          onClick={() => setMode('boxing')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-center gap-1.5 ${
            mode === 'boxing' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Boxing Interval (3m/1m)
        </button>
        <button
          onClick={() => setMode('gym')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-center gap-1.5 ${
            mode === 'gym' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" /> Founder Gym Log
        </button>
      </div>

      {/* MODE A: Boxing Interval Timer */}
      {mode === 'boxing' && (
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          isRest && isBoxingRunning
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-black/40 border-white/5'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isRest && isBoxingRunning ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {isRest && isBoxingRunning ? 'REST ROUND' : `WORK ROUND ${round} / ${TOTAL_ROUNDS}`}
            </span>
            <span className="text-[10px] font-mono text-gray-400">3 MIN WORK / 1 MIN REST</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-4xl font-extrabold font-mono tracking-tight text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBoxingRunning(!isBoxingRunning)}
                className={`p-3 rounded-xl border transition ${
                  isRest && isBoxingRunning
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300'
                }`}
              >
                {isBoxingRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={resetBoxing}
                className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-400 hover:text-white transition"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE B: Founder Minimalist Gym Log */}
      {mode === 'gym' && (
        <div className="space-y-2.5">
          {gymRows.map((row, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-2">
              <input
                type="text"
                value={row.exercise}
                onChange={(e) => handleGymInputChange(idx, 'exercise', e.target.value)}
                className="bg-transparent border-none outline-none font-medium text-xs text-white flex-1 min-w-[120px]"
                placeholder="Exercise Name"
              />

              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] text-gray-500">SETS</span>
                  <input
                    type="number"
                    value={row.sets}
                    onChange={(e) => handleGymInputChange(idx, 'sets', parseInt(e.target.value) || 0)}
                    className="w-8 bg-transparent text-center text-cyan-300 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] text-gray-500">REPS</span>
                  <input
                    type="number"
                    value={row.reps}
                    onChange={(e) => handleGymInputChange(idx, 'reps', parseInt(e.target.value) || 0)}
                    className="w-8 bg-transparent text-center text-cyan-300 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-lg border border-white/10">
                  <span className="text-[10px] text-gray-500">KG</span>
                  <input
                    type="number"
                    value={row.weight}
                    onChange={(e) => handleGymInputChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-12 bg-transparent text-center text-cyan-300 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
