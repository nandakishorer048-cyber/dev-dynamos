import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Pill, Heart, Shield, Sparkles } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user } = useAuth();
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
      title: 'Welcome to Mediguide! 🎉',
      description: 'Account created. Please confirm your email before signing in.',
    });
  };

  const features = [
    { icon: Sparkles, text: 'AI-powered report analysis' },
    { icon: Pill, text: 'Smart medication tracking' },
    { icon: Heart, text: 'Personalized health insights' },
    { icon: Shield, text: 'Secure & private data' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-warm p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-primary-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
              <Pill className="h-6 w-6" />
            </div>
            <span className="text-2xl font-heading font-bold">Mediguide</span>
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary-foreground mb-4">
              Your Personal Health Companion
            </h1>
            <p className="text-lg text-primary-foreground/90">
              Understand your medical reports, manage medications, and never miss a dose with smart reminders.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm p-4"
              >
                <feature.icon className="h-5 w-5 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-primary-foreground/70">
          © 2025 Mediguide. Your health, simplified.
        </p>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-xl font-heading font-bold">Mediguide</span>
          </div>

          <Card className="border-0 shadow-elevated">
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <CardTitle className="text-xl">Welcome back!</CardTitle>
                    <CardDescription>
                      Sign in to access your health dashboard
                    </CardDescription>

                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <CardTitle className="text-xl">Create account</CardTitle>
                    <CardDescription>
                      Start your health journey with Mediguide
                    </CardDescription>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
