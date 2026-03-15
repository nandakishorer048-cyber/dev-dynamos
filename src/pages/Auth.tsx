import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Pill, Heart, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ParticleGalaxy } from '@/components/ParticleGalaxy';


const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAuthErrorFeedback = (mode: 'signin' | 'signup', rawMessage: string) => {
    const message = rawMessage.toLowerCase();

    if (message.includes('email not confirmed')) {
      return {
        title: 'Verify your email',
        description: 'Please confirm your email from your inbox, then sign in.',
        variant: 'default' as const,
      };
    }

    if (message.includes('email rate limit exceeded')) {
      return {
        title: 'Too many attempts',
        description: 'Please wait about a minute, then try again.',
        variant: 'default' as const,
      };
    }

    if (message.includes('already registered')) {
      return {
        title: mode === 'signup' ? 'Account already exists' : 'Sign in failed',
        description: 'This email is already registered. Please sign in instead.',
        variant: 'default' as const,
      };
    }

    if (message.includes('failed to fetch')) {
      return {
        title: 'Temporary connection issue',
        description: 'Session was refreshed. Please click once again.',
        variant: 'default' as const,
      };
    }

    if (message.includes('invalid login credentials')) {
      return {
        title: 'Sign in failed',
        description: 'Email or password is incorrect. Please try again.',
        variant: 'default' as const,
      };
    }

    return {
      title: mode === 'signup' ? 'Sign up failed' : 'Sign in failed',
      description: rawMessage,
      variant: 'default' as const,
    };
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    const { error, session } = await signIn(email, password);
    setLoading(false);

    if (error) {
      const feedback = getAuthErrorFeedback('signin', error.message);
      toast({
        title: feedback.title,
        description: feedback.description,
        variant: feedback.variant,
      });
      return;
    }

    if (session) {
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    const { error, session } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      const feedback = getAuthErrorFeedback('signup', error.message);
      toast({
        title: feedback.title,
        description: feedback.description,
        variant: feedback.variant,
      });
      return;
    }

    if (session) {
      navigate('/dashboard');
      return;
    }

    toast({
      title: 'Welcome to Diagnyx AI! 🎉',
      description: 'Account created. Please confirm your email before signing in.',
    });
  };


  const features = [
    { icon: Sparkles, text: 'AI-powered report analysis', color: 'text-blue-400', glow: 'rgba(59,130,246,0.2)' },
    { icon: Pill, text: 'Smart medication tracking', color: 'text-purple-400', glow: 'rgba(139,92,246,0.2)' },
    { icon: Heart, text: 'Personalized health insights', color: 'text-cyan-400', glow: 'rgba(14,165,233,0.2)' },
    { icon: Shield, text: 'Secure & private data', color: 'text-indigo-400', glow: 'rgba(99,102,241,0.2)' },
  ];

  const inputClassName = "bg-white/[0.03] border-white/10 text-foreground placeholder:text-foreground/30 focus:border-primary/50 focus:ring-primary/20 transition-all";


  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(225 30% 5%) 0%, hsl(230 25% 7%) 30%, hsl(240 20% 8%) 60%, hsl(225 25% 6%) 100%)' }}
    >
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden">
        <ParticleGalaxy />

        <div className="absolute inset-0 z-[1]" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(14, 165, 233, 0.04) 100%)',
        }} />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 text-white">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden shadow-lg"
            >
              <img 
                src="/logo.png" 
                alt="Diagnyx Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <span className="text-2xl font-heading font-bold gradient-text">Diagnyx AI</span>
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-8 relative z-10"
        >
          <motion.div variants={fadeIn}>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              Your Personal{' '}
              <span className="gradient-text">Health Companion</span>
            </h1>
            <p className="text-lg text-foreground/60">
              Understand your medical reports, manage medications, and never miss a dose with smart reminders.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="flex items-center gap-3 rounded-xl p-4 transition-all duration-300 group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(100, 140, 220, 0.08)',
                }}
                whileHover={{
                  scale: 1.02,
                  borderColor: 'rgba(100, 140, 220, 0.2)',
                }}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${feature.color}`}
                  style={{
                    background: feature.glow,
                    boxShadow: `0 0 15px ${feature.glow}`,
                  }}
                >
                  <feature.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground/70">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-foreground/30 relative z-10"
        >
          © 2025 Diagnyx AI. Your health, simplified.
        </motion.p>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 lg:hidden"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden shadow-md"
            >
              <img 
                src="/logo.png" 
                alt="Diagnyx Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <span className="text-xl font-heading font-bold gradient-text">Diagnyx AI</span>
          </motion.div>

          <Card
            className="border-0 overflow-hidden"
            style={{
              background: 'rgba(15, 20, 35, 0.6)',
              backdropFilter: 'blur(24px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
              border: '1px solid rgba(100, 140, 220, 0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(59, 130, 246, 0.04)',
            }}
          >
            <div
              className="h-px w-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3), transparent)',
              }}
            />

            <Tabs defaultValue="signin" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(100, 140, 220, 0.06)',
                }}>
                  <TabsTrigger value="signin" className="data-[state=active]:bg-primary/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                      <CardTitle className="text-xl text-foreground">Welcome back!</CardTitle>
                      <CardDescription className="text-foreground/50 mt-1">
                        Sign in to access your health dashboard
                      </CardDescription>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-foreground/70">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputClassName} ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-foreground/70">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClassName} ${errors.password ? 'border-destructive' : ''}`}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base btn-glow btn-sweep text-white border-0 rounded-xl group"
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ background: 'rgba(100,140,220,0.15)' }} />
                    <span className="text-xs text-foreground/30 font-medium">or</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(100,140,220,0.15)' }} />
                  </div>

                  {/* Google Sign-In */}
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await signInWithGoogle();
                      if (error) toast({ title: 'Google sign-in failed', description: error.message, variant: 'default' });
                    }}
                    className="w-full h-12 flex items-center justify-center gap-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(100,140,220,0.15)',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(100,140,220,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(100,140,220,0.15)')}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
                      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
                      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                      <CardTitle className="text-xl text-foreground">Create account</CardTitle>
                      <CardDescription className="text-foreground/50 mt-1">
                        Start your health journey with Diagnyx AI
                      </CardDescription>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-foreground/70">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-foreground/70">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputClassName} ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-foreground/70">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClassName} ${errors.password ? 'border-destructive' : ''}`}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base btn-glow btn-sweep text-white border-0 rounded-xl group"
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loading ? 'Creating account...' : 'Create Account'}
                        {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px" style={{ background: 'rgba(100,140,220,0.15)' }} />
                    <span className="text-xs text-foreground/30 font-medium">or</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(100,140,220,0.15)' }} />
                  </div>

                  {/* Google Sign-Up */}
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await signInWithGoogle();
                      if (error) toast({ title: 'Google sign-in failed', description: error.message, variant: 'default' });
                    }}
                    className="w-full h-12 flex items-center justify-center gap-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(100,140,220,0.15)',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(100,140,220,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(100,140,220,0.15)')}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
                      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
                      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
