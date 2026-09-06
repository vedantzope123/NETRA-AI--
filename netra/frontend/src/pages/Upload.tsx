import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { FileUp, Sparkles, CheckCircle2, AlertCircle, ArrowRight, User, Phone, Car, MapPin, Building, Network } from 'lucide-react';

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [caseId, setCaseId] = useState('CASE-26189');
  const [sourceTitle, setSourceTitle] = useState('Supplementary FIR Report - Mewat Cell Intercept');
  const [documentText, setDocumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleFIR = `FIRST INFORMATION REPORT (SYNTHETIC BENCHMARK - CASE 26189)
During surveillance in Sector 62 Gurugram, task force intercepted suspect Amit Kasana (alias Munna) driving white Mahindra Scorpio UP16AX3344 near Sector 63 Safehouse Warehouse. On questioning, Kasana confessed to procuring burner mobile SIM +919810112233 from Devender @ Lala under directions from handler Rahul Sharma. The accused stated that cash disbursements were coordinated by Vikram Malhotra at Cyber Hub on behalf of Apex Bullion & Forex Ltd.`;

  const handleLoadSample = () => {
    setDocumentText(sampleFIR);
    setSourceTitle('Field Intercept Report - Gurugram Taskforce');
    setError(null);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim()) {
      setError('Please provide document text or paste an FIR narrative.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadForensicDocument(caseId, documentText, sourceTitle);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Ingestion pipeline error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <FileUp className="w-6 h-6 text-indigo-400" />
            Forensic Document Ingestion
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Offline spaCy NER + Regex Entity Extraction & Automated Graph Node Synthesis
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Load Sample FIR Intercept
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-[#121A2B] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleIngest} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Target Case ID</label>
                <input
                  type="text"
                  required
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Document / FIR Source Title</label>
                <input
                  type="text"
                  required
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Raw Narrative Text / Police Report</label>
              <textarea
                rows={8}
                required
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="Paste FIR narrative, interrogation transcripts, or CDR notes..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Extracting Entities & Synthesizing Graph...</span>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  <span>Execute NLP Ingestion Pipeline</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Extraction Results Output Preview */}
        <div className="lg:col-span-5 bg-[#121A2B] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Live Extraction Output
              </h3>
              {result && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {result.entities_extracted} Extracted
                </span>
              )}
            </div>

            {result ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Ingestion Successful
                  </div>
                  <p className="text-[11px] text-slate-300">{result.message}</p>
                </div>

                {/* Extracted Entities Category Breakdowns */}
                <div className="space-y-2">
                  {result.extracted_entities.people?.length > 0 && (
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5" />
                        Persons:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.extracted_entities.people.map((p: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-200 text-[11px]">
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.extracted_entities.phones?.length > 0 && (
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5" />
                        Phone Numbers:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.extracted_entities.phones.map((ph: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-cyan-600/20 text-cyan-200 font-mono text-[11px]">
                            {ph.identifier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.extracted_entities.vehicles?.length > 0 && (
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 mb-1">
                        <Car className="w-3.5 h-3.5" />
                        Vehicle Plates:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.extracted_entities.vehicles.map((v: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-600/20 text-amber-200 font-mono text-[11px]">
                            {v.identifier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.extracted_entities.locations?.length > 0 && (
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Locations:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.extracted_entities.locations.map((loc: any, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-200 text-[11px]">
                            {loc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <FileUp className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Paste or load an FIR narrative to run extraction.</p>
              </div>
            )}
          </div>

          {result && (
            <button
              onClick={() => navigate(`/cases/${caseId}/graph`)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Network className="w-4 h-4" />
              <span>Explore Updated Case Graph</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
