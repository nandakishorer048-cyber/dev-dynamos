import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicineName, dosage, purpose } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Explaining medicine:', { medicineName, dosage });

    const systemPrompt = `You are a friendly, knowledgeable pharmacy assistant. Your job is to help patients understand their medications in simple, easy-to-understand language.

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

Return your response in this JSON format:
{
  "simpleName": "Common name or brand",
  "whatItDoes": "Simple 1-2 sentence explanation of purpose",
  "howItWorks": "Brief friendly explanation of mechanism",
  "commonSideEffects": ["List of common side effects"],
  "importantPrecautions": ["List of precautions"],
  "tips": ["Helpful tips for taking this medication"],
  "foodInteractions": ["Foods to avoid or take with"],
  "whenToCallDoctor": ["Warning signs to watch for"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
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
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add more credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    console.log('Medicine explanation completed successfully');

    return new Response(JSON.stringify({ explanation: JSON.parse(explanation) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error explaining medicine:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});