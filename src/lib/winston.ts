// Winston Tactical Voice Engine for DIRECTIVE OS
// Uses Web Speech Synthesis API for calm, British-accented tactical briefings & timer alerts

export interface WinstonVoiceConfig {
  enabled: boolean;
  rate: number;
  pitch: number;
}

const DEFAULT_CONFIG: WinstonVoiceConfig = {
  enabled: true,
  rate: 0.95, // Slightly measured pacing
  pitch: 0.9,  // Slightly deeper tone
};

let selectedVoice: SpeechSynthesisVoice | null = null;

function getWinstonVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  if (selectedVoice) return selectedVoice;

  const voices = window.speechSynthesis.getVoices();
  // Prefer British English voice for Winston persona (e.g. Daniel, Oliver, Arthur, en-GB)
  const britishVoice = voices.find(
    (v) => v.lang.includes('en-GB') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('UK')
  );

  const englishVoice = voices.find((v) => v.lang.startsWith('en'));

  selectedVoice = britishVoice || englishVoice || voices[0] || null;
  return selectedVoice;
}

/** Speak a text message using the Winston persona */
export function speakWinston(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getWinstonVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = DEFAULT_CONFIG.rate;
    utterance.pitch = DEFAULT_CONFIG.pitch;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Winston speech synthesis error', e);
  }
}

/** Speak full Winston morning protocol briefing */
export function speakWinstonBriefing(dateStr: string, drillTitle: string, reconCue: string) {
  const text = `Good day, Operator. Protocol for ${dateStr} is active. Directive 01 is ${drillTitle}. Daytime Recon focus: ${reconCue}. All systems operational.`;
  speakWinston(text);
}

/** Tactical timer alerts for Boxing & Cognitive Drills */
export function speakWinstonTimerAlert(alertType: 'work_start' | 'rest_start' | 'drill_halfway' | 'drill_complete', roundNum?: number) {
  switch (alertType) {
    case 'work_start':
      speakWinston(`Work round ${roundNum || 1} initiated. Maintain posture and strike frequency.`);
      break;
    case 'rest_start':
      speakWinston(`Rest round active. Control breathing and lower heart rate.`);
      break;
    case 'drill_halfway':
      speakWinston(`Halfway point reached. Sustain focus.`);
      break;
    case 'drill_complete':
      speakWinston(`Directive complete. Protocol recorded.`);
      break;
  }
}
