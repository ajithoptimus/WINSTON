'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Brain,
  Cpu,
  Dumbbell,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
} from 'lucide-react';
import { db, getTodayDateStr, DailyTrackProgress } from '@/lib/db';
import { getDailyQuestions, TrackQuestion } from '@/lib/daily-content';

interface ExtraQuestion extends TrackQuestion {
  trackId: 'ai-career' | 'mentalism' | 'physical';
}

export default function DailyTracksCard() {
  const todayStr = getTodayDateStr();
  const dailyQuestions = getDailyQuestions(todayStr);

  const [expandedTrack, setExpandedTrack] = useState<'ai-career' | 'mentalism' | 'physical' | null>('ai-career');
  const [extraQuestions, setExtraQuestions] = useState<Record<string, TrackQuestion[]>>({
    'ai-career': [],
    mentalism: [],
    physical: [],
  });
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({
    'ai-career': false,
    mentalism: false,
    physical: false,
  });

  // Load progress from Dexie
  const progressList = useLiveQuery(
    () => db.dailyTrackProgress.where('dateStr').equals(todayStr).toArray(),
    [todayStr],
    []
  );

  const isCompleted = (questionId: string) => {
    return progressList?.some((p) => p.questionId === questionId && p.completed) ?? false;
  };

  const toggleQuestion = async (
    trackId: 'ai-career' | 'mentalism' | 'physical',
    questionId: string
  ) => {
    const existing = progressList?.find((p) => p.questionId === questionId);
    if (existing && existing.id) {
      await db.dailyTrackProgress.update(existing.id, {
        completed: !existing.completed,
        completedAt: !existing.completed ? new Date().toISOString() : undefined,
      });
    } else {
      await db.dailyTrackProgress.add({
        dateStr: todayStr,
        trackId,
        questionId,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const handleAskFreshQuestion = async (trackId: 'ai-career' | 'mentalism' | 'physical') => {
    setIsGenerating((prev) => ({ ...prev, [trackId]: true }));
    try {
      const topicMap = {
        'ai-career': 'AI Integration Engineering, Prompt Engineering with Python, LangChain, or AI QA Evaluation',
        mentalism: 'cold reading, billet peeks, observational baseline detection, or verbal timing drills',
        physical: 'boxing conditioning, compound strength lifts, or presentation posture and endurance',
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate ONE rigorous, high-yield practice drill or interview challenge specifically for ${topicMap[trackId]}.
Format your reply as valid JSON ONLY with exactly these keys:
{
  "category": "Subtopic Name",
  "question": "The detailed challenge or drill text",
  "difficulty": "intermediate"
}
Do NOT include markdown formatting, backticks, or other text outside the JSON.`,
            },
          ],
          language: 'english',
        }),
      });

      const data = await res.json() as { response?: string };
      if (data.response) {
        // Strip out any backticks if Groq returned them
        const cleanJsonStr = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJsonStr) as {
          category: string;
          question: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
        };

        const newQ: TrackQuestion = {
          id: `ai-fresh-${Date.now()}`,
          category: parsed.category || 'AI Generated',
          question: parsed.question,
          difficulty: parsed.difficulty || 'intermediate',
        };

        setExtraQuestions((prev) => ({
          ...prev,
          [trackId]: [...prev[trackId], newQ],
        }));
      }
    } catch (err) {
      console.error('Failed to generate fresh question:', err);
    } finally {
      setIsGenerating((prev) => ({ ...prev, [trackId]: false }));
    }
  };

  const tracks = [
    {
      id: 'ai-career' as const,
      name: 'AI Engineering & Career Crucible',
      badge: 'CAREER PREP',
      icon: Cpu,
      accent: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      questions: [...dailyQuestions.aiCareer, ...(extraQuestions['ai-career'] || [])],
      desc: 'LangChain, LlamaIndex, Python prompt scripts & AI QA assessment',
    },
    {
      id: 'mentalism' as const,
      name: 'Mentalism & Cognitive Vector',
      badge: 'MIND MATRIX',
      icon: Brain,
      accent: 'border-[#e38b6c]/30 text-[#e38b6c] bg-[#e38b6c]/10',
      questions: [...dailyQuestions.mentalism, ...(extraQuestions['mentalism'] || [])],
      desc: 'Cold reading, baseline detection, billet peeks & micro-cues',
    },
    {
      id: 'physical' as const,
      name: 'Physical Armor & Endurance',
      badge: 'PHYSICAL',
      icon: Dumbbell,
      accent: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      questions: [...dailyQuestions.physical, ...(extraQuestions['physical'] || [])],
      desc: 'Boxing intervals, strength progression & presentation posture',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="blick-card p-4 rounded-xl border border-white/10 bg-[#111111] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#e38b6c]/50 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#080808] rounded-[11px] flex items-center justify-center">
                <Award className="w-5 h-5 text-[#e38b6c]" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-mono font-extrabold tracking-wider text-white uppercase flex items-center gap-2">
                <span>DAILY PROTOCOL TRACKS</span>
                <span className="w-2 h-2 rounded-full bg-[#e38b6c] animate-pulse" />
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                AI Career • Cognitive Mentalism • Physical Armor
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-gray-300 border border-white/10">
            {progressList?.filter((p) => p.completed).length || 0} COMPLETED TODAY
          </span>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        {tracks.map((track) => {
          const Icon = track.icon;
          const isExpanded = expandedTrack === track.id;
          const completedCount = track.questions.filter((q) => isCompleted(q.id)).length;
          const totalCount = track.questions.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={track.id}
              className="blick-card rounded-xl border border-white/10 bg-[#111111] overflow-hidden transition-all duration-200"
            >
              {/* Header Accordion Bar */}
              <div
                onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg p-1.5 flex items-center justify-center ${track.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-mono font-bold text-white uppercase">
                        {track.name}
                      </h3>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${track.accent}`}>
                        {track.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{track.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-gray-300 font-bold">{completedCount}/{totalCount}</span>
                    <span className="text-gray-500 ml-1">({percent}%)</span>
                  </div>
                  <button className="text-gray-400 hover:text-white p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progress Line */}
              <div className="h-0.5 w-full bg-white/[0.06]">
                <div
                  className="h-full bg-gradient-to-r from-[#e38b6c] to-[#d23aad] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Collapsible Questions Body */}
              {isExpanded && (
                <div className="p-4 pt-3 border-t border-white/[0.06] space-y-3 bg-[#080808]/50">
                  <div className="space-y-2.5">
                    {track.questions.map((q) => {
                      const done = isCompleted(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            done
                              ? 'bg-[#080808] border-white/5 opacity-60'
                              : 'bg-[#111111] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggleQuestion(track.id, q.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                                done
                                  ? 'bg-[#e38b6c] border-[#e38b6c] text-[#080808]'
                                  : 'border-gray-600 hover:border-gray-400 bg-[#080808]'
                              }`}
                            >
                              {done ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3 h-3 text-transparent" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-gray-400 border border-white/10 uppercase">
                                  {q.category}
                                </span>
                                <span className="text-[9px] font-mono text-gray-500 uppercase">
                                  {q.difficulty}
                                </span>
                              </div>
                              <p
                                className={`text-xs font-sans leading-relaxed ${
                                  done ? 'line-through text-gray-500' : 'text-gray-200'
                                }`}
                              >
                                {q.question}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ask Winston for Fresh Question Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAskFreshQuestion(track.id)}
                      disabled={isGenerating[track.id]}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {isGenerating[track.id] ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#e38b6c]" />
                          <span>Generating Drill...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#e38b6c]" />
                          <span>Ask Winston for Fresh Drill</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
