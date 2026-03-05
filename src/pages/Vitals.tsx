import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSmartDevices } from '@/hooks/useSmartDevices';
import { calculateHealthScore, getAIInsights, deviceTypeLabel } from '@/lib/healthScore';
import type { HealthInsight } from '@/lib/healthScore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
  Heart, Droplets, Activity, Wind, Plus, Trash2, TrendingUp, TrendingDown, Minus,
  Bluetooth, BluetoothSearching, Wifi, WifiOff, Battery, BatteryLow, Clock,
  Watch, Thermometer, Footprints, Moon, Brain, Sparkles, AlertTriangle,
  CheckCircle2, Info, XCircle, Unplug, Zap,
} from 'lucide-react';
import { format } from 'date-fns';

// ──────────────────────────────────────────────
// Types (kept from original)
// ──────────────────────────────────────────────
interface VitalReading {
  id: string;
  reading_date: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  blood_sugar: number | null;
  pulse_rate: number | null;
  oxygen_level: number | null;
  notes: string | null;
}

// ──────────────────────────────────────────────
// Animation variants
// ──────────────────────────────────────────────
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ──────────────────────────────────────────────
// Vital card config
// ──────────────────────────────────────────────
const vitalCardConfig = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', icon: Heart, color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  { key: 'spo2', label: 'Blood Oxygen', unit: '%', icon: Wind, color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
  { key: 'systolicBp', label: 'Blood Pressure', unit: 'mmHg', icon: Activity, color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', diastolicKey: 'diastolicBp' },
  { key: 'bloodSugar', label: 'Blood Sugar', unit: 'mg/dL', icon: Droplets, color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  { key: 'steps', label: 'Daily Steps', unit: 'steps', icon: Footprints, color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { key: 'sleepHours', label: 'Sleep', unit: 'hrs', icon: Moon, color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
  { key: 'stressLevel', label: 'Stress Level', unit: '/10', icon: Brain, color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
] as const;

// ──────────────────────────────────────────────
// Insight severity config
// ──────────────────────────────────────────────
const severityConfig: Record<string, { bg: string; border: string; icon: typeof CheckCircle2; textColor: string }> = {
  success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle2, textColor: 'text-emerald-400' },
  info: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: Info, textColor: 'text-blue-400' },
  warning: { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', icon: AlertTriangle, textColor: 'text-orange-400' },
  danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: XCircle, textColor: 'text-red-400' },
};

// ──────────────────────────────────────────────
// Health Score Ring
// ──────────────────────────────────────────────
function HealthScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const color = getScoreColor();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background ring */}
          <circle cx="80" cy="80" r={radius} fill="none"
            stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          {/* Progress ring */}
          <motion.circle
            cx="80" cy="80" r={radius} fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-heading font-extrabold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-foreground/40 font-medium uppercase tracking-wider">Health Score</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{getLabel()}</span>
    </div>
  );
}

// ──────────────────────────────────────────────
// Device icon helper
// ──────────────────────────────────────────────
function DeviceIcon({ type }: { type: string }) {
  switch (type) {
    case 'smartwatch': return <Watch className="h-5 w-5" />;
    case 'fitness_band': return <Activity className="h-5 w-5" />;
    case 'bp_monitor': return <Heart className="h-5 w-5" />;
    case 'pulse_oximeter': return <Wind className="h-5 w-5" />;
    case 'glucose_meter': return <Droplets className="h-5 w-5" />;
    default: return <Bluetooth className="h-5 w-5" />;
  }
}

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════

