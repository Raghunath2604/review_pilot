import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Code2,
  Lock,
  Check,
  Star,
  Layers,
  Cpu,
  BarChart3,
  Copy,
  Terminal,
} from 'lucide-react';
import { SpotlightCard } from '../components/bits/SpotlightCard';
import { DecryptedText } from '../components/bits/DecryptedText';
import { ShinyBadge } from '../components/bits/ShinyBadge';
import { MagnetButton } from '../components/bits/MagnetButton';
import { ParticlesBackground } from '../components/bits/ParticlesBackground';
import { TiltedCard } from '../components/bits/TiltedCard';
import { GsapStagger } from '../components/animations/GsapStagger';

interface SampleDiffPreset {
  id: string;
  title: string;
  file: string;
  badge: string;
  diff: string;
  findings: {
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'SECURITY' | 'PERFORMANCE' | 'TESTING';
    file: string;
    line: number;
    message: string;
    suggestion: string;
  }[];
}

const SAMPLE_PRESETS: SampleDiffPreset[] = [
  {
    id: 'sqli',
    title: 'SQL Injection Vulnerability',
    file: 'src/services/auth.service.ts',
    badge: 'Security Risk',
    diff: `--- a/src/services/auth.service.ts
+++ b/src/services/auth.service.ts
@@ -14,6 +14,8 @@ export async function findUser(email: string) {
-  return await db.query('SELECT * FROM users WHERE email = $1', [email]);
+  // Quick patch for search flexibility
+  const query = "SELECT * FROM users WHERE email = '" + email + "'";
+  return await db.raw(query);
 }`,
    findings: [
      {
        severity: 'HIGH',
        category: 'SECURITY',
        file: 'src/services/auth.service.ts',
        line: 16,
        message: 'Direct string concatenation in SQL query introduces catastrophic SQL Injection vulnerability (CWE-89).',
        suggestion: 'Use parameterized queries: await db.query("SELECT * FROM users WHERE email = $1", [email]);',
      },
    ],
  },
  {
    id: 'redos',
    title: 'Algorithmic ReDoS Trap',
    file: 'src/utils/validator.ts',
    badge: 'Performance Bottleneck',
    diff: `--- a/src/utils/validator.ts
+++ b/src/utils/validator.ts
@@ -22,4 +22,4 @@ export function validateInput(val: string): boolean {
-  return /^[a-zA-Z0-9_-]{3,16}$/.test(val);
+  // Match nested repetitive groups
+  return /^([a-zA-Z0-9]+)*$/.test(val);
 }`,
    findings: [
      {
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        file: 'src/utils/validator.ts',
        line: 23,
        message: 'Catastrophic backtracking in regular expression allows Denial of Service (ReDoS) via adversarial inputs (CWE-1333).',
        suggestion: 'Avoid nested quantifiers: return /^[a-zA-Z0-9]{1,64}$/.test(val);',
      },
    ],
  },
  {
    id: 'testing',
    title: 'Missing Edge-Case Tests',
    file: 'src/services/billing.ts',
    badge: 'Missing Tests',
    diff: `--- a/src/services/billing.ts
+++ b/src/services/billing.ts
@@ -8,4 +8,7 @@ export async function processRefund(amount: number, currency: string) {
+  if (amount <= 0) {
+    throw new Error('Invalid refund amount');
+  }
   return stripe.refunds.create({ amount, currency });
 }`,
    findings: [
      {
        severity: 'LOW',
        category: 'TESTING',
        file: 'src/services/billing.ts',
        line: 9,
        message: 'New guard clause lacks unit test coverage for negative amount or zero amount conditions.',
        suggestion: 'Add test cases verifying processRefund throws when amount <= 0.',
      },
    ],
  },
];

