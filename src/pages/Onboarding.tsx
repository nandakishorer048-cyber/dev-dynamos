import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from '@/types/earlyAccess';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { StepWelcome } from '@/components/onboarding/StepWelcome';
import { StepRole } from '@/components/onboarding/StepRole';
import { StepApplication } from '@/components/onboarding/StepApplication';
import { StepReferral } from '@/components/onboarding/StepReferral';
import { StepAccount } from '@/components/onboarding/StepAccount';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';
import { Shield, Sparkles } from 'lucide-react';

const INITIAL_DATA: OnboardingData = {
  userRole: '',
  applicationReason: '',
  additionalNotes: '',
  referralSource: '',
  fullName: '',
  country: '',
  state: '',
  city: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFieldChange = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    try {
      // 1. Create account via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('User already registered') || authError.message.includes('already registered')) {
          toast({
            title: 'Account already exists',
            description: 'An account with this email is already registered. Please sign in.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registration failed',
            description: authError.message,
            variant: 'destructive',
          });
        }
        setLoading(false);
        return;
      }

      const userId = authData.user?.id || null;

      // 2. Store application details in early_access_applications
      const { error: dbError } = await supabase.from('early_access_applications').insert({
        user_id: userId,
        full_name: data.fullName,
        email: data.email,
        country: data.country || null,
        state: data.state || null,
        city: data.city || null,
        user_role: data.userRole,
        application_reason: data.applicationReason,
        additional_notes: data.additionalNotes || null,
        referral_source: data.referralSource || null,
        status: 'pending',
        email_verified: false,
      });

      if (dbError) {
        console.error('Error saving application:', dbError);
        // If there's a conflict or table issue, still guide the user gracefully
      }

      // 3. Immediately sign out to prevent auto-login to dashboard before approval
      await supabase.auth.signOut({ scope: 'local' });

      // 4. Navigate to Success Screen
      navigate('/application-success', { state: { email: data.email, name: data.fullName } });
    } catch (err: any) {
      console.error('Submission error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
      {/* Background Particle Galaxy */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <ParticleGalaxy />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden shadow-md bg-white border border-slate-100 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Diagnyx Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
            Diagnyx AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Already applied?</span>
          <Link
            to="/login"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 bg-white/80 hover:bg-white border border-slate-200/80 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl bg-white/70 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-blue-500/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          {/* Top subtle light streak */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400" />

          {/* Progress bar */}
          <ProgressBar currentStep={currentStep} totalSteps={5} />

          {/* Animated Steps */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepWelcome key="step1" onNext={handleNextStep} />
            )}
            {currentStep === 2 && (
              <StepRole
                key="step2"
                selectedRole={data.userRole}
                onSelectRole={(role) => handleFieldChange('userRole', role)}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {currentStep === 3 && (
              <StepApplication
                key="step3"
                applicationReason={data.applicationReason}
                additionalNotes={data.additionalNotes}
                onChangeReason={(val) => handleFieldChange('applicationReason', val)}
                onChangeNotes={(val) => handleFieldChange('additionalNotes', val)}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {currentStep === 4 && (
              <StepReferral
                key="step4"
                referralSource={data.referralSource}
                onChangeReferral={(val) => handleFieldChange('referralSource', val)}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {currentStep === 5 && (
              <StepAccount
                key="step5"
                data={data}
                onChangeField={handleFieldChange}
                onSubmit={handleSubmitApplication}
                onBack={handleBackStep}
                loading={loading}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-blue-500" />
          <span>Encrypted & HIPAA Compliant Platform</span>
        </div>
        <div>© {new Date().getFullYear()} Diagnyx AI. All rights reserved.</div>
      </footer>
    </div>
  );
}
