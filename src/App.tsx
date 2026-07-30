import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { EmergencyButton } from "@/components/EmergencyButton";
import { PatientChatbot } from "@/components/chat/PatientChatbot";
import { useReminderNotifications } from "@/hooks/useReminderNotifications";

import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import ApplicationSuccess from "./pages/ApplicationSuccess";
import Admin from "./pages/Admin";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Medications from "./pages/Medications";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile";
import Vitals from "./pages/Vitals";
import Rewards from "./pages/Rewards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, applicationStatus, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-xl bg-primary/20" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin always has access to dashboard/protected routes
  if (isAdmin) {
    return <>{children}</>;
  }

  // Non-approved users cannot access dashboard or protected routes
  if (applicationStatus !== 'approved') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-xl bg-primary/20" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading, applicationStatus, isAdmin } = useAuth();

  // Initialize reminder notifications with sound
  useReminderNotifications();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-xl bg-primary/20" />
        </div>
      </div>
    );
  }

  const location = useLocation();
  const isApprovedOrAdmin = isAdmin || applicationStatus === 'approved';

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              user && isApprovedOrAdmin ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <PageTransition>
                  <Index />
                </PageTransition>
              )
            }
          />
          <Route
            path="/onboarding"
            element={
              <PageTransition>
                <Onboarding />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              user && isApprovedOrAdmin ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <PageTransition>
                  <Login />
                </PageTransition>
              )
            }
          />
          <Route
            path="/auth"
            element={<Navigate to="/login" replace />}
          />
          <Route
            path="/application-success"
            element={
              <PageTransition>
                <ApplicationSuccess />
              </PageTransition>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medications"
            element={
              <ProtectedRoute>
                <Medications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vitals"
            element={
              <ProtectedRoute>
                <Vitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <Rewards />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      {user && isApprovedOrAdmin && <EmergencyButton />}
      {user && isApprovedOrAdmin && <PatientChatbot />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;