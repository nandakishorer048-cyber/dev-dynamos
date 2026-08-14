import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Loader2, UserPlus, LogIn } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Login() {
  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'signup' && !fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;

    if (mode === 'signup' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);

    try {
      if (mode === 'signup') {
        // --- SIGN UP ---
        const { error: signUpErr, session } = await signUp(email, password, fullName);

        if (signUpErr) {
          const msg = signUpErr.message;
          if (msg.includes('User already registered') || msg.includes('already registered')) {
            // Attempt auto sign in with same password
            const { error: signInErr, session: loginSession } = await signIn(email, password);
            if (!signInErr && loginSession) {
              toast({
                title: 'Welcome back! 🎉',
                description: 'Signed in to your existing account.',
              });
              navigate('/dashboard');
              return;
            }

            toast({
              title: 'Account Already Exists',
              description: 'An account with this email already exists. Switched to Sign In.',
            });
            setMode('signin');
            setLoading(false);
            return;
          }

          toast({
            title: 'Sign Up Failed',
            description: msg,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        toast({
          title: 'Account Created! 🎉',
          description: 'Welcome to Diagnyx AI.',
        });
        navigate('/dashboard');
      } else {
        // --- SIGN IN ---
        const { error: signInErr, session } = await signIn(email, password);

        if (signInErr) {
          toast({
            title: 'Sign in failed',
            description: signInErr.message.includes('Invalid login credentials')
              ? 'Email or password is incorrect. Please check your credentials.'
              : signInErr.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Check if admin
          const { data: adminRow } = await supabase
            .from('admin_roles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (adminRow) {
            navigate('/admin');
            return;
          }

          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast({
        title: 'Authentication Error',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    'bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12 rounded-xl transition-all shadow-sm';

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <ParticleGalaxy />
      </div>

      {/* Left Branding Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden shadow-md bg-white border border-slate-100">
              <img src="/logo.png" alt="Diagnyx Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-heading font-extrabold gradient-text">Diagnyx AI</span>
          </Link>
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
            <Sparkles className="h-3.5 w-3.5" /> Direct Access
          </div>
          <h1 className="text-4xl font-heading font-extrabold text-slate-900 leading-tight">
            {mode === 'signin' ? 'Welcome back to' : 'Join'} <br />
            <span className="gradient-text">Diagnyx AI</span>
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {mode === 'signin'
              ? 'Sign in to access AI-powered report analysis, vital tracking, and smart health tools.'
              : 'Create your account to start understanding your medical reports with total clarity.'}
          </p>
        </div>

        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Diagnyx AI. All rights reserved.</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo Header */}
          <div className="flex items-center justify-center gap-3 lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden shadow-md bg-white border border-slate-100">
                <img src="/logo.png" alt="Diagnyx Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-heading font-extrabold gradient-text">Diagnyx AI</span>
            </Link>
          </div>

          <Card className="border-0 shadow-2xl shadow-blue-500/10 rounded-3xl bg-white/90 backdrop-blur-2xl overflow-hidden border border-white">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400" />
            
            <div className="p-6 pb-0">
              <Tabs value={mode} onValueChange={(val) => setMode(val as 'signin' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 p-1 rounded-xl">
                  <TabsTrigger value="signin" className="rounded-lg font-bold text-xs gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg font-bold text-xs gap-1.5">
                    <UserPlus className="h-3.5 w-3.5" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <CardHeader className="space-y-1 pb-4 pt-4">
              <CardTitle className="text-2xl font-heading font-extrabold text-slate-900">
                {mode === 'signin' ? 'Sign In to Diagnyx AI' : 'Create Your Account'}
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                {mode === 'signin'
                  ? 'Access your account to start managing your health'
                  : 'Get instant access to AI health tools and analysis'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Full Name
                    </Label>
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`${inputClassName} ${errors.fullName ? 'border-rose-400' : ''}`}
                    />
                    {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName}</p>}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClassName} ${errors.email ? 'border-rose-400' : ''}`}
                  />
                  {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClassName} ${errors.password ? 'border-rose-400' : ''}`}
                  />
                  {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClassName} ${errors.confirmPassword ? 'border-rose-400' : ''}`}
                    />
                    {errors.confirmPassword && <p className="text-xs text-rose-500">{errors.confirmPassword}</p>}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold rounded-xl btn-glow text-white border-0 shadow-lg shadow-blue-500/20 gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{mode === 'signin' ? 'Signing in...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                {mode === 'signin' ? (
                  <p className="text-xs text-slate-500">
                    Don&apos;t have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Sign Up Now
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Sign In Here
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