export default function Vitals() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Supabase readings (original)
  const [dbReadings, setDbReadings] = useState<VitalReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [oxygenLevel, setOxygenLevel] = useState('');
  const [notes, setNotes] = useState('');

  // Smart device hook
  const {
    scanning, discoveredDevices, connectedDevices, liveVitals, readings: deviceReadings,
    liveSyncActive, startScan, stopScan, connectDevice, disconnectDevice,
  } = useSmartDevices();

  // Derived
  const healthScore = useMemo(() => calculateHealthScore(liveVitals), [liveVitals]);
  const aiInsights = useMemo(() => getAIInsights(liveVitals), [liveVitals]);

  // Chart data from device readings
  const chartData = useMemo(() => {
    return deviceReadings
      .slice(0, 20)
      .reverse()
      .map((r, i) => ({
        name: format(r.timestamp, 'HH:mm'),
        heartRate: r.vitals.heartRate ?? undefined,
        spo2: r.vitals.spo2 ?? undefined,
        systolicBp: r.vitals.systolicBp ?? undefined,
        diastolicBp: r.vitals.diastolicBp ?? undefined,
        score: calculateHealthScore({ ...liveVitals, ...r.vitals } as any),
      }));
  }, [deviceReadings, liveVitals]);

  // ── Supabase fetch ──
  useEffect(() => {
    if (user) fetchReadings();
  }, [user]);

  const fetchReadings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('vital_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('reading_date', { ascending: false })
      .limit(50);
    if (!error) setDbReadings(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!systolicBp && !bloodSugar && !pulseRate && !oxygenLevel) {
      toast({ title: "Please enter at least one vital reading", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('vital_readings').insert({
      user_id: user.id,
      systolic_bp: systolicBp ? parseInt(systolicBp) : null,
      diastolic_bp: diastolicBp ? parseInt(diastolicBp) : null,
      blood_sugar: bloodSugar ? parseFloat(bloodSugar) : null,
      pulse_rate: pulseRate ? parseInt(pulseRate) : null,
      oxygen_level: oxygenLevel ? parseFloat(oxygenLevel) : null,
      notes: notes || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error saving reading", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vital reading saved! 💪" });
      setSystolicBp(''); setDiastolicBp(''); setBloodSugar(''); setPulseRate(''); setOxygenLevel(''); setNotes('');
      setDialogOpen(false);
      fetchReadings();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('vital_readings').delete().eq('id', id);
    if (error) toast({ title: "Error deleting reading", variant: "destructive" });
    else { toast({ title: "Reading deleted" }); fetchReadings(); }
  };

  const handleStartScan = () => {
    setScanModalOpen(true);
    startScan();
  };

  const handleConnectDevice = (deviceId: string) => {
    connectDevice(deviceId);
    toast({ title: 'Device connected! 🔗', description: 'Health data is now syncing automatically.' });
  };

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="space-y-8 relative z-10">

        {/* ═══ HEADER ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-heading font-bold md:text-3xl text-foreground flex items-center gap-3">
              <Zap className="h-7 w-7 text-cyan-400" style={{ filter: 'drop-shadow(0 0 10px rgba(6,182,212,0.6))' }} />
              Smart Vital Tracker
            </h1>
            <p className="text-foreground/50 flex items-center gap-2 mt-1">
              AI-Powered Health Monitoring
              {liveSyncActive && (
                <motion.span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    color: '#10b981',
                  }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wifi className="h-3 w-3" />
                  Live Sync Active
                </motion.span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleStartScan}
                className="gap-2 btn-glow btn-sweep text-white border-0 rounded-xl h-11"
              >
                <BluetoothSearching className="h-4 w-4" />
                Connect Wearable Device
              </Button>
            </motion.div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl text-foreground/70 hover:text-white"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(100,140,220,0.1)',
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-md"
                style={{
                  background: 'rgba(15, 20, 35, 0.9)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(100, 140, 220, 0.12)',
                }}
              >
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add Vital Reading</DialogTitle>
                  <DialogDescription className="text-foreground/50">
                    Enter your current vital signs manually.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/70">Systolic BP</Label>
                      <Input type="number" placeholder="120" value={systolicBp} onChange={(e) => setSystolicBp(e.target.value)}
                        className="bg-white/[0.03] border-white/10 text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground/70">Diastolic BP</Label>
                      <Input type="number" placeholder="80" value={diastolicBp} onChange={(e) => setDiastolicBp(e.target.value)}
                        className="bg-white/[0.03] border-white/10 text-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/70">Blood Sugar (mg/dL)</Label>
                    <Input type="number" step="0.1" placeholder="100" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)}
                      className="bg-white/[0.03] border-white/10 text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/70">Pulse Rate (bpm)</Label>
                    <Input type="number" placeholder="72" value={pulseRate} onChange={(e) => setPulseRate(e.target.value)}
                      className="bg-white/[0.03] border-white/10 text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/70">Oxygen Level (%)</Label>
                    <Input type="number" step="0.1" placeholder="98" max="100" value={oxygenLevel} onChange={(e) => setOxygenLevel(e.target.value)}
                      className="bg-white/[0.03] border-white/10 text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/70">Notes</Label>
                    <Textarea placeholder="Any observations..." value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="bg-white/[0.03] border-white/10 text-foreground" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}
                      className="rounded-xl text-foreground/60" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(100,140,220,0.1)' }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="btn-glow text-white border-0 rounded-xl">
                      {saving ? 'Saving...' : 'Save Reading'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* ═══ SCAN MODAL ═══ */}
        <Dialog open={scanModalOpen} onOpenChange={(open) => { setScanModalOpen(open); if (!open) stopScan(); }}>
          <DialogContent
            className="max-w-lg"
            style={{
              background: 'rgba(10, 15, 28, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(100, 140, 220, 0.12)',
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                {scanning && <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <BluetoothSearching className="h-5 w-5 text-blue-400" />
                </motion.div>}
                {scanning ? 'Scanning for Devices...' : 'Available Devices'}
              </DialogTitle>
              <DialogDescription className="text-foreground/50">
                {scanning ? 'Looking for nearby Bluetooth health devices' : `Found ${discoveredDevices.length} device(s)`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 max-h-[350px] overflow-y-auto">
              <AnimatePresence>
                {discoveredDevices.map((device, i) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center justify-between p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(100,140,220,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <DeviceIcon type={device.type} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{device.name}</p>
                        <p className="text-xs text-foreground/40">{deviceTypeLabel(device.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-foreground/40">
                        {device.battery > 30 ? <Battery className="h-3 w-3" /> : <BatteryLow className="h-3 w-3 text-orange-400" />}
                        {device.battery}%
                      </div>
                      <Button
                        size="sm"
                        onClick={() => { handleConnectDevice(device.id); setScanModalOpen(false); }}
                        className="btn-glow text-white border-0 rounded-lg text-xs h-8 px-4"
                      >
                        Connect
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {scanning && discoveredDevices.length < 5 && (
                <div className="flex items-center justify-center py-4 gap-2 text-foreground/30 text-sm">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-blue-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Searching...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* ═══ CONNECTED DEVICES ═══ */}
        <AnimatePresence>
          {connectedDevices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex gap-4 overflow-x-auto pb-2">
                {connectedDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 flex items-center gap-4 px-5 py-3 rounded-2xl"
                    style={{
                      background: 'rgba(16,185,129,0.06)',
                      border: '1px solid rgba(16,185,129,0.15)',
                      minWidth: '280px',
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                      <DeviceIcon type={device.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{device.name}</p>
                      <div className="flex items-center gap-3 text-xs text-foreground/40">
                        <span className="flex items-center gap-1">
                          <Wifi className="h-3 w-3 text-emerald-400" /> Connected
                        </span>
                        <span className="flex items-center gap-1">
                          <Battery className="h-3 w-3" /> {device.battery}%
                        </span>
                        {device.lastSync && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {format(device.lastSync, 'HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => disconnectDevice(device.id)}
                      className="text-foreground/40 hover:text-red-400 rounded-lg h-8 w-8 p-0"
                    >
                      <Unplug className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ VITALS GRID ═══ */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vitalCardConfig.map((cfg) => {
            const Icon = cfg.icon;
            const val = liveVitals[cfg.key as keyof typeof liveVitals];
            const diastolic = 'diastolicKey' in cfg ? liveVitals[cfg.diastolicKey as keyof typeof liveVitals] : null;
            const displayVal = val !== null
              ? (diastolic !== null ? `${val}/${diastolic}` : `${val}`)
              : '--';

            return (
              <motion.div key={cfg.key} variants={fadeIn}>
                <Card
                  className="group overflow-hidden relative transition-all duration-400 hover:-translate-y-1"
                  style={{
                    background: 'rgba(15,20,35,0.5)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(100,140,220,0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = cfg.glow.replace('0.3', '0.4');
                    e.currentTarget.style.boxShadow = `0 0 30px ${cfg.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(100,140,220,0.08)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)';
                  }}
                >
                  {/* Top glow line */}
                  <div
                    className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
                  />

                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-xs font-medium text-foreground/50 uppercase tracking-wider">{cfg.label}</CardTitle>
                    <motion.div
                      className="flex items-center justify-center rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: cfg.glow.replace('0.3', '0.12'),
                        color: cfg.color,
                        boxShadow: `0 0 15px ${cfg.glow.replace('0.3', '0.15')}`,
                      }}
                      animate={val !== null ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      key={String(val)} // re-trigger animation on value change
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <motion.div
                      className="text-2xl font-extrabold tracking-tight"
                      style={{
                        background: `linear-gradient(135deg, ${cfg.color}, rgba(255,255,255,0.7))`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                      key={displayVal}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {displayVal}
                    </motion.div>
                    <p className="text-[10px] text-foreground/30 mt-1 uppercase tracking-wider">{cfg.unit}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ═══ HEALTH SCORE + AI INSIGHTS ═══ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              className="h-full"
              style={{
                background: 'rgba(15,20,35,0.5)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(100,140,220,0.08)',
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg font-heading text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.5))' }} />
                  Overall Health Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <HealthScoreRing score={healthScore} />
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Health Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card
              className="h-full"
              style={{
                background: 'rgba(15,20,35,0.5)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(100,140,220,0.08)',
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg font-heading text-foreground flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }} />
                  AI Health Insights
                </CardTitle>
                <CardDescription className="text-foreground/40">Real-time analysis of your vital data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.length === 0 ? (
                  <p className="text-foreground/30 text-sm text-center py-6">Connect a device to receive AI-powered health insights.</p>
                ) : (
                  <AnimatePresence>
                    {aiInsights.map((insight, i) => {
                      const cfg = severityConfig[insight.severity];
                      const SeverityIcon = cfg.icon;
                      return (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.4 }}
                          className="flex items-start gap-3 p-4 rounded-2xl"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                        >
                          <SeverityIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${cfg.textColor}`} />
                          <div>
                            <p className={`font-semibold text-sm ${cfg.textColor}`}>{insight.title}</p>
                            <p className="text-foreground/50 text-xs mt-0.5 leading-relaxed">{insight.message}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══ AI HEALTH ANALYTICS ═══ */}
        {chartData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              style={{
                background: 'rgba(15,20,35,0.5)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(100,140,220,0.08)',
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg font-heading text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
                  AI Health Analytics
                </CardTitle>
                <CardDescription className="text-foreground/40">Real-time trend analysis from connected devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Heart Rate Chart */}
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                      <Heart className="h-3 w-3" /> Heart Rate Trend
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,20,35,0.9)', border: '1px solid rgba(100,140,220,0.15)', borderRadius: '12px', fontSize: '12px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        />
                        <Area type="monotone" dataKey="heartRate" stroke="#ef4444" fill="url(#hrGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Blood Pressure Chart */}
                  <div>
                    <p className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
                      <Activity className="h-3 w-3" /> Blood Pressure History
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,20,35,0.9)', border: '1px solid rgba(100,140,220,0.15)', borderRadius: '12px', fontSize: '12px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        />
                        <Line type="monotone" dataKey="systolicBp" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Systolic" />
                        <Line type="monotone" dataKey="diastolicBp" stroke="#a78bfa" strokeWidth={2} dot={false} name="Diastolic" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* SpO2 Chart */}
                  <div>
                    <p className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Wind className="h-3 w-3" /> Oxygen Level Trend
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} domain={[88, 100]} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,20,35,0.9)', border: '1px solid rgba(100,140,220,0.15)', borderRadius: '12px', fontSize: '12px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        />
                        <Area type="monotone" dataKey="spo2" stroke="#06b6d4" fill="url(#spo2Grad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Health Score Chart */}
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Daily Health Score
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,20,35,0.9)', border: '1px solid rgba(100,140,220,0.15)', borderRadius: '12px', fontSize: '12px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#scoreGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ READING HISTORY TIMELINE ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card
            style={{
              background: 'rgba(15,20,35,0.5)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(100,140,220,0.08)',
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg font-heading text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }} />
                Reading History
              </CardTitle>
              <CardDescription className="text-foreground/40">Timeline of device readings &amp; manual entries</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Device readings timeline */}
              {deviceReadings.length > 0 && (
                <div className="relative mb-6">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'rgba(100,140,220,0.1)' }} />

                  <div className="space-y-4">
                    {deviceReadings.slice(0, 10).map((reading, i) => (
                      <motion.div
                        key={reading.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="flex items-start gap-4 pl-2"
                      >
                        <div
                          className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full mt-1 z-10"
                          style={{ background: 'rgba(59,130,246,0.15)', border: '2px solid rgba(59,130,246,0.3)' }}
                        >
                          <Bluetooth className="h-3 w-3 text-blue-400" />
                        </div>
                        <div
                          className="flex-1 p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,140,220,0.05)' }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-foreground/70">{reading.deviceName}</span>
                            <span className="text-[10px] text-foreground/30">{format(reading.timestamp, 'MMM d, HH:mm:ss')}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {reading.vitals.heartRate != null && <span className="text-xs text-red-400">❤️ {reading.vitals.heartRate} bpm</span>}
                            {reading.vitals.spo2 != null && <span className="text-xs text-cyan-400">🫁 {reading.vitals.spo2}%</span>}
                            {reading.vitals.systolicBp != null && <span className="text-xs text-purple-400">🩺 {reading.vitals.systolicBp}/{reading.vitals.diastolicBp}</span>}
                            {reading.vitals.bloodSugar != null && <span className="text-xs text-blue-400">💉 {reading.vitals.bloodSugar} mg/dL</span>}
                            {reading.vitals.temperature != null && <span className="text-xs text-orange-400">🌡️ {reading.vitals.temperature}°C</span>}
                            {reading.vitals.steps != null && <span className="text-xs text-emerald-400">👟 {reading.vitals.steps}</span>}
                            {reading.vitals.sleepHours != null && <span className="text-xs text-indigo-400">😴 {reading.vitals.sleepHours}h</span>}
                            {reading.vitals.stressLevel != null && <span className="text-xs text-pink-400">🧠 {reading.vitals.stressLevel}/10</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Database readings */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    className="h-8 w-8 rounded-full border-2 border-blue-400 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : dbReadings.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'rgba(100,140,220,0.1)' }} />
                  <div className="space-y-4">
                    {dbReadings.slice(0, 10).map((reading, i) => (
                      <motion.div
                        key={reading.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="flex items-start gap-4 pl-2"
                      >
                        <div
                          className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full mt-1 z-10"
                          style={{ background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.3)' }}
                        >
                          <Plus className="h-3 w-3 text-purple-400" />
                        </div>
                        <div
                          className="flex-1 p-3 rounded-xl group"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,140,220,0.05)' }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-foreground/70">Manual Entry</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-foreground/30">{format(new Date(reading.reading_date), 'MMM d, HH:mm')}</span>
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => handleDelete(reading.id)}
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {reading.systolic_bp && reading.diastolic_bp && <span className="text-xs text-purple-400">🩺 {reading.systolic_bp}/{reading.diastolic_bp}</span>}
                            {reading.blood_sugar && <span className="text-xs text-blue-400">💉 {reading.blood_sugar} mg/dL</span>}
                            {reading.pulse_rate && <span className="text-xs text-red-400">❤️ {reading.pulse_rate} bpm</span>}
                            {reading.oxygen_level && <span className="text-xs text-cyan-400">🫁 {reading.oxygen_level}%</span>}
                            {reading.notes && <span className="text-xs text-foreground/30 italic">📝 {reading.notes}</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : deviceReadings.length === 0 ? (
                <div className="py-8 text-center">
                  <motion.div
                    className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'rgba(59,130,246,0.1)' }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Activity className="h-8 w-8 text-blue-400" />
                  </motion.div>
                  <p className="text-foreground/30">No readings yet. Connect a device or add a manual entry!</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </AppLayout>
  );
}
