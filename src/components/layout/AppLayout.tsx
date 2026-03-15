import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Pill,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Activity,
  Gift,
  Stethoscope
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingBackground } from '@/components/FloatingBackground';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/healthcare', label: 'Health Check', icon: Stethoscope },
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
    <div
      className="min-h-screen bg-background relative overflow-hidden text-foreground"
      style={{ background: 'linear-gradient(135deg, hsl(225 30% 5%) 0%, hsl(230 25% 7%) 30%, hsl(240 20% 8%) 60%, hsl(225 25% 6%) 100%)' }}
    >
      {/* Floating Background Particles */}
      <FloatingBackground />

      {/* Desktop Sidebar with glassmorphism */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 md:block">
        <div
          className="h-full flex flex-col border-r"
          style={{
            background: 'rgba(10, 15, 28, 0.85)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            borderColor: 'rgba(100, 140, 220, 0.08)',
            boxShadow: '10px 0 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(59, 130, 246, 0.03)',
          }}
        >
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 px-6" style={{ borderBottom: '1px solid rgba(100, 140, 220, 0.08)' }}>
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img 
                src="/logo.png" 
                alt="Diagnyx Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pill"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>';
                    icon.className = 'text-white';
                    parent.appendChild(icon);
                  }
                }}
              />
            </motion.div>
            <div>
              <span className="text-xl font-heading font-bold gradient-text">
                Diagnyx AI
              </span>
              <p className="text-xs text-muted-foreground">Health Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 p-4 pt-6 overflow-y-auto">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] px-4 mb-4">
              Menu
            </p>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "nav-pill flex items-center gap-3 text-sm font-medium transition-all duration-300 rounded-2xl relative group",
                      isActive
                        ? "text-white"
                        : "text-foreground/70 hover:text-white hover:bg-white/[0.04]"
                    )}
                    style={isActive ? {
                      background: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), inset 0 0 20px rgba(59, 130, 246, 0.05)',
                    } : undefined}
                  >
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-white/[0.04] text-foreground/60 group-hover:text-white group-hover:bg-white/[0.08]"
                    )}
                      style={isActive ? {
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
                      } : undefined}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    {item.label}
                    {isActive && (
                      <motion.div
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"
                        layoutId="activeIndicator"
                        style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(100, 140, 220, 0.08)' }}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-2xl text-foreground/60 hover:text-white hover:bg-white/[0.04] transition-all duration-300"
              onClick={signOut}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
                <LogOut className="h-[18px] w-[18px]" />
              </div>
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header with glass effect */}
      <header
        className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-4 md:hidden"
        style={{
          background: 'rgba(10, 15, 28, 0.85)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          borderBottom: '1px solid rgba(100, 140, 220, 0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md"
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
          <span className="text-lg font-heading font-bold gradient-text">Diagnyx AI</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl text-foreground hover:bg-white/[0.06]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu with glass effect & animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 pt-16 md:hidden"
            style={{
              background: 'rgba(10, 15, 28, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <nav className="space-y-2 p-4">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "nav-pill flex items-center gap-3 text-base font-medium rounded-2xl transition-all duration-300",
                        isActive
                          ? "text-white"
                          : "text-foreground/70 hover:text-white hover:bg-white/[0.04]"
                      )}
                      style={isActive ? {
                        background: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)',
                      } : undefined}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-primary text-white"
                          : "bg-white/[0.04] text-foreground/60"
                      )}
                        style={isActive ? { boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' } : undefined}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05, duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-base text-foreground/60 hover:text-white hover:bg-white/[0.04]"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                    <LogOut className="h-5 w-5" />
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
          <motion.div
            className="container py-6 md:py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
