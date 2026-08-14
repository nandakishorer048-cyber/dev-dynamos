// Client-side report analysis service fallback
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "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";
const KIMI_API_KEY = import.meta.env.VITE_KIMI_API_KEY || "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";

export interface AnalyzeReportOptions {
  reportText?: string;
  reportType?: string;
  language?: string;
  imageData?: string;
  fileName?: string;
  mimeType?: string;
}

export async function analyzeReportDirect(options: AnalyzeReportOptions) {
  const { reportText, reportType, language = 'en', imageData, mimeType } = options;
  const isImageAnalysis = !!imageData;

  const languageNames: Record<string, string> = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German',
    hi: 'Hindi', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese',
    ja: 'Japanese', ko: 'Korean'
  };
  const targetLanguage = languageNames[language] || 'English';

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
- The status ('normal', 'attention', or 'concerning')
- A detailed 2-4 sentence explanation of what this finding means for the patient's health

For the SUMMARY: Write 4-6 sentences covering the overall picture of the report, the most important findings, what conditions they may indicate, and the urgency level.

Return ONLY a valid JSON object with NO markdown, NO code fences:
{
  "summary": "Comprehensive overview in ${targetLanguage}",
  "keyFindings": [
    {
      "name": "Finding name",
      "value": "Value with units",
      "status": "normal|attention|concerning",
      "explanation": "Detailed explanation"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation"
  ],
  "questionsForDoctor": [
    "Specific question for doctor"
  ]
}`;

  let content = "";
  let lastError = "";

  if (isImageAnalysis && imageData) {
    const base64DataImg = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const imageMimeTypeImg = mimeType || 'image/jpeg';
    const imageDataUrl = `data:${imageMimeTypeImg};base64,${base64DataImg}`;

    // 1. OpenRouter Vision (openai/gpt-4o-mini)
    if (OPENROUTER_API_KEY && !content) {
      console.log('Direct fallback: Trying OpenRouter Vision (gpt-4o-mini)');
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
          const data = await res.json();
          content = data.choices?.[0]?.message?.content || "";
        } else {
          lastError = `OpenRouter Vision failed (${res.status}): ${await res.text()}`;
        }
      } catch (e: any) {
        lastError = `OpenRouter error: ${e.message}`;
      }
    }

    // 2. NVIDIA NIM Vision (meta/llama-3.2-11b-vision-instruct)
    if (KIMI_API_KEY && !content) {
      console.log('Direct fallback: Trying NVIDIA NIM Vision (llama-3.2-11b-vision-instruct)');
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
          const data = await res.json();
          content = data.choices?.[0]?.message?.content || "";
        } else {
          lastError = `NVIDIA Vision failed (${res.status}): ${await res.text()}`;
        }
      } catch (e: any) {
        lastError = `NVIDIA Vision error: ${e.message}`;
      }
    }
  } else {
    // Text Analysis
    const userContent = `Please analyze this ${reportType || 'medical'} report and return ONLY valid JSON as instructed:\n\n${reportText}`;

    // 1. NVIDIA NIM (meta/llama-3.1-70b-instruct)
    if (KIMI_API_KEY && !content) {
      console.log('Direct fallback: Trying NVIDIA NIM (meta/llama-3.1-70b-instruct)');
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
          })
        });

        if (res.ok) {
          const data = await res.json();
          content = data.choices?.[0]?.message?.content || "";
        } else {
          lastError = `NVIDIA NIM text failed (${res.status}): ${await res.text()}`;
        }
      } catch (e: any) {
        lastError = `NVIDIA NIM error: ${e.message}`;
      }
    }

    // 2. OpenRouter Text Models
    if (OPENROUTER_API_KEY && !content) {
      const models = ['openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct', 'qwen/qwen-2.5-72b-instruct'];
      for (const m of models) {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://healthronix.com',
              'X-Title': 'Healthronix App'
            },
            body: JSON.stringify({
              model: m,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
              ],
              ...(m === 'openai/gpt-4o-mini' ? { response_format: { type: 'json_object' } } : {})
            })
          });

          if (res.ok) {
            const data = await res.json();
            content = data.choices?.[0]?.message?.content || "";
            if (content) break;
          } else {
            lastError = `OpenRouter ${m} failed (${res.status}): ${await res.text()}`;
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }
    }
  }

  if (!content) {
    throw new Error(`AI analysis failed. Details: ${lastError}`);
  }

  let cleaned = content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  const analysis = JSON.parse(cleaned);
  if (typeof analysis.summary !== 'string') {
    analysis.summary = "The report analysis was generated successfully.";
  }
  analysis.keyFindings = Array.isArray(analysis.keyFindings) ? analysis.keyFindings : [];
  analysis.recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  analysis.questionsForDoctor = Array.isArray(analysis.questionsForDoctor) ? analysis.questionsForDoctor : [];

  return analysis;
}
