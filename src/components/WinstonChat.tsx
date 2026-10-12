'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Send,
  Monitor,
  Loader2,
  Bot,
  User,
  Trash2,
  Camera,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { db, ChatMessage, getSessionId } from '@/lib/db';
import { speakWinston, stopWinstonSpeech } from '@/lib/winston';
import ConnectPCModal from './ConnectPCModal';

interface DesktopStatus {
  online: boolean;
  lastHeartbeat: string | null;
}

export default function WinstonChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'english' | 'malayalam'>('english');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [desktopStatus, setDesktopStatus] = useState<DesktopStatus>({
    online: false,
    lastHeartbeat: null,
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPCModalOpen, setIsPCModalOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sessionId = getSessionId();

  // Load chat history from IndexedDB
  const messages = useLiveQuery(
    () => db.chatMessages.where('sessionId').equals(sessionId).sortBy('timestamp'),
    [sessionId],
    []
  );

  // Poll desktop agent status
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/pc/heartbeat');
      if (res.ok) {
        const data: DesktopStatus = await res.json();
        setDesktopStatus(data);
      }
    } catch {
      setDesktopStatus({ online: false, lastHeartbeat: null });
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Detect language switch in text
  const detectLanguageSwitch = useCallback((text: string): 'english' | 'malayalam' | null => {
    const lower = text.toLowerCase();
    if (
      lower.includes('speak malayalam') ||
      lower.includes('switch to malayalam') ||
      lower.includes('malayalamil') ||
      lower.includes('മലയാളം')
    ) {
      return 'malayalam';
    }
    if (
      lower.includes('speak english') ||
      lower.includes('switch to english') ||
      lower.includes('in english')
    ) {
      return 'english';
    }
    return null;
  }, []);

  // Send message to Winston
  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    setIsLoading(true);

    const langSwitch = detectLanguageSwitch(textToSend);
    const activeLang = langSwitch || language;
    if (langSwitch) {
      setLanguage(langSwitch);
    }

    // Save user message to IndexedDB
    await db.chatMessages.add({
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      sessionId,
      language: activeLang,
    });

    try {
      const history = (messages || []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      history.push({ role: 'user', content: textToSend });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          language: activeLang,
        }),
      });

      const data = await res.json() as { response?: string; error?: string };
      const reply = data.response || data.error || 'Winston is temporarily unavailable.';

      const addedId = await db.chatMessages.add({
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        sessionId,
        language: activeLang,
      });

      // Auto-voice if enabled
      if (isVoiceEnabled && reply) {
        speakWinston(reply, activeLang);
      }
    } catch {
      await db.chatMessages.add({
        role: 'assistant',
        content:
          activeLang === 'malayalam'
            ? 'വിൻസ്റ്റണുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. ദയവായി ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.'
            : 'Connection to Winston was interrupted. Please check your network and retry.',
        timestamp: new Date().toISOString(),
        sessionId,
      });
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  // Inspect & Analyze PC Screen
  const handleScreenCapture = async () => {
    if (!desktopStatus.online || isCapturing) {
      setIsPCModalOpen(true);
      return;
    }

    setIsCapturing(true);

    await db.chatMessages.add({
      role: 'user',
      content: '📸 Winston, inspect my PC screen and provide the answer or solution.',
      timestamp: new Date().toISOString(),
      sessionId,
      hasScreenshot: true,
    });

    try {
      await fetch('/api/pc/capture', { method: 'POST' });

      let screenshot: string | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const res = await fetch('/api/pc/capture');
        const data = await res.json() as { status: string; screenshot: string | null };
        if (data.status === 'ready' && data.screenshot) {
          screenshot = data.screenshot;
          break;
        }
      }

      if (screenshot) {
        const visionRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [],
            language,
            screenshot,
            screenQuestion:
              'Examine this PC display capture carefully. If there is a coding problem, interview test, or question visible, SOLVE IT directly. If there is an error, diagnose and fix it. Summarize concisely in Winston style.',
          }),
        });

        const visionData = await visionRes.json() as { response?: string; error?: string };
        const analysis = visionData.response || 'Unable to analyze the screenshot.';

        await db.chatMessages.add({
          role: 'assistant',
          content: `🖥️ **Desktop Screen Intelligence:**\n\n${analysis}`,
          timestamp: new Date().toISOString(),
          sessionId,
          hasScreenshot: true,
        });

        if (isVoiceEnabled) {
          speakWinston(analysis, language);
        }
      } else {
        await db.chatMessages.add({
          role: 'assistant',
          content:
            'The desktop agent did not return a screen buffer within the timeout window. Ensure python agent is running.',
          timestamp: new Date().toISOString(),
          sessionId,
        });
      }
    } catch {
      await db.chatMessages.add({
        role: 'assistant',
        content: 'Failed to communicate with desktop screen agent.',
        timestamp: new Date().toISOString(),
        sessionId,
      });
    }

    setIsCapturing(false);
  };

  const handleSpeakMessage = (id: number, text: string, msgLang?: 'english' | 'malayalam') => {
    if (speakingMessageId === id) {
      stopWinstonSpeech();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      speakWinston(text, msgLang || language);
    }
  };

  const handleCopyMessage = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = async () => {
    stopWinstonSpeech();
    await db.chatMessages.where('sessionId').equals(sessionId).delete();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    {
      label: 'LangChain Script Drill',
      prompt: 'Give me an intermediate LangChain Python challenge for AI Integration Engineering.',
    },
    {
      label: 'Prompt QA Testing',
      prompt: 'How do I build an automated testing script in Python to detect hallucinations in LLM outputs?',
    },
    {
      label: 'മലയാളത്തിൽ പറയൂ 🇮🇳',
      prompt: 'വിൻസ്റ്റൺ, എനിക്ക് AI എഞ്ചിനീയറിംഗിനെക്കുറിച്ച് മലയാളത്തിൽ വിശദീകരിച്ചു തരൂ.',
    },
    {
      label: 'Mentalism Cold Read',
      prompt: 'Give me a rapid observational drill for baseline cue detection.',
    },
  ];

  return (
    <>
      <div className="blick-card rounded-2xl border border-white/10 bg-[#111111] shadow-2xl flex flex-col relative overflow-hidden h-[75vh] min-h-[520px]">
        {/* Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e38b6c] to-transparent" />

        {/* Chat Control Header */}
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#111111]/90 backdrop-blur-md">
          {/* Left: Bot Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/20">
              <div className="w-full h-full bg-[#080808] rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#e38b6c]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase">
                  WINSTON AI
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-cyan-300 border border-cyan-500/30">
                  LLaMA 3.3 70B
                </span>
              </div>
              <p className="text-[10px] font-mono text-gray-400">
                Personal Cognitive &amp; Engineering Assistant
              </p>
            </div>
          </div>

          {/* Right: Actions & Controls */}
          <div className="flex items-center gap-1.5">
            {/* Language Switch Toggle */}
            <button
              onClick={() => {
                const next = language === 'english' ? 'malayalam' : 'english';
                setLanguage(next);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono transition border border-white/10 hover:border-white/20 bg-white/[0.04] flex items-center gap-1 text-gray-200"
              title="Click to toggle English / Malayalam"
            >
              <span>{language === 'malayalam' ? '🇮🇳 മലയാളം' : '🇬🇧 EN'}</span>
            </button>

            {/* Read Aloud Toggle */}
            <button
              onClick={() => {
                if (isVoiceEnabled) stopWinstonSpeech();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={`p-1.5 rounded-lg border text-xs transition ${
                isVoiceEnabled
                  ? 'bg-[#e38b6c]/20 border-[#e38b6c]/40 text-[#e38b6c]'
                  : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
              }`}
              title={isVoiceEnabled ? 'Voice output enabled' : 'Voice output disabled'}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Connect PC Button */}
            <button
              onClick={() => setIsPCModalOpen(true)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border flex items-center gap-1.5 transition ${
                desktopStatus.online
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
              }`}
              title="Open Desktop Link Radar"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {desktopStatus.online ? 'Desktop Linked' : 'Connect PC'}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  desktopStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                }`}
              />
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-gray-500 hover:text-rose-400 transition"
              title="Clear today's conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 custom-scrollbar bg-[#090909]/40">
          {(!messages || messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
              <div className="w-14 h-14 rounded-2xl blick-gradient-bg p-[1px] shadow-xl shadow-[#e38b6c]/20">
                <div className="w-full h-full bg-[#080808] rounded-[15px] flex items-center justify-center">
                  <Bot className="w-7 h-7 text-[#e38b6c]" />
                </div>
              </div>
              <div className="max-w-sm space-y-1">
                <p className="text-sm font-mono font-bold text-gray-200">
                  WINSTON SYNTHETIC INTELLIGENCE
                </p>
                <p className="text-xs text-gray-400 font-sans">
                  {language === 'malayalam'
                    ? 'നമസ്കാരം സർ. AI എഞ്ചിനീയറിംഗ്, പൈത്തൺ പ്രോംപ്റ്റിംഗ്, അല്ലെങ്കിൽ മെന്റലിസം പരിശീലനത്തിൽ സഹായിക്കാൻ ഞാൻ സജ്ജനാണ്.'
                    : 'Good day, Sir. I am primed to assist with your AI engineering roadmap, LangChain scripts, or computer screen analysis.'}
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(undefined, s.prompt)}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#e38b6c]/40 text-left transition flex items-start gap-2 group text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#e38b6c] mt-0.5 flex-shrink-0 group-hover:scale-110 transition" />
                    <span className="text-gray-300 font-sans">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages?.map((msg: ChatMessage) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg blick-gradient-bg p-[1px] flex-shrink-0 mt-1">
                  <div className="w-full h-full bg-[#080808] rounded-[7px] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-[#e38b6c]" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md group relative ${
                  msg.role === 'user'
                    ? 'bg-[#e38b6c]/20 text-gray-100 border border-[#e38b6c]/30 rounded-tr-none'
                    : 'bg-[#141414] text-gray-200 border border-white/10 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap break-words font-sans">{msg.content}</div>

                {/* Bubble Bottom Meta & Actions */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.05] text-[10px] text-gray-500 font-mono">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">
                      {/* Speak Message Button */}
                      <button
                        onClick={() =>
                          msg.id && handleSpeakMessage(msg.id, msg.content, msg.language)
                        }
                        className="hover:text-white transition p-0.5"
                        title="Read aloud"
                      >
                        <Volume2
                          className={`w-3.5 h-3.5 ${
                            speakingMessageId === msg.id ? 'text-[#e38b6c] animate-pulse' : ''
                          }`}
                        />
                      </button>

                      {/* Copy Message Button */}
                      <button
                        onClick={() => msg.id && handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-white transition p-0.5"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex-shrink-0 mt-1 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg blick-gradient-bg p-[1px] flex-shrink-0 mt-1">
                <div className="w-full h-full bg-[#080808] rounded-[7px] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-[#e38b6c]" />
                </div>
              </div>
              <div className="bg-[#141414] border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-[#e38b6c] animate-spin" />
                <span className="text-xs text-gray-400 font-mono">
                  {language === 'malayalam'
                    ? 'വിൻസ്റ്റൺ ചിന്തിക്കുന്നു...'
                    : 'Winston is synthesizing...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/[0.08] p-3 bg-[#111111]">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            {/* Direct Screen Inspect Trigger */}
            <button
              type="button"
              onClick={handleScreenCapture}
              disabled={isCapturing}
              className={`p-2.5 rounded-xl border transition flex-shrink-0 ${
                desktopStatus.online
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-white'
              }`}
              title={
                desktopStatus.online
                  ? 'Inspect PC Screen Now'
                  : 'Desktop offline - Click to see instructions'
              }
            >
              {isCapturing ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#e38b6c]" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            {/* Chat Input Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === 'malayalam'
                  ? 'വിൻസ്റ്റണോട് എന്തും ചോദിക്കൂ... (Enter to send)'
                  : 'Ask Winston anything, or inspect PC screen... (Enter to send)'
              }
              rows={1}
              className="flex-1 bg-[#080808] text-xs text-white placeholder-gray-500 rounded-xl px-3.5 py-3 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none font-sans resize-none transition max-h-32 overflow-y-auto"
              style={{ minHeight: '42px' }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl blick-gradient-bg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#e38b6c]/25 flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Connect PC Modal */}
      <ConnectPCModal
        isOpen={isPCModalOpen}
        onClose={() => setIsPCModalOpen(false)}
        onInspectScreen={handleScreenCapture}
        isCapturing={isCapturing}
        desktopOnline={desktopStatus.online}
        lastHeartbeat={desktopStatus.lastHeartbeat}
      />
    </>
  );
}
