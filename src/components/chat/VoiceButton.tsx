import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import { toast } from "sonner";

interface VoiceButtonProps {
  onTranscript?: (text: string) => void;
  onSendMessage?: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceButton = ({ 
  onTranscript, 
  onSendMessage, 
  disabled,
  className 
}: VoiceButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const realtimeChatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = useCallback((event: any) => {
    console.log("Voice event:", event.type);
    
    switch (event.type) {
      case "conversation.item.input_audio_transcription.completed":
        // User's speech transcription
        const userText = event.transcript;
        if (userText) {
          setTranscript(userText);
          onTranscript?.(userText);
        }
        break;
        
      case "response.audio_transcript.delta":
        // AI is speaking
        setIsAiSpeaking(true);
        break;
        
      case "response.audio_transcript.done":
        // AI finished speaking
        setIsAiSpeaking(false);
        break;
        
      case "response.done":
        // Full response completed
        const outputItem = event.response?.output?.[0];
        if (outputItem?.content?.[0]?.transcript) {
          // Could optionally send this to chat history
        }
        break;
        
      case "error":
        console.error("Realtime error:", event.error);
        toast.error("Voice error: " + (event.error?.message || "Unknown error"));
        break;
    }
  }, [onTranscript]);

  const handleError = useCallback((error: Error) => {
    console.error("Voice chat error:", error);
    toast.error("Voice connection failed: " + error.message);
    setIsListening(false);
    setIsConnecting(false);
  }, []);

  const startListening = async () => {
    try {
      setIsConnecting(true);
      
      const chat = new RealtimeChat(handleMessage, handleError);
      
      await chat.init("alloy", `You are Elixa, a helpful AI assistant. 
        Respond conversationally and concisely. 
        The user is speaking to you via voice, so keep responses brief and natural.`);
      
      realtimeChatRef.current = chat;
      setIsListening(true);
      setIsConnecting(false);
      
      toast.success("Voice mode active - start speaking!");
    } catch (error) {
      console.error("Failed to start voice:", error);
      toast.error("Could not start voice mode. Please check microphone permissions.");
      setIsConnecting(false);
    }
  };

  const stopListening = () => {
    if (realtimeChatRef.current) {
      realtimeChatRef.current.disconnect();
      realtimeChatRef.current = null;
    }
    setIsListening(false);
    setIsAiSpeaking(false);
    setTranscript("");
    toast.info("Voice mode ended");
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeChatRef.current) {
        realtimeChatRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="relative">
      <Button
        variant={isListening ? "destructive" : "ghost"}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-xl transition-all",
          isListening && "animate-pulse",
          isAiSpeaking && "ring-2 ring-primary ring-offset-2",
          className
        )}
        onClick={toggleVoice}
        disabled={disabled || isConnecting}
        title={isListening ? "Stop voice mode" : "Start voice mode"}
      >
        {isConnecting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isAiSpeaking ? (
          <Volume2 className="h-5 w-5 animate-pulse" />
        ) : isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      
      {/* Voice activity indicator */}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
    </div>
  );
};
