import React, { useState, useRef, useEffect } from 'react';
import { api, CaseItem } from '../../api/client';
import { VoiceButton } from './VoiceButton';
import { EntityDossierModal } from '../evidence/EntityDossierModal';
import {
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  ShieldCheck,
  FileText,
  CreditCard,
  Radio,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  entities?: string[];
  timestamp: string;
}

export const ChatPane: React.FC<{ caseId?: string }> = ({ caseId: initialCaseId = 'CASE-26189' }) => {
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);
  const [casesList, setCasesList] = useState<CaseItem[]>([]);
  const [selectedDossierEntity, setSelectedDossierEntity] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Greetings, Officer. I am Netra+, your AI forensic investigative co-pilot powered by Google Gemini. I have indexed all 10 criminal network graphs, FIR charge sheets, CDR logs, and subpoenaed bank transaction trails. Ask me about suspect links, hawala money routing, cell tower pings, or click on any suspect name to inspect their evidence dossier.',
      citations: ['Netra+ AI Forensic Engine', 'FIR-492/2026-NCRB-MHA', 'Section 65B SQLite Vault'],
      entities: ['Sanjay Singhal', 'Vikram Malhotra', 'Devender @ Lala'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCases().then(setCasesList).catch(() => {});
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendAssistantChat(textToSend, selectedCaseId);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.response,
        citations: res.citations,
        entities: res.graph_entities_mentioned,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(res.response);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `Investigative query error: ${err.message || 'Unable to connect to intelligence engine.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Who connects Sanjay Singhal to the Mewat Cyber cell and what is the evidence?',
    'Trace the ₹1.8 Cr money laundering transactions from Apex Bullion to Priya Mehra',
    'Which suspect has anomalous nocturnal CDR calling bursts and across how many towers?',
    'What are the cross-case links between Case 26189 and Case 26190?',
  ];

  return (
    <div className="flex flex-col h-full bg-[#0E1524] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Bar with Case Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 bg-[#121A2B] border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Netra+ AI Forensic Copilot
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
                Gemini 2.5 Flash
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Live Graph Intelligence & Evidence Vault</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Multi-Case Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 text-[11px]">Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              {casesList.length > 0 ? (
                casesList.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#121A2B] text-slate-200">
                    {c.id} — {c.title.slice(0, 28)}...
                  </option>
                ))
              ) : (
                <option value="CASE-26189" className="bg-[#121A2B] text-slate-200">CASE-26189 (Operation Maya)</option>
              )}
            </select>
          </div>

          {/* TTS Audio Toggle */}
          <button
            onClick={() => {
              if (ttsEnabled) window.speechSynthesis?.cancel();
              setTtsEnabled(!ttsEnabled);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              ttsEnabled ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle Text-to-Speech audio response"
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Audio</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[88%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-pink-600 to-indigo-600 text-white shadow-md'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`rounded-2xl p-4 text-xs space-y-2.5 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-[#161F32] text-slate-200 border border-slate-700/70 rounded-tl-none shadow-lg'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-line text-slate-100 font-sans">{msg.text}</p>

              {/* Clickable Suspect / Entity Chips */}
              {msg.entities && msg.entities.length > 0 && (
                <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Identified Entities (Click to Inspect):</span>
                  {msg.entities.map((ent, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        // Map label or search in nodes
                        setSelectedDossierEntity(
                          ent.toLowerCase().includes('sanjay') ? 'suspect_sanjay' :
                          ent.toLowerCase().includes('vikram') ? 'suspect_vikram_bridge' :
                          ent.toLowerCase().includes('rahul') ? 'suspect_rahul_cyber' :
                          ent.toLowerCase().includes('priya') ? 'suspect_priya_m' :
                          ent.toLowerCase().includes('devender') ? 'suspect_devender_anomaly' :
                          ent.toLowerCase().includes('farhan') ? 'chk_ringleader_farhan' :
                          ent
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-medium transition-colors"
                    >
                      {ent} ↗
                    </button>
                  ))}
                </div>
              )}

              {/* Citations & Evidence Footnotes */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  <span className="font-semibold text-slate-300">Evidentiary Citations:</span>
                  {msg.citations.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-right text-slate-400 mt-1">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#161F32] rounded-2xl p-3.5 border border-slate-700/70 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-1">Netra+ Gemini 2.5 Flash is analyzing case graph & evidence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-5 py-2.5 bg-[#101726] border-t border-slate-800/80 overflow-x-auto flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-[11px] text-slate-400 font-medium shrink-0">Prompts:</span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="whitespace-nowrap px-3 py-1 bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-full text-[11px] border border-slate-700 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar with Mic STT Button */}
      <div className="p-4 bg-[#121A2B] border-t border-slate-800 flex items-center gap-3">
        <VoiceButton
          onTranscript={(transcript) => {
            setInput(transcript);
            handleSend(transcript);
          }}
          isProcessing={loading}
        />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask Netra+ about suspect links, Hawala trails, or FIRs..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Entity Dossier Modal */}
      {selectedDossierEntity && (
        <EntityDossierModal
          entityId={selectedDossierEntity}
          caseId={selectedCaseId}
          onClose={() => setSelectedDossierEntity(null)}
          onSelectEntity={(newId) => setSelectedDossierEntity(newId)}
        />
      )}
    </div>
  );
};
