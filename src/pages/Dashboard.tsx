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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            {getGreeting()}, <span className="gradient-text">{firstName}</span>! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's your health overview for {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Medical Reports */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Medical Reports
              </CardTitle>
              <div className="icon-container-blue">
                <FileText className="h-5 w-5 text-health-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="stat-number">{stats.totalReports}</div>
              <Link to="/reports" className="text-sm text-primary hover:underline font-medium mt-2 inline-block">
                View all reports →
              </Link>
            </CardContent>
          </Card>

          {/* Active Medications */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Medications
              </CardTitle>
              <div className="icon-container-purple">
                <Pill className="h-5 w-5 text-health-purple" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="stat-number">{stats.activeMedications}</div>
              <Link to="/medications" className="text-sm text-primary hover:underline font-medium mt-2 inline-block">
                Manage medications →
              </Link>
            </CardContent>
          </Card>

          {/* Today's Reminders */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Reminders
              </CardTitle>
              <div className="icon-container-warning">
                <Bell className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="stat-number">{stats.todayReminders}</div>
              <Link to="/reminders" className="text-sm text-primary hover:underline font-medium mt-2 inline-block">
                View schedule →
              </Link>
            </CardContent>
          </Card>

          {/* Adherence Rate */}
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Adherence Rate
              </CardTitle>
              <div className="icon-container-success">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="stat-number">{stats.adherenceRate}%</div>
              <div className="progress-gradient mt-3">
                <Progress value={stats.adherenceRate} className="h-2.5 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Medications & Gamification */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Medications */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Medications
                </CardTitle>
                <CardDescription>Your scheduled doses for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl">
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
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        med.taken 
                          ? 'bg-gradient-to-r from-success/10 to-success/5 border-success/30' 
                          : 'bg-muted/30 border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                          med.taken 
                            ? 'bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-md' 
                            : 'bg-gradient-to-br from-primary/15 to-primary/5 text-primary'
                        }`}>
                          {med.taken ? <Check className="h-6 w-6" /> : <Pill className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get started quickly with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="gap-2 rounded-xl" variant="outline" asChild>
              <Link to="/reports?action=upload">
                <FileText className="h-4 w-4" />
                Upload Report
              </Link>
            </Button>
            <Button className="gap-2 rounded-xl" variant="outline" asChild>
              <Link to="/medications?action=add">
                <Pill className="h-4 w-4" />
                Add Medication
              </Link>
            </Button>
            <Button className="gap-2 rounded-xl" variant="outline" asChild>
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
