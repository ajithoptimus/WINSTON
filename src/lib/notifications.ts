// Web Notifications manager with fallback to in-app audio/visual cues

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

  // Sound chime
  playCompletionChime();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`[DIRECTIVE OS] ${title}`, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'directive-os-alert',
      });
    } catch (e) {
      console.warn('Native notification failed', e);
    }
  }
}

export const DEFAULT_SCHEDULE = [
  { time: '08:00', title: 'Directive 01: Morning Crucible ready.', body: '5-minute cognitive agility drill initialized.' },
  { time: '13:30', title: 'Directive 02: Recon Vector.', body: 'Maintain active human and environmental observation.' },
  { time: '17:30', title: 'Directive 03: Physical Armor window open.', body: 'Execute Boxing rounds or Gym compound lifts.' },
  { time: '21:30', title: 'Directive 05: Takhkir Operational Debrief.', body: 'Log your ground truth and single rule adjustment.' },
];
