'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, Pause, RotateCcw, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CrucibleDrill } from '@/lib/directives';
import { playTickSound, playCompletionChime } from '@/lib/audio';

interface MorningCrucibleCardProps {
  drill: CrucibleDrill;
  completed: boolean;
  onToggleComplete: () => void;
}

export default function MorningCrucibleCard({ drill, completed, onToggleComplete }: MorningCrucibleCardProps) {
  const TOTAL_SECONDS = drill.durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100;

  const handleCompleteClick = () => {
    if (!completed) {
      playCompletionChime();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    onToggleComplete();
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={`rounded-2xl p-5 transition-all duration-300 ${
        completed
          ? 'glass-surface bg-emerald-950/10 border-emerald-500/20'
          : 'glass-surface-active'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">08:00 AM • DIRECTIVE 01</span>
            </div>
            <h2 className="font-semibold text-base text-white tracking-wide">{drill.title}</h2>
          </div>
        </div>

        <button
          onClick={handleCompleteClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
            completed
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${completed ? 'text-emerald-400 fill-emerald-400/20' : 'text-cyan-400'}`} />
          <span>{completed ? 'COMPLETED' : 'COMPLETE'}</span>
        </button>
      </div>

      <p className="text-xs text-gray-300 mb-4">{drill.subtitle}</p>

      {/* Floating Circular Progress & Timer */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-cyan-400 transition-all duration-300"
                fill="transparent"
              />
            </svg>
            <Sparkles className="w-4 h-4 text-cyan-400 absolute" />
          </div>

          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-cyan-300">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-[10px] font-mono text-gray-400">COGNITIVE COUNTDOWN</p>
          </div>
        </div>

        {/* Controls */}
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

      {/* Accordion Instructions */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 transition py-1"
        >
          <span>Protocol Instructions ({drill.instructions.length} steps)</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <motion.ol
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2 pt-2 border-t border-white/5"
          >
            {drill.instructions.map((step, idx) => (
              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="font-mono text-cyan-400 font-bold">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </motion.ol>
        )}
      </div>
    </motion.div>
  );
}
