// Report analysis service using Google Gemini API for medical report interpretation.

export interface AnalyzeReportOptions {
  reportText?: string;
  reportType?: string;
  language?: string;
  imageData?: string;
  fileName?: string;
  mimeType?: string;
}

export interface KeyFinding {
  name: string;
  value: string;
  status: 'normal' | 'attention' | 'concerning';
  explanation: string;
}

export interface AIAnalysis {
  summary: string;
  keyFindings: KeyFinding[];
  recommendations: string[];
  questionsForDoctor: string[];
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  hi: 'Hindi',
  pt: 'Portuguese',
  ar: 'Arabic',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
};

/**
 * Direct Gemini analysis for medical reports (works both standalone and as fallback).
 */
export async function analyzeReportDirect(options: AnalyzeReportOptions): Promise<AIAnalysis> {
  const { reportText, reportType, language = 'en', imageData, mimeType } = options;

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Please configure VITE_GEMINI_API_KEY in your .env file.');
  }

  const isPdfFile = mimeType === 'application/pdf';
  const isImageAnalysis = !!imageData && !isPdfFile;
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

Return ONLY a valid JSON object with NO markdown, NO code fences, NO text before or after:
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

  let contents: any[] = [];

  if (isImageAnalysis && imageData) {
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const cleanMimeType = mimeType || 'image/jpeg';
    contents = [
      {
        parts: [
          {
            text: `${systemPrompt}\n\nCarefully examine this ${reportType || 'medical'} report image. Read every number, value, and label visible. Then return ONLY valid JSON as instructed.`,
          },
          {
            inline_data: {
              mime_type: cleanMimeType,
              data: base64Data,
            },
          },
        ],
      },
    ];
  } else {
    contents = [
      {
        parts: [
          {
            text: `${systemPrompt}\n\nPlease analyze this ${reportType || 'medical'} report and return ONLY valid JSON as instructed:\n\n${reportText || 'No report text provided.'}`,
          },
        ],
      },
    ];
  }

  let lastError = '';

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[reportAnalysisService] Requesting analysis with Gemini model: ${model}`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        lastError = `Gemini model ${model} returned status ${res.status}: ${errorText}`;
        console.warn(lastError);
        continue;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = `Gemini model ${model} returned empty response`;
        continue;
      }

      let cleaned = rawText
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

      const parsed = JSON.parse(cleaned);

      const result: AIAnalysis = {
        summary: typeof parsed.summary === 'string' ? parsed.summary : 'The report analysis was generated successfully.',
        keyFindings: Array.isArray(parsed.keyFindings)
          ? parsed.keyFindings.map((f: any) => ({
              name: String(f.name || 'Finding'),
              value: String(f.value || ''),
              status: ['normal', 'attention', 'concerning'].includes(f.status) ? f.status : 'normal',
              explanation: String(f.explanation || ''),
            }))
          : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
        questionsForDoctor: Array.isArray(parsed.questionsForDoctor) ? parsed.questionsForDoctor.map(String) : [],
      };

      console.log('[reportAnalysisService] Analysis completed successfully via Gemini model', model);
      return result;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`[reportAnalysisService] Error with ${model}:`, lastError);
    }
  }

  throw new Error(`Report analysis failed: ${lastError || 'All models failed to respond'}`);
}
