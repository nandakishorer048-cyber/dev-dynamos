import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingData } from '@/types/earlyAccess';
import { ArrowRight, Lock, UserCheck, Loader2 } from 'lucide-react';
import { z } from 'zod';

interface StepAccountProps {
  data: OnboardingData;
  onChangeField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export function StepAccount({
  data,
  onChangeField,
  onSubmit,
  onBack,
  loading,
}: StepAccountProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!data.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    const emailResult = emailSchema.safeParse(data.email);
    if (!emailResult.success) {
      errs.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(data.password);
    if (!passwordResult.success) {
      errs.password = passwordResult.error.errors[0].message;
    }

    if (data.password !== data.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!data.agreeToTerms) {
      errs.agreeToTerms = 'You must agree to the Privacy Policy & Terms';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;
    await onSubmit();
  };

  const inputStyle =
    'h-12 px-4 rounded-xl bg-white/90 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800 placeholder:text-slate-400 shadow-sm';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 shadow-sm mx-auto mb-1">
          <UserCheck className="h-3.5 w-3.5" />
          Final Step
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-slate-900">
          Create Your Early Access Account
        </h2>
        <p className="text-slate-500 text-sm sm:text-base">
          Fill in your details to finalize your application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Full Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={data.fullName}
            onChange={(e) => onChangeField('fullName', e.target.value)}
            className={`${inputStyle} ${errors.fullName ? 'border-rose-400 focus:ring-rose-200' : ''}`}
          />
          {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName}</p>}
        </div>

        {/* Location Grid: Country, State, City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Country
            </Label>
            <Input
              id="country"
              type="text"
              placeholder="e.g. USA"
              value={data.country}
              onChange={(e) => onChangeField('country', e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              State
            </Label>
            <Input
              id="state"
              type="text"
              placeholder="e.g. California"
              value={data.state}
              onChange={(e) => onChangeField('state', e.target.value)}
              className={inputStyle}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              City
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g. San Francisco"
              value={data.city}
              onChange={(e) => onChangeField('city', e.target.value)}
              className={inputStyle}
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Email Address <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => onChangeField('email', e.target.value)}
            className={`${inputStyle} ${errors.email ? 'border-rose-400 focus:ring-rose-200' : ''}`}
          />
          {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => onChangeField('password', e.target.value)}
              className={`${inputStyle} ${errors.password ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
            {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Confirm Password <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={data.confirmPassword}
              onChange={(e) => onChangeField('confirmPassword', e.target.value)}
              className={`${inputStyle} ${errors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : ''}`}
            />
            {errors.confirmPassword && <p className="text-xs text-rose-500">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-2 space-y-1">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="agreeToTerms"
              checked={data.agreeToTerms}
              onCheckedChange={(checked) => onChangeField('agreeToTerms', Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor="agreeToTerms" className="text-xs text-slate-600 font-normal leading-tight cursor-pointer">
              I agree to the Privacy Policy and Terms of Service.
            </Label>
          </div>
          {errors.agreeToTerms && <p className="text-xs text-rose-500">{errors.agreeToTerms}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={loading}
            className="text-slate-600 font-semibold hover:bg-slate-100/60 rounded-xl px-5"
          >
            Back
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="h-14 px-9 text-base font-bold rounded-2xl btn-glow text-white shadow-xl shadow-blue-500/20 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <span>Request Early Access</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
