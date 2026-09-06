import React from 'react';
import { ChatPane } from '../components/assistant/ChatPane';
import { Bot, Sparkles, Mic, Volume2 } from 'lucide-react';

export const Assistant: React.FC = () => {
  return (
    <div className="h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 sm:p-6 flex flex-col space-y-4">
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-pink-400" />
            Netra+ AI Voice & Chat Forensic Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time graph reasoning, Section 65B citations, and Gemini 2.5 Flash intelligence
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ChatPane caseId="CASE-26189" />
      </div>
    </div>
  );
};
