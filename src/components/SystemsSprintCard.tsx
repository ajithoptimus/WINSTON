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
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#e38b6c] uppercase font-bold">EVENING • DIRECTIVE 04</span>
            </div>
            <h2 className="font-bold text-base text-[#f0f0f0] tracking-wide">{systems.title}</h2>
          </div>
        </div>

        <button
          onClick={handleCompleteClick}
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

      {/* Stopwatch Timer Display */}
      <div className="p-3.5 rounded-lg bg-[#080808] border border-[#222222] flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-2xl font-extrabold font-mono tracking-tight blick-gradient-text">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-[10px] font-mono text-[#666666]">15-MIN SPRINT</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2.5 rounded btn-blick-primary"
          >
            {isRunning ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded btn-blick-secondary text-[#a0a0a0] hover:text-white"
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
            className="p-2.5 rounded-lg bg-[#080808] border border-[#222222] hover:border-[#333333] flex items-start gap-2.5 cursor-pointer transition"
          >
            {checkedTasks[idx] ? (
              <CheckSquare className="w-4 h-4 text-[#e38b6c] mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-[#666666] mt-0.5 shrink-0" />
            )}
            <span className={`text-xs ${checkedTasks[idx] ? 'text-[#666666] line-through' : 'text-[#f0f0f0]'}`}>
              {task}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
