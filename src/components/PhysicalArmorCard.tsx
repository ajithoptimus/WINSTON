'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Play, Pause, RotateCcw, CheckCircle2, Volume2, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, getTodayDateStr, GymLogEntry } from '@/lib/db';
import { playBoxingChime, playCompletionChime } from '@/lib/audio';
import { speakWinstonTimerAlert } from '@/lib/winston';
import HardwareTelemetryWidget from './HardwareTelemetryWidget';

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
  const [liveBpm, setLiveBpm] = useState<number | null>(null);

  // Boxing Interval Timer State
  const WORK_SECONDS = 3 * 60;
  const REST_SECONDS = 1 * 60;
  const TOTAL_ROUNDS = 5;

  const [round, setRound] = useState<number>(1);
  const [isRest, setIsRest] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(WORK_SECONDS);
  const [isBoxingRunning, setIsBoxingRunning] = useState<boolean>(false);

  const boxingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Gym Log State
  const [gymRows, setGymRows] = useState<GymLogEntry[]>([]);

  useEffect(() => {
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

  // Boxing Timer Loop with Winston Tactical Audio Announcer
  useEffect(() => {
    if (isBoxingRunning) {
      boxingTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (!isRest) {
              playBoxingChime(true);
              speakWinstonTimerAlert('rest_start');
              setIsRest(true);
              return REST_SECONDS;
            } else {
              if (round >= TOTAL_ROUNDS) {
                clearInterval(boxingTimerRef.current!);
                setIsBoxingRunning(false);
                playCompletionChime();
                speakWinstonTimerAlert('drill_complete');
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                return 0;
              } else {
                playBoxingChime(false);
                const nextRound = round + 1;
                setRound(nextRound);
                speakWinstonTimerAlert('work_start', nextRound);
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

  const handleStartBoxing = () => {
    if (!isBoxingRunning && timeLeft === WORK_SECONDS) {
      speakWinstonTimerAlert('work_start', round);
    }
    setIsBoxingRunning(!isBoxingRunning);
  };

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
      speakWinstonTimerAlert('drill_complete');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    onToggleComplete();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`p-6 transition-all duration-200 ${
        completed
          ? 'blick-card border-[#e38b6c]/40 bg-[#141211]'
          : 'blick-card'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#0009] border border-[#333333] text-[#e38b6c]">
            {mode === 'boxing' ? <Flame className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#e38b6c] uppercase font-bold">05:30 PM • DIRECTIVE 04</span>
              {liveBpm && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 fill-rose-400 animate-ping" /> {liveBpm} BPM
                </span>
              )}
            </div>
            <h2 className="font-bold text-base text-[#f0f0f0] tracking-wide">Physical Armor</h2>
          </div>
        </div>

        <button
          onClick={handleCompleteSession}
          className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-1.5 ${
            completed
              ? 'btn-blick-primary shadow-lg'
              : 'btn-blick-secondary'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{completed ? 'COMPLETED' : 'COMPLETE'}</span>
        </button>
      </div>

      {/* Smartwatch / BLE Telemetry Hardware Widget */}
      <div className="mb-4">
        <HardwareTelemetryWidget onBpmUpdate={(bpm) => setLiveBpm(bpm)} />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="p-1 rounded-lg bg-[#080808] border border-[#222222] flex items-center mb-4">
        <button
          onClick={() => setMode('boxing')}
          className={`flex-1 py-1.5 rounded text-xs font-mono transition flex items-center justify-center gap-1.5 ${
            mode === 'boxing' ? 'btn-blick-primary' : 'text-[#a0a0a0] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Boxing Interval (3m/1m)
        </button>
        <button
          onClick={() => setMode('gym')}
          className={`flex-1 py-1.5 rounded text-xs font-mono transition flex items-center justify-center gap-1.5 ${
            mode === 'gym' ? 'btn-blick-primary' : 'text-[#a0a0a0] hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" /> Founder Gym Log
        </button>
      </div>

      {/* MODE A: Boxing Interval Timer */}
      {mode === 'boxing' && (
        <div className="p-4 rounded-lg bg-[#080808] border border-[#222222]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#e38b6c]">
              {isRest && isBoxingRunning ? 'REST ROUND' : `WORK ROUND ${round} / ${TOTAL_ROUNDS}`}
            </span>
            <span className="text-[10px] font-mono text-[#666666]">3 MIN WORK / 1 MIN REST</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-4xl font-extrabold font-mono tracking-tight blick-gradient-text">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartBoxing}
                className="p-3 rounded btn-blick-primary"
              >
                {isBoxingRunning ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={resetBoxing}
                className="p-3 rounded btn-blick-secondary text-[#a0a0a0] hover:text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE B: Gym Log */}
      {mode === 'gym' && (
        <div className="space-y-2">
          {gymRows.map((row, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#080808] border border-[#222222] flex flex-wrap items-center justify-between gap-2">
              <input
                type="text"
                value={row.exercise}
                onChange={(e) => handleGymInputChange(idx, 'exercise', e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-xs text-[#f0f0f0] flex-1 min-w-[120px]"
                placeholder="Exercise Name"
              />

              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="flex items-center gap-1 bg-[#0009] px-2 py-1 rounded border border-[#333333]">
                  <span className="text-[10px] text-[#666666]">SETS</span>
                  <input
                    type="number"
                    value={row.sets}
                    onChange={(e) => handleGymInputChange(idx, 'sets', parseInt(e.target.value) || 0)}
                    className="w-8 bg-transparent text-center text-[#e38b6c] outline-none font-bold"
                  />
                </div>

                <div className="flex items-center gap-1 bg-[#0009] px-2 py-1 rounded border border-[#333333]">
                  <span className="text-[10px] text-[#666666]">REPS</span>
                  <input
                    type="number"
                    value={row.reps}
                    onChange={(e) => handleGymInputChange(idx, 'reps', parseInt(e.target.value) || 0)}
                    className="w-8 bg-transparent text-center text-[#e38b6c] outline-none font-bold"
                  />
                </div>

                <div className="flex items-center gap-1 bg-[#0009] px-2 py-1 rounded border border-[#333333]">
                  <span className="text-[10px] text-[#666666]">KG</span>
                  <input
                    type="number"
                    value={row.weight}
                    onChange={(e) => handleGymInputChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-12 bg-transparent text-center text-[#e38b6c] outline-none font-bold"
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
