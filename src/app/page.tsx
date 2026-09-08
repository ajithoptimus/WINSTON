'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Monitor,
  Apple,
  Terminal,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Cpu,
  HardDrive,
  RefreshCw,
  Globe,
  ExternalLink,
  Zap,
  CheckSquare,
  Square,
  FileText,
  KeyRound,
  PackageCheck,
  Sliders,
  Layers,
  FileCode,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [lang, setLang] = useState<'en' | 'de'>('en');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showAttention, setShowAttention] = useState<boolean>(false);
  const [expandedChangelogs, setExpandedChangelogs] = useState<Record<string, boolean>>({
    v015: true,
    v014: false,
  });

  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const toggleTerms = () => {
    setAcceptedTerms(!acceptedTerms);
    if (!acceptedTerms) {
      setShowAttention(false);
    }
  };

  const handleDownloadClick = (filename: string, fileUrl: string) => {
    if (!acceptedTerms) {
      setShowAttention(true);
      setTimeout(() => setShowAttention(false), 2500);
      return;
    }

    setDownloadingFile(filename);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    // Trigger mock download
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = filename;
      a.click();
      setTimeout(() => setDownloadingFile(null), 1500);
    }, 500);
  };

  const toggleChangelog = (ver: string) => {
    setExpandedChangelogs((prev) => ({
      ...prev,
      [ver]: !prev[ver],
    }));
  };

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white selection:bg-cyan-500/30 selection:text-cyan-200 font-sans overflow-x-hidden">
      
      {/* Ambient Drifting Luminescence Mesh Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-cyan-500/15 blur-[140px] animate-orb-1" />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-indigo-600/15 blur-[150px] animate-orb-2" />
        <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-amber-500/10 blur-[160px] animate-orb-3" />
      </div>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 w-full px-6 py-4 bg-[#07090E]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090E] rounded-[11px] flex items-center justify-center font-black text-cyan-400 text-lg tracking-tighter">
                B
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-white">BLICK</span>
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">NATIVE VIDEO EDITOR</span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#about" className="text-gray-400 hover:text-white transition font-medium hidden sm:inline">About</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition font-medium hidden sm:inline">Buy</a>
            <a href="#docs" className="text-gray-400 hover:text-white transition font-medium hidden md:inline">Docs</a>
            
            <a
              href="#download"
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            {/* Language Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg transition ${lang === 'en' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('de')}
                className={`px-2 py-1 rounded-lg transition ${lang === 'de' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                DE
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Download Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-24 space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Public Beta Version 0.1.5 • 64-bit Native Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight"
          >
            Download <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">Blick</span> Video Editor
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto"
          >
            The next-generation, high-performance video editor built from scratch for Windows 10/11 and macOS Apple Silicon.
          </motion.p>

          <div className="pt-2 text-xs font-mono text-cyan-400">
            <a href="#changelog" className="hover:underline flex items-center justify-center gap-1">
              <span>See full changelog details</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* TERMS & DOWNLOAD GATE CARD */}
        <section id="download" className="max-w-3xl mx-auto">
          <motion.div
            animate={showAttention ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
              acceptedTerms
                ? 'glass-surface-active border-cyan-500/40 shadow-2xl shadow-cyan-500/10'
                : showAttention
                ? 'glass-surface bg-rose-950/20 border-rose-500/50 shadow-2xl shadow-rose-500/20'
                : 'glass-surface border-white/10'
            }`}
          >
            {/* Gate Control Checkbox */}
            <div className="flex items-start gap-4 mb-6 p-4 rounded-2xl bg-black/40 border border-white/5">
              <button
                type="button"
                onClick={toggleTerms}
                className="mt-0.5 shrink-0 focus:outline-none"
              >
                {acceptedTerms ? (
                  <CheckSquare className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
                ) : (
                  <Square className="w-6 h-6 text-gray-500 hover:text-gray-300 transition" />
                )}
              </button>
              
              <div className="text-sm text-gray-300 leading-relaxed">
                <span>For the download and use of Blick I accept the </span>
                <a href="#terms" className="text-cyan-400 underline font-medium hover:text-cyan-300">
                  Terms of Use
                </a>
                <span> and acknowledge the software is in open beta evaluation.</span>

                {!acceptedTerms && (
                  <p className={`text-xs font-mono mt-2 transition-colors ${showAttention ? 'text-rose-400 font-bold' : 'text-amber-400/80'}`}>
                    ⚠️ {showAttention ? 'Action Required: You must check the terms box above to unlock download links.' : 'Check the box above to unlock your build installer.'}
                  </p>
                )}
              </div>
            </div>

            {/* OS DOWNLOAD CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* WINDOWS CARD */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Windows</h3>
                      <p className="text-[10px] font-mono text-gray-400">10 / 11 • 64-bit</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">x64</span>
                </div>

                <div className="space-y-2">
                  <button
                    disabled={!acceptedTerms}
                    onClick={() => handleDownloadClick('Blick_0.1.5_win_x64_installer.exe', 'https://blickeditor.com/dl/Blick_0.1.5_win_x64_installer.exe')}
                    className={`w-full p-3 rounded-xl font-mono text-xs transition flex items-center justify-between shadow-lg ${
                      acceptedTerms
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 cursor-pointer'
                        : 'bg-white/[0.04] text-gray-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-bold">Installer</span>
                    </div>
                    <span className="text-[10px] opacity-80">22 MB .exe</span>
                  </button>

                  <button
                    disabled={!acceptedTerms}
                    onClick={() => handleDownloadClick('Blick_0.1.5_win_x64_portable.zip', 'https://blickeditor.com/dl/Blick_0.1.5_win_x64_portable.zip')}
                    className={`w-full p-2.5 rounded-xl font-mono text-xs transition flex items-center justify-between ${
                      acceptedTerms
                        ? 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 border border-white/10 cursor-pointer'
                        : 'bg-white/[0.02] text-gray-600 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <span>Portable (.zip)</span>
                    <span className="text-[10px] text-gray-400">29 MB</span>
                  </button>
                </div>
              </div>

              {/* MACOS CARD */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Apple className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">macOS</h3>
                      <p className="text-[10px] font-mono text-gray-400">15+ • Apple Silicon</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">ARM64</span>
                </div>

                <div className="space-y-2">
                  <button
                    disabled={!acceptedTerms}
                    onClick={() => handleDownloadClick('Blick_0.1.5_macos_arm64_installer.dmg', 'https://blickeditor.com/dl/Blick_0.1.5_macos_arm64_installer.dmg')}
                    className={`w-full p-3 rounded-xl font-mono text-xs transition flex items-center justify-between shadow-lg ${
                      acceptedTerms
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-400 hover:to-cyan-500 text-white shadow-indigo-500/25 cursor-pointer'
                        : 'bg-white/[0.04] text-gray-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span className="font-bold">Installer</span>
                    </div>
                    <span className="text-[10px] opacity-80">22 MB .dmg</span>
                  </button>

                  <button
                    disabled={!acceptedTerms}
                    onClick={() => handleDownloadClick('Blick_0.1.5_macos_arm64_portable.zip', 'https://blickeditor.com/dl/Blick_0.1.5_macos_arm64_portable.zip')}
                    className={`w-full p-2.5 rounded-xl font-mono text-xs transition flex items-center justify-between ${
                      acceptedTerms
                        ? 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 border border-white/10 cursor-pointer'
                        : 'bg-white/[0.02] text-gray-600 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <span>Portable (.zip)</span>
                    <span className="text-[10px] text-gray-400">22 MB</span>
                  </button>
                </div>
              </div>

              {/* LINUX CARD */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-gray-400">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-300">Linux</h3>
                      <p className="text-[10px] font-mono text-gray-500">Kernel 6.x</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center font-mono text-xs text-amber-400/90">
                  Coming Soon
                </div>
              </div>

            </div>

            {/* Note */}
            <p className="text-xs text-gray-400 text-center mt-6">
              This free test version of Blick cannot open project files.{' '}
              <a href="#pricing" className="text-cyan-400 underline hover:text-cyan-300">Buy a license key</a>
              {' '}to unlock opening saved project files.
            </p>
          </motion.div>
        </section>

        {/* CHANGELOG SECTION */}
        <section id="changelog" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              What&apos;s New in Beta Builds
            </h2>
            <span className="text-xs font-mono text-gray-400">Version History</span>
          </div>

          {/* BETA 0.1.5 CARD */}
          <div className="rounded-2xl p-6 glass-surface border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">LATEST</span>
                <h3 className="text-lg font-bold text-white mt-1">Beta 0.1.5 Changelog</h3>
              </div>
              <button
                onClick={() => toggleChangelog('v015')}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 transition"
              >
                {expandedChangelogs.v015 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {expandedChangelogs.v015 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2 border-t border-white/5 text-xs text-gray-300"
              >
                <div>
                  <h4 className="font-mono text-cyan-400 font-bold uppercase mb-2">Improvements</h4>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-cyan-400">
                    <li>The JKL shuttle speed step factor is adjustable again from Settings (1 to 8), instead of being fixed at 2x per tap.</li>
                    <li>Clearer media selection modifiers in the Media panel: Ctrl adds to selection, Shift range-selects from last item, and Ctrl+Shift adds that range.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono text-amber-400 font-bold uppercase mb-2">Bugfixes</h4>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-amber-400">
                    <li>Fix Waveforms and Überblick not appearing as they finish loading.</li>
                    <li>The Media panel clears its selection only when you click empty space inside the panel, not when clicking elsewhere.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

          {/* BETA 0.1.4 CARD */}
          <div className="rounded-2xl p-6 glass-surface border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Beta 0.1.4</h3>
                <p className="text-xs text-gray-400">Major Feature Release: Ripple Editing, Layout Presets, Multiwindow & Chroma Key</p>
              </div>
              <button
                onClick={() => toggleChangelog('v014')}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 transition"
              >
                {expandedChangelogs.v014 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {expandedChangelogs.v014 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2 border-t border-white/5 text-xs text-gray-300"
              >
                <div>
                  <h4 className="font-mono text-cyan-400 font-bold uppercase mb-2">New Features</h4>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-cyan-400">
                    <li><strong>Ripple editing:</strong> Ripple delete selection (Shift+X), Ripple cut (Ctrl+Shift+X), Ripple delete clip at playhead (W).</li>
                    <li><strong>Layout presets:</strong> Save current panel arrangement as named layout and switch between layouts.</li>
                    <li><strong>Multiwindow:</strong> Drag a panel tab out of the window to detach into its own window.</li>
                    <li><strong>Chroma key effect:</strong> Key out green/blue screen transparently with keyframeable controls.</li>
                    <li><strong>Selective effect copy:</strong> Copy individual effects or paste effects across clips with keyframe preservation.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* PRODUCT DESCRIPTION & TECHNICAL REQUIREMENTS GRID */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Product Description & Technical Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div className="p-5 rounded-2xl glass-surface border border-white/10 space-y-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 w-fit text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Development Status</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Blick is in open beta. Pre-1.0 release under active development: ready for real production work with regular performance updates.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-surface border border-white/10 space-y-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 w-fit text-indigo-400">
                <Monitor className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Supported OS</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-mono">
                Windows 10/11 (64-bit)<br />macOS 15 or later on Apple Silicon (M1/M2/M3/M4).
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-surface border border-white/10 space-y-2">
              <div className="p-2 rounded-lg bg-amber-500/10 w-fit text-amber-400">
                <PackageCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Delivery</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Free download available anytime. After purchasing a license, your key is delivered by email within 24 hours.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-surface border border-white/10 space-y-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 w-fit text-emerald-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">100% Offline Activation</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Enter your license key inside Blick to unlock opening saved projects. Activation works fully offline without account lock-in.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-surface border border-white/10 space-y-2">
              <div className="p-2 rounded-lg bg-rose-500/10 w-fit text-rose-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Hardware Requirements</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-mono">
                x86-64 / Apple Silicon<br />8 GB RAM minimum (16 GB recommended)<br />Direct3D 11 / Metal GPU.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-surface border border-white/10 space-y-2">
              <div className="p-2 rounded-lg bg-purple-500/10 w-fit text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">2-Year Update Guarantee</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                License includes all updates released during the 2 years following purchase. Afterwards your installed software keeps working forever.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#07090E]/90 px-6 py-12 text-xs text-gray-400">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
              B
            </div>
            <span>&copy; 2026 Dihedron Software GmbH. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <a href="#about" className="hover:text-cyan-400 transition">About</a>
            <a href="#changelog" className="hover:text-cyan-400 transition">Changelog</a>
            <a href="#terms" className="hover:text-cyan-400 transition">Terms of Use</a>
            <a href="#privacy" className="hover:text-cyan-400 transition">Privacy</a>
            <a href="#license" className="hover:text-cyan-400 transition">License Agreement</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
