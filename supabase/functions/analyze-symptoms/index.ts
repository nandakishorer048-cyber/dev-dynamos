import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const inputSchema = z.object({
  symptoms: z.string().min(3).max(2000),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.string().max(20).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claimsData.claims.sub as string;

    const rawBody = await req.json();
    const validation = inputSchema.safeParse(rawBody);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { symptoms, age, gender } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a medical guidance AI assistant. Analyze user symptoms and provide structured guidance.

IMPORTANT RULES:
- NEVER diagnose. Only suggest possible conditions for awareness.
- Always recommend professional medical consultation.
- Be empathetic and clear.

Respond ONLY with a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "possible_conditions": [
    { "name": "Condition Name", "likelihood": "high|medium|low", "description": "Brief description" }
  ],
  "recommended_tests": [
    { "name": "Test Name", "reason": "Why this test helps", "urgency": "routine|soon|urgent" }
  ],
  "recommended_medicines": [
    { "name": "Medicine Name", "type": "otc|prescription", "purpose": "What it helps with", "note": "Dosage or caution note" }
  ],
  "next_steps": ["Step 1", "Step 2"],
  "urgency_level": "low|moderate|high|emergency",
  "summary": "A brief, empathetic summary of the analysis"
}`;

    const userPrompt = `Patient symptoms: ${symptoms}${age ? `\nAge: ${age}` : ''}${gender ? `\nGender: ${gender}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response content");

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { summary: content, possible_conditions: [], recommended_tests: [], recommended_medicines: [], next_steps: ["Consult a healthcare professional"], urgency_level: "moderate" };
    }

    // Save analysis
    await supabaseClient.from('symptom_analyses').insert({
      user_id: userId,
      symptoms,
      ai_response: parsed,
      recommended_tests: parsed.recommended_tests?.map((t: any) => t.name) || [],
      recommended_medicines: parsed.recommended_medicines?.map((m: any) => m.name) || [],
    });

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Symptom analysis error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze symptoms" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
