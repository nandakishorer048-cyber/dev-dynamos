import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-xl mx-auto space-y-2 mb-8">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(percentage)}% Completed</span>
      </div>
      <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
