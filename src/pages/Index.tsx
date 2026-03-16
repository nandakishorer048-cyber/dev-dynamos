import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FileText,
  Bell,
  Sparkles,
  Heart,
  Shield,
  ArrowRight,
  Activity,
  Brain,
  Stethoscope,
  Pill,
  Watch,
  Dumbbell,
} from 'lucide-react';
import { useRef } from 'react';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
};

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    { title: "AI Report Analyzer", description: "Turn complex medical reports into easy-to-understand summaries with AI-powered analysis.", icon: FileText, color: '#3A8DFF', bg: 'rgba(58, 141, 255, 0.08)' },
    { title: "Symptom Checker", description: "Understand your symptoms instantly with our advanced AI health assistant.", icon: Heart, color: '#E74C6F', bg: 'rgba(231, 76, 111, 0.08)' },
    { title: "Medicine Ordering", description: "Order medicines from verified pharmacies with doorstep delivery.", icon: Pill, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.08)' },
    { title: "Smartwatch Integration", description: "Sync your wearable devices for real-time health data monitoring.", icon: Watch, color: '#00C6FF', bg: 'rgba(0, 198, 255, 0.08)' },
    { title: "Vital Tracker", description: "Monitor heart rate, blood pressure, oxygen levels and more.", icon: Activity, color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.08)' },
    { title: "AI Exercise Recommendations", description: "Get personalized exercise plans based on your health profile.", icon: Dumbbell, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', icon: Activity },
    { value: '99.9%', label: 'Uptime', icon: Shield },
    { value: '24/7', label: 'AI Support', icon: Brain },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(200 50% 96%) 25%, hsl(210 30% 98%) 50%, hsl(195 40% 97%) 75%, hsl(210 35% 98%) 100%)' }}
    >
      {/* Particle Background */}
      <ParticleGalaxy />

      {/* Soft gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full animate-float-slow" style={{ top: '-5%', right: '-5%', background: 'radial-gradient(circle, rgba(58,141,255,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full animate-float-slow delay-300" style={{ bottom: '10%', left: '-5%', background: 'radial-gradient(circle, rgba(0,198,255,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full animate-float delay-600" style={{ top: '40%', right: '20%', background: 'radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 inset-x-4 md:inset-x-8 z-50 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          border: '1px solid rgba(58, 141, 255, 0.08)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.04), 0 0 40px rgba(58, 141, 255, 0.03)',
        }}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <motion.div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md" whileHover={{ scale: 1.1, rotate: 5 }}>
              <img src="/logo.png" alt="Diagnyx Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </motion.div>
            <span className="text-xl font-heading font-bold gradient-text">Diagnyx AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-primary/5 transition-all" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="btn-glow btn-sweep text-white border-0 px-6" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative container min-h-screen flex flex-col items-center justify-center pt-24 pb-16 md:pt-32 z-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium mx-auto"
              style={{
                color: '#3A8DFF',
                background: 'rgba(58, 141, 255, 0.06)',
                border: '1px solid rgba(58, 141, 255, 0.15)',
                boxShadow: '0 0 20px rgba(58, 141, 255, 0.05)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Next-Gen Health Technology
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl font-heading font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block" style={{ color: '#1F2937' }}>AI Powered</span>
              <span className="block pb-2 gradient-text">Smart Health Assistant</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed" style={{ color: '#6B7280' }}>
              Your intelligent health companion for symptom analysis, report interpretation, and real-time vital monitoring.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {[
                { label: 'Analyze Health Report', to: '/auth', primary: true },
                { label: 'Check Symptoms', to: '/auth', primary: false },
                { label: 'Track Vitals', to: '/auth', primary: false },
              ].map((cta) => (
                <motion.div key={cta.label} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className={`h-14 px-8 text-lg gap-2 rounded-2xl transition-all duration-300 ${
                      cta.primary
                        ? 'btn-glow text-white border-0 group'
                        : 'bg-white/80 text-foreground hover:bg-white border border-primary/10 hover:border-primary/25 hover:shadow-lg'
                    }`}
                    asChild
                  >
                    <Link to={cta.to}>
                      {cta.label}
                      {cta.primary && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-8">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div key={i} variants={fadeIn} className="text-center p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(58,141,255,0.06)', backdropFilter: 'blur(10px)' }}>
                <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: '#3A8DFF' }} />
                <div className="text-2xl md:text-3xl font-heading font-extrabold gradient-text">{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: '#9CA3AF' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" style={{ color: '#1F2937' }}>
              Everything You Need for Better{' '}
              <span className="gradient-text">Health Management</span>
            </h2>
            <p className="text-lg" style={{ color: '#6B7280' }}>
              Diagnyx AI combines AI technology with user-friendly design to make managing your health simple and stress-free.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                variants={fadeIn}
                key={i}
                className="tilt-card group rounded-2xl p-6 transition-all duration-400 relative overflow-hidden cursor-default"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(58, 141, 255, 0.06)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.03)',
                }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(58,141,255,0.1)' }}
              >
                {/* Top gradient line on hover */}
                <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)` }} />

                <div className="tilt-card-inner">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110" style={{ background: feature.bg }}>
                    <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2" style={{ color: '#1F2937' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24 relative z-10">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="rounded-3xl relative overflow-hidden p-8 md:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(58,141,255,0.06) 0%, rgba(0,198,255,0.04) 50%, rgba(74,222,128,0.03) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(58,141,255,0.1)',
            boxShadow: '0 20px 60px rgba(58,141,255,0.06)',
          }}
        >
          <div className="relative z-10">
            <motion.div className="inline-flex items-center gap-2 text-sm font-medium mb-6 px-4 py-2 rounded-full" style={{ color: '#3A8DFF', background: 'rgba(58,141,255,0.06)', border: '1px solid rgba(58,141,255,0.12)' }}>
              <Sparkles className="h-4 w-4" />
              Start for Free
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4" style={{ color: '#1F2937' }}>
              Ready to Take Control of{' '}
              <span className="gradient-text">Your Health</span>?
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
              Join thousands of users who trust Diagnyx AI to help them understand their health better.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button size="lg" className="gap-2 h-14 px-10 text-lg font-semibold rounded-2xl text-white border-0 btn-glow group" asChild>
                <Link to="/auth">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started for Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative z-10" style={{ borderTop: '1px solid rgba(58,141,255,0.06)', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Diagnyx Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span className="font-heading font-bold gradient-text">Diagnyx AI</span>
          </div>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            © 2025 Diagnyx AI. Your health, simplified.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
