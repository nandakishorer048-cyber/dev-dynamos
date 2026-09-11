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

    // ── Route determination ──────────────────────────────────────────────────
    // PDFs must NEVER be sent to vision models as image_url.
    // If mimeType is application/pdf, force text path regardless of imageData.
    // After the frontend fix, PDFs will always arrive as reportText (extracted),
    // but we add this guard defensively in case of legacy or direct API calls.
    const isPdfFile = mimeType === 'application/pdf';
    const isImageAnalysis = !!imageData && !isPdfFile;

    console.log('Analyzing medical report:', {
      reportType,
      mimeType: mimeType || 'not provided',
      textLength: reportText?.length ?? 0,
      language: targetLanguage,
      analysisPath: isImageAnalysis ? 'vision' : 'text',
      isPdfFile,
    });

    // Guard: if a PDF arrives with imageData instead of reportText (old client bug),
    // reject it clearly so the user gets a useful message.
    if (isPdfFile && imageData && !reportText) {
      return new Response(
        JSON.stringify({
          error: 'PDF files cannot be processed as images. Please extract text from the PDF and send it as reportText. ' +
                 'If the PDF contains scanned images, please upload an image file (JPEG/PNG) instead.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    if (isImageAnalysis && imageData) {
      // ── VISION PATH: images only (JPEG, PNG, WebP, GIF) ─────────────────────
      const base64DataImg = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const imageMimeTypeImg = mimeType || 'image/jpeg';
      const imageDataUrl = `data:${imageMimeTypeImg};base64,${base64DataImg}`;

      console.log('Vision path: processing image file, mimeType:', imageMimeTypeImg);

      // ── 0. Google Gemini Vision (Primary if GEMINI_API_KEY is set) ───────
      if (GEMINI_API_KEY && !response) {
        const geminiModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
        for (const gModel of geminiModels) {
          console.log(`Trying Gemini vision model: ${gModel}`);
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: `${systemPrompt}\n\nCarefully examine this ${reportType || 'medical'} report image. Read every number, value, and label visible. Then return ONLY valid JSON as instructed.` },
                    {
                      inline_data: {
                        mime_type: imageMimeTypeImg,
                        data: base64DataImg,
                      }
                    }
                  ]
                }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                }
              })
            });

            if (res.ok) {
              console.log(`Gemini vision model ${gModel} succeeded`);
              response = res;
              break;
            } else {
              const errText = await res.text();
              lastError = `Gemini vision (${gModel}) failed (${res.status}): ${errText}`;
              console.error(lastError);
            }
          } catch (err: unknown) {
            lastError = `Gemini vision (${gModel}) network error: ${err instanceof Error ? err.message : String(err)}`;
            console.error(lastError);
          }
        }
      }

      // ── 1. OpenRouter GPT-4o-mini (Vision) ─────────────────
      if (OPENROUTER_API_KEY && (!response || !response.ok)) {
        console.log('Trying openai/gpt-4o-mini for image analysis via OpenRouter');
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://healthronix.com',
              'X-Title': 'Healthronix App',
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o-mini',
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
              response_format: { type: 'json_object' }
            }),
          });

          if (res.ok) {
            console.log('OpenRouter GPT-4o-mini image analysis succeeded');
            response = res;
          } else {
            lastError = `OpenRouter GPT-4o-mini image failed (${res.status}): ${await res.text()}`;
            console.error(lastError);
          }
        } catch (err: unknown) {
          lastError = `OpenRouter GPT-4o-mini image error: ${err instanceof Error ? err.message : String(err)}`;
          console.error(lastError);
        }
      }

      // ── 2. NVIDIA NIM Llama 3.2 11B Vision ─────────────────
      if (KIMI_API_KEY && (!response || !response.ok)) {
        console.log('Trying meta/llama-3.2-11b-vision-instruct for image analysis via NVIDIA NIM');
        try {
          const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${KIMI_API_KEY}`,
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              model: 'meta/llama-3.2-11b-vision-instruct',
              messages: [
                { role: 'system', content: systemPrompt },
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: `Carefully examine this ${reportType || 'medical'} report image. Read every number, value, and label visible. Then return ONLY valid JSON as instructed.` },
                    { type: 'image_url', image_url: { url: imageDataUrl } }
                  ]
                }
              ],
              max_tokens: 4096,
              temperature: 0.2
            })
          });

          if (res.ok) {
            console.log('NVIDIA NIM Llama 3.2 11B Vision image analysis succeeded');
            response = res;
          } else {
            lastError = `NVIDIA NIM Llama 3.2 11B Vision failed (${res.status}): ${await res.text()}`;
            console.error(lastError);
          }
        } catch (err: unknown) {
          lastError = `NVIDIA NIM Vision error: ${err instanceof Error ? err.message : String(err)}`;
          console.error(lastError);
        }
      }

      // ── 3. OpenRouter Gemma 3 27B / Llama 3.3 (Vision fallback) ─────────────────
      if (OPENROUTER_API_KEY && (!response || !response.ok)) {
        console.log('Trying google/gemma-3-27b-it for image analysis via OpenRouter');
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://healthronix.com',
              'X-Title': 'Healthronix App',
            },
            body: JSON.stringify({
              model: 'google/gemma-3-27b-it',
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

          if (res.ok) {
            console.log('OpenRouter Gemma 3 27B image analysis succeeded');
            response = res;
          } else {
            lastError = `OpenRouter Gemma 3 27B image failed (${res.status}): ${await res.text()}`;
            console.error(lastError);
          }
        } catch (err: unknown) {
          lastError = `OpenRouter Gemma 3 27B image error: ${err instanceof Error ? err.message : String(err)}`;
          console.error(lastError);
        }
      }

    } else {
      // ── TEXT PATH: plain text input OR PDF-extracted text ───────────────────
      const userContent = `Please analyze this ${reportType || 'medical'} report and return ONLY valid JSON as instructed:\n\n${reportText}`;

      console.log('Text path: processing text content, length:', reportText?.length ?? 0);

      // 0. Try Google Gemini (Primary if GEMINI_API_KEY is set)
      if (GEMINI_API_KEY && !response) {
        const geminiModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
        for (const gModel of geminiModels) {
          console.log(`Trying Gemini text model: ${gModel}`);
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: `${systemPrompt}\n\nPlease analyze this ${reportType || 'medical'} report and return ONLY valid JSON as instructed:\n\n${reportText}` }
                  ]
                }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                }
              })
            });

            if (res.ok) {
              console.log(`Gemini text model ${gModel} succeeded`);
              response = res;
              break;
            } else {
              const errText = await res.text();
              lastError = `Gemini text (${gModel}) failed (${res.status}): ${errText}`;
              console.error(lastError);
            }
          } catch (err: unknown) {
            lastError = `Gemini text (${gModel}) network error: ${err instanceof Error ? err.message : String(err)}`;
            console.error(lastError);
          }
        }
      }

      // 1. Try NVIDIA NIM Llama 3.1 70B (Fast & Accurate)
      if (KIMI_API_KEY && (!response || !response.ok)) {
        console.log('Trying meta/llama-3.1-70b-instruct via NVIDIA NIM for text analysis');
        try {
          const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${KIMI_API_KEY}`,
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              model: 'meta/llama-3.1-70b-instruct',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
              ],
              temperature: 0.2,
              max_tokens: 8192,
            }),
          });

          if (res.ok) {
            console.log('NVIDIA NIM Llama 3.1 70B text analysis succeeded');
            response = res;
          } else {
            lastError = `NVIDIA NIM text analysis failed (${res.status}): ${await res.text()}`;
            console.error(lastError);
          }
        } catch (err: unknown) {
          lastError = `NVIDIA NIM network error: ${err instanceof Error ? err.message : String(err)}`;
          console.error(lastError);
        }
      }

      // 2. OpenRouter Text Models (gpt-4o-mini -> llama-3.3-70b-instruct -> qwen-2.5-72b-instruct)
      if (OPENROUTER_API_KEY && (!response || !response.ok)) {
        const models = [
          "openai/gpt-4o-mini",
          "meta-llama/llama-3.3-70b-instruct",
          "qwen/qwen-2.5-72b-instruct",
        ];

        for (const model of models) {
          console.log(`Trying OpenRouter model: ${model} for text analysis`);
          try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://healthronix.com",
                "X-Title": "Healthronix App"
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userContent }
                ],
                ...(model === 'openai/gpt-4o-mini' ? { response_format: { type: 'json_object' } } : {})
              }),
            });

            if (res.ok) {
              console.log(`OpenRouter model ${model} succeeded`);
              response = res;
              break;
            } else {
              lastError = await res.text();
              console.error(`Error with ${model}:`, res.status, lastError);
            }
          } catch (err: unknown) {
            console.error(`Fetch failed for ${model}:`, err);
            lastError = err instanceof Error ? err.message : String(err);
          }
        }
      }
    }

    if (!response || !response.ok) {
      console.error('All AI models failed:', lastError);
      return new Response(
        JSON.stringify({ error: `AI analysis failed. Details: ${lastError}` }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let content = "";

    // Extract content based on which API was successful
    if (data.choices && data.choices[0]?.message) {
      content = data.choices[0].message.content; // OpenRouter & NVIDIA NIM format
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
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.slice(start, end + 1);
      }

      analysis = JSON.parse(cleaned);

      // 3. Validate expected shape; patch missing fields
      if (typeof analysis.summary !== 'string') {
        analysis.summary = "The report analysis was generated successfully.";
      }
      analysis.keyFindings = Array.isArray(analysis.keyFindings) ? analysis.keyFindings : [];
      analysis.recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
      analysis.questionsForDoctor = Array.isArray(analysis.questionsForDoctor) ? analysis.questionsForDoctor : [];
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('JSON parse failed, wrapping raw content:', msg);
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
