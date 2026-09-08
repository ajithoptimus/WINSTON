'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Pause, RotateCcw, CheckCircle2, Square, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SystemsFocus } from '@/lib/directives';
import { playTickSound, playCompletionChime } from '@/lib/audio';

interface SystemsSprintCardProps {
  systems: SystemsFocus;
  completed: boolean;
  onToggleComplete: () => void;
}

export default function SystemsSprintCard({ systems, completed, onToggleComplete }: SystemsSprintCardProps) {
  const TOTAL_SECONDS = systems.durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [checkedTasks, setCheckedTasks] = useState<boolean[]>(systems.tasks.map(() => false));

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playCompletionChime();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            return 0;
          }
          playTickSound();
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_SECONDS);
  };

  const toggleTask = (index: number) => {
    const updated = [...checkedTasks];
    updated[index] = !updated[index];
    setCheckedTasks(updated);
  };

  const handleCompleteClick = () => {
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
          : 'glass-surface border-cyan-500/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">EVENING • DIRECTIVE 04</span>
            </div>
            <h2 className="font-semibold text-base text-white tracking-wide">{systems.title}</h2>
          </div>
        </div>

        <button
          onClick={handleCompleteClick}
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

      {/* Stopwatch Timer Display */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-cyan-300">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-[10px] font-mono text-gray-400">15-MIN LOW-LEVEL SPRINT</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-400 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Checklist */}
      <div className="space-y-2">
        {systems.tasks.map((task, idx) => (
          <div
            key={idx}
            onClick={() => toggleTask(idx)}
            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-start gap-2.5 cursor-pointer transition"
          >
            {checkedTasks[idx] ? (
              <CheckSquare className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            )}
            <span className={`text-xs ${checkedTasks[idx] ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
              {task}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
