import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const tokenSchema = z.object({
  agentId: z.string().max(100).optional(),
  useDefault: z.boolean().optional(),
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
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Input validation
    const body = await req.json().catch(() => ({}));
    const validation = tokenSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.errors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { agentId, useDefault } = validation.data;
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const defaultAgentId = Deno.env.get('ELEVENLABS_AGENT_ID');

    if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is not configured');

    const finalAgentId = agentId || (useDefault ? defaultAgentId : null);
    if (!finalAgentId) {
      return new Response(JSON.stringify({ error: 'Agent ID is required', hasDefaultAgent: !!defaultAgentId }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('Generating ElevenLabs conversation token for agent:', finalAgentId.substring(0, 8) + '...');

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(finalAgentId)}`, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `ElevenLabs API error: ${response.status}` }), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { signed_url } = await response.json();
    console.log('Successfully generated signed URL');

    return new Response(JSON.stringify({ signed_url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error generating conversation token:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
