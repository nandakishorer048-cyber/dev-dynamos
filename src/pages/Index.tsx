import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Pill,
  FileText,
  Bell,
  Sparkles,
  Heart,
  Shield,
  ArrowRight,
  Activity,
  Brain,
} from 'lucide-react';
import { useRef } from 'react';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -10,
    scale: 1.03,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
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
    {
      title: "AI Symptom Analysis",
      description: "Understand your symptoms instantly with our advanced AI health assistant.",
      icon: Heart,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      glow: 'rgba(59, 130, 246, 0.3)',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      hoverBorder: 'hover:border-blue-500/40',
    },
    {
      title: "Smart Reports",
      description: "Turn complex medical reports into easy-to-understand summaries.",
      icon: FileText,
      gradient: 'from-purple-500/20 to-pink-500/20',
      glow: 'rgba(139, 92, 246, 0.3)',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      hoverBorder: 'hover:border-purple-500/40',
    },
    {
      title: "Medication Reminders",
      description: "Never miss a dose with intelligent tracking and alerts.",
      icon: Bell,
      gradient: 'from-cyan-500/20 to-teal-500/20',
      glow: 'rgba(14, 165, 233, 0.3)',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      hoverBorder: 'hover:border-cyan-500/40',
    },
    {
      title: "Secure Health Records",
      description: "Your health data is encrypted and completely private.",
      icon: Shield,
      gradient: 'from-indigo-500/20 to-blue-500/20',
      glow: 'rgba(99, 102, 241, 0.3)',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      hoverBorder: 'hover:border-indigo-500/40',
    },
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
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen bg-background relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(225 30% 5%) 0%, hsl(230 25% 7%) 30%, hsl(240 20% 8%) 60%, hsl(225 25% 6%) 100%)' }}
    >
      {/* Particle Galaxy Background */}
      <ParticleGalaxy />

      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-float-slow"
          style={{
            top: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-float-slow delay-300"
          style={{
            bottom: '10%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-float delay-600"
          style={{
            top: '40%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Floating Glass Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 inset-x-4 md:inset-x-8 z-50 rounded-2xl"
        style={{
          background: 'rgba(10, 15, 28, 0.6)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          border: '1px solid rgba(100, 140, 220, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(59, 130, 246, 0.03)',
        }}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{
                background: 'linear-gradient(135deg, hsl(210 100% 56%), hsl(185 85% 50%))',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Pill className="h-5 w-5" />
            </motion.div>
            <span className="text-xl font-heading font-bold gradient-text">Diagnyx AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hover:bg-white/[0.06] text-foreground/80 hover:text-white transition-all" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="btn-glow btn-sweep text-white border-0 px-6"
                asChild
              >
                <Link to="/auth">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with parallax */}
      <section ref={heroRef} className="relative container min-h-screen flex flex-col items-center justify-center pt-24 pb-16 md:pt-32 z-10">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="w-full"
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-blue-300 mx-auto"
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.08), inset 0 0 20px rgba(59, 130, 246, 0.03)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Next-Gen Health Technology
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl font-heading font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block text-foreground" style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}>AI Powered</span>
              <span
                className="block pb-2"
                style={{
                  background: 'linear-gradient(135deg, hsl(210 100% 60%), hsl(270 80% 65%), hsl(185 85% 55%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))',
                }}
              >
                Smart Health Assistance
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto font-medium leading-relaxed">
              Diagnyx AI helps users analyze symptoms, get AI health insights, book lab tests, connect with doctors and order medicines — all in one platform.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg gap-2 rounded-2xl text-white border-0 relative overflow-hidden group btn-glow"
                  asChild
                >
                  <Link to="/auth">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg gap-2 rounded-2xl text-foreground/80 hover:text-white transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(100, 140, 220, 0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                  asChild
                >
                  <Link to="/auth">Explore Features</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-8">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="text-center p-4 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(100, 140, 220, 0.06)',
                }}
              >
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div
                  className="text-2xl md:text-3xl font-heading font-extrabold"
                  style={{
                    background: 'linear-gradient(135deg, hsl(210 100% 60%), hsl(185 85% 55%))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-foreground/50 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 relative z-10" style={{ borderTop: '1px solid rgba(100, 140, 220, 0.06)' }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-foreground">
              Everything You Need for Better{' '}
              <span className="gradient-text">Health Management</span>
            </h2>
            <p className="text-lg text-foreground/50">
              Diagnyx AI combines AI technology with user-friendly design to make managing your health simple and stress-free.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, i) => (
              <motion.div
                variants={fadeIn}
                initial="rest"
                whileHover="hover"
                key={i}
                className={`group rounded-2xl p-6 transition-all duration-400 relative overflow-hidden ${feature.hoverBorder}`}
                style={{
                  background: 'rgba(15, 20, 35, 0.5)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(100, 140, 220, 0.08)',
                }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                {/* Top glow line */}
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.glow}, transparent)`,
                  }}
                />
                <motion.div variants={cardHover} className="relative z-10">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} ${feature.iconColor} group-hover:scale-110 transition-all duration-300`}
                    style={{
                      boxShadow: `0 0 20px ${feature.glow.replace('0.3', '0.15')}`,
                    }}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-foreground/50 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="rounded-3xl relative overflow-hidden p-8 md:p-16 text-center"
          style={{
            background: 'rgba(15, 20, 35, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(100, 140, 220, 0.1)',
            boxShadow: '0 0 80px rgba(139, 92, 246, 0.08), 0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Animated gradient border */}
          <div
            className="absolute inset-0 rounded-3xl opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15), rgba(14,165,233,0.15))',
            }}
          />

          <div className="relative z-10">
            <motion.div
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 mb-6 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Start for Free
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Ready to Take Control of{' '}
              <span className="gradient-text">Your Health</span>?
            </h2>
            <p className="text-lg text-foreground/50 mb-10 max-w-2xl mx-auto">
              Join thousands of users who trust Diagnyx AI to help them understand their health better.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button
                size="lg"
                className="gap-2 h-14 px-10 text-lg font-semibold rounded-2xl text-white border-0 btn-glow relative overflow-hidden group"
                asChild
              >
                <Link to="/auth">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started for Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 relative z-10"
        style={{
          borderTop: '1px solid rgba(100, 140, 220, 0.06)',
          background: 'rgba(10, 15, 28, 0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{
                background: 'linear-gradient(135deg, hsl(210 100% 56%), hsl(185 85% 50%))',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Pill className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold gradient-text">Diagnyx AI</span>
          </div>
          <p className="text-sm text-foreground/40">
            © 2025 Diagnyx AI. Your health, simplified.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}