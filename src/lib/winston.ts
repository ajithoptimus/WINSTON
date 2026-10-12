// Winston Tactical Voice Engine for DIRECTIVE OS & WINSTON v2
// Uses Web Speech Synthesis API for calm British AI speech & Malayalam pronunciation

export interface WinstonVoiceConfig {
  enabled: boolean;
  rate: number;
  pitch: number;
}

const DEFAULT_CONFIG: WinstonVoiceConfig = {
  enabled: true,
  rate: 0.95,
  pitch: 0.9,
};

function getVoiceForLanguage(lang: 'english' | 'malayalam'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (lang === 'malayalam') {
    // Look for Malayalam voice (ml-IN, ml)
    const malayalamVoice = voices.find(
      (v) => v.lang.startsWith('ml') || v.lang.toLowerCase().includes('malayalam')
    );
    if (malayalamVoice) return malayalamVoice;

    // Fallback for Indian accent if specific Malayalam voice isn't installed
    const indianVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes('hi-IN'));
    if (indianVoice) return indianVoice;
  }

  // British English for Winston persona (e.g. Daniel, Oliver, Arthur, en-GB)
  const britishVoice = voices.find(
    (v) =>
      v.lang.includes('en-GB') ||
      v.name.includes('Daniel') ||
      v.name.includes('Oliver') ||
      v.name.includes('UK') ||
      v.name.includes('British')
  );
  if (britishVoice) return britishVoice;

  const englishVoice = voices.find((v) => v.lang.startsWith('en'));
  return englishVoice || voices[0] || null;
}

/** Speak a text message using the Winston persona (English or Malayalam) */
export function speakWinston(text: string, language: 'english' | 'malayalam' = 'english') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    // Strip markdown formatting symbols for cleaner speech
    const cleanText = text
      .replace(/[*_#`~>[\]]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = getVoiceForLanguage(language);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = language === 'malayalam' ? 'ml-IN' : 'en-GB';
    utterance.rate = language === 'malayalam' ? 0.9 : DEFAULT_CONFIG.rate;
    utterance.pitch = DEFAULT_CONFIG.pitch;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Winston speech synthesis error', e);
  }
}

/** Stop any active Winston speech */
export function stopWinstonSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.warn('Speech cancellation error', e);
  }
}

/** Check if speech synthesis is currently active */
export function isWinstonSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

/** Speak full Winston morning protocol briefing */
export function speakWinstonBriefing(dateStr: string, drillTitle: string, reconCue: string) {
  const text = `Good day, Operator. Protocol for ${dateStr} is active. Directive 01 is ${drillTitle}. Daytime Recon focus: ${reconCue}. All systems operational.`;
  speakWinston(text);
}

/** Tactical timer alerts for Boxing & Cognitive Drills */
export function speakWinstonTimerAlert(
  alertType: 'work_start' | 'rest_start' | 'drill_halfway' | 'drill_complete',
  roundNum?: number
) {
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
