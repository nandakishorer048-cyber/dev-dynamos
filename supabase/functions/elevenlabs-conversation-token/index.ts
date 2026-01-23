import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { agentId, useDefault } = body;

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const defaultAgentId = Deno.env.get('ELEVENLABS_AGENT_ID');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Use provided agentId or fall back to default from env
    const finalAgentId = agentId || (useDefault ? defaultAgentId : null);

    if (!finalAgentId) {
      return new Response(
        JSON.stringify({ 
          error: 'Agent ID is required',
          hasDefaultAgent: !!defaultAgentId 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating ElevenLabs conversation token for agent:', finalAgentId.substring(0, 8) + '...');

    // Get signed URL for WebSocket connection (more compatible)
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${finalAgentId}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const { signed_url } = await response.json();

    console.log('Successfully generated signed URL');

    return new Response(JSON.stringify({ signed_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating conversation token:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
