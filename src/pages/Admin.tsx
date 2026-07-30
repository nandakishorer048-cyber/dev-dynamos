import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { EarlyAccessApplication, ApplicationStatus } from '@/types/earlyAccess';
import { StatsCard } from '@/components/admin/StatsCard';
import { ApplicationDrawer } from '@/components/admin/ApplicationDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, isToday } from 'date-fns';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Stethoscope,
  HeartHandshake,
  Microscope,
  Building2,
  Calendar,
  Search,
  Eye,
  LogOut,
  RefreshCw,
  Sparkles,
  Filter,
} from 'lucide-react';

export default function Admin() {
  const [applications, setApplications] = useState<EarlyAccessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Drawer state
  const [selectedApp, setSelectedApp] = useState<EarlyAccessApplication | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('early_access_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error loading applications',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setApplications(data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  // Compute Statistics
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const approvedApps = applications.filter((a) => a.status === 'approved').length;
  const rejectedApps = applications.filter((a) => a.status === 'rejected').length;

  const students = applications.filter((a) => a.user_role === 'Student').length;
  const doctors = applications.filter((a) => a.user_role === 'Doctor').length;
  const patients = applications.filter((a) => a.user_role === 'Patient').length;
  const researchers = applications.filter((a) => a.user_role === 'Medical Researcher').length;
  const hospitals = applications.filter((a) => a.user_role === 'Hospital / Clinic').length;

  const todaysRequests = applications.filter((a) =>
    a.created_at ? isToday(new Date(a.created_at)) : false
  ).length;

  // Filtered Applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.country && app.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      app.user_role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action: Approve
  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('early_access_applications')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        toast({
          title: 'Approval failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        // Update local state
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: 'approved' } : app))
        );

        const targetApp = applications.find((a) => a.id === id);

        toast({
          title: 'Application Approved! 🎉',
          description: `Email notification triggered for ${targetApp?.email || 'user'}.\nSubject: Welcome to Diagnyx AI Early Access!`,
        });

        if (selectedApp?.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: 'approved' } : null));
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reject
  const handleReject = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('early_access_applications')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        toast({
          title: 'Rejection failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app))
        );

        toast({
          title: 'Application Rejected',
          description: 'The applicant status has been updated to Rejected.',
        });

        if (selectedApp?.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: 'rejected' } : null));
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-white border border-slate-100">
              <img src="/logo.png" alt="Diagnyx" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-slate-900 text-lg">Diagnyx AI</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] uppercase">
                  Admin Panel
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">Private Beta Application Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApplications}
              className="rounded-xl border-slate-200 text-slate-700 font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="rounded-xl text-slate-600 font-semibold hover:bg-slate-100 gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Statistics Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Beta Application Analytics
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard
              title="Total Applications"
              value={totalApps}
              icon={<Users className="h-5 w-5" />}
              bgColor="bg-blue-50 text-blue-600"
            />
            <StatsCard
              title="Pending Review"
              value={pendingApps}
              icon={<Clock className="h-5 w-5" />}
              bgColor="bg-amber-50 text-amber-600"
            />
            <StatsCard
              title="Approved"
              value={approvedApps}
              icon={<CheckCircle2 className="h-5 w-5" />}
              bgColor="bg-emerald-50 text-emerald-600"
            />
            <StatsCard
              title="Rejected"
              value={rejectedApps}
              icon={<XCircle className="h-5 w-5" />}
              bgColor="bg-rose-50 text-rose-600"
            />
            <StatsCard
              title="Today's Requests"
              value={todaysRequests}
              icon={<Calendar className="h-5 w-5" />}
              bgColor="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Role Demographics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><GraduationCap className="h-4 w-4" /></div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Students</div>
                <div className="text-base font-extrabold text-slate-900">{students}</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Stethoscope className="h-4 w-4" /></div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Doctors</div>
                <div className="text-base font-extrabold text-slate-900">{doctors}</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><HeartHandshake className="h-4 w-4" /></div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Patients</div>
                <div className="text-base font-extrabold text-slate-900">{patients}</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600"><Microscope className="h-4 w-4" /></div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Researchers</div>
                <div className="text-base font-extrabold text-slate-900">{researchers}</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Building2 className="h-4 w-4" /></div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Hospitals</div>
                <div className="text-base font-extrabold text-slate-900">{hospitals}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table Section */}
        <Card className="border border-slate-200/80 shadow-md bg-white rounded-3xl overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-heading font-extrabold text-slate-900">Application Requests</h3>
              <p className="text-xs text-slate-500 font-medium">
                Review and approve applicants for Diagnyx AI Private Beta
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search name, email, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
                {['all', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Referral Source</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 font-medium">
                      Loading early access applications...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 font-medium">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => {
                    const appliedDateFormatted = app.created_at
                      ? format(new Date(app.created_at), 'MMM d, yyyy')
                      : 'N/A';

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Profile Avatar */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                            {app.full_name.charAt(0).toUpperCase()}
                          </div>
                        </td>

                        {/* Full Name */}
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                          {app.full_name}
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                          {app.email}
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            {app.user_role}
                          </span>
                        </td>

                        {/* Country */}
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                          {app.country || 'N/A'}
                        </td>

                        {/* Referral Source */}
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-medium">
                          {app.referral_source || 'N/A'}
                        </td>

                        {/* Applied Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-medium">
                          {appliedDateFormatted}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {app.status === 'approved' && (
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              🟢 Approved
                            </span>
                          )}
                          {app.status === 'rejected' && (
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                              🔴 Rejected
                            </span>
                          )}
                          {app.status === 'pending' && (
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                              🟡 Pending
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setIsDrawerOpen(true);
                            }}
                            className="h-8 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>

                          {app.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(app.id)}
                                className="h-8 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(app.id)}
                                className="h-8 rounded-lg font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Side Drawer View */}
      <ApplicationDrawer
        application={selectedApp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        actionLoading={actionLoading}
      />
    </div>
  );
}
