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

    const { reportText, reportType, language, imageData, mimeType } = validation.data;
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured');

    const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
    const targetLanguage = languageNames[language] || 'English';
    const isImageAnalysis = !!imageData;

    console.log('Analyzing medical report:', { reportType, textLength: reportText?.length, language: targetLanguage, isImageAnalysis });

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

Return ONLY a valid JSON object (no markdown, no code fences) with all text values in ${targetLanguage}:
{
  "summary": "A 2-3 sentence friendly overview",
  "keyFindings": [{ "name": "Finding name", "value": "The value", "status": "normal", "explanation": "Simple explanation" }],
  "recommendations": ["List of suggestions"],
  "questionsForDoctor": ["Questions"]
}`;

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    let response;
    let lastError = "";
    
    // If it's an image analysis, route directly to Google's official Gemini API (which has a generous free tier for images)
    if (isImageAnalysis && imageData && GEMINI_API_KEY) {
      console.log('Routing image analysis directly to Gemini API');
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const imageMimeType = mimeType || 'image/jpeg';
      
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: { text: systemPrompt }
            },
            contents: [
              {
                role: "user", 
                parts: [
                  { text: `Please analyze this ${reportType || 'medical'} report document and extract all relevant information.` },
                  { 
                    inlineData: {
                      mimeType: imageMimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          lastError = await response.text();
          console.error("Gemini API error:", response.status, lastError);
        } else {
          console.log("Successfully connected to Gemini direct API");
        }
      } catch (err: any) {
        console.error("Gemini API fetch failed:", err);
        lastError = err.message;
      }
    } else {
      // Build OpenRouter content parts for TEXT ONLY
      const userContent = `${systemPrompt}\n\nPlease analyze this ${reportType || 'medical'} report:\n\n${reportText}`;
      
      const models = [
        "google/gemini-2.0-flash-lite-preview-02-05:free",
        "google/gemma-3-27b-it:free",
        "openrouter/free"
      ];

      for (const model of models) {
        console.log(`Trying model: ${model} for text analysis`);
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
              messages: [{ role: 'user', content: userContent }]
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
    }

    if (!response || !response.ok) {
      return new Response(JSON.stringify({ error: "All AI models are currently busy. Please try again later." }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    let content = "";
    
    // Extract content based on which API was successful
    if (data.choices && data.choices[0].message) {
      content = data.choices[0].message.content; // OpenRouter format
    } else if (data.candidates && data.candidates[0].content) {
      content = data.candidates[0].content.parts[0].text; // Gemini direct format
    }
    
    if (!content) throw new Error('No AI response content');

    let analysis;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = { summary: content, keyFindings: [], recommendations: ['Consult a healthcare professional'], questionsForDoctor: [] };
    }

    console.log('Analysis completed successfully');
    return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error analyzing report:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
