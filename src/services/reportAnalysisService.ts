// Client-side report analysis fallback service.
// IMPORTANT: This service intentionally contains NO API keys.
// All AI analysis is performed server-side via the Supabase Edge Function (analyze-report).
// API keys (OPENROUTER_API_KEY, KIMI_API_KEY, GEMINI_API_KEY) are stored exclusively as
// Supabase Edge Function environment secrets and are never exposed to the browser.

export interface AnalyzeReportOptions {
  reportText?: string;
  reportType?: string;
  language?: string;
  imageData?: string;
  fileName?: string;
  mimeType?: string;
}

/**
 * Browser-side fallback for report analysis.
 *
 * This function is intentionally a safe stub that throws a clear error.
 * It exists to satisfy the call-site in Reports.tsx when the Supabase Edge Function
 * is unreachable. No API calls are made from the browser to avoid exposing secrets.
 *
 * If you see this error, check:
 *   1. That the Supabase Edge Function "analyze-report" is deployed.
 *   2. That OPENROUTER_API_KEY (or KIMI_API_KEY / GEMINI_API_KEY) is set in the
 *      Edge Function environment secrets via the Supabase dashboard.
 *   3. That your Supabase project URL and anon key are correctly set in .env.
 */
export async function analyzeReportDirect(_options: AnalyzeReportOptions): Promise<never> {
  console.warn(
    '[reportAnalysisService] Edge Function unavailable. Browser-side fallback is disabled for security. ' +
    'Ensure the Supabase Edge Function "analyze-report" is deployed and API keys are configured as secrets.'
  );
  throw new Error(
    'Analysis service unavailable. Please check your internet connection and try again. ' +
    'If the problem persists, ensure the analysis service is properly configured.'
  );
}
