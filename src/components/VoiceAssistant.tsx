import { useState, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Volume2,
  Loader2,
  Sparkles,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'pl', name: 'Polski' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
];

interface VoiceAssistantProps {
  agentId?: string;
  className?: string;
}

export function VoiceAssistant({ agentId, className }: VoiceAssistantProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [customAgentId, setCustomAgentId] = useState(agentId || '');
  const [useDefaultAgent, setUseDefaultAgent] = useState(true);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      toast({
        title: 'Connected! 🎙️',
        description: 'Voice assistant is ready. Start speaking!',
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from agent');
    },
    onMessage: (message) => {
      console.log('Message from agent:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Failed to connect to voice assistant. Please try again.',
      });
    },
  });

  const startConversation = useCallback(async () => {
    if (!useDefaultAgent && !customAgentId) {
      toast({
        variant: 'destructive',
        title: 'Agent ID Required',
        description: 'Please enter your ElevenLabs Agent ID or use the default agent.',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Check if microphone is available first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');
      
      if (!hasMicrophone) {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-conversation-token', {
        body: useDefaultAgent ? { useDefault: true } : { agentId: customAgentId },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to get conversation token');
      }
      
      if (!data?.signed_url) {
        const errorMsg = data?.error || 'No signed URL received';
        throw new Error(errorMsg);
      }

      // Start the conversation with WebSocket
      await conversation.startSession({
        signedUrl: data.signed_url,
      });
    } catch (error: unknown) {
      console.error('Failed to start conversation:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      let description = message;
      if (message.includes('Permission denied') || message.includes('NotAllowedError')) {
        description = 'Please enable microphone access in your browser settings to use voice features.';
      } else if (message.includes('NotFoundError') || message.includes('Requested device not found') || message.includes('No microphone')) {
        description = 'No microphone detected. Please connect a microphone and refresh the page.';
      } else if (message.includes('ELEVENLABS_AGENT_ID')) {
        description = 'Voice assistant is not configured. Please contact the administrator.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Failed to Start',
        description,
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, customAgentId, useDefaultAgent, toast]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    toast({
      title: 'Conversation Ended',
      description: 'Voice assistant disconnected.',
    });
  }, [conversation, toast]);

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  return (
    <Card className={cn('shadow-soft', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Voice Assistant
        </CardTitle>
        <CardDescription>
          Talk to your health assistant in multiple languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Agent Configuration
          </Label>
          
          {/* Default Agent Toggle */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={useDefaultAgent ? "default" : "outline"}
              size="sm"
              onClick={() => setUseDefaultAgent(true)}
              disabled={isConnected}
            >
              Use Default Agent
            </Button>
            <Button
              type="button"
              variant={!useDefaultAgent ? "default" : "outline"}
              size="sm"
              onClick={() => setUseDefaultAgent(false)}
              disabled={isConnected}
            >
              Custom Agent
            </Button>
          </div>

          {/* Custom Agent ID Input - only show when not using default */}
          {!useDefaultAgent && (
            <div className="space-y-2">
              <Input
                id="agentId"
                placeholder="Enter your ElevenLabs Agent ID"
                value={customAgentId}
                onChange={(e) => setCustomAgentId(e.target.value)}
                disabled={isConnected}
              />
              <p className="text-xs text-muted-foreground">
                Create an agent at{' '}
                <a 
                  href="https://elevenlabs.io/app/conversational-ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ElevenLabs Conversational AI
                </a>
              </p>
            </div>
          )}

          {useDefaultAgent && (
            <p className="text-xs text-muted-foreground">
              ✅ Ready to use! The default health assistant is pre-configured.
            </p>
          )}
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Language
          </Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                type="button"
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLanguage(lang.code)}
                disabled={isConnected}
                className="text-xs"
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Display */}
        <div className="flex items-center justify-center py-6">
          <div 
            className={cn(
              "relative flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300",
              isConnected 
                ? isSpeaking 
                  ? "bg-primary/20 animate-pulse-soft" 
                  : "bg-success/20"
                : "bg-muted"
            )}
          >
            <div 
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full transition-all",
                isConnected 
                  ? isSpeaking 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-success text-success-foreground"
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}
            >
              {isConnecting ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isConnected ? (
                isSpeaking ? (
                  <Volume2 className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )
              ) : (
                <MicOff className="h-8 w-8" />
              )}
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="font-medium">
            {isConnecting 
              ? 'Connecting...' 
              : isConnected 
                ? isSpeaking 
                  ? 'Assistant is speaking...' 
                  : 'Listening... Speak now!'
                : 'Ready to connect'
            }
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isConnected 
              ? 'Ask about your medications, health tips, or reminders'
              : 'Click the button below to start talking'
            }
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {isConnected ? (
            <Button 
              onClick={stopConversation}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <PhoneOff className="h-5 w-5" />
              End Conversation
            </Button>
          ) : (
            <Button 
              onClick={startConversation}
              disabled={isConnecting || (!useDefaultAgent && !customAgentId)}
              size="lg"
              className="gap-2"
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
              {isConnecting ? 'Connecting...' : 'Start Conversation'}
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="rounded-lg bg-secondary/50 p-4 text-sm">
          <p className="font-medium mb-2">💡 Tips:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Ask about your medication schedule</li>
            <li>• Get explanations of medical terms</li>
            <li>• Request health tips and reminders</li>
            <li>• Speak in your preferred language</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
