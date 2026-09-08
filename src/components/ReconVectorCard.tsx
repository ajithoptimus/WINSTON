'use client';

import { motion } from 'framer-motion';
import { Eye, CheckCircle2, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReconCue } from '@/lib/directives';
import { playCompletionChime } from '@/lib/audio';

interface ReconVectorCardProps {
  cue: ReconCue;
  completed: boolean;
  onToggleComplete: () => void;
}

export default function ReconVectorCard({ cue, completed, onToggleComplete }: ReconVectorCardProps) {
  const handleAcknowledge = () => {
    if (!completed) {
      playCompletionChime();
      confetti({ particleCount: 45, spread: 50, origin: { y: 0.6 } });
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
          : 'glass-surface border-indigo-500/20 shadow-indigo-500/5'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">DAYTIME • DIRECTIVE 02</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {cue.category}
              </span>
            </div>
            <h2 className="font-semibold text-base text-white tracking-wide">{cue.title}</h2>
          </div>
        </div>

        <button
          onClick={handleAcknowledge}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
            completed
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${completed ? 'text-emerald-400 fill-emerald-400/20' : 'text-indigo-400'}`} />
          <span>{completed ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}</span>
        </button>
      </div>

      {/* Cue Card Body */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-4">
        <p className="text-xs text-gray-200 leading-relaxed font-sans">{cue.cueText}</p>
      </div>

      {/* Focus Points */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
          <Target className="w-3 h-3 text-indigo-400" /> FOCUS VECTORS:
        </span>
        {cue.focusPoints.map((point, i) => (
          <span
            key={i}
            className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 font-mono"
          >
            {point}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
