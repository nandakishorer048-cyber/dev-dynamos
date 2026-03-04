import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Pill,
  FileText,
  Bell,
  Sparkles,
  Heart,
  Shield,
  ArrowRight,
} from 'lucide-react';

import { ParticleGalaxy } from '@/components/ParticleGalaxy';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Index() {
  const features = [
    {
      title: "AI Symptom Analysis",
      description: "Understand your symptoms instantly with our advanced AI health assistant.",
      icon: Heart,
    },
    {
      title: "Smart Reports",
      description: "Turn complex medical reports into easy-to-understand summaries.",
      icon: FileText,
    },
    {
      title: "Medication Reminders",
      description: "Never miss a dose with intelligent tracking and alerts.",
      icon: Bell,
    },
    {
      title: "Secure Health Records",
      description: "Your health data is encrypted and completely private.",
      icon: Shield,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="min-h-screen bg-background relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #111827, #0f172a)' }}
    >
      {/* Particle Galaxy Background */}
      <ParticleGalaxy />

      {/* Floating Glass Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-4 inset-x-4 md:inset-x-8 z-50 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-soft"
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">Diagnyx AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hover:bg-white/10 text-foreground transition-colors" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="shadow-warm hover:shadow-glow transition-all bg-primary/90 backdrop-blur-sm" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative container min-h-screen flex flex-col items-center justify-center pt-24 pb-16 md:pt-32 z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-md mx-auto shadow-glow">
            <Sparkles className="h-4 w-4" />
            Next-Gen Health Technology
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl font-heading font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block text-foreground drop-shadow-md">AI Powered</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent pb-2 filter drop-shadow-lg">
              Smart Health Assistance
            </span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Diagnyx AI helps users analyze symptoms, get AI health insights, book lab tests, connect with doctors and order medicines — all in one platform.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all duration-300 rounded-2xl bg-primary/90 backdrop-blur-sm relative overflow-hidden group border border-primary/50" asChild>
                <Link to="/auth">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 rounded-2xl text-foreground hover:text-white" asChild>
                <Link to="/auth">Explore Features</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/5 bg-black/20 backdrop-blur-sm py-16 md:py-24 relative z-10">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl font-heading font-bold mb-4 text-foreground">
              Everything You Need for Better Health Management
            </h2>
            <p className="text-lg text-muted-foreground">
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
                whileHover={{ y: -8, scale: 1.02 }}
                key={i}
                className="group rounded-2xl bg-white/5 backdrop-blur-md p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-glow">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
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
          className="rounded-3xl relative overflow-hidden p-8 md:p-12 text-center border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.15)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Diagnyx AI to help them understand their health better.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button size="lg" className="gap-2 bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-2xl h-14 px-8 text-lg font-semibold transition-all relative overflow-hidden group" asChild>
                <Link to="/auth">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started for Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-black/40 backdrop-blur-md relative z-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
              <Pill className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold text-foreground">Diagnyx AI</span>
          </div>
          <p className="text-sm text-foreground/60">
            © 2025 Diagnyx AI. Your health, simplified.
          </p>
        </div>
      </footer>
    </motion.div>
  );
}