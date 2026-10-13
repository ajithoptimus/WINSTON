'use client';

import { useState } from 'react';
import {
  Monitor,
  Camera,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface ConnectPCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectScreen: () => void;
  isCapturing: boolean;
  desktopOnline: boolean;
  lastHeartbeat: string | null;
}

export default function ConnectPCModal({
  isOpen,
  onClose,
  onInspectScreen,
  isCapturing,
  desktopOnline,
  lastHeartbeat,
}: ConnectPCModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg blick-card rounded-2xl border border-white/10 bg-[#111111] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e38b6c] to-transparent" />

        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl blick-gradient-bg p-[1px] shadow-lg shadow-[#e38b6c]/20">
              <div className="w-full h-full bg-[#080808] rounded-[11px] flex items-center justify-center">
                <Monitor className="w-5 h-5 text-[#e38b6c]" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-mono font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
                DESKTOP LINK &amp; SCREEN RADAR
              </h2>
              <p className="text-[11px] font-mono text-gray-400">
                Silent Command-Line Agent Relay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          {/* Connection Status Card */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              desktopOnline
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  desktopOnline
                    ? 'bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20'
                    : 'bg-amber-400'
                }`}
              />
              <div>
                <p className="font-mono font-bold text-white text-sm">
                  {desktopOnline ? '● DESKTOP LINKED (ONLINE)' : '○ DESKTOP OFFLINE'}
                </p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {desktopOnline
                    ? `Agent standby (${lastHeartbeat ? new Date(lastHeartbeat).toLocaleTimeString() : 'Active'})`
                    : 'Run launch command in terminal to link your PC...'}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border uppercase ${
                desktopOnline
                  ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/20'
                  : 'border-amber-500/40 text-amber-300 bg-amber-500/20'
              }`}
            >
              {desktopOnline ? '● Linked' : '○ Offline'}
            </span>
          </div>

          {/* Capture Screen Trigger */}
          <div>
            <button
              onClick={() => {
                onInspectScreen();
                onClose();
              }}
              disabled={!desktopOnline || isCapturing}
              className={`w-full py-3.5 px-4 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-lg ${
                desktopOnline
                  ? 'blick-gradient-bg text-white hover:shadow-[#e38b6c]/30 hover:brightness-110 active:scale-[0.99]'
                  : 'bg-white/[0.04] text-gray-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Capturing Screen...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Capture Screen</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-500 text-center font-mono mt-2">
              Winston holds full operational control — captures only when you tap above.
            </p>
          </div>

          {/* Terminal Commands */}
          <div className="space-y-3 pt-2 border-t border-white/[0.08]">
            <h3 className="font-mono text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#e38b6c]" />
              <span>Command Prompt Controls (Zero UI / Silent)</span>
            </h3>

            <div className="space-y-2.5">
              {/* Start Command */}
              <div className="p-3 rounded-lg bg-[#080808] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-emerald-400 text-[11px]">
                    ▶ Start Silent Agent (in CMD)
                  </span>
                  <button
                    onClick={() => copyToClipboard('winston start', 'start')}
                    className="text-[10px] font-mono text-[#e38b6c] hover:underline flex items-center gap-1"
                  >
                    {copied === 'start' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied === 'start' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="block p-2 rounded bg-black/60 text-emerald-300 font-mono text-xs border border-white/5">
                  winston start
                </code>
              </div>

              {/* Stop Command */}
              <div className="p-3 rounded-lg bg-[#080808] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-rose-400 text-[11px]">
                    ⏹ Stop Silent Agent (in CMD)
                  </span>
                  <button
                    onClick={() => copyToClipboard('winston stop', 'stop')}
                    className="text-[10px] font-mono text-[#e38b6c] hover:underline flex items-center gap-1"
                  >
                    {copied === 'stop' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied === 'stop' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="block p-2 rounded bg-black/60 text-rose-300 font-mono text-xs border border-white/5">
                  winston stop
                </code>
              </div>

              {/* Status Command */}
              <div className="p-3 rounded-lg bg-[#080808] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-cyan-400 text-[11px]">
                    ℹ Check Agent Status (in CMD)
                  </span>
                  <button
                    onClick={() => copyToClipboard('winston status', 'status')}
                    className="text-[10px] font-mono text-[#e38b6c] hover:underline flex items-center gap-1"
                  >
                    {copied === 'status' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied === 'status' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="block p-2 rounded bg-black/60 text-cyan-300 font-mono text-xs border border-white/5">
                  winston status
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
