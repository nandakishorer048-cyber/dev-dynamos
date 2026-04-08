import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Shield,
  ArrowRight,
  Activity,
  Brain,
  Pill,
  Watch,
  Dumbbell,
  Stethoscope,
  ChevronRight,
  Lock,
  Heart
} from 'lucide-react';
import { useRef } from 'react';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';
import { Footer } from '@/components/Footer';
import { ProductPreview } from '@/components/landing/ProductPreview';
import { TrustSection } from '@/components/landing/TrustSection';
import { StorytellingSection } from '@/components/landing/StorytellingSection';
import { InteractiveChatDemo } from '@/components/landing/InteractiveChatDemo';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const features = [
    { 
      title: "AI Report Analyzer", 
      description: "Convert dense medical reports into simple summaries with clinical accuracy.", 
      icon: FileText, 
      color: '#3A8DFF', 
      bg: 'rgba(58, 141, 255, 0.1)' 
    },
    { 
      title: "Symptom Checker", 
      description: "Dialogue-based assessment to understand your health concerns instantly.", 
      icon: Stethoscope, 
      color: '#10B981', 
      bg: 'rgba(16, 185, 129, 0.1)' 
    },
    { 
      title: "Vital Tracking", 
      description: "Real-time monitoring of heart rate, oxygen levels, and blood pressure trends.", 
      icon: Activity, 
      color: '#EF4444', 
      bg: 'rgba(239, 68, 68, 0.1)' 
    },
    { 
      title: "Smartwatch Sync", 
      description: "Seamless integration with your wearable devices for 24/7 health tracking.", 
      icon: Watch, 
      color: '#00C6FF', 
      bg: 'rgba(0, 198, 255, 0.1)' 
    },
    { 
      title: "AI Wellness Plans", 
      description: "Personalized exercise and diet plans tailored to your unique biology.", 
      icon: Dumbbell, 
      color: '#F59E0B', 
      bg: 'rgba(245, 158, 11, 0.1)' 
    },
    { 
      title: "Medicine Hub", 
      description: "Fast ordering and prescription management from verified pharmacies.", 
      icon: Pill, 
      color: '#8B5CF6', 
      bg: 'rgba(139, 92, 246, 0.1)' 
    },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      {/* Particle Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <ParticleGalaxy />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 py-6 px-6 md:px-12 pointer-events-none"
      >
        <div 
          className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 rounded-3xl border border-white/20 bg-white/40 backdrop-blur-2xl shadow-xl shadow-slate-900/5 pointer-events-auto"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center p-1 shadow-lg shadow-primary/20">
                <img src="/logo.png" alt="Diagnyx" className="w-full h-full object-contain brightness-0 invert" />
             </div>
             <span className="text-xl font-bold font-heading tracking-tight text-slate-900">Diagnyx AI</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-500">
             <a href="#" className="hover:text-primary transition-colors">Platform</a>
             <a href="#" className="hover:text-primary transition-colors">Privacy</a>
             <a href="#" className="hover:text-primary transition-colors">For Doctors</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-600 font-bold hover:bg-slate-100/50" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button className="bg-slate-900 text-white rounded-2xl px-6 font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/10" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden z-10">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="container px-4 mx-auto">
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="visible" 
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] mb-8 bg-blue-50 text-primary border border-blue-100 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              The Future of Health Intelligence
            </motion.div>

            <motion.h1 
              variants={fadeIn} 
              className="text-5xl sm:text-7xl lg:text-[100px] font-heading font-black leading-[0.95] tracking-tight text-slate-900 mb-8"
            >
              Understand your health <br />
              <span className="text-primary italic relative">
                with total clarity.
                <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-6 text-blue-100 -z-10" viewBox="0 0 400 30" fill="none">
                  <path d="M5 25C150 5 250 5 395 25" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeIn} 
              className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Diagnyx AI translates complex medical reports, symptoms, and vital data into clear, actionable health insights.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <Button size="lg" className="h-16 px-10 text-lg font-black rounded-[20px] bg-primary hover:bg-blue-600 shadow-2xl shadow-primary/20 gap-3 group" asChild>
                  <Link to="/auth">
                     Analyze Your Report
                     <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </Button>
               <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black rounded-[20px] border-2 border-slate-900 text-slate-900 hover:bg-slate-50 gap-3" asChild>
                  <Link to="/auth">
                     Check Symptoms
                  </Link>
               </Button>
            </motion.div>
          </motion.div>

          <ProductPreview />
        </motion.div>
      </section>

      {/* Trust & Authority */}
      <TrustSection />

      {/* Storytelling - Problem vs Solution */}
      <StorytellingSection />

      {/* Main Features Grid */}
      <section className="py-32 relative bg-white z-10">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
             <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Ecosystem</div>
             <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tight">
                Every tool for a <span className="text-primary">smarter life.</span>
             </h2>
             <p className="text-lg text-slate-500 font-medium">
                Integrated health features designed to work together and give you a 360° view of your biology.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-8 rounded-[32px] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 cursor-default"
              >
                <div 
                  className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center group-hover:scale-110 transition-all duration-500" 
                  style={{ backgroundColor: feature.bg }}
                >
                  <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-6">{feature.description}</p>
                
                <Link to="/auth" className="inline-flex items-center gap-2 text-sm font-black text-primary group/link">
                   View details
                   <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-[32px] transition-opacity -z-10 blur-xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Highlighting */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[100px]" />
         </div>
         
         <div className="container px-4 mx-auto relative z-10 text-center space-y-12">
            <div className="max-w-3xl mx-auto space-y-6">
               <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                  <Lock className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-4xl md:text-5xl font-heading font-black text-white">Your data stays <span className="text-primary italic">your data.</span></h2>
               <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  Encryption is standard at Diagnyx. We prioritize your privacy above all else, using industry-leading protocols to ensure your health history remains confidential and secure.
               </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-8">
               {[
                  { l: "E2E Encrypted", i: Shield },
                  { l: "HIPAA Compliant", i: FileText },
                  { l: "SOC2 Certified", i: Lock },
                  { l: "Identity Protected", i: Heart }
               ].map((item, i) => (
                  <div key={i} className="space-y-3">
                     <item.i className="w-6 h-6 text-primary mx-auto" />
                     <div className="text-white text-xs font-black uppercase tracking-widest">{item.l}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Interactive Chat Demo Preview */}
      <InteractiveChatDemo />

      {/* Final CTA Section */}
      <section className="py-32 relative bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[48px] bg-slate-900 p-12 md:p-24 text-center relative overflow-hidden group shadow-3xl shadow-primary/20"
          >
            {/* Background elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            
            <div className="relative z-10 space-y-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] uppercase font-black tracking-widest border border-white/5">
                  Ready to start?
               </div>
               <h2 className="text-5xl md:text-8xl font-heading font-black text-white tracking-tighter leading-[0.9]">
                  Take control of <br />
                  <span className="text-primary italic">your health today.</span>
               </h2>
               <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                  Join Diagnyx and experience the clarity of clinical AI in the palm of your hand.
               </p>
               <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                 <Button size="lg" className="h-20 px-16 text-xl font-black rounded-3xl bg-primary hover:bg-blue-600 shadow-2xl shadow-primary/40 group gap-4" asChild>
                   <Link to="/auth">
                     Get Started for Free
                     <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                   </Link>
                 </Button>
               </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
