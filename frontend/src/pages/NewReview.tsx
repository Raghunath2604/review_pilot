import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  FileDiff,
  GitPullRequest,
  AlertCircle,
  Loader2,
  Zap,
  ArrowLeft,
  Sparkles,
  Terminal,
  Key,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const SAMPLE_DIFF = `diff --git a/src/auth/jwt.service.ts b/src/auth/jwt.service.ts
--- a/src/auth/jwt.service.ts
+++ b/src/auth/jwt.service.ts
@@ -20,4 +20,10 @@ export function verifyToken(token: string): Payload {
-  return jwt.verify(token, process.env.JWT_SECRET!);
+  // Insecure algorithm "none" bypass risk
+  const decoded = jwt.decode(token);
+  if (decoded.header.alg === 'none') {
+    return decoded.payload;
+  }
+  
+  for (let i = 0; i < 1000; i++) {
+    for (let j = 0; j < 1000; j++) {
+      // Inefficient nested check
+    }
+  }
+  return payload;
+}`;

const SAMPLE_REDOS = `diff --git a/src/utils/parser.ts b/src/utils/parser.ts
--- a/src/utils/parser.ts
+++ b/src/utils/parser.ts
@@ -15,3 +15,3 @@ export function sanitizeInput(input: string): string {
-  return input.trim();
+  // Catastrophic nested regex backtracking
+  return input.replace(/([a-zA-Z0-9]+)+$/, '');
 }`;

const MAX_DIFF_BYTES = 200 * 1024; // 200 KB

