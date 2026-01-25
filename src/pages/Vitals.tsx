import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Heart, Droplets, Activity, Wind, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

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

export default function Vitals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [readings, setReadings] = useState<VitalReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [oxygenLevel, setOxygenLevel] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchReadings();
    }
  }, [user]);

  const fetchReadings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('vital_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('reading_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching vitals:', error);
    } else {
      setReadings(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate at least one field is filled
    if (!systolicBp && !bloodSugar && !pulseRate && !oxygenLevel) {
      toast({
        title: "Please enter at least one vital reading",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('vital_readings')
      .insert({
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
      toast({
        title: "Error saving reading",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Vital reading saved! 💪" });
      resetForm();
      setDialogOpen(false);
      fetchReadings();
    }
  };

  const resetForm = () => {
    setSystolicBp('');
    setDiastolicBp('');
    setBloodSugar('');
    setPulseRate('');
    setOxygenLevel('');
    setNotes('');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('vital_readings')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting reading",
        variant: "destructive",
      });
    } else {
      toast({ title: "Reading deleted" });
      fetchReadings();
    }
  };

  const getLatestReading = (field: keyof VitalReading) => {
    const reading = readings.find(r => r[field] !== null);
    return reading ? reading[field] : null;
  };

  const getTrend = (field: keyof VitalReading) => {
    const validReadings = readings.filter(r => r[field] !== null).slice(0, 5);
    if (validReadings.length < 2) return null;
    
    const latest = validReadings[0][field] as number;
    const previous = validReadings[1][field] as number;
    
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'stable';
  };

  const TrendIcon = ({ trend }: { trend: string | null }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-blue-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getBpStatus = (systolic: number | null, diastolic: number | null) => {
    if (!systolic || !diastolic) return 'unknown';
    if (systolic < 120 && diastolic < 80) return 'normal';
    if (systolic < 130 && diastolic < 80) return 'elevated';
    if (systolic < 140 || diastolic < 90) return 'high-1';
    return 'high-2';
  };

  const getSugarStatus = (sugar: number | null) => {
    if (!sugar) return 'unknown';
    if (sugar < 100) return 'normal';
    if (sugar < 126) return 'prediabetes';
    return 'diabetes';
  };

  const getOxygenStatus = (oxygen: number | null) => {
    if (!oxygen) return 'unknown';
    if (oxygen >= 95) return 'normal';
    if (oxygen >= 90) return 'low';
    return 'critical';
  };

  const getPulseStatus = (pulse: number | null) => {
    if (!pulse) return 'unknown';
    if (pulse >= 60 && pulse <= 100) return 'normal';
    if (pulse < 60) return 'low';
    return 'high';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold md:text-3xl">Vital Tracker</h1>
            <p className="text-muted-foreground">Monitor your health vitals over time</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Reading
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Vital Reading</DialogTitle>
                <DialogDescription>
                  Enter your current vital signs. You can leave fields empty if not measured.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar">Blood Sugar (mg/dL)</Label>
                  <Input
                    id="sugar"
                    type="number"
                    step="0.1"
                    placeholder="100"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
                  <Input
                    id="pulse"
                    type="number"
                    placeholder="72"
                    value={pulseRate}
                    onChange={(e) => setPulseRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygen">Oxygen Level (%)</Label>
                  <Input
                    id="oxygen"
                    type="number"
                    step="0.1"
                    placeholder="98"
                    max="100"
                    value={oxygenLevel}
                    onChange={(e) => setOxygenLevel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Reading'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {getLatestReading('systolic_bp') && getLatestReading('diastolic_bp')
                    ? `${getLatestReading('systolic_bp')}/${getLatestReading('diastolic_bp')}`
                    : '--/--'}
                </div>
                <TrendIcon trend={getTrend('systolic_bp')} />
              </div>
              <p className="text-xs text-muted-foreground">mmHg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Blood Sugar</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {getLatestReading('blood_sugar') ?? '--'}
                </div>
                <TrendIcon trend={getTrend('blood_sugar')} />
              </div>
              <p className="text-xs text-muted-foreground">mg/dL</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pulse Rate</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {getLatestReading('pulse_rate') ?? '--'}
                </div>
                <TrendIcon trend={getTrend('pulse_rate')} />
              </div>
              <p className="text-xs text-muted-foreground">bpm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Oxygen Level</CardTitle>
              <Wind className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {getLatestReading('oxygen_level') ?? '--'}
                </div>
                <TrendIcon trend={getTrend('oxygen_level')} />
              </div>
              <p className="text-xs text-muted-foreground">%</p>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reading History</CardTitle>
            <CardDescription>Your recent vital sign measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : readings.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No readings yet. Add your first vital reading!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>BP (mmHg)</TableHead>
                      <TableHead>Sugar (mg/dL)</TableHead>
                      <TableHead>Pulse (bpm)</TableHead>
                      <TableHead>O₂ (%)</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell className="font-medium">
                          {format(new Date(reading.reading_date), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell>
                          {reading.systolic_bp && reading.diastolic_bp
                            ? `${reading.systolic_bp}/${reading.diastolic_bp}`
                            : '--'}
                        </TableCell>
                        <TableCell>{reading.blood_sugar ?? '--'}</TableCell>
                        <TableCell>{reading.pulse_rate ?? '--'}</TableCell>
                        <TableCell>{reading.oxygen_level ?? '--'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {reading.notes || '--'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reading.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
