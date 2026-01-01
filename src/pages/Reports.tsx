import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface MedicalReport {
  id: string;
  title: string;
  file_name: string | null;
  report_type: string | null;
  report_date: string | null;
  ai_analysis: string | null;
  key_findings: any;
  created_at: string;
}

interface AIAnalysis {
  summary: string;
  keyFindings: Array<{
    name: string;
    value: string;
    status: 'normal' | 'attention' | 'concerning';
    explanation: string;
  }>;
  recommendations: string[];
  questionsForDoctor: string[];
}

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  
  const [newReport, setNewReport] = useState({
    title: '',
    reportType: '',
    reportDate: '',
    reportText: '',
  });

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('medical_reports')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!newReport.title || !newReport.reportText) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title and report content.',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-report', {
        body: {
          reportText: newReport.reportText,
          reportType: newReport.reportType,
        },
      });

      if (error) throw error;

      // Save to database
      const { data: savedReport, error: saveError } = await supabase
        .from('medical_reports')
        .insert({
          user_id: user!.id,
          title: newReport.title,
          report_type: newReport.reportType,
          report_date: newReport.reportDate || null,
          ai_analysis: JSON.stringify(data.analysis),
          key_findings: data.analysis.keyFindings,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setReports([savedReport, ...reports]);
      setNewReport({ title: '', reportType: '', reportDate: '', reportText: '' });
      setDialogOpen(false);

      toast({
        title: 'Report analyzed! ✨',
        description: 'Your medical report has been analyzed and saved.',
      });
    } catch (error: any) {
      console.error('Error analyzing report:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Unable to analyze the report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('medical_reports')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Delete failed',
        description: 'Unable to delete the report.',
        variant: 'destructive',
      });
    } else {
      setReports(reports.filter(r => r.id !== id));
      toast({ title: 'Report deleted' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'attention':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'concerning':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Normal</Badge>;
      case 'attention':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Attention</Badge>;
      case 'concerning':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Concerning</Badge>;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Medical Reports</h1>
            <p className="text-muted-foreground">Upload and analyze your medical reports with AI</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Analyze Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Analyze Medical Report
                </DialogTitle>
                <DialogDescription>
                  Paste your medical report text and our AI will explain it in simple terms.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Blood Test Results"
                      value={newReport.title}
                      onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Input
                      id="type"
                      placeholder="e.g., Blood Work, X-Ray"
                      value={newReport.reportType}
                      onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Report Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newReport.reportDate}
                    onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Report Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste the content of your medical report here..."
                    className="min-h-[200px]"
                    value={newReport.reportText}
                    onChange={(e) => setNewReport({ ...newReport, reportText: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  className="w-full gap-2" 
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload your first medical report to get AI-powered insights
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Analyze Your First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => {
              const analysis: AIAnalysis | null = report.ai_analysis 
                ? JSON.parse(report.ai_analysis) 
                : null;

              return (
                <Card key={report.id} className="shadow-soft hover:shadow-elevated transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>
                          {report.report_type && `${report.report_type} • `}
                          {report.report_date 
                            ? format(new Date(report.report_date), 'MMM d, yyyy')
                            : format(new Date(report.created_at), 'MMM d, yyyy')
                          }
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {analysis && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                        
                        {analysis.keyFindings && analysis.keyFindings.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {analysis.keyFindings.slice(0, 3).map((finding, i) => (
                              <div key={i} className="flex items-center gap-1">
                                {getStatusIcon(finding.status)}
                                <span className="text-sm">{finding.name}</span>
                              </div>
                            ))}
                            {analysis.keyFindings.length > 3 && (
                              <span className="text-sm text-muted-foreground">
                                +{analysis.keyFindings.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedReport && (() => {
              const analysis: AIAnalysis | null = selectedReport.ai_analysis 
                ? JSON.parse(selectedReport.ai_analysis) 
                : null;

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedReport.title}</DialogTitle>
                    <DialogDescription>
                      {selectedReport.report_type && `${selectedReport.report_type} • `}
                      {selectedReport.report_date 
                        ? format(new Date(selectedReport.report_date), 'MMMM d, yyyy')
                        : format(new Date(selectedReport.created_at), 'MMMM d, yyyy')
                      }
                    </DialogDescription>
                  </DialogHeader>

                  {analysis && (
                    <div className="space-y-6 mt-4">
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <h4 className="font-medium mb-2">Summary</h4>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                      </div>

                      {analysis.keyFindings && analysis.keyFindings.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Key Findings</h4>
                          <div className="space-y-3">
                            {analysis.keyFindings.map((finding, i) => (
                              <div key={i} className="p-3 rounded-lg border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(finding.status)}
                                    <span className="font-medium">{finding.name}</span>
                                  </div>
                                  {getStatusBadge(finding.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Value:</span> {finding.value}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {finding.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {analysis.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.questionsForDoctor && analysis.questionsForDoctor.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Questions for Your Doctor</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {analysis.questionsForDoctor.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}