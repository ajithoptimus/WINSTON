// Winston Tactical Voice Engine for DIRECTIVE OS & WINSTON v2
// High-fidelity Neural Audio Engine with native Malayalam & British English TTS

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let isAudioPlaying = false;

function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, '') // strip code blocks
    .replace(/`[^`]+`/g, '') // strip inline code
    .replace(/[*_#~>[\]]/g, ' ') // strip markdown formatting
    .replace(/https?:\/\/\S+/g, '') // strip urls
    .replace(/\s+/g, ' ')
    .trim();
}

/** Fallback to browser SpeechSynthesis if network TTS is unreachable */
function speakViaSpeechSynthesis(text: string, language: 'english' | 'malayalam', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
    utterance.lang = language === 'malayalam' ? 'ml-IN' : 'en-GB';
    utterance.rate = 0.95;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis fallback failed:', e);
    if (onEnd) onEnd();
  }
}

/** Speak a text message using Winston's Neural Voice (Malayalam or English) */
export async function speakWinston(
  text: string,
  language: 'english' | 'malayalam' = 'english',
  onEnd?: () => void
): Promise<void> {
  if (typeof window === 'undefined') return;

  stopWinstonSpeech();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  try {
    isAudioPlaying = true;

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, language }),
    });

    if (!res.ok) {
      throw new Error(`TTS server responded with ${res.status}`);
    }

    const blob = await res.blob();
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }
    currentObjectUrl = URL.createObjectURL(blob);

    const audio = new Audio(currentObjectUrl);
    currentAudio = audio;

    audio.onended = () => {
      isAudioPlaying = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
      }
      currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      isAudioPlaying = false;
      currentAudio = null;
      // Fallback to local speech synthesis
      speakViaSpeechSynthesis(clean, language, onEnd);
    };

    await audio.play();
  } catch (error) {
    console.warn('Neural TTS failed, falling back to browser synthesis:', error);
    isAudioPlaying = false;
    speakViaSpeechSynthesis(clean, language, onEnd);
  }
}

/** Stop any active Winston speech playback */
export function stopWinstonSpeech(): void {
  if (typeof window === 'undefined') return;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch {
      // ignore
    }
    currentObjectUrl = null;
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  isAudioPlaying = false;
}

/** Check if Winston is currently speaking */
export function isWinstonSpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  return isAudioPlaying || (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.speaking);
}

/** Speak full Winston morning protocol briefing */
export function speakWinstonBriefing(dateStr: string, drillTitle: string, reconCue: string) {
  const text = `Good day, Operator. Protocol for ${dateStr} is active. Directive 01 is ${drillTitle}. Daytime Recon focus: ${reconCue}. All systems operational.`;
  speakWinston(text, 'english');
}

/** Tactical timer alerts for Boxing & Cognitive Drills */
export function speakWinstonTimerAlert(
  alertType: 'work_start' | 'rest_start' | 'drill_halfway' | 'drill_complete',
  roundNum?: number
) {
  switch (alertType) {
    case 'work_start':
      speakWinston(`Work round ${roundNum || 1} initiated. Maintain posture and strike frequency.`, 'english');
      break;
    case 'rest_start':
      speakWinston(`Rest round active. Control breathing and lower heart rate.`, 'english');
      break;
    case 'drill_halfway':
      speakWinston(`Halfway point reached. Sustain focus.`, 'english');
      break;
    case 'drill_complete':
      speakWinston(`Directive complete. Protocol recorded.`, 'english');
      break;
  }
}
