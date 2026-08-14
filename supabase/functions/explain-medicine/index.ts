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
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured');

    const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
    const targetLanguage = languageNames[language] || 'English';

    console.log('Explaining medicine:', { medicineName, dosage, language: targetLanguage });

    const prompt = `You are a friendly, knowledgeable pharmacy assistant. Your job is to help patients understand their medications in simple, easy-to-understand language.

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

Return ONLY a valid JSON object (no markdown, no code fences) with all text values in ${targetLanguage}:
{
  "simpleName": "Common name or brand",
  "whatItDoes": "Simple 1-2 sentence explanation",
  "howItWorks": "Brief friendly explanation",
  "commonSideEffects": ["Side effects"],
  "importantPrecautions": ["Precautions"],
  "tips": ["Helpful tips"],
  "foodInteractions": ["Food info"],
  "whenToCallDoctor": ["Warning signs"]
}

Medicine: ${medicineName}
Dosage: ${dosage || 'Not specified'}
Prescribed for: ${purpose || 'General use'}`;

    const models = [
      "openai/gpt-4o-mini",
      "meta-llama/llama-3.3-70b-instruct",
      "qwen/qwen-2.5-72b-instruct",
      "openrouter/auto"
    ];

    let response;
    let lastError = "";

    for (const model of models) {
      console.log(`Trying model: ${model}`);
      try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://healthronix.com",
            "X-Title": "Healthronix App"
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }]
          }),
        });

        if (response.ok) {
          console.log(`Successfully connected to ${model}`);
          break; // Success! Exit the loop
        } else {
          lastError = await response.text();
          console.error(`Error with ${model}:`, response.status, lastError);
        }
      } catch (err: any) {
        console.error(`Fetch failed for ${model}:`, err);
        lastError = err.message;
      }
    }

    const KIMI_API_KEY = Deno.env.get("KIMI_API_KEY");
    if ((!response || !response.ok) && KIMI_API_KEY) {
      console.log('OpenRouter failed. Trying NVIDIA NIM Fallback (Llama 3.1 70B)');
      try {
        response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${KIMI_API_KEY}`,
            "Accept": "application/json"
          },
          body: JSON.stringify({
            model: "meta/llama-3.1-70b-instruct",
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 2048
          }),
        });
        if (response.ok) {
          console.log('Successfully connected to NVIDIA NIM');
        } else {
          lastError = await response.text();
          console.error('Error with NVIDIA NIM:', response.status, lastError);
        }
      } catch (err: any) {
        console.error('Fetch failed for NVIDIA NIM:', err);
        lastError = err.message;
      }
    }

    if (!response || !response.ok) {
      return new Response(JSON.stringify({ error: "All AI models are currently busy. Please try again later." }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No AI response content');

    let explanation;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      explanation = JSON.parse(cleaned);
    } catch {
      explanation = { simpleName: medicineName, whatItDoes: content, howItWorks: '', commonSideEffects: [], importantPrecautions: [], tips: ['Consult your pharmacist for more details'], foodInteractions: [], whenToCallDoctor: [] };
    }

    console.log('Medicine explanation completed successfully');
    return new Response(JSON.stringify({ explanation }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error explaining medicine:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
