// Web Bluetooth API Engine for Smartwatch & Heart Rate Hardware Integration

export interface HeartRateData {
  bpm: number;
  contactDetected: boolean;
  rrIntervalMs?: number;
  timestamp: string;
}

export interface HardwareState {
  connected: boolean;
  deviceName: string | null;
  batteryLevel: number | null;
  currentBpm: number | null;
  zone: 'REST' | 'WARMUP' | 'AEROBIC' | 'ANAEROBIC' | 'PEAK';
}

// Fallback interfaces for Web Bluetooth API when @types/web-bluetooth is not installed
interface BLEDevice {
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<BLEGattServer>;
    disconnect(): void;
  };
  addEventListener(type: string, listener: EventListener): void;
}

interface BLEGattServer {
  getPrimaryService(service: number | string): Promise<BLEGattService>;
}

interface BLEGattService {
  getCharacteristic(characteristic: number | string): Promise<BLEGattCharacteristic>;
}

interface BLEGattCharacteristic {
  value?: DataView;
  startNotifications(): Promise<BLEGattCharacteristic>;
  addEventListener(type: string, listener: (event: Event) => void): void;
}

let bleDevice: BLEDevice | null = null;
let hrCharacteristic: BLEGattCharacteristic | null = null;

/** Standard GATT Heart Rate Service UUID */
const HEART_RATE_SERVICE_UUID = 0x180d;
const HEART_RATE_MEASUREMENT_UUID = 0x2a37;

/** Determine Heart Rate Training Zone based on Max HR (estimated 220 - age ~ 190) */
export function calculateHRZone(bpm: number): HardwareState['zone'] {
  if (bpm < 100) return 'REST';
  if (bpm < 125) return 'WARMUP';
  if (bpm < 150) return 'AEROBIC';
  if (bpm < 170) return 'ANAEROBIC';
  return 'PEAK';
}

/** Check if browser supports Web Bluetooth API */
export function isWebBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in (navigator as unknown as { bluetooth: unknown });
}

/** Request and Pair with a Bluetooth Smartwatch or Heart Rate Sensor */
export async function connectSmartwatch(
  onData: (data: HeartRateData) => void,
  onDisconnect?: () => void
): Promise<string> {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth API is not supported in this browser. Use Chrome or Edge.');
  }

  try {
    const nav = navigator as unknown as {
      bluetooth: {
        requestDevice(options: unknown): Promise<BLEDevice>;
      };
    };

    bleDevice = await nav.bluetooth.requestDevice({
      filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
      optionalServices: ['battery_service'],
    });

    if (!bleDevice || !bleDevice.gatt) {
      throw new Error('Bluetooth device GATT server unreachable.');
    }

    bleDevice.addEventListener('gattserverdisconnected', () => {
      if (onDisconnect) onDisconnect();
    });

    const server = await bleDevice.gatt.connect();
    const service = await server.getPrimaryService(HEART_RATE_SERVICE_UUID);
    hrCharacteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);

    await hrCharacteristic.startNotifications();
    hrCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
      const target = event.target as unknown as BLEGattCharacteristic;
      if (!target || !target.value) return;

      const dataView = target.value;
      const flags = dataView.getUint8(0);
      const is16Bit = (flags & 0x01) !== 0;
      const contactDetected = (flags & 0x06) !== 0;

      let bpm: number;
      if (is16Bit) {
        bpm = dataView.getUint16(1, true);
      } else {
        bpm = dataView.getUint8(1);
      }

      onData({
        bpm,
        contactDetected,
        timestamp: new Date().toLocaleTimeString(),
      });
    });

    return bleDevice.name || 'Bluetooth Heart Rate Sensor';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to connect Bluetooth hardware';
    throw new Error(message);
  }
}

/** Disconnect Bluetooth Hardware */
export async function disconnectSmartwatch() {
  if (bleDevice && bleDevice.gatt && bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect();
  }
  bleDevice = null;
  hrCharacteristic = null;
}
