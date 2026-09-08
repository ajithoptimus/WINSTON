'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Download, Trash2, Calendar, FileText } from 'lucide-react';
import { db, DebriefEntry } from '@/lib/db';

interface DebriefHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger: number;
}

export default function DebriefHistoryModal({ isOpen, onClose, refreshTrigger }: DebriefHistoryModalProps) {
  const [entries, setEntries] = useState<DebriefEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      db.debriefs.orderBy('id').reverse().toArray().then(setEntries).catch(console.error);
    }
  }, [isOpen, refreshTrigger]);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await db.debriefs.delete(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleExportAllMarkdown = () => {
    if (entries.length === 0) return;

    let md = `# DIRECTIVE OS - OPERATIONAL DEBRIEF VAULT ARCHIVE
*Export Date: ${new Date().toISOString()}*

---

`;

    entries.forEach((e) => {
      md += `## Debrief Date: ${e.dateStr} (${e.timestamp})
- **Target Objective**: ${e.targetObjective || 'N/A'}
- **Ground Truth**: ${e.groundTruth || 'N/A'}
- **Point of Friction**: ${e.frictionPoint || 'N/A'}
- **Single Rule Adjustment**: ${e.singleRuleAdjustment || 'N/A'}
- **Tracks Completed**: ${e.trackChips?.join(', ') || 'None'}

---

`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `directive-os-debrief-archive-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="w-full max-w-lg max-h-[85vh] p-6 rounded-2xl glass-surface border border-white/10 text-white shadow-2xl relative flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Debrief Vault Archive</h3>
                  <p className="text-xs text-gray-400">{entries.length} historical debrief records</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {entries.length > 0 && (
                  <button
                    onClick={handleExportAllMarkdown}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition flex items-center gap-1.5"
                    title="Export All as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export MD</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Entry Feed */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
              {entries.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-xs font-mono">No historical debriefs logged yet.</p>
                  <p className="text-[11px] text-gray-500">Complete the Nightly Takhkir card to save your first operational record.</p>
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{entry.dateStr}</span>
                        <span className="text-gray-600">•</span>
                        <span>{entry.timestamp}</span>
                      </div>

                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-gray-500 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {entry.targetObjective && (
                      <div>
                        <p className="text-[10px] font-mono text-cyan-400 uppercase">Target Objective</p>
                        <p className="text-xs text-gray-200">{entry.targetObjective}</p>
                      </div>
                    )}

                    {entry.groundTruth && (
                      <div>
                        <p className="text-[10px] font-mono text-amber-400 uppercase">Ground Truth</p>
                        <p className="text-xs text-gray-300">{entry.groundTruth}</p>
                      </div>
                    )}

                    {entry.singleRuleAdjustment && (
                      <div>
                        <p className="text-[10px] font-mono text-emerald-400 uppercase">Single Rule Adjustment</p>
                        <p className="text-xs font-medium text-emerald-300">{entry.singleRuleAdjustment}</p>
                      </div>
                    )}

                    {entry.trackChips && entry.trackChips.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {entry.trackChips.map((chip, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-gray-300 border border-white/10"
                          >
                            ✓ {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
