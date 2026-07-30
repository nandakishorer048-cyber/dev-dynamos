import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Clock, XCircle, Home, Mail, Sparkles, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { ApplicationStatus } from '@/types/earlyAccess';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // Status modal state if login is blocked
  const [loginStatusModal, setLoginStatusModal] = useState<ApplicationStatus | null>(null);

  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !validateForm()) return;
    setLoading(true);
    setLoginStatusModal(null);

    try {
      // 1. Attempt Supabase auth sign-in
      const { error: signInError, session } = await signIn(email, password);

      if (signInError) {
        toast({
          title: 'Sign in failed',
          description: signInError.message.includes('Invalid login credentials')
            ? 'Email or password is incorrect. Please try again.'
            : signInError.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!session || !session.user) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      // 2. Check if user is an Admin
      const { data: adminRow } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (adminRow) {
        // Admin user -> allow direct access
        navigate('/admin');
        return;
      }

      // 3. Check early_access_applications status
      const { data: application } = await supabase
        .from('early_access_applications')
        .select('status')
        .or(`user_id.eq.${userId},email.eq.${userEmail}`)
        .maybeSingle();

      if (!application) {
        // No application found for this account -> sign out & prompt to apply
        await signOut();
        toast({
          title: 'Early Access Required',
          description: 'No Early Access application was found for this account. Please request Early Access first.',
        });
        navigate('/onboarding');
        return;
      }

      if (application.status === 'pending') {
        // BLOCK LOGIN
        await signOut();
        setLoginStatusModal('pending');
        setLoading(false);
        return;
      }

      if (application.status === 'rejected') {
        // BLOCK LOGIN
        await signOut();
        setLoginStatusModal('rejected');
        setLoading(false);
        return;
      }

      if (application.status === 'approved') {
        // ALLOW LOGIN
        navigate('/dashboard');
        return;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast({
        title: 'Sign in error',
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
            <Sparkles className="h-3.5 w-3.5" /> Private Beta Access
          </div>
          <h1 className="text-4xl font-heading font-extrabold text-slate-900 leading-tight">
            Welcome back to <br />
            <span className="gradient-text">Diagnyx AI</span>
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Approved members can sign in below to access AI-powered report analysis, vital tracking, and smart health tools.
          </p>
        </div>

        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Diagnyx AI. Private Beta Release.</p>
      </div>

      {/* Right Login / Status Form Panel */}
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

          {/* Conditional Display: Pending Screen */}
          {loginStatusModal === 'pending' && (
            <Card className="border-0 shadow-2xl shadow-amber-500/10 rounded-3xl bg-white/90 backdrop-blur-2xl p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-100/80 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                ⏳
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">
                  Application Under Review
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your application is currently under review by our team.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center gap-2 text-sm font-bold text-amber-800">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                Status: 🟡 Pending
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                You will receive an email notification as soon as your account has been approved.
              </p>

              <div className="pt-2">
                <Button
                  onClick={() => setLoginStatusModal(null)}
                  className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 gap-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Return Home</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Conditional Display: Rejected Screen */}
          {loginStatusModal === 'rejected' && (
            <Card className="border-0 shadow-2xl shadow-rose-500/10 rounded-3xl bg-white/90 backdrop-blur-2xl p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-100/80 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                <XCircle className="h-8 w-8 text-rose-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">
                  Request Not Approved
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Unfortunately your request has not been approved at this time.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-700 leading-relaxed">
                If you believe this is an error or would like to provide additional details, please contact our support team.
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={() => setLoginStatusModal(null)}
                  className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 gap-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Return Home</span>
                </Button>
              </div>
            </Card>
          )}

          {/* Normal Login Card */}
          {loginStatusModal === null && (
            <Card className="border-0 shadow-2xl shadow-blue-500/10 rounded-3xl bg-white/90 backdrop-blur-2xl overflow-hidden border border-white">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400" />
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-heading font-extrabold text-slate-900">
                  Sign In to Diagnyx AI
                </CardTitle>
                <CardDescription className="text-slate-500 text-sm">
                  Access for approved early access users & admins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputClassName} ${errors.email ? 'border-rose-400' : ''}`}
                    />
                    {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="signin-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </Label>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClassName} ${errors.password ? 'border-rose-400' : ''}`}
                    />
                    {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold rounded-xl btn-glow text-white border-0 shadow-lg shadow-blue-500/20 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
                  <p className="text-xs text-slate-500">Don&apos;t have Early Access yet?</p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 rounded-xl font-bold border-slate-200 text-blue-600 hover:bg-blue-50/50"
                  >
                    <Link to="/onboarding">Apply for Early Access</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
