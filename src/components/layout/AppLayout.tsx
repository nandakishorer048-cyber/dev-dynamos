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
  Gift
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

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
    <div className="min-h-screen">
      {/* Desktop Sidebar with gradient */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-sidebar-border md:block gradient-sidebar">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-health-mint text-primary-foreground shadow-warm">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold gradient-text">
                Mediguide
              </span>
              <p className="text-xs text-muted-foreground">Health Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-4">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "nav-pill flex items-center gap-3 text-sm font-medium",
                    isActive
                      ? "nav-pill-active"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    isActive 
                      ? "bg-primary-foreground/20" 
                      : "bg-sidebar-accent/50"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="border-t border-sidebar-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 nav-pill text-sidebar-foreground hover:bg-sidebar-accent/60"
              onClick={signOut}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent/50">
                <LogOut className="h-5 w-5" />
              </div>
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header with glass effect */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border px-4 md:hidden glass-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-health-mint text-primary-foreground">
            <Pill className="h-5 w-5" />
          </div>
          <span className="text-lg font-heading font-bold gradient-text">Mediguide</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu with glass effect */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16 md:hidden glass-card">
          <nav className="space-y-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "nav-pill flex items-center gap-3 text-base font-medium",
                    isActive
                      ? "nav-pill-active"
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isActive ? "bg-primary-foreground/20" : "bg-accent"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.label}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 nav-pill px-4 py-3 text-base"
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <LogOut className="h-5 w-5" />
              </div>
              Sign Out
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-72">
        <div className="min-h-screen pt-16 md:pt-0">
          <div className="container py-6 md:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
