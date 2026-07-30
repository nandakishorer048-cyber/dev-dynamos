import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto text-center space-y-8"
    >
      <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-blue-50 text-primary border border-blue-100 shadow-sm">
        <Sparkles className="h-3.5 w-3.5" />
        Private Beta Program
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-slate-900 leading-tight">
          Welcome to <span className="gradient-text">Diagnyx AI</span>
        </h1>
        <p className="text-lg sm:text-xl font-medium text-slate-600 leading-relaxed max-w-lg mx-auto">
          Building the future of AI-powered healthcare.
        </p>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
          Help us personalize your experience before requesting Early Access.
        </p>
      </div>

      {/* Feature highlights badge */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-sm flex flex-col items-center gap-1.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">Instant AI Analysis</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-sm flex flex-col items-center gap-1.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">Clinical Grade</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-sm flex flex-col items-center gap-1.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">24/7 Monitoring</span>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={onNext}
          size="lg"
          className="w-full sm:w-auto h-14 px-10 text-base font-bold rounded-2xl btn-glow text-white shadow-xl shadow-blue-500/20 group gap-3"
        >
          <span>Get Started</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}
