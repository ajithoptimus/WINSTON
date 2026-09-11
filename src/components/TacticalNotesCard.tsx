'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { NotebookPen, Plus, Check, Trash2, Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { db, NoteEntry, getTodayDateStr, getTomorrowDateStr } from '@/lib/db';

export default function TacticalNotesCard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [content, setContent] = useState('');
  const [targetDate, setTargetDate] = useState<'tomorrow' | 'today'>('tomorrow');
  const [priority, setPriority] = useState<'critical' | 'strategic' | 'general'>('strategic');
  const [filter, setFilter] = useState<'tomorrow' | 'today' | 'all'>('tomorrow');

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // Reactive query from IndexedDB
  const notes = useLiveQuery(
    async () => {
      if (filter === 'tomorrow') {
        return await db.notes.where('dateStr').equals(tomorrowStr).reverse().sortBy('createdAt');
      } else if (filter === 'today') {
        return await db.notes.where('dateStr').equals(todayStr).reverse().sortBy('createdAt');
      } else {
        return await db.notes.toCollection().reverse().sortBy('createdAt');
      }
    },
    [filter, todayStr, tomorrowStr],
    []
  );

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const dateStr = targetDate === 'tomorrow' ? tomorrowStr : todayStr;
    await db.notes.add({
      dateStr,
      createdAt: new Date().toISOString(),
      content: content.trim(),
      priority,
      completed: false,
    });

    setContent('');
  };

  const toggleNoteComplete = async (note: NoteEntry) => {
    if (!note.id) return;
    await db.notes.update(note.id, {
      completed: !note.completed,
    });
  };

  const deleteNote = async (id?: number) => {
    if (!id) return;
    await db.notes.delete(id);
  };

  return (
    <div className="blick-card p-4 rounded-xl border border-white/10 bg-[#111111] shadow-2xl relative overflow-hidden">
      {/* Edge Luminescence */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#e38b6c]/40 to-transparent" />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg blick-gradient-bg p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#080808] rounded-[7px] flex items-center justify-center">
              <NotebookPen className="w-4 h-4 text-[#e38b6c]" />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              TACTICAL NOTES // TOMORROW'S PLAN
            </h2>
            <p className="text-[10px] text-gray-400 font-mono">
              Offline-first target directives & scratchpad
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-gray-400 hover:text-white transition"
          title={isExpanded ? 'Collapse notes' : 'Expand notes'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Note Input Form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add notes or plan something for tomorrow..."
                rows={2}
                className="w-full bg-[#080808] text-xs text-white placeholder-gray-500 rounded-lg p-2.5 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none font-sans resize-none transition"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Target Date Toggle */}
              <div className="flex items-center gap-1 bg-[#080808] p-1 rounded-lg border border-white/10 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setTargetDate('tomorrow')}
                  className={`px-2 py-1 rounded transition ${
                    targetDate === 'tomorrow'
                      ? 'bg-[#e38b6c]/20 text-[#e38b6c] font-bold border border-[#e38b6c]/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setTargetDate('today')}
                  className={`px-2 py-1 rounded transition ${
                    targetDate === 'today'
                      ? 'bg-[#e38b6c]/20 text-[#e38b6c] font-bold border border-[#e38b6c]/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Today
                </button>
              </div>

              {/* Priority Selector */}
              <div className="flex items-center gap-1 bg-[#080808] p-1 rounded-lg border border-white/10 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setPriority('critical')}
                  className={`px-2 py-1 rounded transition ${
                    priority === 'critical'
                      ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Critical
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('strategic')}
                  className={`px-2 py-1 rounded transition ${
                    priority === 'strategic'
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Strategic
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('general')}
                  className={`px-2 py-1 rounded transition ${
                    priority === 'general'
                      ? 'bg-gray-500/20 text-gray-300 font-bold border border-gray-500/30'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  General
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-3 py-1.5 btn-blick-primary flex items-center gap-1 text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* Filter Bar & Count */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-gray-400">
            <div className="flex items-center gap-1.5">
              <span>View:</span>
              <button
                onClick={() => setFilter('tomorrow')}
                className={`px-1.5 py-0.5 rounded ${
                  filter === 'tomorrow' ? 'text-[#e38b6c] underline font-bold' : 'hover:text-white'
                }`}
              >
                Tomorrow ({notes ? notes.filter(n => n.dateStr === tomorrowStr).length : 0})
              </button>
              <span>•</span>
              <button
                onClick={() => setFilter('today')}
                className={`px-1.5 py-0.5 rounded ${
                  filter === 'today' ? 'text-[#e38b6c] underline font-bold' : 'hover:text-white'
                }`}
              >
                Today ({notes ? notes.filter(n => n.dateStr === todayStr).length : 0})
              </button>
              <span>•</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-1.5 py-0.5 rounded ${
                  filter === 'all' ? 'text-[#e38b6c] underline font-bold' : 'hover:text-white'
                }`}
              >
                All ({notes ? notes.length : 0})
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {notes && notes.length > 0 ? (
              notes.map((note) => {
                const isTomorrow = note.dateStr === tomorrowStr;
                const isToday = note.dateStr === todayStr;

                return (
                  <div
                    key={note.id}
                    className={`p-2.5 rounded-lg bg-[#080808] border transition flex items-start justify-between gap-3 ${
                      note.completed
                        ? 'border-white/5 opacity-50'
                        : note.priority === 'critical'
                        ? 'border-rose-500/30'
                        : note.priority === 'strategic'
                        ? 'border-cyan-500/30'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => toggleNoteComplete(note)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition flex-shrink-0 ${
                          note.completed
                            ? 'bg-[#e38b6c] border-[#e38b6c] text-[#080808]'
                            : 'border-gray-600 hover:border-gray-400 bg-transparent'
                        }`}
                      >
                        {note.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <p
                          className={`text-xs font-sans break-words ${
                            note.completed ? 'line-through text-gray-500' : 'text-gray-200'
                          }`}
                        >
                          {note.content}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                          <span
                            className={`px-1.5 py-0.2 rounded uppercase ${
                              note.priority === 'critical'
                                ? 'bg-rose-500/10 text-rose-400'
                                : note.priority === 'strategic'
                                ? 'bg-cyan-500/10 text-cyan-400'
                                : 'bg-gray-500/10 text-gray-400'
                            }`}
                          >
                            {note.priority}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {isTomorrow ? 'Tomorrow' : isToday ? 'Today' : note.dateStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-600 hover:text-rose-400 transition p-1"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center rounded-lg bg-[#080808] border border-white/5">
                <Sparkles className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xs text-gray-400 font-mono">No notes recorded yet</p>
                <p className="text-[10px] text-gray-500">Add a note or plan for tomorrow above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
