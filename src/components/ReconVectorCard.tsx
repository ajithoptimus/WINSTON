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
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#e38b6c] uppercase font-bold">DAYTIME • DIRECTIVE 02</span>
              <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-white/[0.05] text-[#a0a0a0] border border-white/10">
                {cue.category}
              </span>
            </div>
            <h2 className="font-bold text-base text-[#f0f0f0] tracking-wide">{cue.title}</h2>
          </div>
        </div>

        <button
          onClick={handleAcknowledge}
          className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-1.5 ${
            completed
              ? 'btn-blick-primary shadow-lg'
              : 'btn-blick-secondary'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{completed ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}</span>
        </button>
      </div>

      {/* Cue Card Body */}
      <div className="p-4 rounded-lg bg-[#080808] border border-[#222222] mb-4">
        <p className="text-xs text-[#f0f0f0] leading-relaxed">{cue.cueText}</p>
      </div>

      {/* Focus Points */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono text-[#666666] flex items-center gap-1">
          <Target className="w-3 h-3 text-[#e38b6c]" /> FOCUS VECTORS:
        </span>
        {cue.focusPoints.map((point, i) => (
          <span
            key={i}
            className="px-2.5 py-1 rounded bg-[#0009] border border-[#333333] text-xs text-[#a0a0a0] font-mono"
          >
            {point}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
