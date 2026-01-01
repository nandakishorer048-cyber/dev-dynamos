import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Pill, 
  Bell, 
  TrendingUp, 
  Plus,
  Check,
  Clock,
  Calendar
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
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your health overview for {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Medical Reports
              </CardTitle>
              <FileText className="h-4 w-4 text-health-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <Link to="/reports" className="text-xs text-primary hover:underline">
                View all reports →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Medications
              </CardTitle>
              <Pill className="h-4 w-4 text-health-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMedications}</div>
              <Link to="/medications" className="text-xs text-primary hover:underline">
                Manage medications →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Reminders
              </CardTitle>
              <Bell className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayReminders}</div>
              <Link to="/reminders" className="text-xs text-primary hover:underline">
                View schedule →
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Adherence Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adherenceRate}%</div>
              <Progress value={stats.adherenceRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Today's Medications & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Medications */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Medications
                </CardTitle>
                <CardDescription>Your scheduled doses for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/reminders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todayMeds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No medications scheduled for today</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/medications">Add a medication</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayMeds.map((med) => (
                    <div
                      key={med.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        med.taken ? 'bg-success/10 border-success/30' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          med.taken ? 'bg-success text-success-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          {med.taken ? <Check className="h-5 w-5" /> : <Pill className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{med.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-3" variant="outline" asChild>
                <Link to="/reports?action=upload">
                  <FileText className="h-4 w-4" />
                  Upload Report
                </Link>
              </Button>
              <Button className="w-full justify-start gap-3" variant="outline" asChild>
                <Link to="/medications?action=add">
                  <Pill className="h-4 w-4" />
                  Add Medication
                </Link>
              </Button>
              <Button className="w-full justify-start gap-3" variant="outline" asChild>
                <Link to="/reminders?action=add">
                  <Bell className="h-4 w-4" />
                  Set Reminder
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}