'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Check,
  Trash2,
  Edit2,
  Calendar,
  Search,
  CheckCircle2,
  Circle,
  Tag,
  X,
  Sparkles,
  Filter,
  ListTodo,
} from 'lucide-react';
import { db, NoteEntry, getTodayDateStr, getTomorrowDateStr } from '@/lib/db';

export default function TodoManagerCard() {
  // Form input state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetDate, setTargetDate] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(getTodayDateStr());
  const [priority, setPriority] = useState<'critical' | 'strategic' | 'general'>('strategic');
  const [category, setCategory] = useState<'General' | 'Work' | 'Personal' | 'Kongad'>('General');
  const [showDetailedAdd, setShowDetailedAdd] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'strategic' | 'general'>('all');

  // Edit Modal State
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  // Reactive Dexie query
  const rawNotes = useLiveQuery(() => db.notes.toCollection().reverse().sortBy('createdAt'), [], []);

  // Filter notes in memory
  const filteredNotes = (rawNotes || []).filter((note) => {
    // Title fallback for older note entries
    const noteTitle = note.title || note.content || '';
    const noteContent = note.content || '';

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches = noteTitle.toLowerCase().includes(q) || noteContent.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Status filter
    if (statusFilter === 'active' && note.completed) return false;
    if (statusFilter === 'completed' && !note.completed) return false;

    // Date filter
    if (dateFilter === 'today' && note.dateStr !== todayStr) return false;
    if (dateFilter === 'tomorrow' && note.dateStr !== tomorrowStr) return false;

    // Priority filter
    if (priorityFilter !== 'all' && note.priority !== priorityFilter) return false;

    return true;
  });

  const totalCount = rawNotes?.length || 0;
  const activeCount = rawNotes?.filter((n) => !n.completed).length || 0;
  const completedCount = rawNotes?.filter((n) => n.completed).length || 0;

  // Handle Add Note / Todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let dateStr = todayStr;
    if (targetDate === 'tomorrow') dateStr = tomorrowStr;
    if (targetDate === 'custom') dateStr = customDate;

    await db.notes.add({
      title: title.trim(),
      content: content.trim() || undefined,
      dateStr,
      createdAt: new Date().toISOString(),
      priority,
      completed: false,
      category,
    });

    // Reset inputs
    setTitle('');
    setContent('');
    setShowDetailedAdd(false);
  };

  // Toggle Completion Status
  const toggleComplete = async (note: NoteEntry) => {
    if (!note.id) return;
    await db.notes.update(note.id, {
      completed: !note.completed,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete Single Note
  const handleDelete = async (id?: number) => {
    if (!id) return;
    await db.notes.delete(id);
  };

  // Clear All Completed Tasks
  const handleClearCompleted = async () => {
    const completedIds = (rawNotes || []).filter((n) => n.completed && n.id).map((n) => n.id!);
    if (completedIds.length === 0) return;
    await db.notes.bulkDelete(completedIds);
  };

  // Handle Update Note Submission
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !editingNote.id) return;

    const updatedTitle = (editingNote.title || editingNote.content || '').trim();
    if (!updatedTitle) return;

    await db.notes.update(editingNote.id, {
      title: updatedTitle,
      content: editingNote.content?.trim() || undefined,
      dateStr: editingNote.dateStr,
      priority: editingNote.priority,
      category: editingNote.category,
      updatedAt: new Date().toISOString(),
    });

    setEditingNote(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="blick-card p-4 rounded-xl border border-white/10 bg-[#111111] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#e38b6c]/50 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#080808] rounded-[11px] flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-[#e38b6c]" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-mono font-extrabold tracking-wider text-white uppercase flex items-center gap-2">
                <span>TODO & NOTES MATRIX</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </h2>
              <p className="text-xs text-gray-400 font-mono">100% Client-Side Persistent Task Manager</p>
            </div>
          </div>

          {/* Stat Badges */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-gray-300 border border-white/10">
              TOTAL: <strong className="text-white">{totalCount}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              ACTIVE: <strong className="text-cyan-300">{activeCount}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#e38b6c]/10 text-[#e38b6c] border border-[#e38b6c]/20">
              DONE: <strong className="text-[#e38b6c]">{completedCount}</strong>
            </span>
          </div>
        </div>

        {/* Quick Add / Create Form */}
        <form onSubmit={handleAddTodo} className="mt-4 space-y-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done? Type a task or note..."
              className="flex-1 bg-[#080808] text-xs text-white placeholder-gray-500 rounded-lg px-3 py-2.5 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none font-sans transition"
            />
            <button
              type="button"
              onClick={() => setShowDetailedAdd(!showDetailedAdd)}
              className={`p-2.5 rounded-lg border text-xs font-mono transition ${
                showDetailedAdd
                  ? 'bg-[#e38b6c]/20 border-[#e38b6c]/40 text-[#e38b6c]'
                  : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
              }`}
              title="Toggle Detailed Note Options"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2.5 btn-blick-primary flex items-center gap-1.5 text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>

          {/* Detailed Add Options */}
          {showDetailedAdd && (
            <div className="p-3 rounded-lg bg-[#080808] border border-white/10 space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="text-[11px] font-mono text-gray-400 block mb-1">Details / Content (Optional)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add extra context, details, links, or bullet points..."
                  rows={2}
                  className="w-full bg-[#111111] text-xs text-white placeholder-gray-500 rounded-lg p-2 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none font-sans resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                {/* Target Date Selector */}
                <div>
                  <label className="text-gray-400 block mb-1">Target Date</label>
                  <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setTargetDate('today')}
                      className={`flex-1 py-1 rounded transition ${
                        targetDate === 'today' ? 'bg-[#e38b6c]/20 text-[#e38b6c] font-bold' : 'text-gray-400'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetDate('tomorrow')}
                      className={`flex-1 py-1 rounded transition ${
                        targetDate === 'tomorrow' ? 'bg-[#e38b6c]/20 text-[#e38b6c] font-bold' : 'text-gray-400'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="text-gray-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#111111] text-white rounded-lg p-1.5 border border-white/10 focus:outline-none"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="strategic">🔵 Strategic</option>
                    <option value="general">⚪ General</option>
                  </select>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="text-gray-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#111111] text-white rounded-lg p-1.5 border border-white/10 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Kongad">Kongad Protocol</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="blick-card p-3 rounded-xl border border-white/10 bg-[#111111] space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or notes..."
              className="w-full bg-[#080808] text-xs text-white placeholder-gray-500 rounded-lg pl-8 pr-3 py-1.5 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#080808] p-1 rounded-lg border border-white/10 text-[11px] font-mono w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded transition ${
                statusFilter === 'all'
                  ? 'bg-white/10 text-white font-bold border border-white/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded transition ${
                statusFilter === 'active'
                  ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded transition ${
                statusFilter === 'completed'
                  ? 'bg-[#e38b6c]/20 text-[#e38b6c] font-bold border border-[#e38b6c]/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Done
            </button>
          </div>
        </div>

        {/* Sub-Filters: Date & Priority */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span>Date:</span>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-1.5 py-0.5 rounded ${
                dateFilter === 'all' ? 'text-[#e38b6c] font-bold underline' : 'hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-1.5 py-0.5 rounded ${
                dateFilter === 'today' ? 'text-[#e38b6c] font-bold underline' : 'hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-1.5 py-0.5 rounded ${
                dateFilter === 'tomorrow' ? 'text-[#e38b6c] font-bold underline' : 'hover:text-white'
              }`}
            >
              Tomorrow
            </button>
          </div>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-gray-500 hover:text-rose-400 transition flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Completed ({completedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Task & Notes List */}
      <div className="space-y-2">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => {
            const noteTitle = note.title || note.content || 'Untitled Note';
            const isTomorrow = note.dateStr === tomorrowStr;
            const isToday = note.dateStr === todayStr;

            return (
              <div
                key={note.id}
                className={`blick-card p-3.5 rounded-xl border transition-all duration-200 bg-[#111111] flex items-start justify-between gap-3 ${
                  note.completed
                    ? 'border-white/5 opacity-50'
                    : note.priority === 'critical'
                    ? 'border-rose-500/30 hover:border-rose-500/50'
                    : note.priority === 'strategic'
                    ? 'border-cyan-500/30 hover:border-cyan-500/50'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Checkbox Toggle */}
                <button
                  onClick={() => toggleComplete(note)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                    note.completed
                      ? 'bg-[#e38b6c] border-[#e38b6c] text-[#080808]'
                      : 'border-gray-600 hover:border-gray-300 bg-[#080808]'
                  }`}
                  title={note.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {note.completed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-3 h-3 text-transparent" />}
                </button>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-xs font-semibold font-sans break-words ${
                        note.completed ? 'line-through text-gray-500' : 'text-gray-100'
                      }`}
                    >
                      {noteTitle}
                    </h3>

                    {/* Priority Badge */}
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold ${
                        note.priority === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : note.priority === 'strategic'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}
                    >
                      {note.priority}
                    </span>

                    {/* Category Tag */}
                    {note.category && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/[0.04] text-gray-400 border border-white/10 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {note.category}
                      </span>
                    )}
                  </div>

                  {/* Body Content Details */}
                  {note.content && note.title && (
                    <p className={`text-[11px] font-sans break-words ${note.completed ? 'line-through text-gray-600' : 'text-gray-400'}`}>
                      {note.content}
                    </p>
                  )}

                  {/* Date Badge */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#e38b6c]" />
                      {isTomorrow ? 'Tomorrow' : isToday ? 'Today' : note.dateStr}
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="p-1.5 text-gray-500 hover:text-cyan-400 transition rounded-lg hover:bg-white/[0.04]"
                    title="Edit note"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 transition rounded-lg hover:bg-white/[0.04]"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center rounded-xl bg-[#111111] border border-white/10 blick-card space-y-2">
            <Sparkles className="w-6 h-6 text-[#e38b6c] mx-auto animate-pulse" />
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase">NO TASKS FOUND</h3>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
              {searchQuery ? `No tasks match your search query "${searchQuery}"` : 'Your matrix is clear. Create a new task or note above!'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl blick-card space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#e38b6c]" />
                Edit Task / Note
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-gray-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={editingNote.title || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full bg-[#080808] text-xs text-white rounded-lg p-2.5 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-400 block mb-1">Details (Optional)</label>
                <textarea
                  value={editingNote.content || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  rows={3}
                  className="w-full bg-[#080808] text-xs text-white rounded-lg p-2.5 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <label className="text-gray-400 block mb-1">Priority</label>
                  <select
                    value={editingNote.priority}
                    onChange={(e) => setEditingNote({ ...editingNote, priority: e.target.value as any })}
                    className="w-full bg-[#080808] text-white rounded-lg p-2 border border-white/10 focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="strategic">Strategic</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Category</label>
                  <select
                    value={editingNote.category || 'General'}
                    onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                    className="w-full bg-[#080808] text-white rounded-lg p-2 border border-white/10 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Kongad">Kongad Protocol</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-gray-300 text-xs font-mono hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 btn-blick-primary text-xs font-mono"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
