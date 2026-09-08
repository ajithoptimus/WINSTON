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
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#e38b6c] uppercase font-bold">08:00 AM • DIRECTIVE 01</span>
            </div>
            <h2 className="font-bold text-base text-[#f0f0f0] tracking-wide">{drill.title}</h2>
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

      <p className="text-xs text-[#a0a0a0] mb-4 leading-relaxed">{drill.subtitle}</p>

      {/* Floating Circular Progress & Timer */}
      <div className="p-4 rounded-lg bg-[#080808] border border-[#222222] flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="3"
                className="text-[#222222]"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="url(#blickGrad)"
                strokeWidth="3"
                strokeDasharray={119}
                strokeDashoffset={119 - (119 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="blickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e38b6c" />
                  <stop offset="100%" stopColor="#d23aad" />
                </linearGradient>
              </defs>
            </svg>
            <Sparkles className="w-3.5 h-3.5 text-[#e38b6c] absolute" />
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono tracking-tight blick-gradient-text">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-[10px] font-mono text-[#666666]">COGNITIVE TIMER</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2.5 rounded btn-blick-primary text-xs flex items-center justify-center"
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

      {/* Accordion Instructions */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-[#a0a0a0] hover:text-white transition py-1 font-mono"
        >
          <span>Protocol Instructions ({drill.instructions.length} steps)</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-[#e38b6c]" /> : <ChevronDown className="w-4 h-4 text-[#666666]" />}
        </button>

        {isExpanded && (
          <motion.ol
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-2 pt-2 border-t border-[#222222]"
          >
            {drill.instructions.map((step, idx) => (
              <li key={idx} className="text-xs text-[#a0a0a0] flex items-start gap-2">
                <span className="font-mono text-[#e38b6c] font-bold">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </motion.ol>
        )}
      </div>
    </motion.div>
  );
}
