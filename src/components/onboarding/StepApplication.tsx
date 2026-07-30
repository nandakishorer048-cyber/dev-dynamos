import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight, Sparkles } from 'lucide-react';

interface StepApplicationProps {
  applicationReason: string;
  additionalNotes: string;
  onChangeReason: (val: string) => void;
  onChangeNotes: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepApplication({
  applicationReason,
  additionalNotes,
  onChangeReason,
  onChangeNotes,
  onNext,
  onBack,
}: StepApplicationProps) {
  const isReasonValid = applicationReason.trim().length >= 10;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm mx-auto mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          Key Application Question
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
          Why would you like Early Access to Diagnyx AI?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
          We&apos;re carefully selecting our first users. Tell us a little about yourself and how you plan to use Diagnyx AI.
        </p>
      </div>

      <div className="space-y-6 pt-2">
        {/* Main Textarea */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-bold text-slate-800 flex items-center gap-1">
              Your Reason for Requesting Access <span className="text-rose-500">*</span>
            </Label>
            <span
              className={`text-xs font-semibold ${
                applicationReason.length > 1000
                  ? 'text-rose-600 font-bold'
                  : applicationReason.length > 800
                  ? 'text-amber-600'
                  : 'text-slate-400'
              }`}
            >
              {applicationReason.length} / 1000
            </span>
          </div>
          <Textarea
            value={applicationReason}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                onChangeReason(e.target.value);
              }
            }}
            placeholder={`Example:\n"I'm a second-year medical student interested in learning how AI can assist doctors in understanding medical reports.\n\nI'd love to test Diagnyx AI and provide detailed feedback to improve the platform."`}
            className="min-h-[160px] rounded-2xl bg-white/90 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 p-4 text-sm sm:text-base leading-relaxed placeholder:text-slate-400 shadow-sm resize-none"
          />
          {!isReasonValid && applicationReason.length > 0 && (
            <p className="text-xs text-amber-600 font-medium">
              Please provide at least 10 characters detailing your intent.
            </p>
          )}
        </div>

        {/* Optional Textarea */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-bold text-slate-700">
              Anything else you&apos;d like us to know? <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </Label>
            <span className="text-xs text-slate-400 font-semibold">
              {additionalNotes.length} / 500
            </span>
          </div>
          <Textarea
            value={additionalNotes}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                onChangeNotes(e.target.value);
              }
            }}
            placeholder="Suggestions, ideas, healthcare challenges you've faced, or anything you'd like to share."
            className="min-h-[100px] rounded-2xl bg-white/90 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 p-4 text-sm leading-relaxed placeholder:text-slate-400 shadow-sm resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-600 font-semibold hover:bg-slate-100/60 rounded-xl px-5"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isReasonValid}
          className="h-12 px-8 font-bold rounded-xl btn-glow text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 gap-2"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
