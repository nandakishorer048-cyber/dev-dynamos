import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { GamificationCard } from '@/components/gamification/GamificationCard';
import { motion } from 'framer-motion';
import {
  FileText, Pill, Bell, TrendingUp, Check, Clock,
  Calendar, Plus, Sparkles, Heart, Droplets, Activity
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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardStyles = [
  { iconBg: 'rgba(58, 141, 255, 0.08)', iconColor: '#3A8DFF', hoverBorder: 'rgba(58, 141, 255, 0.2)', shadowGlow: '0 4px 20px rgba(58, 141, 255, 0.08)' },
  { iconBg: 'rgba(139, 92, 246, 0.08)', iconColor: '#8B5CF6', hoverBorder: 'rgba(139, 92, 246, 0.2)', shadowGlow: '0 4px 20px rgba(139, 92, 246, 0.08)' },
  { iconBg: 'rgba(0, 198, 255, 0.08)', iconColor: '#00C6FF', hoverBorder: 'rgba(0, 198, 255, 0.2)', shadowGlow: '0 4px 20px rgba(0, 198, 255, 0.08)' },
  { iconBg: 'rgba(74, 222, 128, 0.08)', iconColor: '#4ADE80', hoverBorder: 'rgba(74, 222, 128, 0.2)', shadowGlow: '0 4px 20px rgba(74, 222, 128, 0.08)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalReports: 0, activeMedications: 0, todayReminders: 0, adherenceRate: 0 });
  const [todayMeds, setTodayMeds] = useState<TodayMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: profileData } = await supabase.from('profiles').select('full_name').eq('user_id', user!.id).single();
      setProfile(profileData);

      const { count: reportsCount } = await supabase.from('medical_reports').select('*', { count: 'exact', head: true }).eq('user_id', user!.id);
      const { count: medsCount } = await supabase.from('medications').select('*', { count: 'exact' }).eq('user_id', user!.id).eq('is_active', true);

      const { data: reminders } = await supabase
        .from('medication_reminders')
        .select(`id, reminder_time, medication_id, medications (id, name, dosage)`)
        .eq('user_id', user!.id).eq('is_enabled', true);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data: logs } = await supabase.from('medication_logs').select('*').eq('user_id', user!.id).gte('scheduled_time', today.toISOString());

      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: weekLogs } = await supabase.from('medication_logs').select('status').eq('user_id', user!.id).gte('scheduled_time', weekAgo.toISOString());

      const takenCount = weekLogs?.filter(l => l.status === 'taken').length || 0;
      const totalLogs = weekLogs?.length || 0;
      const adherence = totalLogs > 0 ? Math.round((takenCount / totalLogs) * 100) : 100;

      const todayMedsList: TodayMedication[] = (reminders || []).map((r: any) => ({
        id: r.id, name: r.medications?.name || 'Unknown', dosage: r.medications?.dosage || '', time: r.reminder_time,
        taken: logs?.some((l: any) => l.reminder_id === r.id && l.status === 'taken') || false,
      }));

      setStats({ totalReports: reportsCount || 0, activeMedications: medsCount || 0, todayReminders: reminders?.length || 0, adherenceRate: adherence });
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

  const statCards = [
    { title: 'Medical Reports', value: stats.totalReports, icon: FileText, link: '/reports', linkText: 'View all reports →', style: cardStyles[0] },
    { title: 'Active Medications', value: stats.activeMedications, icon: Pill, link: '/medications', linkText: 'Manage medications →', style: cardStyles[1] },
    { title: "Today's Reminders", value: stats.todayReminders, icon: Bell, link: '/reminders', linkText: 'View schedule →', style: cardStyles[2] },
    { title: 'Adherence Rate', value: `${stats.adherenceRate}%`, icon: TrendingUp, link: null, linkText: null, style: cardStyles[3], isProgress: true },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-heading font-bold" style={{ color: '#1F2937' }}>
            {getGreeting()},{' '}
            <span className="gradient-text">{firstName}</span>! 👋
          </h1>
          <p className="text-lg" style={{ color: '#6B7280' }}>
            Here's your health overview for {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={i} variants={fadeIn} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <Card
                  className="group overflow-hidden relative transition-all duration-400 hover:-translate-y-1"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(58, 141, 255, 0.06)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = card.style.hoverBorder;
                    e.currentTarget.style.boxShadow = card.style.shadowGlow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(58, 141, 255, 0.06)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.03)';
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium" style={{ color: '#6B7280' }}>{card.title}</CardTitle>
                    <div className="flex items-center justify-center rounded-xl p-3 transition-all duration-300 group-hover:scale-110" style={{ background: card.style.iconBg }}>
                      <Icon className="h-5 w-5" style={{ color: card.style.iconColor }} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-extrabold tracking-tight" style={{ color: '#1F2937' }}>{card.value}</div>
                    {card.isProgress && (
                      <div className="mt-3 rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(74, 222, 128, 0.1)' }}>
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${stats.adherenceRate}%` }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} style={{ background: 'linear-gradient(90deg, #4ADE80, #22C55E)', boxShadow: '0 0 10px rgba(74, 222, 128, 0.3)' }} />
                      </div>
                    )}
                    {card.link && (
                      <Link to={card.link} className="text-sm font-medium mt-2 inline-block transition-opacity hover:opacity-70" style={{ color: card.style.iconColor }}>{card.linkText}</Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Today's Medications & Gamification */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-2">
            <Card className="overflow-hidden relative group transition-all duration-400" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(58, 141, 255, 0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }}>
              <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent, rgba(58, 141, 255, 0.2), transparent)' }} />
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading" style={{ color: '#1F2937' }}>
                    <Calendar className="h-5 w-5" style={{ color: '#3A8DFF' }} />
                    Today's Medications
                  </CardTitle>
                  <CardDescription style={{ color: '#9CA3AF' }}>Your scheduled doses for today</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl transition-all" style={{ background: 'rgba(58, 141, 255, 0.04)', border: '1px solid rgba(58, 141, 255, 0.1)', color: '#3A8DFF' }}>
                  <Link to="/reminders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {todayMeds.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="flex justify-center mb-4">
                      <motion.div className="h-20 w-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(58,141,255,0.08), rgba(0,198,255,0.08))' }} animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                        <Pill className="h-10 w-10" style={{ color: '#3A8DFF' }} />
                      </motion.div>
                    </div>
                    <h3 className="text-lg font-heading font-semibold mb-2" style={{ color: '#1F2937' }}>No medications scheduled</h3>
                    <p className="mb-6 max-w-sm mx-auto" style={{ color: '#9CA3AF' }}>Start managing your health by adding your first medication.</p>
                    <Button asChild className="rounded-xl btn-glow text-white border-0">
                      <Link to="/medications" className="gap-2"><Plus className="h-4 w-4" />Add Your First Medication</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayMeds.map((med, index) => (
                      <motion.div key={med.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08, duration: 0.4 }}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${!med.taken ? 'hover:-translate-y-0.5' : ''}`}
                        style={{
                          background: med.taken ? 'rgba(74, 222, 128, 0.04)' : 'rgba(58, 141, 255, 0.02)',
                          border: `1px solid ${med.taken ? 'rgba(74, 222, 128, 0.12)' : 'rgba(58, 141, 255, 0.06)'}`,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300" style={{ background: med.taken ? 'rgba(74, 222, 128, 0.1)' : 'rgba(58, 141, 255, 0.06)' }}>
                            {med.taken ? <Check className="h-6 w-6" style={{ color: '#4ADE80' }} /> : <Pill className="h-6 w-6" style={{ color: '#3A8DFF' }} />}
                          </div>
                          <div>
                            <p className={`font-semibold ${med.taken ? 'line-through' : ''}`} style={{ color: med.taken ? '#9CA3AF' : '#1F2937' }}>{med.name}</p>
                            <p className="text-sm" style={{ color: '#9CA3AF' }}>{med.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: med.taken ? 'rgba(74, 222, 128, 0.06)' : 'rgba(58, 141, 255, 0.04)', border: `1px solid ${med.taken ? 'rgba(74, 222, 128, 0.08)' : 'rgba(58, 141, 255, 0.06)'}`, color: med.taken ? '#4ADE80' : '#6B7280' }}>
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">{med.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <GamificationCard />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <Card className="overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(58, 141, 255, 0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.03)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-heading" style={{ color: '#1F2937' }}>
                <Sparkles className="h-5 w-5" style={{ color: '#8B5CF6' }} />
                Quick Actions
              </CardTitle>
              <CardDescription style={{ color: '#9CA3AF' }}>Get started quickly with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {[
                { to: '/reports?action=upload', icon: FileText, label: 'Upload Report', color: '#3A8DFF' },
                { to: '/medications?action=add', icon: Pill, label: 'Add Medication', color: '#8B5CF6' },
                { to: '/reminders?action=add', icon: Bell, label: 'Set Reminder', color: '#00C6FF' },
              ].map((action) => (
                <motion.div key={action.to} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button className="gap-2 rounded-xl transition-all duration-300 hover:shadow-md" variant="outline" asChild style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(58, 141, 255, 0.08)', color: '#1F2937' }}>
                    <Link to={action.to}>
                      <action.icon className="h-4 w-4" style={{ color: action.color }} />
                      {action.label}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <VoiceAssistant />
      </div>
    </AppLayout>
  );
}
