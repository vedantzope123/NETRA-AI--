import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import cytoscape from 'cytoscape';
import {
  Shield, Network, Eye, Sparkles, ArrowRight, CheckCircle2, Lock, Cpu, BrainCircuit,
  Activity, Globe, MapPin, Users, Phone, Car, Wallet, FileText, Layers, Zap,
  Search, BarChart3, Scale, Link2, Fingerprint, Radio, Target, Trophy
} from 'lucide-react';

export const Home: React.FC = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const [selectedEdgeJustification, setSelectedEdgeJustification] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Cytoscape demo graph
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      elements: [
        { data: { id: 'sanjay', label: 'Sanjay S.', type: 'person', bg: '#6366F1' } },
        { data: { id: 'vikram', label: 'Vikram M.', type: 'bridge', bg: '#EC4899' } },
        { data: { id: 'rahul', label: 'Rahul S.', type: 'person', bg: '#6366F1' } },
        { data: { id: 'fortuner', label: 'DL01CA9988', type: 'vehicle', bg: '#F59E0B' } },
        { data: { id: 'apex', label: 'Apex Ltd', type: 'org', bg: '#8B5CF6' } },
        { data: { id: 'nuh', label: 'Nuh Safehouse', type: 'location', bg: '#10B981' } },
        {
          data: { id: 'e1', source: 'sanjay', target: 'vikram', label: 'COORDINATED',
            color: '#10B981', just: '32 encrypted calls & escrow handshakes verified at Cyber Hub between Sanjay Singhal & Vikram Malhotra.' },
        },
        {
          data: { id: 'e2', source: 'vikram', target: 'rahul', label: 'DISPATCH',
            color: '#10B981', just: 'Vikram coordinates victim extortion payout distributions directly with Rahul Sharma via Signal app.' },
        },
        {
          data: { id: 'e3', source: 'sanjay', target: 'fortuner', label: 'OWNER',
            color: '#10B981', just: 'Vahan national vehicle database links DL01CA9988 directly to Sanjay Singhal.' },
        },
        {
          data: { id: 'e4', source: 'sanjay', target: 'apex', label: 'DIRECTOR',
            color: '#10B981', just: 'Sanjay Singhal is registered beneficial director of shell entity Apex Bullion & Forex Ltd.' },
        },
        {
          data: { id: 'e5', source: 'rahul', target: 'nuh', label: 'GEOLOCATED',
            color: '#F59E0B', just: 'Continuous cell tower presence at Nuh safehouse location during extortion shifts.' },
        },
      ],
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)', 'background-color': 'data(bg)', 'color': '#F8FAFC',
            'font-size': '9px', 'font-family': 'Inter, sans-serif', 'font-weight': 600,
            'text-valign': 'bottom', 'text-margin-y': 4, 'width': 30, 'height': 30,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2, 'line-color': 'data(color)', 'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle', 'curve-style': 'bezier',
            'label': 'data(label)', 'font-size': '7px', 'color': '#64748B',
          },
        },
        { selector: 'edge:selected', style: { 'width': 3.5, 'line-color': '#38BDF8' } },
      ],
      layout: { name: 'cose', animate: false, padding: 15 } as any,
      userZoomingEnabled: false, userPanningEnabled: false,
    });

    cy.on('tap', 'edge', (evt) => setSelectedEdgeJustification(evt.target.data('just')));
    return () => cy.destroy();
  }, []);

  const flagshipFeatures = [
    {
      icon: Network,
      accentColor: 'indigo',
      title: 'Unified Network Intelligence',
      subtitle: 'One Graph. Every Connection.',
      description: 'Connects people, phones, vehicles, bank accounts, cases, and locations into a single unified relationship graph. See how a suspect links to a phone number, which links to a vehicle, which links to a crime location — all in one interactive view.',
      badges: ['People', 'Phones', 'Vehicles', 'Accounts', 'Cases', 'Locations'],
      badgeIcons: [Users, Phone, Car, Wallet, FileText, MapPin],
    },
    {
      icon: Globe,
      accentColor: 'emerald',
      title: 'Graph + Geospatial Fusion',
      subtitle: 'Networks Meet Geography.',
      description: 'Combines network relationship graphs with geographic context to reveal spatial and movement-linked patterns. See where suspects meet, which cell towers they traverse, and map the physical footprint of digital criminal networks.',
      badges: ['Network Graph', 'Location Map', 'Movement Trails', 'Cell Towers'],
      badgeIcons: [Network, MapPin, Activity, Radio],
    },
    {
      icon: Scale,
      accentColor: 'amber',
      title: 'Evidence-Backed Explainable Leads',
      subtitle: 'Every Lead Tells You Why.',
      description: 'Every high-priority result is accompanied by the relationships, source records, and analytical factors that produced it. No black boxes — every connection has a plain-language courtroom-ready justification with confidence scoring.',
      badges: ['Justifications', 'Source Records', 'Confidence Score', 'Evidence Type'],
      badgeIcons: [FileText, Search, BarChart3, Fingerprint],
    },
  ];

  const features = [
    { icon: Eye, title: 'Courtroom Explainability', description: 'Every graph connection is backed by a plain-English justification with a clear evidentiary citation.' },
    { icon: Sparkles, title: 'Human-in-the-Loop Learning', description: 'Investigators confirm or reject connections with one click, visibly retraining the confidence scorer in real-time.' },
    { icon: BrainCircuit, title: 'Syndicate & Bridge Detection', description: 'Betweenness centrality and Louvain community algorithms pinpoint hidden kingpins and multi-ring brokers.' },
    { icon: Target, title: 'Behavioral Anomaly Engine', description: 'Isolation Forest flags nocturnal CDR bursts, rapid cell-tower switching, and mule account spikes.' },
    { icon: Cpu, title: 'Zero-Cost Offline Core', description: '100% free-tier architecture with offline spaCy NER and Google Gemini Flash fallback — zero procurement bottlenecks.' },
    { icon: Lock, title: 'Governance & Audit Trail', description: 'Immutable append-only audit logging and role-based PII redaction built for law enforcement governance.' },
  ];

  const steps = [
    { num: '01', title: 'Ingest Reports', desc: 'Upload FIRs, CDR dumps, and financial statements in raw text.' },
    { num: '02', title: 'Offline NER Extraction', desc: 'spaCy extracts suspects, phone numbers, vehicle plates, and organizations.' },
    { num: '03', title: 'Graph Build & AI Justify', desc: 'NetworkX detects bridges while Gemini writes legal justifications.' },
    { num: '04', title: 'Investigator Feedback', desc: 'Confirm or reject links to refine the intelligence model live.' },
  ];

  const stats = [
    { value: '10', label: 'Active Cases', color: 'indigo' },
    { value: '75+', label: 'Tracked Entities', color: 'cyan' },
    { value: '80+', label: 'Evidence Links', color: 'emerald' },
    { value: '20+', label: 'Intel Alerts', color: 'rose' },
  ];

  const accentMap: Record<string, { bg: string; border: string; text: string; iconBg: string; glow: string }> = {
    indigo: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', text: 'text-indigo-400', iconBg: 'bg-indigo-600/15', glow: 'shadow-indigo-500/10' },
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-600/15', glow: 'shadow-emerald-500/10' },
    amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', iconBg: 'bg-amber-600/15', glow: 'shadow-amber-500/10' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 cyber-grid-bg">
      {/* ═══════════ Header ═══════════ */}
      <header className="h-20 px-6 max-w-7xl mx-auto w-full flex items-center justify-between animate-fade-in-down">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider text-white flex items-center gap-1">
              NETRA<span className="text-pink-400 font-black text-2xl leading-none animate-pulse">+</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              MHA PS 26189
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 btn-primary-glow"
          >
            Access Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ═══════════ Hero Section ═══════════ */}
      <section className="pt-10 pb-16 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Ministry of Home Affairs — NCRB, Women Safety Division
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            See the Invisible. <br />
            <span className="text-shimmer">
              Stop the Crime with Netra+
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            <strong className="text-white">Netra+</strong> ingests raw police records, synthesizes an <strong className="text-white">explainable criminal network graph</strong>, 
            and links every connection to verifiable database locations, CFSL Report IDs, FIR charge sheets, CDR tower telemetry, and RTGS transaction ledgers.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/25 flex items-center gap-2 btn-primary-glow"
            >
              Open Live Case Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium text-sm transition-colors"
            >
              Investigator Login
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            {['100% Free-Tier & Offline NER', 'FIR, CDR & Transaction Traceability', 'Section 65B BSA Admissibility', '10 Active Criminal Networks'].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cytoscape Demo Widget */}
        <div className="lg:col-span-5 bg-[#121A2B] rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4 animate-fade-in-up delay-200 relative overflow-hidden">
          <div className="absolute inset-0 scan-line pointer-events-none" />
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-white">Live Interactive Graph Preview</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Click edge → AI justification</span>
          </div>

          <div ref={cyRef} className="w-full h-56 bg-[#0A0E17] rounded-xl border border-slate-800/80" />

          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs">
            <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Edge Justification:
            </div>
            <p className="text-slate-300 italic">
              "{selectedEdgeJustification || '32 encrypted calls & escrow handshakes verified at Cyber Hub between Sanjay Singhal & Vikram Malhotra.'}"
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ Live Stats Counter Bar ═══════════ */}
      <section className="py-6 px-6 bg-[#0E1524]/80 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st, i) => (
            <div key={st.label}
              className={`text-center py-4 px-3 rounded-xl bg-[#121A2B] border border-slate-800/60 animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`text-3xl sm:text-4xl font-extrabold kpi-number text-${st.color}-400 stat-counter`}>
                {st.value}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ 3 FLAGSHIP FEATURES ═══════════ */}
      <section id="flagship" data-animate className="py-20 px-6 max-w-7xl mx-auto w-full space-y-16">
        <div className={`text-center space-y-3 ${visibleSections.has('flagship') ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">Key Differentiators</h2>
          <h3 className="text-2xl sm:text-4xl font-bold text-white">Three Innovations That Set NETRA Apart</h3>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Purpose-built for India's law enforcement with a focus on explainability, spatial intelligence, and evidence traceability.
          </p>
        </div>

        <div className="space-y-8">
          {flagshipFeatures.map((ff, idx) => {
            const Icon = ff.icon;
            const accent = accentMap[ff.accentColor];
            return (
              <div
                key={ff.title}
                className={`feature-card rounded-2xl ${accent.bg} border ${accent.border} p-6 sm:p-8 shadow-xl ${accent.glow} ${
                  visibleSections.has('flagship') ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(idx + 1) * 0.15}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${accent.iconBg} border ${accent.border} flex items-center justify-center ${accent.text} shrink-0 feature-icon`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${accent.text} font-bold`}>
                        Feature {idx + 1}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-bold text-white mt-1">{ff.title}</h4>
                      <p className={`text-sm font-semibold ${accent.text} mt-0.5`}>{ff.subtitle}</p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">{ff.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {ff.badges.map((badge, bi) => {
                        const BadgeIcon = ff.badgeIcons[bi];
                        return (
                          <span key={badge}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200`}
                          >
                            <BadgeIcon className={`w-3.5 h-3.5 ${accent.text}`} />
                            {badge}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ How It Works ═══════════ */}
      <section id="workflow" data-animate className="py-16 px-6 bg-[#0E1524]/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className={`text-center space-y-3 ${visibleSections.has('workflow') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">Workflow</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">How NETRA Accelerates Investigations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={st.num}
                className={`p-6 rounded-2xl bg-[#121A2B] border border-slate-800 space-y-3 feature-card ${
                  visibleSections.has('workflow') ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(i + 1) * 0.12}s` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-extrabold text-indigo-500/60">{st.num}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                </div>
                <h4 className="font-semibold text-white text-base">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Core Capabilities Grid ═══════════ */}
      <section id="capabilities" data-animate className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className={`text-center space-y-3 ${visibleSections.has('capabilities') ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">Core Capabilities</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Designed for Next-Generation Law Enforcement</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i}
                className={`p-6 rounded-2xl bg-[#121A2B] border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 group feature-card ${
                  visibleSections.has('capabilities') ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(i + 1) * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors feature-icon">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-white text-base">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ Tech Stack Banner ═══════════ */}
      <section className="py-12 px-6 bg-[#0E1524]/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">100% Free & Open Source Stack</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['React 18', 'FastAPI', 'NetworkX', 'Cytoscape.js', 'Leaflet', 'spaCy NER', 'Gemini AI', 'Scikit-learn', 'SQLite', 'Recharts', 'Zustand', 'JWT Auth'].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-lg bg-[#121A2B] border border-slate-800 text-xs text-slate-300 font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA Section ═══════════ */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full text-center space-y-8">
        <div className="space-y-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-white">Ready to Uncover Hidden Networks?</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Access the live forensic intelligence dashboard with 10 pre-loaded cases, 75+ tracked entities, and real-time graph analytics.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/25 flex items-center gap-2 btn-primary-glow"
          >
            <Zap className="w-4 h-4" />
            Launch Dashboard
          </Link>
          <Link to="/login"
            className="px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Secure Login
          </Link>
        </div>
      </section>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-400">NETRA AI</span>
            <span className="text-slate-600">—</span>
            <span>Ministry of Home Affairs Problem Statement 26189</span>
          </div>
          <span className="font-mono text-slate-400">NCRB · Women Safety Division · 100% Free-Tier Architecture</span>
        </div>
      </footer>
    </div>
  );
};
