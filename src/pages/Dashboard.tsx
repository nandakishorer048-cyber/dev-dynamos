import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { GamificationCard } from '@/components/gamification/GamificationCard';
import {
  FileText,
  Pill,
  Bell,
  TrendingUp,
  Check,
  Clock,
  Calendar,
  Plus,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalReports: number;
  activeMedications: number;
  todayReminders: number;
  adherenceRate: number;
}

interface TodayMedication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    activeMedications: 0,
    todayReminders: 0,
    adherenceRate: 0,
  });
  const [todayMeds, setTodayMeds] = useState<TodayMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user!.id)
        .single();

      setProfile(profileData);

      // Fetch reports count
      const { count: reportsCount } = await supabase
        .from('medical_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      // Fetch active medications
      const { data: medications, count: medsCount } = await supabase
        .from('medications')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id)
        .eq('is_active', true);

      // Fetch today's reminders
      const { data: reminders } = await supabase
        .from('medication_reminders')
        .select(`
          id,
          reminder_time,
          medication_id,
          medications (
            id,
            name,
            dosage
          )
        `)
        .eq('user_id', user!.id)
        .eq('is_enabled', true);

      // Fetch today's logs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: logs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user!.id)
        .gte('scheduled_time', today.toISOString());

      // Calculate adherence rate (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: weekLogs } = await supabase
        .from('medication_logs')
        .select('status')
        .eq('user_id', user!.id)
        .gte('scheduled_time', weekAgo.toISOString());

      const takenCount = weekLogs?.filter(l => l.status === 'taken').length || 0;
      const totalLogs = weekLogs?.length || 0;
      const adherence = totalLogs > 0 ? Math.round((takenCount / totalLogs) * 100) : 100;

      // Build today's medication list
      const todayMedsList: TodayMedication[] = (reminders || []).map((r: any) => ({
        id: r.id,
        name: r.medications?.name || 'Unknown',
        dosage: r.medications?.dosage || '',
        time: r.reminder_time,
        taken: logs?.some((l: any) => l.reminder_id === r.id && l.status === 'taken') || false,
      }));

      setStats({
        totalReports: reportsCount || 0,
        activeMedications: medsCount || 0,
        todayReminders: reminders?.length || 0,
        adherenceRate: adherence,
      });

      setTodayMeds(todayMedsList.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in relative z-10">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground drop-shadow-md">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">{firstName}</span>! 👋
          </h1>
          <p className="text-foreground/70 text-lg">
            Here's your health overview for {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Medical Reports */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-primary/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Medical Reports
              </CardTitle>
              <div className="flex items-center justify-center rounded-xl p-3 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-glow">
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{stats.totalReports}</div>
              <Link to="/reports" className="text-sm text-primary hover:text-primary/80 font-medium mt-2 inline-block">
                View all reports →
              </Link>
            </CardContent>
          </Card>

          {/* Active Medications */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Active Medications
              </CardTitle>
              <div className="flex items-center justify-center rounded-xl p-3 bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors duration-300 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                <Pill className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{stats.activeMedications}</div>
              <Link to="/medications" className="text-sm text-secondary hover:text-secondary/80 font-medium mt-2 inline-block">
                Manage medications →
              </Link>
            </CardContent>
          </Card>

          {/* Today's Reminders */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-accent/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Today's Reminders
              </CardTitle>
              <div className="flex items-center justify-center rounded-xl p-3 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Bell className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{stats.todayReminders}</div>
              <Link to="/reminders" className="text-sm text-accent hover:text-accent/80 font-medium mt-2 inline-block">
                View schedule →
              </Link>
            </CardContent>
          </Card>

          {/* Adherence Rate */}
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-success/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Adherence Rate
              </CardTitle>
              <div className="flex items-center justify-center rounded-xl p-3 bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground transition-colors duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{stats.adherenceRate}%</div>
              <div className="mt-3 bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success/80 to-success transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${stats.adherenceRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Medications & Gamification */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Medications */}
          <Card className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-heading text-foreground">
                  <Calendar className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                  Today's Medications
                </CardTitle>
                <CardDescription className="text-foreground/60">Your scheduled doses for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl border-white/10 bg-white/5 text-foreground hover:bg-white/10 transition-colors">
                <Link to="/reminders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todayMeds.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-health-mint/20 flex items-center justify-center animate-float">
                      <Pill className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                    No medications scheduled
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start managing your health by adding your first medication. We'll help you stay on track!
                  </p>
                  <Button
                    asChild
                    className="rounded-xl bg-gradient-to-r from-primary to-health-mint hover:from-primary/90 hover:to-health-mint/90 shadow-warm"
                  >
                    <Link to="/medications" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Medication
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayMeds.map((med) => (
                    <div
                      key={med.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${med.taken
                          ? 'bg-success/5 border-success/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]'
                          : 'bg-white/5 border-white/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:-translate-y-1'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${med.taken
                            ? 'bg-success/20 text-success shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                            : 'bg-primary/10 text-primary shadow-glow'
                          }`}>
                          {med.taken ? <Check className="h-6 w-6" /> : <Pill className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className={`font-semibold ${med.taken ? 'text-foreground/70 line-through decoration-success/50' : 'text-foreground'}`}>{med.name}</p>
                          <p className="text-sm text-foreground/50">{med.dosage}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${med.taken ? 'bg-success/10 text-success/80 border-success/20' : 'bg-black/30 text-foreground/70 border-white/5'
                        }`}>
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{med.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gamification Card */}
          <GamificationCard />
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-heading text-foreground">
              <Sparkles className="h-5 w-5 text-accent drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-foreground/60">Get started quickly with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="gap-2 rounded-xl border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]" variant="outline" asChild>
              <Link to="/reports?action=upload">
                <FileText className="h-4 w-4" />
                Upload Report
              </Link>
            </Button>
            <Button className="gap-2 rounded-xl border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:border-secondary/30 transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]" variant="outline" asChild>
              <Link to="/medications?action=add">
                <Pill className="h-4 w-4" />
                Add Medication
              </Link>
            </Button>
            <Button className="gap-2 rounded-xl border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:border-accent/30 transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]" variant="outline" asChild>
              <Link to="/reminders?action=add">
                <Bell className="h-4 w-4" />
                Set Reminder
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Voice Assistant */}
        <VoiceAssistant />
      </div>
    </AppLayout>
  );
}
