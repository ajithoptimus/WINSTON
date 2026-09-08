import Dexie, { Table } from 'dexie';

export interface DirectiveState {
  id?: number;
  dateStr: string; // Format: YYYY-MM-DD
  directiveId: 'crucible' | 'recon' | 'physical' | 'systems' | 'takhkir';
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
  time: string; // "08:00", "13:30", "17:30", "21:30"
  enabled: boolean;
}

export class DirectiveOSDatabase extends Dexie {
  directives!: Table<DirectiveState>;
  gymLogs!: Table<GymLogEntry>;
  debriefs!: Table<DebriefEntry>;
  settings!: Table<{ key: string; value: unknown }>;

  constructor() {
    super('DirectiveOSDB');
    this.version(1).stores({
      directives: '++id, dateStr, directiveId, completed, [dateStr+directiveId]',
      gymLogs: '++id, dateStr, exercise',
      debriefs: '++id, dateStr, timestamp',
      settings: 'key',
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
