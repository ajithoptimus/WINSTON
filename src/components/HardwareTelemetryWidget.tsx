'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Watch, Heart, Activity, Radio, AlertCircle, X, Check } from 'lucide-react';
import {
  connectSmartwatch,
  disconnectSmartwatch,
  isWebBluetoothSupported,
  calculateHRZone,
  HardwareState,
} from '@/lib/hardware';

interface HardwareTelemetryWidgetProps {
  onBpmUpdate?: (bpm: number) => void;
}

export default function HardwareTelemetryWidget({ onBpmUpdate }: HardwareTelemetryWidgetProps) {
  const [hardwareState, setHardwareState] = useState<HardwareState>({
    connected: false,
    deviceName: null,
    batteryLevel: 92,
    currentBpm: null,
    zone: 'REST',
  });

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Simulated Telemetry Loop for Demo Mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDemoMode) {
      interval = setInterval(() => {
        const baseBpm = 135 + Math.floor(Math.sin(Date.now() / 2000) * 25);
        const zone = calculateHRZone(baseBpm);

        setHardwareState({
          connected: true,
          deviceName: 'Apple Watch Ultra (BLE Demo)',
          batteryLevel: 88,
          currentBpm: baseBpm,
          zone,
        });

        if (onBpmUpdate) onBpmUpdate(baseBpm);
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDemoMode, onBpmUpdate]);

  const handleConnectBLE = async () => {
    setErrorMsg(null);
    setIsConnecting(true);

    try {
      const name = await connectSmartwatch(
        (data) => {
          const zone = calculateHRZone(data.bpm);
          setHardwareState((prev) => ({
            ...prev,
            connected: true,
            deviceName: name,
            currentBpm: data.bpm,
            zone,
          }));
          if (onBpmUpdate) onBpmUpdate(data.bpm);
        },
        () => {
          setHardwareState((prev) => ({
            ...prev,
            connected: false,
            currentBpm: null,
          }));
        }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setErrorMsg(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectSmartwatch();
    setIsDemoMode(false);
    setHardwareState({
      connected: false,
      deviceName: null,
      batteryLevel: null,
      currentBpm: null,
      zone: 'REST',
    });
  };

  return (
    <div className="p-4 rounded-xl blick-card border border-white/10 space-y-3">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${hardwareState.connected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/10'}`}>
            <Watch className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#f0f0f0]">Smartwatch Telemetry</h4>
            <p className="text-[10px] font-mono text-gray-400">
              {hardwareState.connected ? hardwareState.deviceName : 'Web Bluetooth GATT / HR Strap'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!hardwareState.connected ? (
            <>
              <button
                onClick={handleConnectBLE}
                disabled={isConnecting}
                className="px-2.5 py-1 rounded text-xs font-mono btn-blick-primary flex items-center gap-1"
              >
                <Radio className="w-3 h-3 text-white animate-pulse" />
                <span>{isConnecting ? 'PAIRING...' : 'PAIR BLE'}</span>
              </button>

              <button
                onClick={() => setIsDemoMode(true)}
                className="px-2 py-1 rounded text-[10px] font-mono btn-blick-secondary text-gray-400 hover:text-white"
                title="Run Simulated Demo Telemetry"
              >
                DEMO
              </button>
            </>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-2.5 py-1 rounded text-xs font-mono btn-blick-secondary text-rose-400 hover:text-rose-300 border-rose-500/30"
            >
              DISCONNECT
            </button>
          )}
        </div>
      </div>

      {/* Live HR Readout & Zone Display */}
      {hardwareState.connected && hardwareState.currentBpm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-lg bg-[#080808] border border-[#222222] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-ping absolute opacity-75" />
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500 relative" />
            </div>

            <div>
              <div className="text-2xl font-extrabold font-mono text-white flex items-baseline gap-1">
                <span>{hardwareState.currentBpm}</span>
                <span className="text-xs font-normal text-rose-400 font-mono">BPM</span>
              </div>
              <p className="text-[9px] font-mono text-gray-500">LIVE CARDIAC TELEMETRY</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
              hardwareState.zone === 'PEAK' || hardwareState.zone === 'ANAEROBIC'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              ZONE: {hardwareState.zone}
            </span>
            <span className="text-[9px] font-mono text-gray-400 mt-1">BATTERY: {hardwareState.batteryLevel}%</span>
          </div>
        </motion.div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
