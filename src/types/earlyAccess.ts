export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface EarlyAccessApplication {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  country?: string;
  state?: string;
  city?: string;
  user_role: string;
  application_reason: string;
  additional_notes?: string;
  referral_source?: string;
  status: ApplicationStatus;
  email_verified: boolean;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  userRole: string;
  applicationReason: string;
  additionalNotes: string;
  referralSource: string;
  fullName: string;
  country: string;
  state: string;
  city: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}
