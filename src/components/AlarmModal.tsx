'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Clock, Check, Shield } from 'lucide-react';
import { DEFAULT_SCHEDULE, requestNotificationPermission } from '@/lib/notifications';
import { db } from '@/lib/db';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlarmModal({ isOpen, onClose }: AlarmModalProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [alarms, setAlarms] = useState(DEFAULT_SCHEDULE.map((item, index) => ({
    id: `alarm-${index}`,
    title: item.title,
    time: item.time,
    enabled: true
  })));

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved settings from Dexie
    db.settings.get('alarm_schedule').then((setting) => {
      if (setting && Array.isArray(setting.value)) {
        setAlarms(setting.value as typeof alarms);
      }
    }).catch(console.error);
  }, []);

  const handleToggle = (id: string) => {
    const updated = alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    setAlarms(updated);
    db.settings.put({ key: 'alarm_schedule', value: updated }).catch(console.error);
  };

  const handleTimeChange = (id: string, time: string) => {
    const updated = alarms.map(a => a.id === id ? { ...a, time } : a);
    setAlarms(updated);
    db.settings.put({ key: 'alarm_schedule', value: updated }).catch(console.error);
  };

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="w-full max-w-md p-6 rounded-2xl glass-surface border border-white/10 text-white shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg tracking-wide text-white">Notification Telemetry</h3>
                <p className="text-xs text-gray-400">Calm protocol window schedules</p>
              </div>
            </div>

            {/* Permission Banner */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <Shield className={`w-4 h-4 ${permission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>
                  Status: <strong className="uppercase font-mono tracking-wider">{permission}</strong>
                </span>
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition"
                >
                  Enable
                </button>
              )}
            </div>

            {/* Alarm List */}
            <div className="space-y-3.5 mb-6">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">{alarm.title}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-cyan-400">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="time"
                        value={alarm.time}
                        onChange={(e) => handleTimeChange(alarm.id, e.target.value)}
                        className="bg-transparent border-none outline-none text-cyan-400 font-mono text-xs w-16 text-center focus:ring-0"
                      />
                    </div>

                    <button
                      onClick={() => handleToggle(alarm.id)}
                      className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                        alarm.enabled ? 'bg-cyan-500' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          alarm.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Configuration
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
