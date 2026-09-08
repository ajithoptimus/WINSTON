'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Save, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, getTodayDateStr, DebriefEntry } from '@/lib/db';
import { playCompletionChime } from '@/lib/audio';

interface NightlyTakhkirCardProps {
  completed: boolean;
  onToggleComplete: () => void;
  onRefreshHistory: () => void;
}

const AVAILABLE_CHIPS = ['Mentalism', 'Recon Vector', 'Physical/Boxing', 'Systems Sprint'];

export default function NightlyTakhkirCard({ completed, onToggleComplete, onRefreshHistory }: NightlyTakhkirCardProps) {
  const [targetObjective, setTargetObjective] = useState('');
  const [groundTruth, setGroundTruth] = useState('');
  const [frictionPoint, setFrictionPoint] = useState('');
  const [singleRuleAdjustment, setSingleRuleAdjustment] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>(['Mentalism', 'Recon Vector', 'Physical/Boxing', 'Systems Sprint']);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleArchiveDebrief = async () => {
    if (!targetObjective && !groundTruth) return;

    const entry: DebriefEntry = {
      dateStr: getTodayDateStr(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      targetObjective,
      groundTruth,
      frictionPoint,
      singleRuleAdjustment,
      trackChips: selectedChips,
    };

    await db.debriefs.add(entry);
    setIsSaved(true);
    playCompletionChime();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });

    if (!completed) {
      onToggleComplete();
    }
    onRefreshHistory();

    setTimeout(() => setIsSaved(false), 3000);
  };

  const exportCurrentAsMarkdown = () => {
    const md = `# OPERATIONAL DEBRIEF (TAKHKIR) - ${getTodayDateStr()}
## Target Objective
${targetObjective || 'N/A'}

## Ground Truth (Ego-Free Reality)
${groundTruth || 'N/A'}

## Point of Friction
${frictionPoint || 'N/A'}

## Single Rule Adjustment
${singleRuleAdjustment || 'N/A'}

## Verified Track Chips
${selectedChips.map(c => `- [x] ${c}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `takhkir-debrief-${getTodayDateStr()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={`rounded-2xl p-5 transition-all duration-300 ${
        completed
          ? 'glass-surface bg-emerald-950/10 border-emerald-500/20'
          : 'glass-surface border-amber-500/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${completed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">09:30 PM • DIRECTIVE 05</span>
            </div>
            <h2 className="font-semibold text-base text-white tracking-wide">Nightly Takhkir</h2>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 transition"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-gray-300 mb-4">Ego-free operational debrief vault & single non-negotiable rule adjustment.</p>

      {isExpanded && (
        <div className="space-y-3.5">
          {/* Form Fields */}
          <div>
            <label className="block text-[11px] font-mono text-cyan-400 mb-1">1. TARGET OBJECTIVE (WHAT WAS TESTED?)</label>
            <input
              type="text"
              value={targetObjective}
              onChange={(e) => setTargetObjective(e.target.value)}
              placeholder="e.g. Acidus Novus glance speed & 5-round boxing interval focus"
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-cyan-500/50 transition font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-amber-400 mb-1">2. GROUND TRUTH (EGO-FREE REALITY)</label>
            <textarea
              rows={2}
              value={groundTruth}
              onChange={(e) => setGroundTruth(e.target.value)}
              placeholder="e.g. Retained 3 out of 4 visual details; round 4 boxing rest extended by 15s."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-amber-500/50 transition font-sans resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-rose-400 mb-1">3. POINT OF FRICTION (WHERE DID LAG OCCUR?)</label>
            <input
              type="text"
              value={frictionPoint}
              onChange={(e) => setFrictionPoint(e.target.value)}
              placeholder="e.g. Hesitation during high-tempo speech desynchronization drill."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-rose-500/50 transition font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-emerald-400 mb-1">4. SINGLE RULE ADJUSTMENT (NON-NEGOTIABLE FOR TOMORROW)</label>
            <input
              type="text"
              value={singleRuleAdjustment}
              onChange={(e) => setSingleRuleAdjustment(e.target.value)}
              placeholder="e.g. Initiate 3-second shoulder check immediately upon entering sports pitch."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-emerald-500/50 transition font-sans"
            />
          </div>

          {/* Track Completion Chips */}
          <div>
            <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase">VERIFIED TRACK COMPLETION</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CHIPS.map((chip) => {
                const isSelected = selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-gray-200'
                    }`}
                  >
                    [{isSelected ? '✓' : ' '}] {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleArchiveDebrief}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'ARCHIVED TO VAULT!' : 'ARCHIVE DEBRIEF'}</span>
            </button>

            <button
              onClick={exportCurrentAsMarkdown}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition"
              title="Export as Markdown .md"
            >
              <Download className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
