import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AIAnalysis } from '@/pages/HealthcareFlow';

const SYMPTOM_SUGGESTIONS = [
  'Headache and fatigue',
  'Fever with body aches',
  'Stomach pain and nausea',
  'Persistent cough',
  'Chest discomfort',
  'Joint pain and stiffness',
];

interface SymptomEntryProps {
  onAnalysis: (result: AIAnalysis, symptoms: string) => void;
}

export function SymptomEntry({ onAnalysis }: SymptomEntryProps) {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) { toast.error('Please describe your symptoms'); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Please log in'); return; }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ symptoms: symptoms.trim(), ...(age && { age: parseInt(age) }), ...(gender && { gender }) }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Analysis failed');
      }

      const result = await resp.json();
      onAnalysis(result, symptoms.trim());
    } catch (e: any) {
      toast.error(e.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="icon-container"><Stethoscope className="h-5 w-5 text-primary" /></div>
            Describe Your Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Textarea
            placeholder="Describe what you're experiencing in detail. For example: I've had a persistent headache for 3 days, along with mild fever and fatigue..."
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            rows={5}
            className="resize-none text-base"
          />

          {/* Quick suggestions */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setSymptoms(prev => prev ? `${prev}, ${s.toLowerCase()}` : s)}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Optional info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Age (optional)</label>
              <Input type="number" placeholder="e.g. 30" value={age} onChange={e => setAge(e.target.value)} min="0" max="150" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Gender (optional)</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={loading || !symptoms.trim()} size="lg" className="w-full gradient-warm text-primary-foreground font-semibold text-base">
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 h-5 w-5" /> Analyze Symptoms</>}
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/20 p-4">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-warning-foreground">Medical Disclaimer</p>
          <p className="text-xs text-muted-foreground mt-0.5">This AI analysis is for informational purposes only and is not a medical diagnosis. Always consult a qualified healthcare professional for medical advice.</p>
        </div>
      </div>
    </div>
  );
}
