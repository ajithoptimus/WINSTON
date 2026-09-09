// Web Notifications manager for KONGAD PROTOCOL with fallback to in-app audio cues

import { playCompletionChime } from './audio';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export function sendDirectiveNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;

  playCompletionChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`[OPERATOR OS] ${title}`, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'kongad-protocol-alert',
      });
    } catch (e) {
      console.warn('Native notification failed', e);
    }
  }
}

export const DEFAULT_SCHEDULE = [
  { time: '08:00', title: 'Directive 01: Morning Crucible ready.', body: '5-minute cognitive agility drill initialized.' },
  { time: '10:00', title: 'Mission Kongad [T-113]: Complete phase deliverable.', body: 'Execute high-priority phase target deliverables.' },
  { time: '12:30', title: 'Directive 03: Recon Vector active.', body: 'Maintain active human and environmental observation.' },
  { time: '17:30', title: 'Directive 04: Physical Crucible open.', body: 'Execute Boxing rounds or Gym compound lifts.' },
  { time: '21:30', title: 'Directive 05: Takhkir Operational Debrief.', body: 'Log your ground truth and single rule adjustment.' },
];
