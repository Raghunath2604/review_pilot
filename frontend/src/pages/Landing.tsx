import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Code2,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart3,
  Copy,
  Check,
  Sparkles,
  Terminal,
  Star,
} from 'lucide-react';
import { SpotlightCard } from '../components/bits/SpotlightCard';
import { DecryptedText } from '../components/bits/DecryptedText';
import { ParticlesBackground } from '../components/bits/ParticlesBackground';
import { ShinyBadge } from '../components/bits/ShinyBadge';
import { MagnetButton } from '../components/bits/MagnetButton';
import { TiltedCard } from '../components/bits/TiltedCard';
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
        message: 'Branch condition (amount <= 0) has 0% branch coverage in test suite.',
        suggestion: 'Add unit tests for zero and negative refund amounts: expect(() => processRefund(-5, "USD")).toThrow();',
      },
    ],
  },
];

export const Landing: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<SampleDiffPreset>(SAMPLE_PRESETS[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  useGSAP(
    () => {
      // 1. Hero entrance master timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-badge-wrap', { y: -25, opacity: 0, duration: 0.7 })
        .from('.hero-main-title', { y: 35, opacity: 0, duration: 0.8 }, '-=0.4')
        .from('.hero-main-sub', { y: 25, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-cta-btns', { scale: 0.92, y: 20, opacity: 0, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.3')
        .from('.hero-micro-guarantee', { opacity: 0, duration: 0.5 }, '-=0.2')
        .from('.hero-floating-stats', { y: 40, opacity: 0, duration: 0.8 }, '-=0.3');

      // 2. ScrollTrigger for Live Preview section
      gsap.from('.live-preview-content', {
        scrollTrigger: {
          trigger: '#live-preview',
          start: 'top 85%',
        },
        y: 45,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });

      // 3. ScrollTrigger for Testimonials
      gsap.from('.testimonial-card', {
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // 4. ScrollTrigger for Architecture
      gsap.from('.arch-card', {
        scrollTrigger: {
          trigger: '#architecture',
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 0.85,
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
    <div ref={containerRef} className="text-slate-100 min-h-screen overflow-hidden">
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-36 overflow-hidden">
        <ParticlesBackground particleCount={50} className="opacity-40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-7">
            {/* Shiny Pill Badge from React Bits */}
            <div className="hero-badge-wrap flex justify-center">
              <ShinyBadge icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}>
                Next-Gen Code Review Platform • Live Gemini 3.1 & Claude Engine
              </ShinyBadge>
            </div>

            {/* Giant Headline with Cyberpunk Decrypted Reveal */}
            <h1 className="hero-main-title text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Automated Code Reviews that Feel Like a{' '}
              <span className="gradient-text-accent inline-block font-black">
                <DecryptedText text="Principal Engineer" speed={35} maxIterations={12} />
              </span>{' '}
              on Your Team.
            </h1>

            {/* Subheader */}
            <p className="hero-main-sub text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Paste a unified diff or GitHub pull request URL. ReviewPilot catches subtle security risks,
              race conditions, and unindexed queries with line-level fixes and an auditable precision feedback loop.
            </p>

            {/* CTA Buttons with React Bits Magnet Button */}
            <div className="hero-cta-btns pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" id="hero-get-started-btn">
                <MagnetButton
                  padding={80}
                  className="px-8 py-4 rounded-full text-base font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_0_30px_-3px_rgba(99,102,241,0.6)] transition-all flex items-center gap-2"
                >
                  <span>Start Reviewing Free</span>
                  <ArrowRight className="w-4 h-4" />
                </MagnetButton>
              </Link>
              <a href="#live-preview">
                <MagnetButton
                  padding={60}
                  className="px-8 py-4 rounded-full text-base font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] shadow-lg transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Live Preview</span>
                </MagnetButton>
              </a>
            </div>

            {/* Micro-guarantee */}
            <div className="hero-micro-guarantee pt-3 flex items-center justify-center space-x-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                Zero prompt injection leakage
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                GitHub REST API ready
              </span>
            </div>
          </div>

          {/* ---------------- 2. FLOATING GLASS STATS BAR ---------------- */}
          <div className="hero-floating-stats mt-16 max-w-5xl mx-auto">
            <div className="glass-pill rounded-3xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
              <div className="text-center sm:text-left sm:pl-2">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  <GsapCounter value={99} suffix="%" duration={1.6} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                  AI Precision Rate
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Verified by real developers</div>
              </div>

              <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  &lt; 1.2<span className="text-indigo-400">s</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Review Latency
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Accelerated single-turn extraction</div>
              </div>

              <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                  0<span className="text-emerald-400/80">%</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Injection Risk
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Rigid XML isolation barrier</div>
              </div>

              <div className="text-center sm:text-left sm:pl-6 pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  <GsapCounter value={100} suffix="%" duration={1.8} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Zod Validated
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Deterministic schema recovery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. LIVE CODE ANALYSIS PREVIEW ---------------- */}
      <section id="live-preview" className="py-20 bg-slate-950/60 border-y border-white/[0.08] backdrop-blur-md">
        <div className="live-preview-content max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Live Code Analysis Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              See How ReviewPilot Analyzes Code
            </h2>
            <p className="text-sm text-slate-400 mt-2">
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
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/40'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span>{preset.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    activePreset.id === preset.id
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>

          {/* IDE Container Card with React Bits TiltedCard 3D Hover */}
          <TiltedCard maxRotation={2.5} scale={1.005}>
            <div className="bg-[#05070C] rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] border border-slate-800 overflow-hidden text-slate-200">
              {/* Window Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
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
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
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
              <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto bg-[#070A10] leading-relaxed">
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
              <div className="bg-slate-900/90 border-t border-slate-800 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                      ReviewPilot Analysis Finding
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Zod Validated
                  </span>
                </div>

                {activePreset.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="bg-[#05070C] rounded-2xl p-4 sm:p-5 border border-slate-800/90 space-y-3 shadow-inner"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            finding.severity === 'HIGH'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {finding.severity} SEVERITY
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {finding.category}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        Line {finding.line}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
                      {finding.message}
                    </p>

                    <div className="bg-[#0B0F19] rounded-xl p-3 border border-slate-800 font-mono text-xs text-indigo-300">
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

      {/* ---------------- 4. FEATURE PILLARS ---------------- */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Core Analysis Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            Engineered for Production Excellence
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Every pull request is scrutinized across four deep engineering vectors with verifiable reasoning.
          </p>
        </div>

        <GsapStagger selector=".pillar-card" stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Security */}
          <SpotlightCard
            spotlightColor="rgba(239, 68, 68, 0.22)"
            className="pillar-card p-8 rounded-3xl relative transition-all duration-300 hover:-translate-y-1.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Deep Security & Vulnerabilities
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Detects SQL injection, broken object-level authorization (IDOR), ReDoS, hardcoded secrets,
              and cross-site scripting vulnerabilities before they hit production branches.
            </p>
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center text-xs font-semibold text-red-400">
              <span>OWASP Top 10 Aligned</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </SpotlightCard>

          {/* Card 2: Performance */}
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.22)"
            className="pillar-card p-8 rounded-3xl relative transition-all duration-300 hover:-translate-y-1.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Performance & Algorithmic Traps
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Flags O(N²) quadratic loops, unindexed relational database queries, unhandled Promise memory leaks,
              and connection pool exhaustions before latency regressions occur.
            </p>
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center text-xs font-semibold text-amber-400">
              <span>Sub-millisecond Focus</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </SpotlightCard>

          {/* Card 3: Testing */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.22)"
            className="pillar-card p-8 rounded-3xl relative transition-all duration-300 hover:-translate-y-1.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Missing Test Synthesis
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Identifies uncovered branch edge-cases, null pointer conditions, and generates ready-to-paste
              unit test specifications in Vitest or Jest.
            </p>
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center text-xs font-semibold text-emerald-400">
              <span>High-Branch Coverage</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </SpotlightCard>
        </GsapStagger>
      </section>

      {/* ---------------- 5. TESTIMONIALS ---------------- */}
      <section id="testimonials" className="py-24 bg-slate-950/60 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Developer Endorsements
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Trusted by High-Velocity Engineering Teams
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              See what tech leads and senior software engineers say about ReviewPilot in daily CI workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="testimonial-card glass-card rounded-3xl p-7 space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "ReviewPilot caught a subtle JWT replay vulnerability and an unindexed Prisma query in our pull request
                that two senior reviewers missed. It paid for itself on day one."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  AC
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Alex Chen</div>
                  <div className="text-xs text-slate-400">Staff SDE @ FinTech Cloud</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass-card rounded-3xl p-7 space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "The feedback loop is the killer feature. Instead of generic LLM hallucinations, ReviewPilot tracks
                whether findings were accepted, driving our false-positive rate under 1%."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  SJ
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Sarah Jenkins</div>
                  <div className="text-xs text-slate-400">VP of Engineering @ OpenScale</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card glass-card rounded-3xl p-7 space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "The diff isolation barrier is crucial for enterprise security. Malicious contributors cannot inject
                prompt overrides into our automated code analysis."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  DR
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Devon Rivera</div>
                  <div className="text-xs text-slate-400">Security Lead @ CloudMesh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 6. ARCHITECTURE & SECURITY SECTION ---------------- */}
      <section id="architecture" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="arch-card glass-card rounded-3xl p-8 sm:p-12 border border-indigo-500/30 shadow-[0_0_40px_-5px_rgba(99,102,241,0.2)] relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Enterprise Security Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Engineered with Defensive AI Boundaries
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
              Unlike consumer chatbots that naively concatenate inputs, ReviewPilot wraps every pull request in four
              isolated reliability layers to guarantee security and zero prompt leakage.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
                <Lock className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-white">Prompt Injection Isolation</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Diffs quarantined within rigid &lt;diff_content&gt; delimiters.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
                <Cpu className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-white">Zod Schema Self-Healing</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Single-retry automated recovery with exact error feedback.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-white">Recursive PII Masking</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Tokens, passwords, and sensitive keys scrubbed before logging.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
                <BarChart3 className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs text-white">Auditable Precision Rate</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Continuous feedback loop computing verified precision.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 7. CALL TO ACTION ---------------- */}
      <section className="py-24 bg-gradient-to-tr from-indigo-950 via-slate-900 to-slate-950 text-white relative border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Ready to Catch Vulnerabilities Before Merge?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Join thousands of developers using ReviewPilot to maintain pristine codebases, eliminate security regressions, and ship faster.
          </p>
          <div className="pt-3">
            <Link
              to="/register"
              id="cta-bottom-register-btn"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-full text-base font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_0_30px_-3px_rgba(99,102,241,0.6)] transition-all hover:scale-105 active:scale-95"
            >
              <span>Get Started Free — No Credit Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 8. FOOTER ---------------- */}
      <footer className="bg-[#05070C] border-t border-white/[0.08] py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-sm">ReviewPilot</span>
            <span className="text-slate-500">© 2026. Built with React 18, Node.js 20 & Claude 3.5 Sonnet.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/Raghunath2604/ReviewPilot"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              GitHub Repository
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