export const NewReview: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [sourceType, setSourceType] = useState<'DIFF' | 'GITHUB_PR'>('DIFF');
  const [diffText, setDiffText] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);

  useGSAP(
    () => {
      gsap.from('.new-review-box', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
      });
    },
    { scope: pageRef }
  );

  // Optional custom AI key configuration
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('reviewpilot_custom_llm_key') || ''
      : ''
  );

  const navigate = useNavigate();

  const diffBytes = new TextEncoder().encode(diffText).length;
  const isDiffTooLarge = diffBytes > MAX_DIFF_BYTES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceType === 'DIFF') {
      if (!diffText.trim()) {
        setError('Please enter a unified diff to analyze.');
        return;
      }
      if (isDiffTooLarge) {
        setError('Diff exceeds the 200 KB payload limit. Please trim the changes.');
        return;
      }
    } else {
      if (!prUrl.trim()) {
        setError('Please enter a valid GitHub pull request URL.');
        return;
      }
      const prRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/;
      if (!prRegex.test(prUrl.trim())) {
        setError('Invalid GitHub Pull Request URL. Format: https://github.com/owner/repo/pull/123');
        return;
      }
    }

    // Save key in localStorage if user entered one
    if (typeof window !== 'undefined') {
      if (customApiKey.trim()) {
        localStorage.setItem('reviewpilot_custom_llm_key', customApiKey.trim());
      } else {
        localStorage.removeItem('reviewpilot_custom_llm_key');
      }
    }

    setIsAnalyzing(true);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const { review } = await api.createReview({
        sourceType,
        diff: sourceType === 'DIFF' ? diffText : undefined,
        prUrl: sourceType === 'GITHUB_PR' ? prUrl : undefined,
        apiKey: customApiKey.trim() || undefined,
      });

      clearInterval(stepInterval);
      navigate(`/reviews/${review.id}`);
    } catch (err) {
      clearInterval(stepInterval);
      setError((err as Error).message || 'Failed to submit review');
      setIsAnalyzing(false);
    }
  };

  const loadSampleDiff = (type: 'jwt' | 'redos') => {
    setSourceType('DIFF');
    if (type === 'jwt') {
      setDiffText(SAMPLE_DIFF);
    } else {
      setDiffText(SAMPLE_REDOS);
    }
    setError(null);
  };

  return (
    <div ref={pageRef} className="pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              New Automated Code Review
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Engine</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit unified git diffs or public GitHub pull requests to detect vulnerabilities, performance bottlenecks, and missing tests.
          </p>
        </div>

        {/* Main Review Form Card */}
        <div className="new-review-box glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          {error && (
            <div
              id="new-review-error-alert"
              className="flex items-start space-x-2.5 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Type Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Input Method
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                id="source-type-diff-btn"
                onClick={() => setSourceType('DIFF')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
                  sourceType === 'DIFF'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <FileDiff className="w-4 h-4" />
                <span>Unified Git Diff</span>
              </button>

              <button
                type="button"
                id="source-type-pr-btn"
                onClick={() => setSourceType('GITHUB_PR')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
                  sourceType === 'GITHUB_PR'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <GitPullRequest className="w-4 h-4" />
                <span>GitHub Pull Request</span>
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {sourceType === 'DIFF' ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="diff-textarea"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-400"
                  >
                    Paste Unified Diff
                  </label>

                  {/* 1-Click Sample Preset Buttons */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-500 font-medium">Load sample:</span>
                    <button
                      type="button"
                      id="load-sample-diff-btn"
                      data-testid="load-sample-diff-btn"
                      onClick={() => loadSampleDiff('jwt')}
                      className="px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 font-semibold transition"
                    >
                      Vulnerable JWT
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleDiff('redos')}
                      className="px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 font-semibold transition"
                    >
                      ReDoS Regex
                    </button>
                  </div>
                </div>

                {/* Diff Editor Container */}
                <div className="relative rounded-2xl border border-slate-800 bg-[#05070C] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>unified.patch</span>
                    </div>
                    <div className="text-[11px]">
                      {diffBytes > 0 ? (
                        <span className={isDiffTooLarge ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {(diffBytes / 1024).toFixed(1)} KB / 200 KB
                        </span>
                      ) : (
                        <span>0 KB</span>
                      )}
                    </div>
                  </div>

                  <textarea
                    id="diff-textarea"
                    data-testid="diff-textarea"
                    rows={12}
                    value={diffText}
                    onChange={(e) => setDiffText(e.target.value)}
                    placeholder="Paste unified git diff here (e.g. diff --git a/... b/...)..."
                    className="block w-full font-mono text-xs p-4 bg-transparent text-emerald-300 placeholder-slate-600 focus:outline-none leading-relaxed selection:bg-indigo-600"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="pr-url-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  GitHub Pull Request URL
                </label>
                <input
                  id="pr-url-input"
                  data-testid="pr-url-input"
                  type="url"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/facebook/react/pull/28000"
                  className="block w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
                <p className="text-xs text-slate-400">
                  ReviewPilot fetches public pull request diffs via the GitHub REST API and parses unified patches.
                </p>
              </div>
            )}

            {/* Optional Custom AI Provider Configuration */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom AI Provider API Key (Optional)</span>
                {showKeyConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showKeyConfig && (
                <div className="mt-3 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-2 text-xs">
                  <p className="text-slate-300">
                    Enter your personal <strong>Anthropic Claude</strong> key (<code>sk-ant-...</code>) or <strong>Google Gemini</strong> key (<code>AIza...</code>) to execute real-time live model inference:
                  </p>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="sk-ant-... or AIza..."
                    className="w-full bg-[#05070C] border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    * If left empty, ReviewPilot uses the preconfigured system engine and defensive AST rules.
                  </p>
                </div>
              )}
            </div>

            {/* Analysis Progress Stepper */}
            {isAnalyzing && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2.5 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Executing AI Analysis Pipeline...</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold">
                  <div className={`p-2 rounded-xl border text-center transition-all ${analysisStep >= 1 ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'text-slate-500 border-white/[0.08] bg-white/[0.02]'}`}>
                    1. Diff Quarantining
                  </div>
                  <div className={`p-2 rounded-xl border text-center transition-all ${analysisStep >= 2 ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'text-slate-500 border-white/[0.08] bg-white/[0.02]'}`}>
                    2. LLM Inference
                  </div>
                  <div className={`p-2 rounded-xl border text-center transition-all ${analysisStep >= 3 ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'text-slate-500 border-white/[0.08] bg-white/[0.02]'}`}>
                    3. Zod Validation
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                id="submit-review-btn"
                data-testid="submit-review-btn"
                disabled={isAnalyzing || (sourceType === 'DIFF' && isDiffTooLarge)}
                className="w-full flex justify-center items-center space-x-2 py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all shadow-[0_0_25px_-3px_rgba(99,102,241,0.5)] active:scale-[0.99]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Code Changes...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Start Automated Code Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
