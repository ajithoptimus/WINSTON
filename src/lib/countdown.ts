// Top Orbital Countdown Engine for Jan 1, 2027 Launch

export interface PhaseInfo {
  id: number;
  name: string;
  monthStr: string;
  badge: string;
}

export const KONGAD_PHASES: PhaseInfo[] = [
  { id: 1, name: 'THE SETUP', monthStr: 'SEP 2026', badge: 'PHASE 01: THE SETUP (SEP 2026)' },
  { id: 2, name: 'FOUNDATION & SCHEMA', monthStr: 'OCT 2026', badge: 'PHASE 02: FOUNDATION & SCHEMA (OCT 2026)' },
  { id: 3, name: 'IOT & DEMO PREP', monthStr: 'NOV 2026', badge: 'PHASE 03: IOT & DEMO PREP (NOV 2026)' },
  { id: 4, name: 'AUDIT & VOICE AI', monthStr: 'DEC 2026', badge: 'PHASE 04: AUDIT & VOICE AI (DEC 2026)' },
];

export function getDaysToLaunch(currentDate: Date = new Date()): number {
  const targetDate = new Date('2027-01-01T00:00:00Z');
  const diffTime = targetDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getCurrentPhase(currentDate: Date = new Date()): PhaseInfo {
  const month = currentDate.getMonth(); // 0-indexed (8 = Sep, 9 = Oct, 10 = Nov, 11 = Dec)

  if (month === 8) return KONGAD_PHASES[0]; // Sep
  if (month === 9) return KONGAD_PHASES[1]; // Oct
  if (month === 10) return KONGAD_PHASES[2]; // Nov
  if (month === 11) return KONGAD_PHASES[3]; // Dec

  return KONGAD_PHASES[0];
}

export function getLaunchProgressPercent(currentDate: Date = new Date()): number {
  const startDate = new Date('2026-09-01T00:00:00Z');
  const targetDate = new Date('2027-01-01T00:00:00Z');

  const totalDuration = targetDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();

  const percent = (elapsed / totalDuration) * 100;
  return Math.min(100, Math.max(0, parseFloat(percent.toFixed(1))));
}
