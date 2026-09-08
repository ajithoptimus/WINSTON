'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Save, Download, ChevronDown, ChevronUp, Sparkles, Cpu, AlertTriangle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, getTodayDateStr, DebriefEntry } from '@/lib/db';
import { playCompletionChime } from '@/lib/audio';
import { analyzeDebriefWithAI, DebriefAnalysisResult } from '@/lib/ai';

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

  // AI Telemetry State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<DebriefAnalysisResult | null>(null);

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleAIRefine = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeDebriefWithAI(targetObjective, groundTruth, frictionPoint, singleRuleAdjustment);
      setAiResult(result);
      setSingleRuleAdjustment(result.sharpenedRule);
    } catch (e) {
      console.warn('AI analysis error', e);
    } finally {
      setIsAnalyzing(false);
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

## Single Rule Adjustment (AI Sharpened)
${singleRuleAdjustment || 'N/A'}

## AI Cognitive Precision Score
${aiResult ? `${aiResult.accuracyScore}%` : 'N/A'}

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
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#e38b6c] uppercase font-bold">09:30 PM • DIRECTIVE 05</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/[0.05] text-[#e38b6c] border border-[#e38b6c]/30 flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" /> AI ENGINE
              </span>
            </div>
            <h2 className="font-bold text-base text-[#f0f0f0] tracking-wide">Nightly Takhkir</h2>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 btn-blick-secondary text-[#a0a0a0] hover:text-white"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4 text-[#e38b6c]" /> : <ChevronDown className="w-4 h-4 text-[#666666]" />}
        </button>
      </div>

      <p className="text-xs text-[#a0a0a0] mb-4">Ego-free operational debrief vault & AI accuracy rule sharpening engine.</p>

      {isExpanded && (
        <div className="space-y-3.5">
          {/* Form Fields */}
          <div>
            <label className="block text-[11px] font-mono text-[#e38b6c] mb-1 font-bold uppercase">1. TARGET OBJECTIVE (WHAT WAS TESTED?)</label>
            <input
              type="text"
              value={targetObjective}
              onChange={(e) => setTargetObjective(e.target.value)}
              placeholder="e.g. Acidus Novus glance speed & 5-round boxing interval focus"
              className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222222] text-xs text-[#f0f0f0] outline-none focus:border-[#e38b6c] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#e38b6c] mb-1 font-bold uppercase">2. GROUND TRUTH (EGO-FREE REALITY)</label>
            <textarea
              rows={2}
              value={groundTruth}
              onChange={(e) => setGroundTruth(e.target.value)}
              placeholder="e.g. Retained 3 out of 4 visual details; round 4 boxing rest extended by 15s."
              className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222222] text-xs text-[#f0f0f0] outline-none focus:border-[#e38b6c] transition resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#e38b6c] mb-1 font-bold uppercase">3. POINT OF FRICTION (WHERE DID LAG OCCUR?)</label>
            <input
              type="text"
              value={frictionPoint}
              onChange={(e) => setFrictionPoint(e.target.value)}
              placeholder="e.g. Hesitation during high-tempo speech desynchronization drill."
              className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222222] text-xs text-[#f0f0f0] outline-none focus:border-[#e38b6c] transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono text-[#e38b6c] font-bold uppercase">4. SINGLE RULE ADJUSTMENT</label>
              
              {/* AI Refine Button */}
              <button
                type="button"
                onClick={handleAIRefine}
                disabled={isAnalyzing}
                className="px-2.5 py-1 rounded text-[10px] font-mono btn-blick-primary flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-white" />
                <span>{isAnalyzing ? 'ANALYZING...' : 'AI ACCURACY SHARPEN'}</span>
              </button>
            </div>

            <input
              type="text"
              value={singleRuleAdjustment}
              onChange={(e) => setSingleRuleAdjustment(e.target.value)}
              placeholder="e.g. If encountering hesitation, immediately pause 3s for physical reset."
              className="w-full px-3 py-2 rounded-lg bg-[#080808] border border-[#222222] text-xs text-[#f0f0f0] outline-none focus:border-[#e38b6c] transition font-mono"
            />
          </div>

          {/* AI Telemetry Result Banner */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg bg-[#080808] border border-[#e38b6c]/30 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#e38b6c] font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#e38b6c]" /> AI ACCURACY SCORE:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#e38b6c]/20 text-[#e38b6c] font-bold border border-[#e38b6c]/40">
                    {aiResult.accuracyScore}% PRECISION
                  </span>
                </div>

                {aiResult.biasDetected && (
                  <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Bias: {aiResult.biasDetected}</span>
                  </div>
                )}

                <ul className="text-[11px] text-[#a0a0a0] space-y-1 pl-4 list-disc marker:text-[#e38b6c]">
                  {aiResult.insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Track Completion Chips */}
          <div>
            <label className="block text-[10px] font-mono text-[#666666] mb-1.5 uppercase font-bold">VERIFIED TRACK COMPLETION</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CHIPS.map((chip) => {
                const isSelected = selectedChips.includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className={`px-2.5 py-1 rounded text-xs font-mono border transition ${
                      isSelected
                        ? 'btn-blick-primary'
                        : 'btn-blick-secondary text-[#666666]'
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
              className="flex-1 py-2.5 rounded btn-blick-primary font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-white" />
              <span>{isSaved ? 'ARCHIVED TO VAULT!' : 'ARCHIVE DEBRIEF'}</span>
            </button>

            <button
              onClick={exportCurrentAsMarkdown}
              className="p-2.5 rounded btn-blick-secondary text-[#a0a0a0] hover:text-white"
              title="Export as Markdown .md"
            >
              <Download className="w-4 h-4 text-[#e38b6c]" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
