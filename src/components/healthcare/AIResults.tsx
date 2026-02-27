import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Pill, AlertTriangle, ArrowLeft, Activity, Lightbulb, ShieldAlert } from 'lucide-react';
import type { AIAnalysis } from '@/pages/HealthcareFlow';
import { cn } from '@/lib/utils';

interface AIResultsProps {
  analysis: AIAnalysis;
  onBookTests: () => void;
  onOrderMedicines: () => void;
  onBack: () => void;
}

const urgencyColors: Record<string, string> = {
  low: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  emergency: 'bg-destructive text-destructive-foreground',
};

const likelihoodColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-muted text-muted-foreground',
};

export function AIResults({ analysis, onBookTests, onOrderMedicines, onBack }: AIResultsProps) {
  const hasTests = analysis.recommended_tests?.length > 0;
  const hasMedicines = analysis.recommended_medicines?.length > 0;
  const otcMedicines = analysis.recommended_medicines?.filter(m => m.type === 'otc') || [];
  const rxMedicines = analysis.recommended_medicines?.filter(m => m.type === 'prescription') || [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>

      {/* Urgency banner */}
      {analysis.urgency_level === 'emergency' && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive p-4 text-destructive-foreground">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <div><p className="font-bold">Seek Immediate Medical Attention</p><p className="text-sm opacity-90">Your symptoms may require urgent care. Please visit the nearest emergency room or call emergency services.</p></div>
        </div>
      )}

      {/* Summary */}
      <Card className="premium-card">
        <CardHeader><CardTitle className="flex items-center gap-3"><div className="icon-container"><Activity className="h-5 w-5 text-primary" /></div>AI Health Assessment</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground leading-relaxed">{analysis.summary}</p>
          <Badge className={cn("text-xs", urgencyColors[analysis.urgency_level] || urgencyColors.moderate)}>
            Urgency: {analysis.urgency_level?.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      {/* Possible Conditions */}
      {analysis.possible_conditions?.length > 0 && (
        <Card className="premium-card">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-warning" /> Possible Conditions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.possible_conditions.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                  <Badge className={cn("text-xs shrink-0 mt-0.5", likelihoodColors[c.likelihood] || likelihoodColors.low)}>{c.likelihood}</Badge>
                  <div><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-muted-foreground mt-0.5">{c.description}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>These are not diagnoses. Consult a doctor for accurate assessment.</span></div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Tests */}
      {hasTests && (
        <Card className="premium-card border-primary/20">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" /> Recommended Tests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {analysis.recommended_tests.map((t, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-primary/5">
                <div><p className="font-semibold text-sm">{t.name}</p><p className="text-xs text-muted-foreground mt-0.5">{t.reason}</p></div>
                <Badge variant="outline" className={cn("text-xs shrink-0",
                  t.urgency === 'urgent' ? 'border-destructive/40 text-destructive' : t.urgency === 'soon' ? 'border-warning/40 text-warning' : 'border-border'
                )}>{t.urgency}</Badge>
              </div>
            ))}
            <Button onClick={onBookTests} className="w-full gradient-warm text-primary-foreground mt-2"><FlaskConical className="mr-2 h-4 w-4" /> Book Recommended Tests</Button>
          </CardContent>
        </Card>
      )}

      {/* Medicines */}
      {hasMedicines && (
        <Card className="premium-card border-health-mint/20">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Pill className="h-5 w-5 text-health-mint" /> Suggested Medicines</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {otcMedicines.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-success/5">
                <div className="flex items-center gap-2"><Badge className="bg-success/10 text-success text-xs">OTC</Badge><p className="font-semibold text-sm">{m.name}</p></div>
                <p className="text-xs text-muted-foreground mt-1">{m.purpose}</p>
                {m.note && <p className="text-xs text-muted-foreground italic mt-0.5">{m.note}</p>}
              </div>
            ))}
            {rxMedicines.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-warning/5 border border-warning/10">
                <div className="flex items-center gap-2"><Badge className="bg-warning/10 text-warning text-xs">Prescription</Badge><p className="font-semibold text-sm">{m.name}</p></div>
                <p className="text-xs text-muted-foreground mt-1">{m.purpose}</p>
                <p className="text-xs text-warning mt-1 font-medium">⚠️ Requires doctor consultation before purchase</p>
              </div>
            ))}
            <Button onClick={onOrderMedicines} variant="outline" className="w-full mt-2 border-primary/30 text-primary hover:bg-primary/5">
              <Pill className="mr-2 h-4 w-4" /> Order Medicines
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {analysis.next_steps?.length > 0 && (
        <Card className="premium-card">
          <CardHeader><CardTitle className="text-lg">Recommended Next Steps</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {analysis.next_steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="text-foreground">{s}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
