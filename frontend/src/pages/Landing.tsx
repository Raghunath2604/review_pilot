import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Code2,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  GitPullRequest,
  GitBranch,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from 'lucide-react';
import { SpotlightCard } from '../components/bits/SpotlightCard';
import { GsapStagger } from '../components/animations/GsapStagger';
import { GsapCounter } from '../components/animations/GsapCounter';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface SampleDiffPreset {
  id: string;
  title: string;
  file: string;
  badge: string;
  badgeColor: string;
  hunkHeader: string;
  startLine: number;
  diffLines: { type: 'context' | 'del' | 'add'; lineOld?: number; lineNew?: number; content: string }[];
  finding: {
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'SECURITY' | 'PERFORMANCE' | 'TESTING';
    cwe: string;
    file: string;
    line: number;
    message: string;
    suggestion: string;
  };
}

const SAMPLE_PRESETS: SampleDiffPreset[] = [
  {
    id: 'sqli',
    title: 'SQL Injection Vulnerability',
    file: 'src/services/auth.service.ts',
    badge: 'CWE-89 Risk',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    hunkHeader: '@@ -14,6 +14,8 @@ export async function findUser(email: string)',
    startLine: 14,
    diffLines: [
      { type: 'context', lineOld: 14, lineNew: 14, content: 'export async function findUser(email: string) {' },
      { type: 'del', lineOld: 15, content: "-  return await db.query('SELECT * FROM users WHERE email = $1', [email]);" },
      { type: 'add', lineNew: 15, content: '+  // Fast patch for dynamic query filtering' },
      { type: 'add', lineNew: 16, content: "+  const query = \"SELECT * FROM users WHERE email = '\" + email + \"'\";" },
      { type: 'add', lineNew: 17, content: '+  return await db.raw(query);' },
      { type: 'context', lineOld: 16, lineNew: 18, content: '}' },
    ],
    finding: {
      severity: 'HIGH',
      category: 'SECURITY',
      cwe: 'CWE-89',
      file: 'src/services/auth.service.ts',
      line: 16,
      message: 'Direct string concatenation into raw SQL execution creates a critical SQL Injection risk. Adversarial inputs can bypass password authentication or exfiltrate the entire user table.',
      suggestion: 'Use parameterized queries with prepared statement bindings:\nreturn await db.query(\'SELECT * FROM users WHERE email = $1\', [email]);',
    },
  },
  {
    id: 'redos',
    title: 'Algorithmic ReDoS Backtracking',
    file: 'src/utils/validator.ts',
    badge: 'CWE-1333 Risk',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    hunkHeader: '@@ -22,4 +22,4 @@ export function validateUsername(val: string): boolean',
    startLine: 22,
    diffLines: [
      { type: 'context', lineOld: 22, lineNew: 22, content: 'export function validateUsername(val: string): boolean {' },
      { type: 'del', lineOld: 23, content: '-  return /^[a-zA-Z0-9_-]{3,16}$/.test(val);' },
      { type: 'add', lineNew: 23, content: '+  // Match nested repeating alphanumeric tokens' },
      { type: 'add', lineNew: 24, content: '+  return /^([a-zA-Z0-9]+)*$/.test(val);' },
      { type: 'context', lineOld: 24, lineNew: 25, content: '}' },
    ],
    finding: {
      severity: 'MEDIUM',
      category: 'PERFORMANCE',
      cwe: 'CWE-1333',
      file: 'src/utils/validator.ts',
      line: 24,
      message: 'Nested quantifiers `([a-zA-Z0-9]+)*` trigger exponential time complexity O(2^N) via catastrophic backtracking. An attacker can freeze the Node.js event loop with a crafted 30-char payload.',
      suggestion: 'Remove ambiguous nested repetition:\nreturn /^[a-zA-Z0-9]{3,64}$/.test(val);',
    },
  },
  {
    id: 'testing',
    title: 'Missing Boundary Test Coverage',
    file: 'src/services/billing.ts',
    badge: 'Coverage Gap',
    badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    hunkHeader: '@@ -8,4 +8,7 @@ export async function processRefund(amount: number, currency: string)',
    startLine: 8,
    diffLines: [
      { type: 'context', lineOld: 8, lineNew: 8, content: 'export async function processRefund(amount: number, currency: string) {' },
      { type: 'add', lineNew: 9, content: '+  if (amount <= 0) {' },
      { type: 'add', lineNew: 10, content: "+    throw new Error('Invalid refund amount');" },
      { type: 'add', lineNew: 11, content: '+  }' },
      { type: 'context', lineOld: 9, lineNew: 12, content: '  return stripe.refunds.create({ amount, currency });' },
      { type: 'context', lineOld: 10, lineNew: 13, content: '}' },
    ],
    finding: {
      severity: 'LOW',
      category: 'TESTING',
      cwe: 'Branch-Coverage',
      file: 'src/services/billing.ts',
      line: 9,
      message: 'New guard clause (amount <= 0) has 0% branch coverage in test suite. Negative or zero refund values are not asserted in billing.test.ts.',
      suggestion: '// Add test specification in src/services/billing.test.ts:\nit("rejects non-positive refund amounts", async () => {\n  await expect(processRefund(-10, "USD")).rejects.toThrow("Invalid refund amount");\n});',
    },
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'Prompt Injection Isolation',
    reviewPilot: 'Rigid XML <diff_content> boundary quarantine with strict delimiters',
    sonarqube: 'N/A (Rule-based AST only, no LLM semantic reasoning)',
    rawLLM: 'Vulnerable: PR diffs hijack conversational instructions',
  },
  {
    feature: 'Line-Level Anchor Precision',
    reviewPilot: 'Strict unified hunk mapping with exact line numbers & file paths',
    sonarqube: 'Static file line mapping (No PR context understanding)',
    rawLLM: 'Frequent hallucinations: invents line numbers outside diff',
  },
  {
    feature: 'Deterministic Output Validation',
    reviewPilot: 'Zod schema validation with automatic single-retry self-healing',
    sonarqube: 'Deterministic static analysis engine',
    rawLLM: 'Unpredictable markdown prose; breaks automated CI pipelines',
  },
  {
    feature: 'Auditable Feedback Loop',
    reviewPilot: 'Tracks developer acceptance & false-positive rate per review',
    sonarqube: 'Manual rule suppressions in config file',
    rawLLM: 'Zero memory: repeats identical false-positives across runs',
  },
  {
    feature: 'CI/CD Pipeline Latency',
    reviewPilot: 'Single-turn parallelized inference (p99 < 1.4s)',
    sonarqube: 'Local AST compile (fast, but misses semantic vulnerabilities)',
    rawLLM: 'Multi-turn conversational chat (15s–30s+ with high token cost)',
  },
];

