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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardStyles = [
  {
    color: 'blue',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    hoverGlow: 'rgba(59, 130, 246, 0.15)',
    hoverBorder: 'rgba(59, 130, 246, 0.3)',
    gradientFrom: 'from-blue-500/10',
    shadowGlow: '0 0 20px rgba(59, 130, 246, 0.15)',
    activeShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
  },
  {
    color: 'purple',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    hoverGlow: 'rgba(139, 92, 246, 0.15)',
    hoverBorder: 'rgba(139, 92, 246, 0.3)',
    gradientFrom: 'from-purple-500/10',
    shadowGlow: '0 0 20px rgba(139, 92, 246, 0.15)',
    activeShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
  },
  {
    color: 'cyan',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    hoverGlow: 'rgba(14, 165, 233, 0.15)',
    hoverBorder: 'rgba(14, 165, 233, 0.3)',
    gradientFrom: 'from-cyan-500/10',
    shadowGlow: '0 0 20px rgba(14, 165, 233, 0.15)',
    activeShadow: '0 0 30px rgba(14, 165, 233, 0.2)',
  },
  {
    color: 'green',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    hoverGlow: 'rgba(16, 185, 129, 0.15)',
    hoverBorder: 'rgba(16, 185, 129, 0.3)',
    gradientFrom: 'from-emerald-500/10',
    shadowGlow: '0 0 20px rgba(16, 185, 129, 0.15)',
    activeShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
  },
];

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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user!.id)
        .single();

      setProfile(profileData);

      const { count: reportsCount } = await supabase
        .from('medical_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      const { data: medications, count: medsCount } = await supabase
        .from('medications')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id)
        .eq('is_active', true);

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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: logs } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user!.id)
        .gte('scheduled_time', today.toISOString());

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

  const statCards = [
    {
      title: 'Medical Reports',
      value: stats.totalReports,
      icon: FileText,
      link: '/reports',
      linkText: 'View all reports →',
      style: cardStyles[0],
    },
    {
      title: 'Active Medications',
      value: stats.activeMedications,
      icon: Pill,
      link: '/medications',
      linkText: 'Manage medications →',
      style: cardStyles[1],
    },
    {
      title: "Today's Reminders",
      value: stats.todayReminders,
      icon: Bell,
      link: '/reminders',
      linkText: 'View schedule →',
      style: cardStyles[2],
    },
    {
      title: 'Adherence Rate',
      value: `${stats.adherenceRate}%`,
      icon: TrendingUp,
      link: null,
      linkText: null,
      style: cardStyles[3],
      isProgress: true,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            {getGreeting()},{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(210 100% 60%), hsl(270 80% 65%), hsl(185 85% 55%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))',
              }}
            >
              {firstName}
            </span>
            ! 👋
          </h1>
          <p className="text-foreground/50 text-lg">
            Here's your health overview for {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                variants={fadeIn}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  className="group overflow-hidden relative transition-all duration-400 hover:-translate-y-1"
                  style={{
                    background: 'rgba(15, 20, 35, 0.5)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(100, 140, 220, 0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = card.style.hoverBorder;
                    e.currentTarget.style.boxShadow = card.style.activeShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(100, 140, 220, 0.08)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)';
                  }}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.style.gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  {/* Top glow line */}
                  <div
                    className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${card.style.hoverBorder}, transparent)`,
                    }}
                  />

                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-foreground/50">
                      {card.title}
                    </CardTitle>
                    <div
                      className={`flex items-center justify-center rounded-xl p-3 ${card.style.iconBg} ${card.style.iconColor} transition-all duration-300 group-hover:scale-110`}
                      style={{ boxShadow: card.style.shadowGlow }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div
                      className="text-3xl font-extrabold tracking-tight"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {card.value}
                    </div>
                    {card.isProgress && (
                      <div className="mt-3 rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.adherenceRate}%` }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                          style={{
                            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.8), rgba(16, 185, 129, 1))',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                          }}
                        />
                      </div>
                    )}
                    {card.link && (
                      <Link
                        to={card.link}
                        className={`text-sm ${card.style.iconColor} hover:opacity-80 font-medium mt-2 inline-block transition-opacity`}
                      >
                        {card.linkText}
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Today's Medications & Gamification */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Medications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <Card
              className="overflow-hidden relative group transition-all duration-400"
              style={{
                background: 'rgba(15, 20, 35, 0.5)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(100, 140, 220, 0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}
            >
              {/* Top glow line */}
              <div
                className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)' }}
              />

              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading text-foreground">
                    <Calendar className="h-5 w-5 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
                    Today's Medications
                  </CardTitle>
                  <CardDescription className="text-foreground/40">Your scheduled doses for today</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl text-foreground/70 hover:text-white transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(100, 140, 220, 0.1)',
                  }}
                >
                  <Link to="/reminders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {todayMeds.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="flex justify-center mb-4">
                      <motion.div
                        className="h-20 w-20 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.12))',
                          boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)',
                        }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Pill className="h-10 w-10 text-blue-400" />
                      </motion.div>
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                      No medications scheduled
                    </h3>
                    <p className="text-foreground/40 mb-6 max-w-sm mx-auto">
                      Start managing your health by adding your first medication. We'll help you stay on track!
                    </p>
                    <Button
                      asChild
                      className="rounded-xl btn-glow text-white border-0"
                    >
                      <Link to="/medications" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Medication
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayMeds.map((med, index) => (
                      <motion.div
                        key={med.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${med.taken
                            ? ''
                            : 'hover:-translate-y-0.5'
                          }`}
                        style={{
                          background: med.taken ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${med.taken ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 140, 220, 0.06)'}`,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${med.taken ? 'text-emerald-400' : 'text-blue-400'
                              }`}
                            style={{
                              background: med.taken ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.1)',
                              boxShadow: med.taken
                                ? '0 0 15px rgba(16, 185, 129, 0.15)'
                                : '0 0 15px rgba(59, 130, 246, 0.1)',
                            }}
                          >
                            {med.taken ? <Check className="h-6 w-6" /> : <Pill className="h-6 w-6" />}
                          </div>
                          <div>
                            <p className={`font-semibold ${med.taken ? 'text-foreground/50 line-through decoration-emerald-500/50' : 'text-foreground'}`}>{med.name}</p>
                            <p className="text-sm text-foreground/40">{med.dosage}</p>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${med.taken ? 'text-emerald-400/70' : 'text-foreground/50'
                            }`}
                          style={{
                            background: med.taken ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.2)',
                            border: `1px solid ${med.taken ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 140, 220, 0.04)'}`,
                          }}
                        >
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

          {/* Gamification Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <GamificationCard />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card
            className="overflow-hidden"
            style={{
              background: 'rgba(15, 20, 35, 0.5)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(100, 140, 220, 0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-heading text-foreground">
                <Sparkles className="h-5 w-5 text-purple-400" style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }} />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-foreground/40">Get started quickly with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {[
                { to: '/reports?action=upload', icon: FileText, label: 'Upload Report', hoverColor: 'rgba(59, 130, 246, 0.15)' },
                { to: '/medications?action=add', icon: Pill, label: 'Add Medication', hoverColor: 'rgba(139, 92, 246, 0.15)' },
                { to: '/reminders?action=add', icon: Bell, label: 'Set Reminder', hoverColor: 'rgba(14, 165, 233, 0.15)' },
              ].map((action) => (
                <motion.div key={action.to} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="gap-2 rounded-xl text-foreground/70 hover:text-white transition-all duration-300"
                    variant="outline"
                    asChild
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(100, 140, 220, 0.08)',
                    }}
                  >
                    <Link to={action.to}>
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Voice Assistant */}
        <VoiceAssistant />
      </div>
    </AppLayout>
  );
}
