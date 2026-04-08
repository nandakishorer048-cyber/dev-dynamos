import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, FileText, Pill, Bell, User, LogOut, Menu, X,
  Activity, Gift, Stethoscope
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingBackground } from '@/components/FloatingBackground';

interface AppLayoutProps { children: ReactNode; }

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/vitals', label: 'Vitals', icon: Activity },
  { path: '/medications', label: 'Medications', icon: Pill },
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/profile', label: 'Profile', icon: User },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(210 40% 98%) 0%, hsl(200 50% 96%) 25%, hsl(210 30% 98%) 50%, hsl(195 40% 97%) 75%, hsl(210 35% 98%) 100%)' }}>
      <FloatingBackground />

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 md:block">
        <div
          className="h-full flex flex-col border-r"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            borderColor: 'rgba(58, 141, 255, 0.06)',
            boxShadow: '4px 0 30px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 px-6" style={{ borderBottom: '1px solid rgba(58, 141, 255, 0.06)' }}>
            <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden shadow-md" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <img src="/logo.png" alt="Diagnyx Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </motion.div>
            <div>
              <span className="text-xl font-heading font-bold gradient-text">Diagnyx AI</span>
              <p className="text-xs text-muted-foreground">Health Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 p-4 pt-6 overflow-y-auto">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] px-4 mb-4">Menu</p>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                  <Link
                    to={item.path}
                    className={cn(
                      "nav-pill flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-2xl relative group",
                      isActive ? "text-primary" : "text-foreground/60 hover:text-foreground hover:bg-primary/[0.04]"
                    )}
                    style={isActive ? {
                      background: 'rgba(58, 141, 255, 0.08)',
                      border: '1px solid rgba(58, 141, 255, 0.12)',
                      boxShadow: '0 2px 12px rgba(58, 141, 255, 0.06)',
                    } : undefined}
                  >
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-primary/[0.06] text-foreground/50 group-hover:text-primary group-hover:bg-primary/[0.08]"
                    )} style={isActive ? { boxShadow: '0 4px 12px rgba(58, 141, 255, 0.3)' } : undefined}>
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    {item.label}
                    {isActive && (
                      <motion.div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary" layoutId="activeIndicator" style={{ boxShadow: '0 0 6px rgba(58, 141, 255, 0.6)' }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(58, 141, 255, 0.06)' }}>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-2xl text-foreground/50 hover:text-foreground hover:bg-destructive/5 transition-all duration-300" onClick={signOut}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/[0.06]">
                <LogOut className="h-[18px] w-[18px] text-destructive/60" />
              </div>
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header
        className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-4 md:hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          borderBottom: '1px solid rgba(58, 141, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md">
            <img src="/logo.png" alt="Diagnyx Logo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <span className="text-lg font-heading font-bold gradient-text">Diagnyx AI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-xl text-foreground hover:bg-primary/5">
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 pt-16 md:hidden"
            style={{ background: 'rgba(255, 255, 255, 0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            <nav className="space-y-2 p-4">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "nav-pill flex items-center gap-3 text-base font-medium rounded-2xl transition-all duration-300",
                        isActive ? "text-primary" : "text-foreground/60 hover:text-foreground hover:bg-primary/[0.04]"
                      )}
                      style={isActive ? { background: 'rgba(58, 141, 255, 0.08)', border: '1px solid rgba(58, 141, 255, 0.12)' } : undefined}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                        isActive ? "bg-primary text-white" : "bg-primary/[0.06] text-foreground/50"
                      )} style={isActive ? { boxShadow: '0 4px 12px rgba(58, 141, 255, 0.3)' } : undefined}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navItems.length * 0.05, duration: 0.3 }}>
                <Button variant="ghost" className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-base text-foreground/50 hover:text-foreground hover:bg-destructive/5" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/[0.06]">
                    <LogOut className="h-5 w-5 text-destructive/60" />
                  </div>
                  Sign Out
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:pl-72 relative z-10">
        <div className="min-h-screen pt-16 md:pt-0">
          <motion.div className="container py-6 md:py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
