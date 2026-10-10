import Dexie, { Table } from 'dexie';

export interface DirectiveState {
  id?: number;
  dateStr: string;
  directiveId: 'crucible' | 'mission' | 'recon' | 'physical' | 'systems' | 'takhkir';
  completed: boolean;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface GymLogEntry {
  id?: number;
  dateStr: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface DebriefEntry {
  id?: number;
  dateStr: string;
  timestamp: string;
  targetObjective: string;
  groundTruth: string;
  frictionPoint: string;
  singleRuleAdjustment: string;
  trackChips: string[];
}

export interface AlarmSetting {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

export interface NoteEntry {
  id?: number;
  title?: string;
  content?: string;
  dateStr: string;
  createdAt: string;
  updatedAt?: string;
  priority: 'critical' | 'strategic' | 'general';
  completed: boolean;
  category?: string;
}

// ---- WINSTON v2 NEW TABLES ----

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sessionId: string;
  language?: 'english' | 'malayalam';
  hasScreenshot?: boolean;
  screenshotData?: string;
}

export interface DailyTrackProgress {
  id?: number;
  dateStr: string;
  trackId: 'ai-career' | 'mentalism' | 'physical';
  questionId: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface WorkoutLog {
  id?: number;
  dateStr: string;
  createdAt: string;
  category: 'boxing' | 'strength' | 'endurance' | 'mobility' | 'presentation';
  exercise: string;
  details: string;
  duration?: number;
  rpe?: number;
}

export interface StreakData {
  id?: number;
  dateStr: string;
  tracksCompleted: string[];
  totalTasks: number;
  completedTasks: number;
}

export class DirectiveOSDatabase extends Dexie {
  directives!: Table<DirectiveState>;
  gymLogs!: Table<GymLogEntry>;
  debriefs!: Table<DebriefEntry>;
  settings!: Table<{ key: string; value: unknown }>;
  notes!: Table<NoteEntry>;
  chatMessages!: Table<ChatMessage>;
  dailyTrackProgress!: Table<DailyTrackProgress>;
  workoutLogs!: Table<WorkoutLog>;
  streaks!: Table<StreakData>;

  constructor() {
    super('DirectiveOSDB');
    this.version(1).stores({
      directives: '++id, dateStr, directiveId, completed, [dateStr+directiveId]',
      gymLogs: '++id, dateStr, exercise',
      debriefs: '++id, dateStr, timestamp',
      settings: 'key',
    });
    this.version(2).stores({
      directives: '++id, dateStr, directiveId, completed, [dateStr+directiveId]',
      gymLogs: '++id, dateStr, exercise',
      debriefs: '++id, dateStr, timestamp',
      settings: 'key',
      notes: '++id, dateStr, priority, completed, createdAt',
    });
    this.version(3).stores({
      directives: '++id, dateStr, directiveId, completed, [dateStr+directiveId]',
      gymLogs: '++id, dateStr, exercise',
      debriefs: '++id, dateStr, timestamp',
      settings: 'key',
      notes: '++id, dateStr, priority, completed, category, createdAt',
    });
    this.version(4).stores({
      directives: '++id, dateStr, directiveId, completed, [dateStr+directiveId]',
      gymLogs: '++id, dateStr, exercise',
      debriefs: '++id, dateStr, timestamp',
      settings: 'key',
      notes: '++id, dateStr, priority, completed, category, createdAt',
      chatMessages: '++id, sessionId, timestamp, role',
      dailyTrackProgress: '++id, dateStr, trackId, questionId, completed, [dateStr+trackId]',
      workoutLogs: '++id, dateStr, category, createdAt',
      streaks: '++id, dateStr',
    });
  }
}

export const db = new DirectiveOSDatabase();

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSessionId(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
