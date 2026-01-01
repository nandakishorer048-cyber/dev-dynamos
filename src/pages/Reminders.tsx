import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Plus, 
  Loader2,
  Trash2,
  Clock,
  Pill,
  Check,
  X,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
}

interface Reminder {
  id: string;
  medication_id: string;
  reminder_time: string;
  days_of_week: number[];
  is_enabled: boolean;
  medications: Medication;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  reminder_id: string | null;
  status: string;
  scheduled_time: string;
  logged_at: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Reminders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newReminder, setNewReminder] = useState({
    medicationId: '',
    time: '08:00',
    days: [0, 1, 2, 3, 4, 5, 6],
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    // Fetch reminders with medication info
    const { data: remindersData } = await supabase
      .from('medication_reminders')
      .select(`
        *,
        medications (id, name, dosage)
      `)
      .eq('user_id', user!.id)
      .order('reminder_time');

    // Fetch active medications
    const { data: medsData } = await supabase
      .from('medications')
      .select('id, name, dosage')
      .eq('user_id', user!.id)
      .eq('is_active', true);

    // Fetch today's logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: logsData } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', user!.id)
      .gte('scheduled_time', today.toISOString());

    setReminders(remindersData || []);
    setMedications(medsData || []);
    setTodayLogs(logsData || []);
    setLoading(false);
  };

  const handleAddReminder = async () => {
    if (!newReminder.medicationId) {
      toast({
        title: 'Select a medication',
        description: 'Please choose which medication this reminder is for.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('medication_reminders')
        .insert({
          user_id: user!.id,
          medication_id: newReminder.medicationId,
          reminder_time: newReminder.time,
          days_of_week: newReminder.days,
        })
        .select(`
          *,
          medications (id, name, dosage)
        `)
        .single();

      if (error) throw error;

      setReminders([...reminders, data]);
      setNewReminder({ medicationId: '', time: '08:00', days: [0, 1, 2, 3, 4, 5, 6] });
      setDialogOpen(false);

      toast({
        title: 'Reminder set! ⏰',
        description: 'You\'ll be reminded to take your medication.',
      });
    } catch (error: any) {
      console.error('Error adding reminder:', error);
      toast({
        title: 'Failed to add reminder',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminder = async (reminder: Reminder) => {
    const { error } = await supabase
      .from('medication_reminders')
      .update({ is_enabled: !reminder.is_enabled })
      .eq('id', reminder.id);

    if (error) {
      toast({
        title: 'Update failed',
        variant: 'destructive',
      });
    } else {
      setReminders(reminders.map(r => 
        r.id === reminder.id ? { ...r, is_enabled: !r.is_enabled } : r
      ));
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('medication_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } else {
      setReminders(reminders.filter(r => r.id !== id));
      toast({ title: 'Reminder deleted' });
    }
  };

  const handleLogDose = async (reminder: Reminder, status: 'taken' | 'skipped') => {
    const now = new Date();
    const [hours, minutes] = reminder.reminder_time.split(':');
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: user!.id,
          medication_id: reminder.medication_id,
          reminder_id: reminder.id,
          status,
          scheduled_time: scheduledTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setTodayLogs([...todayLogs, data]);

      toast({
        title: status === 'taken' ? 'Great job! 💪' : 'Logged as skipped',
        description: status === 'taken' 
          ? `${reminder.medications.name} marked as taken.`
          : `${reminder.medications.name} marked as skipped.`,
      });
    } catch (error) {
      console.error('Error logging dose:', error);
      toast({ title: 'Failed to log dose', variant: 'destructive' });
    }
  };

  const isLoggedToday = (reminder: Reminder) => {
    return todayLogs.some(log => log.reminder_id === reminder.id);
  };

  const getLogStatus = (reminder: Reminder) => {
    const log = todayLogs.find(l => l.reminder_id === reminder.id);
    return log?.status;
  };

  const toggleDay = (day: number) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Medication Reminders</h1>
            <p className="text-muted-foreground">Never miss a dose with smart reminders</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={medications.length === 0}>
                <Plus className="h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Set Medication Reminder
                </DialogTitle>
                <DialogDescription>
                  Choose when to be reminded about your medication.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Medication</Label>
                  <Select
                    value={newReminder.medicationId}
                    onValueChange={(value) => setNewReminder({ ...newReminder, medicationId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medication" />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} {med.dosage && `(${med.dosage})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Reminder Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day, index) => (
                      <Button
                        key={day}
                        type="button"
                        variant={newReminder.days.includes(index) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(index)}
                        className="w-12"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAddReminder} 
                  className="w-full gap-2" 
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {saving ? 'Setting reminder...' : 'Set Reminder'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* No medications warning */}
        {medications.length === 0 && !loading && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="flex items-center gap-4 py-4">
              <Pill className="h-8 w-8 text-warning" />
              <div>
                <p className="font-medium">No active medications</p>
                <p className="text-sm text-muted-foreground">
                  Add medications first to set up reminders.
                </p>
              </div>
              <Button variant="outline" className="ml-auto" asChild>
                <a href="/medications">Add Medication</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Today's Schedule */}
        {reminders.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders
                  .filter(r => r.is_enabled && r.days_of_week.includes(new Date().getDay()))
                  .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time))
                  .map((reminder) => {
                    const logged = isLoggedToday(reminder);
                    const status = getLogStatus(reminder);

                    return (
                      <div
                        key={reminder.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          status === 'taken' 
                            ? 'bg-success/10 border-success/30'
                            : status === 'skipped'
                            ? 'bg-muted border-muted-foreground/20'
                            : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            status === 'taken' 
                              ? 'bg-success text-success-foreground'
                              : status === 'skipped'
                              ? 'bg-muted-foreground/20 text-muted-foreground'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {status === 'taken' ? (
                              <Check className="h-6 w-6" />
                            ) : status === 'skipped' ? (
                              <X className="h-6 w-6" />
                            ) : (
                              <Pill className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{reminder.medications.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {reminder.medications.dosage}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{reminder.reminder_time}</span>
                          </div>

                          {!logged && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => handleLogDose(reminder, 'skipped')}
                              >
                                <X className="h-4 w-4" />
                                Skip
                              </Button>
                              <Button
                                size="sm"
                                className="gap-1"
                                onClick={() => handleLogDose(reminder, 'taken')}
                              >
                                <Check className="h-4 w-4" />
                                Taken
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Reminders */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reminders.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reminders yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Set up reminders to never miss your medications
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">All Reminders</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {reminders.map((reminder) => (
                <Card key={reminder.id} className={`shadow-soft ${!reminder.is_enabled ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          reminder.is_enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{reminder.medications.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reminder.reminder_time}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminder.is_enabled}
                          onCheckedChange={() => handleToggleReminder(reminder)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1 flex-wrap">
                      {DAYS.map((day, index) => (
                        <span
                          key={day}
                          className={`px-2 py-1 text-xs rounded ${
                            reminder.days_of_week.includes(index)
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}