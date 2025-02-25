import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();

  let recognition: SpeechRecognition | null = null;

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);
        processVoiceCommand(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const processVoiceCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase();

    // Process different voice commands
    if (normalizedCommand.includes('show health data')) {
      window.location.href = '/dashboard';
    } else if (normalizedCommand.includes('upload medical records')) {
      // Trigger medical records upload dialog
    } else if (normalizedCommand.includes('show recommendations')) {
      // Scroll to recommendations section
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      toast({
        title: "Listening",
        description: "Speak your command...",
      });
    }
    setIsListening(!isListening);
  }, [isListening, recognition]);

  return (
    <Card className="fixed bottom-4 right-4 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Button
            variant={isListening ? "destructive" : "default"}
            size="icon"
            onClick={toggleListening}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          {transcript && (
            <p className="text-sm text-muted-foreground">{transcript}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
