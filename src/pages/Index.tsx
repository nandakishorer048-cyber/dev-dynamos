import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Pill, 
  FileText, 
  Bell, 
  Sparkles, 
  Heart,
  Shield,
  ArrowRight,
  Check
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: FileText,
      title: 'AI Report Analysis',
      description: 'Upload your medical reports and get plain-language explanations of complex medical terms.',
    },
    {
      icon: Pill,
      title: 'Medication Tracking',
      description: 'Keep track of all your medications with dosage info and AI-powered explanations.',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Never miss a dose with customizable reminders and adherence tracking.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and only accessible to you.',
    },
  ];

  const benefits = [
    'Understand your medical reports in simple terms',
    'Get medication explanations without medical jargon',
    'Track your health journey over time',
    'Improve medication adherence with smart reminders',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-xl font-heading font-bold">Mediguide</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              <Sparkles className="h-4 w-4" />
              AI-Powered Health Assistant
            </div>
            
            <h1 className="text-4xl font-heading font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your Personal{' '}
              <span className="text-primary">Health Companion</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg">
              Understand your medical reports, track medications, and never miss a dose with Mediguide — your friendly health assistant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/auth">
                  Start Free Today
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Learn More</Link>
              </Button>
            </div>

            <div className="space-y-3 pt-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl" />
              <div className="relative rounded-2xl bg-card p-8 shadow-elevated border border-border">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-warm text-primary-foreground">
                      <Heart className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">Health Dashboard</h3>
                      <p className="text-sm text-muted-foreground">All your health data in one place</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-success/10 p-3">
                      <span className="text-sm font-medium">Medication Adherence</span>
                      <span className="text-sm font-bold text-success">94%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                      <span className="text-sm font-medium">Reports Analyzed</span>
                      <span className="text-sm font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-accent p-3">
                      <span className="text-sm font-medium">Active Medications</span>
                      <span className="text-sm font-bold">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Everything You Need for Better Health Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Mediguide combines AI technology with user-friendly design to make managing your health simple and stress-free.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl bg-card p-6 shadow-soft border border-border hover:shadow-elevated transition-all"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <div className="rounded-3xl gradient-warm p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Mediguide to help them understand their health better.
          </p>
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <Link to="/auth">
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Pill className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold">Mediguide</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Mediguide. Your health, simplified.
          </p>
        </div>
      </footer>
    </div>
  );
}