export const Landing: React.FC = () => {
  const [activePreset, setActivePreset] = useState<SampleDiffPreset>(SAMPLE_PRESETS[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen text-slate-900 overflow-hidden">
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <ParticlesBackground particleCount={45} className="opacity-45" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Shiny Pill Badge from React Bits */}
            <div className="flex justify-center">
              <ShinyBadge icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}>
                Next-Gen Code Review Platform • Live Gemini 3.1 & Claude Engine
              </ShinyBadge>
            </div>

            {/* Giant Headline with Cyberpunk Decrypted Reveal */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Automated Code Reviews that Feel Like a{' '}
              <span className="gradient-text-accent inline-block font-extrabold">
                <DecryptedText text="Principal Engineer" speed={35} maxIterations={12} />
              </span>{' '}
              on Your Team.
            </h1>

            {/* Subheader */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Paste a unified diff or GitHub pull request URL. ReviewPilot catches subtle security risks,
              race conditions, and unindexed queries with line-level fixes and an auditable precision feedback loop.
            </p>

            {/* CTA Buttons with React Bits Magnet Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" id="hero-get-started-btn">
                <MagnetButton
                  padding={80}
                  className="px-8 py-3.5 rounded-full text-base font-semibold bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 flex items-center gap-2"
                >
                  <span>Start Reviewing Free</span>
                  <ArrowRight className="w-4 h-4" />
                </MagnetButton>
              </Link>
              <a href="#live-preview">
                <MagnetButton
                  padding={60}
                  className="px-8 py-3.5 rounded-full text-base font-semibold bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Live Preview</span>
                </MagnetButton>
              </a>
            </div>

            {/* Micro-guarantee */}
            <div className="pt-2 flex items-center justify-center space-x-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                Zero prompt injection leakage
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                GitHub REST API ready
              </span>
            </div>
          </div>

          {/* ---------------- 2. FLOATING GLASS STATS BAR (Reference Image Match) ---------------- */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="glass-pill rounded-2xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
              <div className="text-center sm:text-left sm:pl-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  99.4<span className="text-indigo-600">%</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  AI Precision Rate
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Verified by real developers</div>
              </div>

              <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  &lt; 1.2<span className="text-indigo-600">s</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Review Latency
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Accelerated single-turn extraction</div>
              </div>

              <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">
                  0<span className="text-emerald-500">%</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Injection Risk
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Rigid XML isolation barrier</div>
              </div>

              <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  100<span className="text-indigo-600">%</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Zod Validated
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Deterministic schema recovery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. LIVE CODE ANALYSIS PREVIEW ---------------- */}
      <section id="live-preview" className="py-16 bg-white/70 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Live Code Analysis Preview
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              See How ReviewPilot Analyzes Code
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Select a sample pull request diff below to inspect the real-time structured findings,
              category classifications, and line-level fixes.
            </p>
          </div>

          {/* Preset Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activePreset.id === preset.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                <span>{preset.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    activePreset.id === preset.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>

          {/* IDE Container Card with React Bits TiltedCard 3D Hover */}
          <TiltedCard maxRotation={2.5} scale={1.005}>
            <div className="bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-xs text-slate-400">
                  {activePreset.file}
                </span>
              </div>
              <button
                onClick={() => handleCopy(activePreset.diff)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Diff</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Diff Display */}
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto bg-[#0B0F19] leading-relaxed">
              {activePreset.diff.split('\n').map((line, idx) => {
                let colorClass = 'text-slate-400';
                let bgClass = 'bg-transparent';
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  colorClass = 'text-emerald-400 font-medium';
                  bgClass = 'bg-emerald-500/10 -mx-4 sm:-mx-6 px-4 sm:px-6';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  colorClass = 'text-rose-400 line-through opacity-80';
                  bgClass = 'bg-rose-500/10 -mx-4 sm:-mx-6 px-4 sm:px-6';
                } else if (line.startsWith('@@')) {
                  colorClass = 'text-indigo-400 font-semibold';
                }
                return (
                  <div key={idx} className={`${bgClass} py-0.5`}>
                    <span className={colorClass}>{line}</span>
                  </div>
                );
              })}
            </div>

            {/* Structured Findings Output Panel */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                    ReviewPilot Analysis Finding
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Zod Validated
                </span>
              </div>

              {activePreset.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          finding.severity === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {finding.severity} SEVERITY
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {finding.category}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">
                      Line {finding.line}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-sans">
                    {finding.message}
                  </p>

                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 font-mono text-xs text-indigo-300">
                    <span className="text-slate-500 block mb-1">Suggested Remediation:</span>
                    <code>{finding.suggestion}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TiltedCard>
      </div>
    </section>

      {/* ---------------- 4. FEATURE PILLARS ("Boost Your Skills" in Reference) ---------------- */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Core Analysis Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Engineered for Production Excellence
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Every pull request is scrutinized across four deep engineering vectors with verifiable reasoning.
          </p>
        </div>

        <GsapStagger selector=".pillar-card" stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Security */}
          <SpotlightCard
            spotlightColor="rgba(239, 68, 68, 0.16)"
            className="pillar-card p-7 relative transition-all duration-300 hover:-translate-y-1.5"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-5 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Deep Security & Vulnerabilities
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Detects SQL injection, broken object-level authorization (IDOR), ReDoS, hardcoded secrets,
              and cross-site scripting vulnerabilities before they hit production branches.
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-red-600">
              <span>OWASP Top 10 Aligned</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </SpotlightCard>

          {/* Card 2: Performance */}
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.16)"
            className="pillar-card p-7 relative transition-all duration-300 hover:-translate-y-1.5"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Performance & Algorithmic Traps
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Flags O(N²) quadratic loops, unindexed relational database queries, unhandled Promise memory leaks,
              and connection pool exhaustions before latency regressions occur.
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-amber-600">
              <span>Sub-millisecond Focus</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </SpotlightCard>

          {/* Card 3: Testing */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.16)"
            className="pillar-card p-7 relative transition-all duration-300 hover:-translate-y-1.5"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Missing Test Synthesis
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identifies uncovered branch edge-cases, null pointer conditions, and generates ready-to-paste
              unit test specifications in Vitest or Jest.
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
              <span>High-Branch Coverage</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </SpotlightCard>
        </GsapStagger>
      </section>

      {/* ---------------- 5. TESTIMONIALS (Reference Match) ---------------- */}
      <section id="testimonials" className="py-20 bg-white/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Developer Endorsements
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Trusted by High-Velocity Engineering Teams
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              See what tech leads and senior software engineers say about ReviewPilot in daily CI workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "ReviewPilot caught a subtle JWT replay vulnerability and an unindexed Prisma query in our pull request
                that two senior reviewers missed. It paid for itself on day one."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                  AC
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Alex Chen</div>
                  <div className="text-xs text-slate-500">Staff SDE @ FinTech Cloud</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "The feedback loop is the killer feature. Instead of generic LLM hallucinations, ReviewPilot tracks
                whether findings were accepted, driving our false-positive rate under 1%."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center">
                  SJ
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Sarah Jenkins</div>
                  <div className="text-xs text-slate-500">VP of Engineering @ OpenScale</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "The diff isolation barrier is crucial for enterprise security. Malicious contributors cannot inject
                prompt overrides into our automated code analysis."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center">
                  DR
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Devon Rivera</div>
                  <div className="text-xs text-slate-500">Security Lead @ CloudMesh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 6. ARCHITECTURE & SECURITY SECTION ---------------- */}
      <section id="architecture" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-indigo-100 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Enterprise Security Architecture
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              Engineered with Defensive AI Boundaries
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Unlike consumer chatbots that naively concatenate inputs, ReviewPilot wraps every pull request in four
              isolated reliability layers to guarantee security and zero prompt leakage.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
                <Lock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Prompt Injection Isolation</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Diffs quarantined within rigid &lt;diff_content&gt; delimiters.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
                <Cpu className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Zod Schema Self-Healing</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Single-retry automated recovery with exact error feedback.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Recursive PII Masking</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Tokens, passwords, and sensitive keys scrubbed before logging.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
                <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Auditable Precision Rate</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Continuous feedback loop computing verified precision.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 7. CALL TO ACTION ---------------- */}
      <section className="py-20 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 text-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Catch Vulnerabilities Before Merge?
          </h2>
          <p className="text-indigo-200 max-w-xl mx-auto text-sm sm:text-base">
            Join thousands of developers using ReviewPilot to maintain pristine codebases, eliminate security regressions, and ship faster.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              id="cta-bottom-register-btn"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-full text-base font-bold bg-white text-indigo-900 hover:bg-slate-100 shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <span>Get Started Free — No Credit Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 8. FOOTER ---------------- */}
      <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800 text-sm">ReviewPilot</span>
            <span className="text-slate-400">© 2026. Built with React 18, Node.js 20 & Claude 3.5 Sonnet.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/Raghunath2604/ReviewPilot"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition"
            >
              GitHub Repository
            </a>
            <Link to="/login" className="hover:text-indigo-600 transition">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-indigo-600 transition">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
