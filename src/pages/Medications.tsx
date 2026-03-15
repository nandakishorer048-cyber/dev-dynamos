import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pill, 
  Plus, 
  Sparkles,
  Loader2,
  Trash2,
  Edit,
  AlertTriangle,
  Info,
  Heart,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  purpose: string | null;
  precautions: string | null;
  side_effects: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  ai_explanation: string | null;
  created_at: string;
}

interface AIExplanation {
  simpleName: string;
  whatItDoes: string;
  howItWorks: string;
  commonSideEffects: string[];
  importantPrecautions: string[];
  tips: string[];
  foodInteractions: string[];
  whenToCallDoctor: string[];
}

export default function Medications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: '',
    purpose: '',
    startDate: '',
    language: 'en',
  });

  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
  ];

  useEffect(() => {
    if (user) fetchMedications();
  }, [user]);

  const fetchMedications = async () => {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
    } else {
      setMedications(data || []);
    }
    setLoading(false);
  };

  const handleAddMedication = async () => {
    if (!newMed.name) {
      toast({
        title: 'Missing information',
        description: 'Please provide the medication name.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    setExplaining(true);

    try {
      // Get AI explanation
      const { data: aiData, error: aiError } = await supabase.functions.invoke('explain-medicine', {
        body: {
          medicineName: newMed.name,
          dosage: newMed.dosage,
          purpose: newMed.purpose,
          language: newMed.language,
        },
      });

      let aiExplanation = null;
      if (!aiError && aiData?.explanation) {
        aiExplanation = JSON.stringify(aiData.explanation);
      } else if (aiError) {
        console.error("AI Explanation skipped due to error:", aiError);
        // We continue saving without AI explanation if it's just busy
      }

      setExplaining(false);

      // Save to database
      const { data: savedMed, error: saveError } = await supabase
        .from('medications')
        .insert({
          user_id: user!.id,
          name: newMed.name,
          dosage: newMed.dosage || null,
          frequency: newMed.frequency || null,
          purpose: newMed.purpose || null,
          start_date: newMed.startDate || null,
          ai_explanation: aiExplanation,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setMedications([savedMed, ...medications]);
      setNewMed({ name: '', dosage: '', frequency: '', purpose: '', startDate: '', language: 'en' });
      setDialogOpen(false);

      toast({
        title: 'Medication added! 💊',
        description: `${newMed.name} has been added to your list.`,
      });
    } catch (error: any) {
      console.error('Error adding medication:', error);
      toast({
        title: 'Failed to add medication',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setExplaining(false);
    }
  };

  const handleToggleActive = async (med: Medication) => {
    const { error } = await supabase
      .from('medications')
      .update({ is_active: !med.is_active })
      .eq('id', med.id);

    if (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update medication status.',
        variant: 'destructive',
      });
    } else {
      setMedications(medications.map(m => 
        m.id === med.id ? { ...m, is_active: !m.is_active } : m
      ));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Delete failed',
        description: 'Unable to delete the medication.',
        variant: 'destructive',
      });
    } else {
      setMedications(medications.filter(m => m.id !== id));
      toast({ title: 'Medication deleted' });
    }
  };

  const activeMeds = medications.filter(m => m.is_active);
  const inactiveMeds = medications.filter(m => !m.is_active);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">My Medications</h1>
            <p className="text-muted-foreground">Track and understand your medications</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Add New Medication
                </DialogTitle>
                <DialogDescription>
                  Add a medication and get AI-powered explanations in simple terms.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Metformin, Lisinopril"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 500mg"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      placeholder="e.g., Twice daily"
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">What is it for?</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Blood pressure, Diabetes"
                    value={newMed.purpose}
                    onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newMed.startDate}
                      onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Explanation Language
                    </Label>
                    <Select 
                      value={newMed.language} 
                      onValueChange={(value) => setNewMed({ ...newMed, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleAddMedication} 
                  className="w-full gap-2" 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {explaining ? 'Getting AI explanation...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Add & Get AI Explanation
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Medications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : medications.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Pill className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No medications yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your medications to get AI-powered explanations and set reminders
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Medications */}
            {activeMeds.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Active Medications ({activeMeds.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeMeds.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onToggle={() => handleToggleActive(med)}
                      onDelete={() => handleDelete(med.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Medications */}
            {inactiveMeds.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                  Past Medications ({inactiveMeds.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {inactiveMeds.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onToggle={() => handleToggleActive(med)}
                      onDelete={() => handleDelete(med.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function MedicationCard({ 
  medication, 
  onToggle, 
  onDelete 
}: { 
  medication: Medication; 
  onToggle: () => void;
  onDelete: () => void;
}) {
  const explanation: AIExplanation | null = medication.ai_explanation 
    ? JSON.parse(medication.ai_explanation) 
    : null;

  return (
    <Card className={`shadow-soft transition-all ${!medication.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              medication.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{medication.name}</CardTitle>
              <CardDescription>
                {medication.dosage && `${medication.dosage}`}
                {medication.frequency && ` • ${medication.frequency}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={medication.is_active}
              onCheckedChange={onToggle}
            />
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {medication.purpose && (
          <Badge variant="secondary" className="mb-3">
            {medication.purpose}
          </Badge>
        )}

        {explanation && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="explanation" className="border-0">
              <AccordionTrigger className="text-sm text-primary hover:no-underline py-2">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  View AI Explanation
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-medium text-sm mb-1">What it does</p>
                  <p className="text-sm text-muted-foreground">{explanation.whatItDoes}</p>
                </div>

                {explanation.commonSideEffects?.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Common Side Effects
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {explanation.commonSideEffects.slice(0, 4).map((effect, i) => (
                        <li key={i}>• {effect}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.tips?.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-health-blue" />
                      Helpful Tips
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {explanation.tips.slice(0, 3).map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}