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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY');

    console.log('API keys present:', { hasOpenRouter: !!OPENROUTER_API_KEY, hasGemini: !!GEMINI_API_KEY, hasKimi: !!KIMI_API_KEY });

    if (!OPENROUTER_API_KEY && !GEMINI_API_KEY && !KIMI_API_KEY) {
      throw new Error('No AI API keys configured');
    }

    const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
    const targetLanguage = languageNames[language] || 'English';
    const isImageAnalysis = !!imageData;

    console.log('Analyzing medical report:', { reportType, textLength: reportText?.length, language: targetLanguage, isImageAnalysis });

    const systemPrompt = `You are an expert medical report analyst with deep clinical knowledge across all medical specialties including radiology, pathology, cardiology, hematology, endocrinology, and more. Your role is to provide thorough, accurate, and highly descriptive analysis of medical reports for patients.

CRITICAL LANGUAGE REQUIREMENT: You MUST respond entirely in ${targetLanguage}. Every word in your JSON response must be in ${targetLanguage}.

${isImageAnalysis ? 'You are analyzing a SCANNED medical document/image. Read and extract ALL visible text, numbers, values, units, and labels from the image before analyzing.' : ''}

YOUR ANALYSIS MUST BE:
- **Comprehensive**: Cover every finding, value, and measurement mentioned in the report
- **Descriptive**: Give detailed explanations — what it is, what it means, why it matters  
- **Clinically accurate**: Reference normal reference ranges, explain deviations quantitatively
- **Educational**: Help the patient understand the medical terminology in plain language
- **Honest**: Clearly flag concerning findings while being compassionate

For EACH key finding you MUST include:
- The exact name of the finding/test
- The exact value reported (with units)
- The normal reference range for that value
- Whether it is normal, borderline, or concerning — and by how much
- A detailed 2-4 sentence explanation of what this finding means for the patient's health
- Any clinical significance or implications

For the SUMMARY: Write 4-6 sentences covering the overall picture of the report, the most important findings, what conditions they may indicate, and the urgency level.

For RECOMMENDATIONS: Be specific and actionable (e.g., "Follow up with a cardiologist within 2 weeks" not just "see a doctor"). Include lifestyle, dietary, and medical follow-up recommendations.

For QUESTIONS FOR DOCTOR: Generate 5-8 intelligent, specific questions based on the actual findings.

IMPORTANT RULES:
- Do NOT skip or abbreviate any finding
- Do NOT diagnose — say "may indicate" or "is consistent with"
- Do NOT use vague language like "slightly elevated" — say exactly by how much
- Cover ALL findings from the report, not just the abnormal ones
- ALL TEXT MUST BE IN ${targetLanguage}

Return ONLY a valid JSON object with NO markdown, NO code fences, NO text before or after. All values must be in ${targetLanguage}:
{
  "summary": "Comprehensive 4-6 sentence overview covering all major findings, their clinical significance, overall health picture, and recommended urgency of follow-up",
  "keyFindings": [
    {
      "name": "Exact test/finding name",
      "value": "Exact value with units",
      "status": "normal|attention|concerning",
      "explanation": "Detailed 2-4 sentence explanation: what this is, the normal range, what this value means, and why it matters for patient health"
    }
  ],
  "recommendations": [
    "Specific, actionable recommendation with timeframe if applicable"
  ],
  "questionsForDoctor": [
    "Specific, intelligent question based on actual findings"
  ]
}`;

    let response: Response | undefined;
    let lastError = "";
    let geminiError = "";

    // --- IMAGE ANALYSIS ---
    // Primary: google/gemma-3-27b-it:free via OpenRouter (multimodal vision)
    // Fallback: Gemini OCR → Kimi K2.5 analysis (2-step pipeline)

    if (isImageAnalysis && imageData) {
      const base64DataImg = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const imageMimeTypeImg = mimeType || 'image/jpeg';
      const imageDataUrl = `data:${imageMimeTypeImg};base64,${base64DataImg}`;

      // ── Primary: Gemma 3 27B (multimodal) via OpenRouter ─────────────────
      if (OPENROUTER_API_KEY) {
        console.log('Trying google/gemma-3-27b-it:free for image analysis via OpenRouter');
        try {
          const imgRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://healthronix.com',
              'X-Title': 'Healthronix App',
            },
            body: JSON.stringify({
              model: 'google/gemma-3-27b-it:free',
              messages: [{
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `${systemPrompt}\n\nCarefully examine this ${reportType || 'medical'} report image. Read every number, value, and label visible. Then return ONLY valid JSON as instructed.`
                  },
                  { type: 'image_url', image_url: { url: imageDataUrl } }
                ]
              }],
            }),
          });

          if (imgRes.ok) {
            console.log('Gemma 3 27B image analysis succeeded');
            response = imgRes;
          } else {
            lastError = `Gemma 3 27B image failed (${imgRes.status}): ${await imgRes.text()}`;
            console.error(lastError);
          }
        } catch (err: any) {
          lastError = `Gemma 3 27B image error: ${err.message}`;
          console.error(lastError);
        }
      }

      // ── Fallback: 2-step OCR (Gemini/Phi) → Kimi K2.5 analysis ──────────
      if (!response && (GEMINI_API_KEY || KIMI_API_KEY)) {
        console.log('Nemotron failed, falling back to OCR + Kimi pipeline');
        const ocrPrompt = `You are an OCR engine. Extract ALL text from this medical document image verbatim. Include every number, unit, label, value, date, and word you can see. Output raw text only.`;
        let extractedText = '';

        // OCR via Gemini
        if (GEMINI_API_KEY && !extractedText) {
          for (const model of ['gemini-1.5-flash', 'gemini-2.0-flash']) {
            try {
              const gr = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: ocrPrompt }, { inlineData: { mimeType: imageMimeTypeImg, data: base64DataImg } }] }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
                  })
                }
              );
              if (gr.ok) {
                const gd = await gr.json();
                extractedText = gd.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (extractedText) { console.log('Gemini OCR succeeded'); break; }
              } else {
                lastError = `Gemini OCR ${model}: ${await gr.text()}`;
              }
            } catch (e: any) { lastError = e.message; }
          }
        }

        // OCR via NVIDIA NIM Phi-Vision
        if (KIMI_API_KEY && !extractedText) {
          for (const m of ['microsoft/phi-3.5-vision-instruct', 'microsoft/phi-3-vision-128k-instruct']) {
            try {
              const nr = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KIMI_API_KEY}`, 'Accept': 'application/json' },
                body: JSON.stringify({ model: m, messages: [{ role: 'user', content: [{ type: 'text', text: ocrPrompt }, { type: 'image_url', image_url: { url: imageDataUrl } }] }], max_tokens: 4096, temperature: 0.1, stream: false })
              });
              if (nr.ok) {
                extractedText = (await nr.json()).choices?.[0]?.message?.content || '';
                if (extractedText) { console.log(`NVIDIA NIM OCR ${m} succeeded`); break; }
              } else { lastError = `NIM OCR ${m}: ${await nr.text()}`; }
            } catch (e: any) { lastError = e.message; }
          }
        }

        if (!extractedText) throw new Error(`All image extraction methods failed. Last: ${lastError}`);

        // Kimi K2.5 analysis on extracted text
        if (!KIMI_API_KEY) throw new Error('KIMI_API_KEY required for analysis fallback');
        console.log(`OCR done (${extractedText.length} chars). Running Kimi K2.5 analysis...`);
        response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KIMI_API_KEY}`, 'Accept': 'application/json' },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2.5',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Analyze this ${reportType || 'medical'} report (extracted from image) and return ONLY valid JSON:\n\n${extractedText}` }
            ],
            max_tokens: 16384, temperature: 0.3, top_p: 1.0, stream: false,
            chat_template_kwargs: { thinking: true }
          })
        });
        if (!response.ok) throw new Error(`Kimi K2.5 fallback failed (${response.status}): ${await response.text()}`);
        console.log('Kimi K2.5 fallback analysis succeeded');
      }

    } else {
      // --- TEXT ANALYSIS: Kimi K2.5 (primary) → OpenRouter (fallback) ---
      const userContent = `${systemPrompt}\n\nPlease analyze this ${reportType || 'medical'} report:\n\n${reportText}`;

      // 1. Try Kimi K2.5 via NVIDIA NIM
      if (KIMI_API_KEY) {
        console.log('Trying Kimi K2.5 via NVIDIA NIM for text analysis');
        try {
          response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${KIMI_API_KEY}`,
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              model: 'moonshotai/kimi-k2.5',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Please analyze this ${reportType || 'medical'} report and return ONLY valid JSON as instructed:\n\n${reportText}` }
              ],
              max_tokens: 16384,
              temperature: 0.3,
              top_p: 1.0,
              stream: false,
              chat_template_kwargs: { thinking: true },
            }),
          });
          if (response.ok) {
            console.log('Kimi K2.5 succeeded');
          } else {
            lastError = `Kimi K2.5 failed (${response.status}): ${await response.text()}`;
            console.error(lastError);
            response = undefined;
          }
        } catch (err: any) {
          lastError = `Kimi K2.5 network error: ${err.message}`;
          console.error(lastError);
          response = undefined;
        }
      }

      // 2. Fallback: OpenRouter free models
      if ((!response || !response.ok) && OPENROUTER_API_KEY) {
        const models = [
          "google/gemma-3-27b-it:free",
          "meta-llama/llama-3.1-8b-instruct:free",
        ];

        for (const model of models) {
          console.log(`Fallback: Trying OpenRouter model: ${model} for text analysis`);
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
              console.log(`OpenRouter model ${model} succeeded`);
              break;
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

      if (!KIMI_API_KEY && !OPENROUTER_API_KEY) {
        throw new Error('No text analysis API keys configured');
      }
    }

    if (!response || !response.ok) {
      const errorDetails = geminiError
        ? `Gemini image analysis failed: ${geminiError}. Fallback also failed: ${lastError}`
        : lastError;
      console.error('All AI models failed:', errorDetails);
      return new Response(
        JSON.stringify({ error: `AI analysis failed. Details: ${errorDetails}` }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let content = "";

    // Extract content based on which API was successful
    if (data.choices && data.choices[0]?.message) {
      content = data.choices[0].message.content; // OpenRouter format
    } else if (data.candidates && data.candidates[0]?.content) {
      content = data.candidates[0].content.parts[0].text; // Gemini direct format
    }

    console.log('Raw AI response content length:', content?.length);

    if (!content) {
      console.error('Empty AI response. Full data:', JSON.stringify(data));
      throw new Error('No AI response content');
    }


    let analysis;
    try {
      // 1. Strip thinking / reasoning blocks (various formats)
      let cleaned = content
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // 2. Find the outermost JSON object via brace matching
      const start = cleaned.indexOf('{');
      if (start !== -1) {
        let depth = 0;
        let end = -1;
        for (let i = start; i < cleaned.length; i++) {
          if (cleaned[i] === '{') depth++;
          else if (cleaned[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end !== -1) cleaned = cleaned.slice(start, end + 1);
      }

      analysis = JSON.parse(cleaned);

      // 3. Validate expected shape; patch missing fields
      if (typeof analysis.summary !== 'string') throw new Error('Missing summary field');
      analysis.keyFindings = Array.isArray(analysis.keyFindings) ? analysis.keyFindings : [];
      analysis.recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
      analysis.questionsForDoctor = Array.isArray(analysis.questionsForDoctor) ? analysis.questionsForDoctor : [];
    } catch (e: any) {
      console.warn('JSON parse failed, wrapping raw content:', e.message);
      // Provide a readable fallback — strip any JSON bleed-through from summary
      const summaryText = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```[\s\S]*?```/g, '').trim().slice(0, 800);
      analysis = { summary: summaryText, keyFindings: [], recommendations: ['Please consult a healthcare professional.'], questionsForDoctor: [] };
    }

    console.log('Analysis completed successfully');
    return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error analyzing report:', msg);
    return new Response(JSON.stringify({ error: `An error occurred: ${msg}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
