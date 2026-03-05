import { useState, useCallback, useRef, useEffect } from 'react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface SmartDevice {
    id: string;
    name: string;
    type: 'smartwatch' | 'fitness_band' | 'bp_monitor' | 'pulse_oximeter' | 'glucose_meter';
    connected: boolean;
    battery: number;
    lastSync: Date | null;
    rssi?: number;           // Signal strength for scan UI
}

export interface LiveVitals {
    heartRate: number | null;
    spo2: number | null;
    systolicBp: number | null;
    diastolicBp: number | null;
    bloodSugar: number | null;
    temperature: number | null;
    steps: number | null;
    sleepHours: number | null;
    stressLevel: number | null;   // 1-10
}

export interface DeviceReading {
    id: string;
    timestamp: Date;
    deviceName: string;
    deviceType: SmartDevice['type'];
    vitals: Partial<LiveVitals>;
}

// ──────────────────────────────────────────────
// Simulated device catalogue
// ──────────────────────────────────────────────

const SIMULATED_DEVICES: Omit<SmartDevice, 'connected' | 'lastSync'>[] = [
    { id: 'sw-1', name: 'Galaxy Watch 6', type: 'smartwatch', battery: 78, rssi: -45 },
    { id: 'fb-1', name: 'Mi Band 8 Pro', type: 'fitness_band', battery: 92, rssi: -52 },
    { id: 'bp-1', name: 'Omron HEM-7156', type: 'bp_monitor', battery: 65, rssi: -60 },
    { id: 'po-1', name: 'Masimo MightySat', type: 'pulse_oximeter', battery: 84, rssi: -48 },
    { id: 'gm-1', name: 'Accu-Chek Guide', type: 'glucose_meter', battery: 56, rssi: -55 },
];

// ──────────────────────────────────────────────
// Realistic data generators
// ──────────────────────────────────────────────

