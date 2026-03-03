import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Pill, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { z } from 'zod';
import { AntigravityDots } from '@/components/auth/AntigravityDots';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorFeedback = (m: AuthMode, raw: string) => {
    const msg = raw.toLowerCase();
    if (msg.includes('email not confirmed'))
      return { title: 'Verify your email', description: 'Please confirm your email from your inbox, then sign in.' };
    if (msg.includes('email rate limit exceeded'))
      return { title: 'Too many attempts', description: 'Please wait about a minute, then try again.' };
    if (msg.includes('already registered'))
      return { title: m === 'signup' ? 'Account already exists' : 'Sign in failed', description: 'This email is already registered. Please sign in instead.' };
    if (msg.includes('failed to fetch'))
      return { title: 'Temporary connection issue', description: 'Session was refreshed. Please click once again.' };
    if (msg.includes('invalid login credentials'))
      return { title: 'Sign in failed', description: 'Email or password is incorrect. Please try again.' };
    return { title: m === 'signup' ? 'Sign up failed' : 'Sign in failed', description: raw };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        const fb = getErrorFeedback('signin', error.message);
        toast({ title: fb.title, description: fb.description });
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        const fb = getErrorFeedback('signup', error.message);
        toast({ title: fb.title, description: fb.description });
      } else {
        toast({ title: 'Welcome to Mediguide! 🎉', description: 'Account created. Please confirm your email before signing in.' });
        setMode('signin');
      }
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-foreground">
      {/* Antigravity dots canvas */}
      <AntigravityDots />

      {/* Centered auth card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-warm shadow-glow">
              <Pill className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-3xl font-heading font-bold text-primary-foreground">
              Mediguide
            </span>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border/10 bg-card/95 p-8 shadow-elevated backdrop-blur-xl">
            {/* Mode toggle */}
            <div className="mb-6 flex rounded-2xl bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrors({}); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
                  mode === 'signin'
                    ? 'bg-primary text-primary-foreground shadow-warm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="mr-1.5 inline h-4 w-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrors({}); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${
                  mode === 'signup'
                    ? 'bg-primary text-primary-foreground shadow-warm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="mr-1.5 inline h-4 w-4" />
                Sign Up
              </button>
            </div>

            {/* Title */}
            <h1 className="mb-1 text-2xl font-heading font-bold text-foreground">
              {mode === 'signin' ? 'Welcome back!' : 'Create account'}
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'Sign in to access your health dashboard'
                : 'Start your health journey with Mediguide'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5 animate-slide-up">
                  <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-background ${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-semibold gradient-warm hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <span className="animate-pulse-soft">
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Switch mode link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-primary hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-primary-foreground/40">
            © 2025 Mediguide. Your health, simplified.
          </p>
        </div>
      </div>
    </div>
  );
}
