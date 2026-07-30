import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Compass } from 'lucide-react';

interface StepReferralProps {
  referralSource: string;
  onChangeReferral: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const QUICK_SUGGESTIONS = [
  'Instagram',
  'Friend',
  'Google',
  'LinkedIn',
  'College',
  'Hackathon',
  'YouTube',
  'Twitter / X',
  'Product Hunt',
];

export function StepReferral({
  referralSource,
  onChangeReferral,
  onNext,
  onBack,
}: StepReferralProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm mx-auto mb-1">
          <Compass className="h-3.5 w-3.5" />
          Discovery
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-slate-900">
          How did you discover Diagnyx AI?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          Select a popular option or type your answer below.
        </p>
      </div>

      <div className="space-y-6 pt-2">
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_SUGGESTIONS.map((item) => {
            const isSelected = referralSource === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onChangeReferral(item)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 hover:border-blue-300'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Custom Text Input */}
        <div className="space-y-2">
          <Input
            type="text"
            value={referralSource}
            onChange={(e) => onChangeReferral(e.target.value)}
            placeholder="Type your answer or select above..."
            className="h-14 px-5 rounded-2xl bg-white/90 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-base placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-600 font-semibold hover:bg-slate-100/60 rounded-xl px-5"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="h-12 px-8 font-bold rounded-xl btn-glow text-white shadow-lg shadow-blue-500/20 gap-2"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
