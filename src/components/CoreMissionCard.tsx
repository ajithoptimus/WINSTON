'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Square, CheckSquare, Layers, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KONGAD_TASKS, PhaseTask } from '@/lib/kongad';
import { KONGAD_PHASES } from '@/lib/countdown';
import { db, getTodayDateStr } from '@/lib/db';
import { playCompletionChime } from '@/lib/audio';

interface CoreMissionCardProps {
  completed: boolean;
  onToggleComplete: () => void;
}

export default function CoreMissionCard({ completed, onToggleComplete }: CoreMissionCardProps) {
  const [activePhaseId, setActivePhaseId] = useState<number>(1);
  const [checkedTaskIds, setCheckedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    // Load completed tasks from Dexie
    const today = getTodayDateStr();
    db.directives.where({ dateStr: today, directiveId: 'core-mission' }).first().then((rec) => {
      if (rec && rec.metadata && Array.isArray(rec.metadata.completedTaskIds)) {
        setCheckedTaskIds(rec.metadata.completedTaskIds as string[]);
      }
    }).catch(console.error);
  }, []);

  const currentPhaseTasks = KONGAD_TASKS.filter((t) => t.phaseId === activePhaseId);

  const toggleTask = async (taskId: string) => {
    let updated: string[];
    if (checkedTaskIds.includes(taskId)) {
      updated = checkedTaskIds.filter((id) => id !== taskId);
    } else {
      updated = [...checkedTaskIds, taskId];
      playCompletionChime();
    }

    setCheckedTaskIds(updated);

    // Save task completion map to Dexie
    const today = getTodayDateStr();
    const existing = await db.directives.where({ dateStr: today, directiveId: 'core-mission' }).first();

    if (existing && existing.id) {
      await db.directives.update(existing.id, {
        metadata: { ...existing.metadata, completedTaskIds: updated },
      });
    } else {
      await db.directives.add({
        dateStr: today,
        directiveId: 'core-mission' as any,
        completed: false,
        metadata: { completedTaskIds: updated },
      });
    }

    // If all tasks for phase are checked, trigger confetti
    if (currentPhaseTasks.every((t) => updated.includes(t.id))) {
      confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
      if (!completed) {
        onToggleComplete();
      }
    }
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
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#e38b6c] uppercase font-bold">10:00 AM • DIRECTIVE 02</span>
              <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                DYNAMIC MISSION
              </span>
            </div>
            <h2 className="font-bold text-base text-[#f0f0f0] tracking-wide">Core Mission Deliverable</h2>
          </div>
        </div>

        <button
          onClick={onToggleComplete}
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

      <p className="text-xs text-[#a0a0a0] mb-4">Kongad Protocol Phase deliverables & high-priority launch targets.</p>

      {/* Phase Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-[#080808] border border-[#222222] mb-4 text-[10px] font-mono">
        {KONGAD_PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePhaseId(p.id)}
            className={`py-1.5 rounded font-bold transition text-center ${
              activePhaseId === p.id
                ? 'btn-blick-primary text-white shadow-sm'
                : 'text-[#666666] hover:text-[#a0a0a0]'
            }`}
          >
            P0{p.id} ({p.monthStr.slice(0, 3)})
          </button>
        ))}
      </div>

      {/* Active Phase Task Deliverables List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#a0a0a0] pb-1 border-b border-[#222222]">
          <span className="font-bold text-[#e38b6c] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#e38b6c]" />
            {KONGAD_PHASES.find(p => p.id === activePhaseId)?.badge}
          </span>
          <span>
            {currentPhaseTasks.filter(t => checkedTaskIds.includes(t.id)).length}/{currentPhaseTasks.length} DONE
          </span>
        </div>

        {currentPhaseTasks.map((task) => {
          const isChecked = checkedTaskIds.includes(task.id);
          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="p-3 rounded-lg bg-[#080808] border border-[#222222] hover:border-[#333333] flex items-start gap-3 cursor-pointer transition"
            >
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-[#e38b6c] mt-0.5 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-[#666666] mt-0.5 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isChecked ? 'text-[#666666] line-through' : 'text-[#f0f0f0]'}`}>
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span className="text-[9px] font-mono text-[#666666] flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {task.dueDate}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#a0a0a0] mt-0.5 leading-relaxed">{task.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
