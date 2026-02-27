import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SymptomEntry } from '@/components/healthcare/SymptomEntry';
import { AIResults } from '@/components/healthcare/AIResults';
import { TestBooking } from '@/components/healthcare/TestBooking';
import { MedicineOrder } from '@/components/healthcare/MedicineOrder';
import { OrderTracking } from '@/components/healthcare/OrderTracking';
import { Stethoscope, FlaskConical, Pill, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FlowStep = 'symptoms' | 'results' | 'book-test' | 'order-medicine' | 'tracking';

export type AIAnalysis = {
  possible_conditions: { name: string; likelihood: string; description: string }[];
  recommended_tests: { name: string; reason: string; urgency: string }[];
  recommended_medicines: { name: string; type: string; purpose: string; note: string }[];
  next_steps: string[];
  urgency_level: string;
  summary: string;
};

const steps = [
  { id: 'symptoms', label: 'Symptoms', icon: Stethoscope },
  { id: 'results', label: 'AI Analysis', icon: ClipboardList },
  { id: 'book-test', label: 'Book Tests', icon: FlaskConical },
  { id: 'order-medicine', label: 'Medicines', icon: Pill },
] as const;

export default function HealthcareFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('symptoms');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [symptoms, setSymptoms] = useState('');

  const activeIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold gradient-text">Health Assessment</h1>
          <p className="text-muted-foreground mt-1">Get AI-powered guidance and book tests or medicines</p>
        </div>

        {/* Stepper */}
        {currentStep !== 'tracking' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeIndex;
              const isDone = i < activeIndex;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  {i > 0 && <div className={cn("h-0.5 w-6 rounded-full transition-colors", isDone ? "bg-primary" : "bg-border")} />}
                  <button
                    disabled={i > activeIndex}
                    onClick={() => i <= activeIndex && setCurrentStep(step.id as FlowStep)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                      isActive && "bg-primary text-primary-foreground shadow-warm",
                      isDone && "bg-primary/10 text-primary cursor-pointer",
                      !isActive && !isDone && "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {step.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="animate-fade-in">
          {currentStep === 'symptoms' && (
            <SymptomEntry
              onAnalysis={(result, symptomText) => {
                setAnalysis(result);
                setSymptoms(symptomText);
                setCurrentStep('results');
              }}
            />
          )}
          {currentStep === 'results' && analysis && (
            <AIResults
              analysis={analysis}
              onBookTests={() => setCurrentStep('book-test')}
              onOrderMedicines={() => setCurrentStep('order-medicine')}
              onBack={() => setCurrentStep('symptoms')}
            />
          )}
          {currentStep === 'book-test' && analysis && (
            <TestBooking
              recommendedTests={analysis.recommended_tests}
              symptoms={symptoms}
              aiRecommendation={analysis.summary}
              onComplete={() => setCurrentStep('tracking')}
              onBack={() => setCurrentStep('results')}
            />
          )}
          {currentStep === 'order-medicine' && analysis && (
            <MedicineOrder
              recommendedMedicines={analysis.recommended_medicines}
              symptoms={symptoms}
              aiRecommendation={analysis.summary}
              onComplete={() => setCurrentStep('tracking')}
              onBack={() => setCurrentStep('results')}
            />
          )}
          {currentStep === 'tracking' && <OrderTracking onNewAssessment={() => { setCurrentStep('symptoms'); setAnalysis(null); }} />}
        </div>
      </div>
    </AppLayout>
  );
}
