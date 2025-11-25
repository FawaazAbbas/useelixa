import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceCallDialogProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
  agentInstructions?: string;
  voice?: string;
}

export const VoiceCallDialog = ({
  open,
  onClose,
  agentName,
  agentInstructions,
  voice = 'alloy'
}: VoiceCallDialogProps) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event.type);
    
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    } else if (event.type === 'conversation.item.created') {
      if (event.item?.content) {
        const textContent = event.item.content.find((c: any) => c.type === 'text');
        if (textContent) {
          setTranscript(prev => [...prev, `${event.item.role}: ${textContent.text}`]);
        }
      }
    } else if (event.type === 'response.text.delta') {
      // Handle streaming text responses
      if (event.delta) {
        setTranscript(prev => {
          const newTranscript = [...prev];
          if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].startsWith('assistant:')) {
            newTranscript[newTranscript.length - 1] += event.delta;
          } else {
            newTranscript.push(`assistant: ${event.delta}`);
          }
          return newTranscript;
        });
      }
    } else if (event.type === 'error') {
      console.error('Realtime API error:', event);
      toast({
        title: "Voice Call Error",
        description: event.error?.message || "An error occurred during the call",
        variant: "destructive",
      });
    }
  };

  const handleError = (error: Error) => {
    console.error('Voice call error:', error);
    toast({
      title: "Connection Error",
      description: error.message,
      variant: "destructive",
    });
    setIsConnected(false);
    setIsConnecting(false);
  };

  const startCall = async () => {
    try {
      setIsConnecting(true);
      setTranscript([]);

      const instructions = agentInstructions || 
        `You are ${agentName}, a helpful AI assistant. Be conversational, natural, and concise in your responses. Engage in natural dialogue with the user.`;

      chatRef.current = new RealtimeChat(handleMessage, handleError);
      await chatRef.current.init(voice, instructions);
      
      setIsConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Voice Call Connected",
        description: `Now talking with ${agentName}`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      setIsConnecting(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to start voice call',
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setTranscript([]);
    onClose();
  };

  useEffect(() => {
    if (open && !isConnected && !isConnecting) {
      startCall();
    }

    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
        chatRef.current = null;
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Call with {agentName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-8">
          {/* Voice Indicator */}
          <div className={cn(
            "relative w-32 h-32 rounded-full flex items-center justify-center",
            "transition-all duration-300",
            isSpeaking ? "bg-primary/20 animate-pulse" : "bg-muted"
          )}>
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center",
              isSpeaking ? "bg-primary" : "bg-muted-foreground"
            )}>
              <Mic className={cn(
                "w-12 h-12",
                isSpeaking ? "text-primary-foreground" : "text-background"
              )} />
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-lg font-medium">
              {isConnecting && "Connecting..."}
              {isConnected && !isSpeaking && "Listening..."}
              {isConnected && isSpeaking && `${agentName} is speaking...`}
            </p>
          </div>

          {/* Transcript */}
          {transcript.length > 0 && (
            <div className="w-full max-h-40 overflow-y-auto border rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-2">Live Transcript:</p>
              {transcript.slice(-3).map((line, idx) => (
                <p key={idx} className="text-sm mb-1">{line}</p>
              ))}
            </div>
          )}

          {/* Call Controls */}
          <div className="flex gap-4">
            {isConnected && (
              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            )}
          </div>

          {isConnecting && (
            <p className="text-sm text-muted-foreground">
              Please allow microphone access when prompted
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