function rand(min: number, max: number) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateVitalsForDevice(type: SmartDevice['type']): Partial<LiveVitals> {
    switch (type) {
        case 'smartwatch':
            return {
                heartRate: rand(62, 110),
                spo2: rand(94, 99),
                steps: Math.round(rand(2000, 12000)),
                sleepHours: rand(5, 9),
                stressLevel: Math.round(rand(2, 8)),
                temperature: rand(36.2, 37.2),
            };
        case 'fitness_band':
            return {
                heartRate: rand(60, 105),
                steps: Math.round(rand(1500, 15000)),
                sleepHours: rand(4.5, 9.5),
                stressLevel: Math.round(rand(1, 9)),
            };
        case 'bp_monitor':
            return {
                systolicBp: Math.round(rand(105, 150)),
                diastolicBp: Math.round(rand(65, 95)),
                heartRate: rand(58, 100),
            };
        case 'pulse_oximeter':
            return {
                spo2: rand(92, 99),
                heartRate: rand(60, 108),
            };
        case 'glucose_meter':
            return {
                bloodSugar: Math.round(rand(70, 180)),
            };
        default:
            return {};
    }
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useSmartDevices() {
    const [scanning, setScanning] = useState(false);
    const [discoveredDevices, setDiscoveredDevices] = useState<SmartDevice[]>([]);
    const [connectedDevices, setConnectedDevices] = useState<SmartDevice[]>([]);
    const [liveVitals, setLiveVitals] = useState<LiveVitals>({
        heartRate: null,
        spo2: null,
        systolicBp: null,
        diastolicBp: null,
        bloodSugar: null,
        temperature: null,
        steps: null,
        sleepHours: null,
        stressLevel: null,
    });
    const [readings, setReadings] = useState<DeviceReading[]>([]);
    const [liveSyncActive, setLiveSyncActive] = useState(false);

    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const readingIdRef = useRef(0);

    // ── Scan for devices ──
    const startScan = useCallback(async () => {
        setScanning(true);
        setDiscoveredDevices([]);

        // Try real Web Bluetooth first
        let usedRealBluetooth = false;
        if ('bluetooth' in navigator) {
            try {
                const btDevice = await (navigator as any).bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['heart_rate', 'health_thermometer', 'blood_pressure'],
                });
                // If we reach here, user selected a real device
                const realDevice: SmartDevice = {
                    id: 'bt-' + btDevice.id,
                    name: btDevice.name || 'Bluetooth Device',
                    type: 'smartwatch',
                    connected: false,
                    battery: Math.round(rand(40, 100)),
                    lastSync: null,
                    rssi: -50,
                };
                setDiscoveredDevices([realDevice]);
                usedRealBluetooth = true;
            } catch {
                // User cancelled or BT not available — fall through to simulation
            }
        }

        if (!usedRealBluetooth) {
            // Simulate progressive device discovery
            for (let i = 0; i < SIMULATED_DEVICES.length; i++) {
                await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
                setDiscoveredDevices((prev) => [
                    ...prev,
                    { ...SIMULATED_DEVICES[i], connected: false, lastSync: null },
                ]);
            }
        }

        setScanning(false);
    }, []);

    const stopScan = useCallback(() => {
        setScanning(false);
    }, []);

    // ── Connect to a device ──
    const connectDevice = useCallback((deviceId: string) => {
        setDiscoveredDevices((prev) => {
            const device = prev.find((d) => d.id === deviceId);
            if (!device) return prev;

            const connectedDevice: SmartDevice = {
                ...device,
                connected: true,
                lastSync: new Date(),
            };

            setConnectedDevices((cd) => [...cd, connectedDevice]);

            // Generate initial reading
            const initialVitals = generateVitalsForDevice(connectedDevice.type);
            setLiveVitals((lv) => ({
                ...lv,
                ...Object.fromEntries(
                    Object.entries(initialVitals).filter(([, v]) => v !== null && v !== undefined)
                ),
            }));

            const reading: DeviceReading = {
                id: `r-${readingIdRef.current++}`,
                timestamp: new Date(),
                deviceName: connectedDevice.name,
                deviceType: connectedDevice.type,
                vitals: initialVitals,
            };
            setReadings((r) => [reading, ...r]);

            return prev.filter((d) => d.id !== deviceId);
        });

        setLiveSyncActive(true);
    }, []);

    // ── Disconnect a device ──
    const disconnectDevice = useCallback((deviceId: string) => {
        setConnectedDevices((prev) => prev.filter((d) => d.id !== deviceId));
    }, []);

    // ── Periodic sync (every 8s while devices connected) ──
    useEffect(() => {
        if (connectedDevices.length === 0) {
            setLiveSyncActive(false);
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
            return;
        }

        setLiveSyncActive(true);

        syncIntervalRef.current = setInterval(() => {
            // Pick a random connected device
            const device = connectedDevices[Math.floor(Math.random() * connectedDevices.length)];
            const newVitals = generateVitalsForDevice(device.type);

            setLiveVitals((lv) => ({
                ...lv,
                ...Object.fromEntries(
                    Object.entries(newVitals).filter(([, v]) => v !== null && v !== undefined)
                ),
            }));

            // Update last sync
            setConnectedDevices((prev) =>
                prev.map((d) => (d.id === device.id ? { ...d, lastSync: new Date() } : d))
            );

            // Add to readings
            const reading: DeviceReading = {
                id: `r-${readingIdRef.current++}`,
                timestamp: new Date(),
                deviceName: device.name,
                deviceType: device.type,
                vitals: newVitals,
            };
            setReadings((r) => [reading, ...r].slice(0, 100));
        }, 8000);

        return () => {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        };
    }, [connectedDevices]);

    return {
        // State
        scanning,
        discoveredDevices,
        connectedDevices,
        liveVitals,
        readings,
        liveSyncActive,
        // Actions
        startScan,
        stopScan,
        connectDevice,
        disconnectDevice,
    };
}
