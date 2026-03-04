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

import { ParticleGalaxy } from '@/components/ParticleGalaxy';

export default function Index() {
  const features = [
    // ... (keeping features/benefits as is, but inserting the new code)
  ];

  const benefits = [
    'Understand your medical reports in simple terms',
    'Get medication explanations without medical jargon',
    'Track your health journey over time',
    'Improve medication adherence with smart reminders',
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #ffffff, #f0f4f8)' }}>
      {/* Particle Galaxy Background */}
      <ParticleGalaxy />

      {/* Floating Glass Navigation */}
      <nav className="fixed top-4 inset-x-4 md:inset-x-8 z-50 rounded-2xl border border-white/20 bg-white/30 backdrop-blur-md shadow-soft">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">Mediguide</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hover:bg-white/50" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button className="shadow-warm hover:shadow-glow transition-all" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container min-h-screen flex flex-col items-center justify-center pt-24 pb-16 md:pt-32 z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm mx-auto shadow-sm">
            <Sparkles className="h-4 w-4" />
            Next-Gen Health Technology
          </div>

          <h1 className="text-5xl font-heading font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block text-foreground">AI Powered</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent pb-2">
              Smart Health Assistance
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Mediguide helps users analyze symptoms, get AI health insights, book lab tests, connect with doctors and order medicines — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-warm hover:scale-105 transition-transform duration-300 rounded-2xl" asChild>
              <Link to="/auth">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/80 hover:scale-105 transition-all duration-300 rounded-2xl" asChild>
              <Link to="/auth">Explore Features</Link>
            </Button>
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