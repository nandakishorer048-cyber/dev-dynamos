import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000),
    })
  ).min(1).max(50),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Input validation
    const rawBody = await req.json();
    const validation = chatSchema.safeParse(rawBody);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { messages } = validation.data;
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    console.log("Processing patient chat request with", messages.length, "messages");

    const systemPrompt = `You are Diagnyx AI, a compassionate and knowledgeable health assistant designed to help patients understand their health concerns. 

Your role is to:
- Listen empathetically to patients' health concerns and symptoms
- Provide general health information and education
- Help patients understand medical terminology in simple terms
- Suggest when they should consult a healthcare professional
- Offer emotional support and reassurance
- Help patients prepare questions for their doctor visits

Important guidelines:
- Always be warm, patient, and understanding
- Never provide specific medical diagnoses or treatment plans
- Always recommend consulting a healthcare professional for serious concerns
- Remind patients that you're an AI assistant, not a replacement for medical care
- Be culturally sensitive and respectful
- If discussing medications, remind them to consult their doctor or pharmacist
- Keep responses concise but helpful

Remember: You're here to support and educate, not to replace professional medical advice.`;

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const models = [
      "google/gemini-2.0-flash-lite-preview-02-05:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-3-27b-it:free",
      "openrouter/free"
    ];

    let response;
    let lastError = "";

    for (const model of models) {
      console.log(`Trying model: ${model}`);
      try {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://healthronix.com",
            "X-Title": "Healthronix App"
          },
          body: JSON.stringify({
            model: model,
            messages: openRouterMessages,
            stream: true
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

    if (!response || !response.ok) {
      return new Response(JSON.stringify({ error: "All AI models are currently busy. Please try again later." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Streaming response from AI gateway");
    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (error) {
    console.error("Patient chat error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
