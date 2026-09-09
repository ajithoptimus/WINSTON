'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Activity, Calendar, Trophy, Zap } from 'lucide-react';
import { db, DirectiveState, getTodayDateStr } from '@/lib/db';

interface DisciplineRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyStats {
  dateStr: string;
  count: number;
}

interface TrackStats {
  crucible: number;
  recon: number;
  physical: number;
  systems: number;
  takhkir: number;
}

export default function DisciplineRadarModal({ isOpen, onClose }: DisciplineRadarModalProps) {
  const [streak, setStreak] = useState<number>(0);
  const [last30Days, setLast30Days] = useState<DailyStats[]>([]);
  const [trackStats, setTrackStats] = useState<TrackStats>({
    crucible: 0,
    recon: 0,
    physical: 0,
    systems: 0,
    takhkir: 0,
  });

  useEffect(() => {
    if (isOpen) {
      calculateAnalytics();
    }
  }, [isOpen]);

  const calculateAnalytics = async () => {
    const allDirectives = await db.directives.toArray();
    
    // Group by date
    const dateMap: Record<string, number> = {};
    const trackCounts: TrackStats = { crucible: 0, recon: 0, physical: 0, systems: 0, takhkir: 0 };

    allDirectives.forEach((item) => {
      if (item.completed) {
        dateMap[item.dateStr] = (dateMap[item.dateStr] || 0) + 1;
        if (item.directiveId in trackCounts) {
          trackCounts[item.directiveId as keyof TrackStats] += 1;
        }
      }
    });

    setTrackStats(trackCounts);

    // Calculate 30-day grid
    const days: DailyStats[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        dateStr,
        count: dateMap[dateStr] || 0,
      });
    }

    setLast30Days(days);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;

      if (dateMap[dStr] && dateMap[dStr] >= 3) { // At least 3 directives for streak day
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Check yesterday if today not completed yet
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  // Helper for Radar SVG coordinates
  const getRadarPoints = (stats: TrackStats) => {
    const maxVal = Math.max(1, ...Object.values(stats));
    const center = 100;
    const radius = 70;

    const angles = [
      -Math.PI / 2, // Top (Crucible)
      -Math.PI / 2 + (2 * Math.PI) / 5, // Top Right (Recon)
      -Math.PI / 2 + (4 * Math.PI) / 5, // Bottom Right (Physical)
      -Math.PI / 2 + (6 * Math.PI) / 5, // Bottom Left (Systems)
      -Math.PI / 2 + (8 * Math.PI) / 5, // Top Left (Takhkir)
    ];

    const values = [
      stats.crucible,
      stats.recon,
      stats.physical,
      stats.systems,
      stats.takhkir,
    ];

    const points = values.map((val, idx) => {
      const r = (val / maxVal) * radius;
      const x = center + r * Math.cos(angles[idx]);
      const y = center + r * Math.sin(angles[idx]);
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg p-6 rounded-2xl blick-card border border-white/10 text-white shadow-2xl relative space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#0009] border border-[#333333] text-[#e38b6c]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#f0f0f0]">Protocol Discipline Radar</h3>
                  <p className="text-xs text-[#a0a0a0]">30-Day Heatmap & 5-Axis Balance Telemetry</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 btn-blick-secondary text-[#a0a0a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Streak & Key Metric Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#080808] border border-[#222222] flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#e38b6c]/10 text-[#e38b6c]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold font-mono blick-gradient-text">
                    {streak} DAYS
                  </div>
                  <p className="text-[10px] font-mono text-[#666666]">ACTIVE STREAK</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080808] border border-[#222222] flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#d23aad]/10 text-[#d23aad]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold font-mono blick-gradient-text">
                    {Object.values(trackStats).reduce((a, b) => a + b, 0)}
                  </div>
                  <p className="text-[10px] font-mono text-[#666666]">TOTAL EXECUTIONS</p>
                </div>
              </div>
            </div>

            {/* 5-Axis Discipline Radar Chart */}
            <div className="p-4 rounded-xl bg-[#080808] border border-[#222222] flex flex-col items-center">
              <span className="text-xs font-mono text-[#e38b6c] font-bold uppercase mb-2">5-Axis Discipline Balance</span>
              
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-52 h-52 overflow-visible" viewBox="0 0 200 200">
                  {/* Outer & Inner Reference Polygons */}
                  {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <polygon
                      key={i}
                      points={getRadarPoints({
                        crucible: scale * 10,
                        recon: scale * 10,
                        physical: scale * 10,
                        systems: scale * 10,
                        takhkir: scale * 10,
                      })}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Dynamic Radar Fill Polygon */}
                  <polygon
                    points={getRadarPoints(trackStats)}
                    fill="rgba(227, 139, 108, 0.25)"
                    stroke="#e38b6c"
                    strokeWidth="2"
                  />
                </svg>

                {/* Radar Axis Labels */}
                <span className="absolute top-0 text-[10px] font-mono text-[#f0f0f0] font-bold">Mentalism</span>
                <span className="absolute top-12 right-0 text-[10px] font-mono text-[#a0a0a0]">Recon</span>
                <span className="absolute bottom-3 right-2 text-[10px] font-mono text-[#a0a0a0]">Physical</span>
                <span className="absolute bottom-3 left-2 text-[10px] font-mono text-[#a0a0a0]">Systems</span>
                <span className="absolute top-12 left-0 text-[10px] font-mono text-[#a0a0a0]">Takhkir</span>
              </div>
            </div>

            {/* 30-Day Completion Heatmap Grid */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-mono">
                <span className="text-[#a0a0a0] font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#e38b6c]" /> 30-DAY CONSISTENCY GRID
                </span>
                <span className="text-[#666666]">5/5 COMPLETE</span>
              </div>

              <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl bg-[#080808] border border-[#222222]">
                {last30Days.map((day, idx) => {
                  let opacityClass = 'bg-[#111111] border border-white/5';
                  if (day.count === 5) opacityClass = 'blick-gradient-bg shadow-sm shadow-[#e38b6c]/30';
                  else if (day.count >= 3) opacityClass = 'bg-[#e38b6c]/60 border border-[#e38b6c]/40';
                  else if (day.count >= 1) opacityClass = 'bg-[#e38b6c]/30 border border-[#e38b6c]/20';

                  return (
                    <div
                      key={idx}
                      title={`${day.dateStr}: ${day.count}/5 Directives Completed`}
                      className={`h-7 rounded-md flex items-center justify-center text-[9px] font-mono font-bold transition hover:scale-110 cursor-pointer ${opacityClass}`}
                    >
                      {day.count > 0 ? day.count : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded btn-blick-primary font-bold text-xs transition shadow-lg"
            >
              CLOSE TELEMETRY DASHBOARD
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
