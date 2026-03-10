import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const explainMedicineSchema = z.object({
  medicineName: z.string().min(1).max(200),
  dosage: z.string().max(100).optional(),
  purpose: z.string().max(500).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'hi', 'pt', 'ar', 'zh', 'ja', 'ko']).default('en'),
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
    const validation = explainMedicineSchema.safeParse(rawBody);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { medicineName, dosage, purpose, language } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
    const targetLanguage = languageNames[language] || 'English';

    console.log('Explaining medicine:', { medicineName, dosage, language: targetLanguage });

    const systemPrompt = `You are a friendly, knowledgeable pharmacy assistant. Your job is to help patients understand their medications in simple, easy-to-understand language.

IMPORTANT: You MUST respond entirely in ${targetLanguage}. All text in your response must be in ${targetLanguage}.

When explaining a medication:
1. Explain what the medicine does in simple terms
2. Describe common side effects to watch for
3. List important precautions and interactions
4. Provide helpful tips for taking the medication
5. Note any foods or activities to avoid

Important guidelines:
- Use warm, supportive language
- Avoid complex medical terms - explain everything simply
- Don't replace professional medical advice
- Encourage patients to consult their pharmacist or doctor for specific concerns
- Be encouraging and helpful
- ALL TEXT MUST BE IN ${targetLanguage}

Return your response in this JSON format (with all text values in ${targetLanguage}):
{
  "simpleName": "Common name or brand in ${targetLanguage}",
  "whatItDoes": "Simple 1-2 sentence explanation in ${targetLanguage}",
  "howItWorks": "Brief friendly explanation in ${targetLanguage}",
  "commonSideEffects": ["Side effects in ${targetLanguage}"],
  "importantPrecautions": ["Precautions in ${targetLanguage}"],
  "tips": ["Helpful tips in ${targetLanguage}"],
  "foodInteractions": ["Food info in ${targetLanguage}"],
  "whenToCallDoctor": ["Warning signs in ${targetLanguage}"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please explain this medication:\n\nMedicine: ${medicineName}\nDosage: ${dosage || 'Not specified'}\nPrescribed for: ${purpose || 'General use'}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'AI credits depleted. Please add more credits.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;
    console.log('Medicine explanation completed successfully');

    return new Response(JSON.stringify({ explanation: JSON.parse(explanation) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error explaining medicine:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
