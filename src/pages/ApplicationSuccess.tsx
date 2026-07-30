import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';
import { Clock, Home, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ApplicationSuccess() {
  const location = useLocation();
  const state = (location.state as { email?: string; name?: string }) || {};

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40">
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <ParticleGalaxy />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10 bg-white/80 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-blue-500/10 rounded-3xl p-8 sm:p-10 text-center space-y-6"
      >
        {/* Animated Celebration Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-100 via-blue-100 to-indigo-100 flex items-center justify-center text-4xl shadow-inner border border-white">
          🎉
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Request Submitted Successfully!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Thank you for requesting Early Access to <span className="font-bold text-slate-900">Diagnyx AI</span>.
          </p>
        </div>

        <div className="bg-slate-50/90 border border-slate-200/70 rounded-2xl p-4 text-left space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            We&apos;ve received your application
            {state.email && (
              <>
                {' '}
                for <span className="font-semibold text-slate-900">{state.email}</span>
              </>
            )}
            .
          </p>
          <p>
            Our team carefully reviews every request to ensure the best experience for our early users.
          </p>
          <p className="flex items-center gap-2 font-medium text-slate-700">
            <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
            You&apos;ll receive an email once your account has been approved.
          </p>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/70 flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600">Status Badge</span>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-amber-800">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              🟡 Pending Review
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/90 border border-blue-200/70 flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600">Est. Review Time</span>
            <div className="flex items-center gap-1 font-extrabold text-sm text-blue-900">
              <Clock className="h-4 w-4 text-blue-600" />
              24–72 Hours
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            asChild
            size="lg"
            className="w-full h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl shadow-slate-900/10 gap-2"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              <span>Return Home</span>
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
