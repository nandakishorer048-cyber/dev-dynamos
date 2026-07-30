import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

interface StepRoleProps {
  selectedRole: string;
  onSelectRole: (role: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ROLES = [
  { id: 'Student', label: 'Student', icon: '🎓', desc: 'Medical or general student' },
  { id: 'Patient', label: 'Patient', icon: '🩺', desc: 'Managing personal health' },
  { id: 'Doctor', label: 'Doctor', icon: '👨‍⚕️', desc: 'Practicing physician / MD' },
  { id: 'Healthcare Professional', label: 'Healthcare Professional', icon: '🏥', desc: 'Nurse, pharmacist, therapist' },
  { id: 'Medical Researcher', label: 'Medical Researcher', icon: '🔬', desc: 'Clinical research & academics' },
  { id: 'Hospital / Clinic', label: 'Hospital / Clinic', icon: '🏢', desc: 'Healthcare organization' },
  { id: 'AI Enthusiast', label: 'AI Enthusiast', icon: '💻', desc: 'Exploring health tech & AI' },
  { id: 'Other', label: 'Other', icon: '✨', desc: 'Custom role or general interest' },
];

export function StepRole({ selectedRole, onSelectRole, onNext, onBack }: StepRoleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-heading font-extrabold text-slate-900">
          Who are you?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          Select the option that best describes your primary role or interest.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRole(role.id)}
              className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                  : 'bg-white/80 border-slate-200/80 hover:border-blue-300 hover:bg-white shadow-sm'
              }`}
            >
              <div className="text-3xl p-2 rounded-xl bg-white shadow-inner flex-shrink-0">
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className={`font-bold text-sm sm:text-base ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                    {role.label}
                  </h3>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{role.desc}</p>
              </div>
            </motion.div>
          );
        })}
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
          disabled={!selectedRole}
          className="h-12 px-8 font-bold rounded-xl btn-glow text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 gap-2"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
