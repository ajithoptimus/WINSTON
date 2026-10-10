'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Send,
  Monitor,
  Loader2,
  Bot,
  User,
  Globe,
  Trash2,
  Camera,
} from 'lucide-react';
import { db, ChatMessage, getSessionId } from '@/lib/db';

interface DesktopStatus {
  online: boolean;
  lastHeartbeat: string | null;
}

export default function WinstonChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'english' | 'malayalam'>('english');
  const [desktopStatus, setDesktopStatus] = useState<DesktopStatus>({ online: false, lastHeartbeat: null });
  const [isCapturing, setIsCapturing] = useState(false);
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
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/pc/heartbeat');
        if (res.ok) {
          const data: DesktopStatus = await res.json();
          setDesktopStatus(data);
        }
      } catch {
        setDesktopStatus({ online: false, lastHeartbeat: null });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect language switch commands
  const detectLanguageSwitch = useCallback((text: string): 'english' | 'malayalam' | null => {
    const lower = text.toLowerCase();
    if (lower.includes('speak malayalam') || lower.includes('malayalam') || lower.includes('മലയാളം')) {
      return 'malayalam';
    }
    if (lower.includes('speak english') || lower.includes('switch to english')) {
      return 'english';
    }
    return null;
  }, []);

  // Send message to Winston
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Check for language switch
    const langSwitch = detectLanguageSwitch(userMessage);
    if (langSwitch) {
      setLanguage(langSwitch);
    }
    const currentLang = langSwitch || language;

    // Save user message to IndexedDB
    await db.chatMessages.add({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      sessionId,
      language: currentLang,
    });

    try {
      // Build message history for API
      const history = (messages || []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      history.push({ role: 'user', content: userMessage });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          language: currentLang,
        }),
      });

      const data = await res.json() as { response?: string; error?: string };

      const reply = data.response || data.error || 'Winston is temporarily unavailable.';

      // Save assistant response
      await db.chatMessages.add({
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        sessionId,
        language: currentLang,
      });
    } catch {
      await db.chatMessages.add({
        role: 'assistant',
        content: 'Connection to Winston\'s neural network was interrupted. Please check your internet connection and try again.',
        timestamp: new Date().toISOString(),
        sessionId,
      });
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  // Capture and analyze PC screen
  const handleScreenCapture = async () => {
    if (!desktopStatus.online || isCapturing) return;

    setIsCapturing(true);

    // Save a user message about the request
    await db.chatMessages.add({
      role: 'user',
      content: '📸 Inspect my PC screen and tell me what you see.',
      timestamp: new Date().toISOString(),
      sessionId,
      hasScreenshot: true,
    });

    try {
      // Request capture
      await fetch('/api/pc/capture', { method: 'POST' });

      // Poll for result (max 15 seconds)
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
        // Send to vision API
        const visionRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [],
            language,
            screenshot,
            screenQuestion: 'Analyze this screenshot from my PC. Describe what you see, identify any questions or problems visible, and provide answers or insights.',
          }),
        });

        const visionData = await visionRes.json() as { response?: string; error?: string };
        const analysis = visionData.response || 'Unable to analyze the screenshot.';

        await db.chatMessages.add({
          role: 'assistant',
          content: `🖥️ **Desktop Screen Analysis:**\n\n${analysis}`,
          timestamp: new Date().toISOString(),
          sessionId,
          hasScreenshot: true,
        });
      } else {
        await db.chatMessages.add({
          role: 'assistant',
          content: 'The desktop agent did not respond with a screenshot within the timeout window. Please ensure the agent is running and try again.',
          timestamp: new Date().toISOString(),
          sessionId,
        });
      }
    } catch {
      await db.chatMessages.add({
        role: 'assistant',
        content: 'Failed to capture the desktop screen. Please check the agent connection.',
        timestamp: new Date().toISOString(),
        sessionId,
      });
    }

    setIsCapturing(false);
  };

  // Clear chat history
  const handleClearChat = async () => {
    await db.chatMessages.where('sessionId').equals(sessionId).delete();
  };

  // Handle enter key (shift+enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="blick-card rounded-xl border border-white/10 bg-[#111111] shadow-2xl flex flex-col relative overflow-hidden" style={{ height: '60vh', minHeight: '400px' }}>
      {/* Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#e38b6c]/50 to-transparent" />

      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/20">
            <div className="w-full h-full bg-[#080808] rounded-[7px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#e38b6c]" />
            </div>
          </div>
          <div>
            <h2 className="text-xs font-mono font-extrabold tracking-wider text-white uppercase">WINSTON AI</h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {language === 'malayalam' ? 'മലയാളം' : 'English'}
              </span>
              <span className="text-[#444]">•</span>
              <span className={`flex items-center gap-1 ${desktopStatus.online ? 'text-emerald-400' : 'text-gray-500'}`}>
                <Monitor className="w-3 h-3" />
                {desktopStatus.online ? '● Desktop Linked' : '○ Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Screen Capture Button */}
          <button
            onClick={handleScreenCapture}
            disabled={!desktopStatus.online || isCapturing}
            className={`p-2 rounded-lg text-xs font-mono transition border ${
              desktopStatus.online
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-white/[0.02] border-white/10 text-gray-600 cursor-not-allowed'
            }`}
            title={desktopStatus.online ? 'Capture & Solve' : 'Desktop agent offline'}
          >
            {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-gray-500 hover:text-rose-400 transition"
            title="Clear today's chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {(!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
            <div className="w-12 h-12 rounded-xl blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/30">
              <div className="w-full h-full bg-[#080808] rounded-[11px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#e38b6c]" />
              </div>
            </div>
            <div>
              <p className="text-sm font-mono font-bold text-gray-300">WINSTON ONLINE</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Good day, Sir. I am ready to assist with your AI career preparation, mentalism training, or any inquiry you may have.
              </p>
            </div>
          </div>
        )}

        {messages?.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md blick-gradient-bg p-[1px] flex-shrink-0 mt-1">
                <div className="w-full h-full bg-[#080808] rounded-[5px] flex items-center justify-center">
                  <Bot className="w-3 h-3 text-[#e38b6c]" />
                </div>
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#e38b6c]/20 text-gray-100 border border-[#e38b6c]/30'
                  : 'bg-[#080808] text-gray-300 border border-white/10'
              }`}
            >
              <div className="whitespace-pre-wrap break-words font-sans">{msg.content}</div>
              <p className="text-[9px] text-gray-600 mt-1.5 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex-shrink-0 mt-1 flex items-center justify-center">
                <User className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-md blick-gradient-bg p-[1px] flex-shrink-0 mt-1">
              <div className="w-full h-full bg-[#080808] rounded-[5px] flex items-center justify-center">
                <Bot className="w-3 h-3 text-[#e38b6c]" />
              </div>
            </div>
            <div className="bg-[#080808] border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-[#e38b6c] animate-spin" />
              <span className="text-xs text-gray-400 font-mono">Winston is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] px-3 py-2.5">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'malayalam' ? 'Winston-നോട് ചോദിക്കുക...' : 'Ask Winston anything...'}
            rows={1}
            className="flex-1 bg-[#080808] text-xs text-white placeholder-gray-500 rounded-lg px-3 py-2.5 border border-white/10 focus:border-[#e38b6c]/50 focus:outline-none font-sans resize-none transition max-h-24 overflow-y-auto"
            style={{ minHeight: '36px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg blick-gradient-bg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#e38b6c]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
