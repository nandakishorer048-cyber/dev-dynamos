import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { EarlyAccessApplication } from '@/types/earlyAccess';
import { CheckCircle2, XCircle, Calendar, MapPin, Mail, User, Compass, Sparkles, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationDrawerProps {
  application: EarlyAccessApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  actionLoading: boolean;
}

export function ApplicationDrawer({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
  actionLoading,
}: ApplicationDrawerProps) {
  if (!application) return null;

  const appliedDate = application.created_at
    ? format(new Date(application.created_at), 'PPP p')
    : 'Unknown';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">🔴 Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">🟡 Pending Review</span>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto p-6 space-y-6 bg-slate-50/95 backdrop-blur-xl">
        <SheetHeader className="space-y-2 border-b border-slate-200/80 pb-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                {application.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <SheetTitle className="text-xl font-heading font-extrabold text-slate-900">
                  {application.full_name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" />
                  {application.email}
                </SheetDescription>
              </div>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between">
            {getStatusBadge(application.status)}
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {appliedDate}
            </span>
          </div>
        </SheetHeader>

        {/* Application Details Body */}
        <div className="space-y-5 text-sm">
          {/* Role & Referral */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="h-3 w-3 text-blue-500" /> Role
              </span>
              <p className="font-extrabold text-slate-900">{application.user_role}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Compass className="h-3 w-3 text-indigo-500" /> Referral Source
              </span>
              <p className="font-extrabold text-slate-900">{application.referral_source || 'N/A'}</p>
            </div>
          </div>

          {/* Location */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-emerald-500" /> Location
            </span>
            <p className="font-bold text-slate-900">
              {[application.city, application.state, application.country].filter(Boolean).join(', ') || 'Not specified'}
            </p>
          </div>

          {/* Application Reason (MOST IMPORTANT) */}
          <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-600" /> Why Early Access?
            </span>
            <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
              {application.application_reason}
            </p>
          </div>

          {/* Additional Notes */}
          {application.additional_notes && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-slate-500" /> Additional Notes
              </span>
              <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                {application.additional_notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <SheetFooter className="border-t border-slate-200/80 pt-4 flex-col gap-2">
          {application.status === 'pending' ? (
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() => onReject(application.id)}
                className="h-11 rounded-xl font-bold border-rose-200 text-rose-600 hover:bg-rose-50 gap-1.5"
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
              <Button
                disabled={actionLoading}
                onClick={() => onApprove(application.id)}
                className="h-11 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
            </div>
          ) : (
            <div className="w-full text-center text-xs font-semibold text-slate-500 py-2">
              Status is already set to <span className="font-extrabold uppercase text-slate-800">{application.status}</span>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
