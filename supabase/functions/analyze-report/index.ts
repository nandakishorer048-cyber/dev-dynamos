import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const analyzeReportSchema = z.object({
  reportText: z.string().max(50000).optional(),
  reportType: z.string().max(50).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'hi', 'pt', 'ar', 'zh', 'ja', 'ko']).default('en'),
  imageData: z.string().max(10000000).optional(),
  fileName: z.string().max(255).optional(),
  mimeType: z.string().max(100).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Input validation
    const rawBody = await req.json();
    const validation = analyzeReportSchema.safeParse(rawBody);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { reportText, reportType, language, imageData, fileName, mimeType } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
    const targetLanguage = languageNames[language] || 'English';
    const isImageAnalysis = !!imageData;

    console.log('Analyzing medical report:', { reportType, textLength: reportText?.length, language: targetLanguage, isImageAnalysis, fileName: fileName || 'N/A' });

    const systemPrompt = `You are a friendly, compassionate medical report analyzer. Your job is to help patients understand their medical reports in simple, easy-to-understand language.

IMPORTANT: You MUST respond entirely in ${targetLanguage}. All text in your response must be in ${targetLanguage}.

When analyzing a medical report${isImageAnalysis ? ' (from an image or PDF scan)' : ''}:
1. Identify key findings and values
2. Explain what each finding means in plain language
3. Highlight any values that are outside normal ranges
4. Provide a brief, reassuring summary
5. Suggest questions the patient might want to ask their doctor

Important guidelines:
- Use warm, supportive language
- Avoid medical jargon - explain everything simply
- Don't diagnose or provide medical advice
- Encourage patients to discuss findings with their healthcare provider
- Be encouraging while being honest about concerning findings
- ALL TEXT MUST BE IN ${targetLanguage}
${isImageAnalysis ? '- Extract all text and values you can see from the image/document\n- If parts are unclear, mention that in your analysis' : ''}

Return your response in this JSON format (with all text values in ${targetLanguage}):
{
  "summary": "A 2-3 sentence friendly overview in ${targetLanguage}",
  "keyFindings": [{ "name": "Finding name", "value": "The value", "status": "normal" | "attention" | "concerning", "explanation": "Simple explanation" }],
  "recommendations": ["List of suggestions"],
  "questionsForDoctor": ["Questions"]
}`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    if (isImageAnalysis) {
      const userContent: any[] = [{ type: 'text', text: `Please analyze this ${reportType || 'medical'} report image/document and extract all relevant information:` }];
      if (imageData!.startsWith('data:')) {
        userContent.push({ type: 'image_url', image_url: { url: imageData } });
      }
      messages.push({ role: 'user', content: userContent });
    } else {
      messages.push({ role: 'user', content: `Please analyze this ${reportType || 'medical'} report:\n\n${reportText}` });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages, response_format: { type: "json_object" } }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'AI credits depleted. Please add more credits.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ analysis: JSON.parse(analysis) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error analyzing report:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
