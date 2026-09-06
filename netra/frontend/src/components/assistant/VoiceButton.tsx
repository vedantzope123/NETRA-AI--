import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-IN'; // Indian English / Global English

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      setSupported(false);
    }
  }, [onTranscript]);

  const toggleListen = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        <MicOff className="w-4 h-4 text-slate-500" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleListen}
      disabled={isProcessing}
      className={`relative p-3 rounded-full transition-all shadow-lg flex items-center justify-center ${
        isListening
          ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse scale-110'
          : isProcessing
          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
      }`}
      title={isListening ? 'Listening... click to stop' : 'Click to Speak to Netra Voice Assistant'}
      aria-label="Voice input"
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      {isListening && (
        <span className="absolute -inset-1 rounded-full border-2 border-rose-500 animate-ping opacity-75 pointer-events-none" />
      )}
    </button>
  );
};