export const Landing: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<SampleDiffPreset>(SAMPLE_PRESETS[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [acceptedState, setAcceptedState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'cli' | 'curl'>('github');

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-badge-wrap', { y: -20, opacity: 0, duration: 0.6 })
        .from('.hero-main-title', { y: 25, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('.hero-main-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-cta-btns', { y: 15, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.hero-micro-guarantee', { opacity: 0, duration: 0.4 }, '-=0.2')
        .from('.hero-studio-card', { y: 35, opacity: 0, duration: 0.8 }, '-=0.3');

      gsap.from('.stats-telemetry-bar', {
        scrollTrigger: {
          trigger: '#stats-bar',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.from('.matrix-table-wrap', {
        scrollTrigger: {
          trigger: '#comparison',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.cicd-studio-wrap', {
        scrollTrigger: {
          trigger: '#integration',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    { scope: containerRef }
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div ref={containerRef} className="text-zinc-100 min-h-screen">
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-mesh-dark">
        <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Live Engine Status Badge */}
            <div className="hero-badge-wrap flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Engine Live:</span>
                <span>Gemini 3.1 & Claude 3.5 Sonnet</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">p99 1.2s</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="hero-main-title text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Continuous Code Intelligence for{' '}
              <span className="gradient-text-accent block">
                High-Velocity Engineering
              </span>
            </h1>

            {/* Subheader */}
            <p className="hero-main-sub text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              ReviewPilot acts as an autonomous Principal Engineer on every pull request. We quarantine incoming diffs,
              parse syntax trees, and detect OWASP vulnerabilities, algorithmic traps, and uncovered edge cases with line-level AST accuracy.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-btns pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                id="hero-get-started-btn"
                className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-sm font-mono"
              >
                <span>Start Reviewing Free</span>
                <ArrowRight className="w-4 h-4 text-zinc-900" />
              </Link>
              <a
                href="#live-preview"
                className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-300 border border-zinc-800 transition-all flex items-center justify-center gap-2 font-mono"
              >
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span>Inspect Sample PR</span>
              </a>
            </div>

            {/* Micro Guarantees */}
            <div className="hero-micro-guarantee pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Prompt Injection Quarantined
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Zod Schema Validated
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Zero Credit Card Required
              </span>
            </div>
          </div>

          {/* ---------------- 2. INTERACTIVE GITHUB PR DIFF STUDIO ---------------- */}
          <div id="live-preview" className="hero-studio-card mt-14 max-w-5xl mx-auto">
            {/* Preset Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <GitPullRequest className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-zinc-200">Interactive PR Triage Demo:</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset);
                      setAcceptedState(null);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
                      activePreset.id === preset.id
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{preset.title.split(' ')[0]}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* GitHub-Styled PR Diff Container */}
            <div className="bg-[#090C10] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
              {/* GitHub PR Title Bar */}
              <div className="px-4 py-3 bg-[#0D1117] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2.5">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-zinc-500">|</span>
                  <div className="flex items-center space-x-1.5 text-zinc-300">
                    <span className="text-zinc-400">reviewpilot/core</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-white font-semibold">{activePreset.file}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                    <GitBranch className="w-3 h-3 text-indigo-400" />
                    <span>main</span>
                    <span className="text-zinc-600">←</span>
                    <span className="text-zinc-200">feat/auth-v2</span>
                  </span>
                  <button
                    onClick={() => handleCopy(activePreset.diffLines.map((l) => l.content).join('\n'))}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Diff'}</span>
                  </button>
                </div>
              </div>

              {/* Hunk Header */}
              <div className="px-4 py-1.5 bg-[#161B22]/80 border-b border-zinc-800/80 font-mono text-[11px] text-indigo-300/80">
                {activePreset.hunkHeader}
              </div>

              {/* Code Diff Lines with GitHub Line Gutter */}
              <div className="font-mono text-xs overflow-x-auto leading-relaxed select-text">
                {activePreset.diffLines.map((line, idx) => {
                  const isDel = line.type === 'del';
                  const isAdd = line.type === 'add';

                  return (
                    <div
                      key={idx}
                      className={`flex items-stretch ${
                        isDel
                          ? 'bg-rose-950/25 text-rose-300'
                          : isAdd
                          ? 'bg-emerald-950/25 text-emerald-300'
                          : 'text-zinc-400 hover:bg-zinc-900/40'
                      }`}
                    >
                      {/* Old Line Gutter */}
                      <div className="w-12 py-0.5 px-2 text-right select-none text-[11px] text-zinc-600 border-r border-zinc-800/50 bg-[#090C10]">
                        {line.lineOld || ''}
                      </div>
                      {/* New Line Gutter */}
                      <div className="w-12 py-0.5 px-2 text-right select-none text-[11px] text-zinc-600 border-r border-zinc-800/50 bg-[#090C10]">
                        {line.lineNew || ''}
                      </div>
                      {/* Marker */}
                      <div className="w-6 py-0.5 text-center select-none font-bold text-zinc-500">
                        {isDel ? '-' : isAdd ? '+' : ' '}
                      </div>
                      {/* Line Content */}
                      <div className="py-0.5 px-2 whitespace-pre flex-1">
                        {line.content.replace(/^[+-]\s{2}/, '  ')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inline Review Finding Box Anchored to Diff Line */}
              <div className="p-4 bg-[#0D1117] border-t border-zinc-800 font-sans">
                <div className="rounded-lg border border-zinc-800 bg-[#090C10] p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono text-[10px] font-bold">
                        RP
                      </div>
                      <span className="font-semibold text-xs text-white">ReviewPilot Automated Audit</span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-[11px] text-zinc-400">
                        line {activePreset.finding.line}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${activePreset.badgeColor}`}>
                        {activePreset.finding.severity} SEVERITY
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300">
                        {activePreset.finding.category} ({activePreset.finding.cwe})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                    {activePreset.finding.message}
                  </p>

                  {/* Remediation Snippet */}
                  <div className="rounded-md border border-zinc-800 bg-[#05070C] p-3 font-mono text-xs text-emerald-300 overflow-x-auto">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-sans font-semibold">
                      Suggested Fix:
                    </div>
                    <pre className="whitespace-pre-wrap">{activePreset.finding.suggestion}</pre>
                  </div>

                  {/* Real Developer Feedback Loop Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setAcceptedState('accepted')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition ${
                          acceptedState === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Accept Fix (True Positive)</span>
                      </button>
                      <button
                        onClick={() => setAcceptedState('fp')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition ${
                          acceptedState === 'fp'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dismiss (False Positive)</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500">
                      {acceptedState === 'accepted' ? (
                        <span className="text-emerald-400">✓ Feedback logged: Precision updated in telemetry</span>
                      ) : acceptedState === 'fp' ? (
                        <span className="text-amber-400">✓ Feedback logged: Rule suppression recorded</span>
                      ) : (
                        <span>Feedback calibrates team precision rate</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. FLOATING TELEMETRY METRIC BAR ---------------- */}
      <section id="stats-bar" className="py-12 border-y border-zinc-800 bg-[#090C10]">
        <div className="stats-telemetry-bar max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
            <div className="text-center sm:text-left sm:pl-2">
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                <GsapCounter value={99} suffix="%" duration={1.6} />
              </div>
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mt-1">
                AI Precision Rate
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Auditable developer acceptance</div>
            </div>

            <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                &lt; 1.2<span className="text-indigo-400">s</span>
              </div>
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mt-1">
                Review Latency
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Single-turn parallelized inference</div>
            </div>

            <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
                0.0<span className="text-emerald-400/80">%</span>
              </div>
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mt-1">
                Prompt Injection Leak
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Rigid XML isolation barrier</div>
            </div>

            <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                <GsapCounter value={100} suffix="%" duration={1.8} />
              </div>
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mt-1">
                Zod Determinism
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Automated schema self-healing</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 4. ARCHITECTURAL COMPARISON MATRIX ---------------- */}
      <section id="comparison" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Architectural Differentiation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why High-Velocity Teams Choose ReviewPilot Over Raw LLMs
          </h2>
          <p className="text-zinc-400 text-sm">
            Consumer chatbots hallucinate diff offsets and fail on prompt injection. ReviewPilot is engineered as a deterministic static & semantic analysis system.
          </p>
        </div>

        <div className="matrix-table-wrap overflow-x-auto rounded-xl border border-zinc-800 bg-[#090C10] shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#0D1117] text-zinc-400 font-mono uppercase text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Capability</th>
                <th className="py-3.5 px-4 font-bold text-white bg-indigo-950/20 border-x border-indigo-900/30">
                  ReviewPilot Engine
                </th>
                <th className="py-3.5 px-4 font-medium text-zinc-400">SonarQube / Snyk</th>
                <th className="py-3.5 px-4 font-medium text-zinc-400">Raw ChatGPT / Copilot Chat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white font-mono whitespace-nowrap">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-emerald-300 bg-indigo-950/15 border-x border-indigo-900/30 font-medium leading-relaxed">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{row.reviewPilot}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-zinc-400 leading-relaxed">
                    {row.sonarqube}
                  </td>
                  <td className="py-4 px-4 text-rose-400/90 leading-relaxed">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{row.rawLLM}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 5. FOUR CORE AUDIT VECTORS ---------------- */}
      <section id="features" className="py-20 border-t border-zinc-800 bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              Audit Vectors
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Surgical Precision Across Four Engineering Dimensions
            </h2>
            <p className="text-zinc-400 text-sm">
              Every pull request is scrutinized across security, performance, test synthesis, and clean architecture.
            </p>
          </div>

          <GsapStagger selector=".pillar-card" stagger={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Security */}
            <SpotlightCard
              spotlightColor="rgba(239, 68, 68, 0.15)"
              className="pillar-card p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 relative"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 font-mono">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Deep Security & CWE Auditing
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Catches SQL injection (CWE-89), IDOR broken authorization, hardcoded secrets, ReDoS, and insecure deserialization before merging into main.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-rose-400 flex items-center gap-1">
                <span>OWASP Top 10 Aligned</span>
              </div>
            </SpotlightCard>

            {/* Card 2: Performance */}
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.15)"
              className="pillar-card p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 relative"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 font-mono">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Performance & Latency Traps
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Flags O(N²) quadratic loops, unindexed relational queries, connection pool exhaustion, and unhandled Promise memory leaks.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-amber-400 flex items-center gap-1">
                <span>Sub-millisecond Optimization</span>
              </div>
            </SpotlightCard>

            {/* Card 3: Testing */}
            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.15)"
              className="pillar-card p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 relative"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 font-mono">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Branch Test Synthesis
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Detects untested branch edge cases and automatically generates ready-to-paste unit tests in Vitest, Jest, or PyTest.
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span>High-Branch Coverage</span>
              </div>
            </SpotlightCard>
          </GsapStagger>
        </div>
      </section>

      {/* ---------------- 6. CI/CD INTEGRATION STUDIO ---------------- */}
      <section id="integration" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
            Developer Integration
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Integrates in 60 Seconds with GitHub Actions
          </h2>
          <p className="text-zinc-400 text-sm">
            Drop into your CI workflow or invoke directly from the terminal with a single command.
          </p>
        </div>

        <div className="cicd-studio-wrap rounded-xl border border-zinc-800 bg-[#090C10] overflow-hidden shadow-2xl">
          {/* Studio Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D1117] border-b border-zinc-800 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('github')}
                className={`px-3 py-1 rounded text-xs transition ${
                  activeTab === 'github'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                .github/workflows/reviewpilot.yml
              </button>
              <button
                onClick={() => setActiveTab('cli')}
                className={`px-3 py-1 rounded text-xs transition ${
                  activeTab === 'cli'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                CLI Terminal
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 rounded text-xs transition ${
                  activeTab === 'curl'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                cURL / REST API
              </button>
            </div>

            <button
              onClick={() => {
                const code =
                  activeTab === 'github'
                    ? `name: ReviewPilot CI\non: [pull_request]\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: reviewpilot/action@v1\n        with:\n          github-token: \${{ secrets.GITHUB_TOKEN }}\n          fail-on: HIGH`
                    : activeTab === 'cli'
                    ? `npx reviewpilot audit --pr \${PR_NUMBER} --fail-on HIGH`
                    : `curl -X POST https://api.reviewpilot.dev/v1/reviews \\\n  -H "Authorization: Bearer \${API_KEY}" \\\n  -d '{"sourceType": "GITHUB_PR", "prUrl": "https://github.com/owner/repo/pull/42"}'`;
                handleCopy(code);
              }}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Terminal Code Body */}
          <div className="p-4 sm:p-6 font-mono text-xs overflow-x-auto leading-relaxed bg-[#05070C] text-zinc-300">
            {activeTab === 'github' && (
              <pre>
                <span className="text-zinc-500">name:</span> <span className="text-emerald-400">ReviewPilot Code Audit</span>{'\n'}
                <span className="text-zinc-500">on:</span> [pull_request]{'\n\n'}
                <span className="text-zinc-500">jobs:</span>{'\n'}
                {'  '}<span className="text-zinc-500">audit:</span>{'\n'}
                {'    '}<span className="text-zinc-500">runs-on:</span> ubuntu-latest{'\n'}
                {'    '}<span className="text-zinc-500">steps:</span>{'\n'}
                {'      '}- <span className="text-zinc-500">uses:</span> actions/checkout@v4{'\n'}
                {'      '}- <span className="text-zinc-500">uses:</span> reviewpilot/action@v1{'\n'}
                {'        '}<span className="text-zinc-500">with:</span>{'\n'}
                {'          '}<span className="text-zinc-400">github-token:</span> <span className="text-indigo-400">${'{{ secrets.GITHUB_TOKEN }}'}</span>{'\n'}
                {'          '}<span className="text-zinc-400">fail-on:</span> <span className="text-rose-400">HIGH</span>{'\n'}
                {'          '}<span className="text-zinc-400">precision-threshold:</span> <span className="text-emerald-400">95%</span>
              </pre>
            )}

            {activeTab === 'cli' && (
              <pre>
                <span className="text-zinc-500"># Audit local git diff against main branch</span>{'\n'}
                <span className="text-emerald-400">$</span> npx reviewpilot audit --branch main --fail-on HIGH{'\n\n'}
                <span className="text-zinc-500"># Output:</span>{'\n'}
                <span className="text-indigo-400">✓ AST Parsed (4 files, +42 -12 lines)</span>{'\n'}
                <span className="text-rose-400">✖ [HIGH] SQL Injection in src/services/auth.service.ts:16 (CWE-89)</span>{'\n'}
                <span className="text-zinc-400">ℹ Remediation generated. Exit code: 1</span>
              </pre>
            )}

            {activeTab === 'curl' && (
              <pre>
                <span className="text-emerald-400">curl</span> -X POST http://localhost:5000/api/v1/reviews \{'\n'}
                {'  '}-H <span className="text-indigo-300">"Authorization: Bearer $REVIEWPILOT_TOKEN"</span> \{'\n'}
                {'  '}-H <span className="text-indigo-300">"Content-Type: application/json"</span> \{'\n'}
                {'  '}-d <span className="text-amber-300">'{"{"}"sourceType": "DIFF", "diff": "..."{"}"}'</span>
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- 7. CALL TO ACTION ---------------- */}
      <section className="py-20 bg-[#090C10] border-t border-zinc-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Catch Critical Vulnerabilities Before Merge
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto">
            Audit unified diffs and GitHub Pull Requests in seconds with live Gemini 3.1 & Claude 3.5 Sonnet analysis.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              id="cta-bottom-register-btn"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition font-mono shadow-sm"
            >
              <span>Get Started Free — No Credit Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 8. FOOTER ---------------- */}
      <footer className="bg-[#05070C] border-t border-zinc-800/80 py-10 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-sm">ReviewPilot</span>
            <span>• AST & LLM Code Intelligence Engine</span>
          </div>
          <div className="flex items-center space-x-5">
            <a
              href="https://github.com/Raghunath2604/ReviewPilot"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link to="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-white transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
