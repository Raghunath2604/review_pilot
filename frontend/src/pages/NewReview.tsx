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
+}`;

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
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    },
    { scope: pageRef }
  );

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
    <div ref={pageRef} className="pb-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Dashboard</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300">New Review</span>
        </Link>

        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Execute Automated Code Review
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini 3.1 & Claude</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Paste unified git patches or GitHub PR links. Evaluated against OWASP Top 10, ReDoS, and test gaps.
          </p>
        </div>

        {/* Main Review Form Card */}
        <div className="new-review-box rounded-xl border border-zinc-800 bg-[#090C10] p-5 sm:p-6 space-y-5 shadow-xl">
          {error && (
            <div
              id="new-review-error-alert"
              className="flex items-start space-x-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Type Toggle */}
          <div className="space-y-1.5 font-mono text-xs">
            <label className="block text-[11px] text-zinc-400 uppercase tracking-wider">
              Input Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-w-sm">
              <button
                type="button"
                id="source-type-diff-btn"
                onClick={() => setSourceType('DIFF')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition border ${
                  sourceType === 'DIFF'
                    ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <FileDiff className="w-3.5 h-3.5" />
                <span>Unified Git Diff</span>
              </button>

              <button
                type="button"
                id="source-type-pr-btn"
                onClick={() => setSourceType('GITHUB_PR')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition border ${
                  sourceType === 'GITHUB_PR'
                    ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>GitHub Pull Request</span>
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {sourceType === 'DIFF' ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <label
                    htmlFor="diff-textarea"
                    className="block text-[11px] text-zinc-400 uppercase tracking-wider"
                  >
                    Unified Diff Payload
                  </label>

                  {/* 1-Click Sample Preset Buttons */}
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="text-zinc-500">Presets:</span>
                    <button
                      type="button"
                      id="load-sample-diff-btn"
                      data-testid="load-sample-diff-btn"
                      onClick={() => loadSampleDiff('jwt')}
                      className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
                    >
                      Vulnerable JWT
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleDiff('redos')}
                      className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
                    >
                      ReDoS Regex
                    </button>
                  </div>
                </div>

                {/* Diff Editor Container */}
                <div className="relative rounded-lg border border-zinc-800 bg-[#05070C] overflow-hidden font-mono">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-800 bg-[#0D1117] text-[11px] text-zinc-400">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>patch_input.diff</span>
                    </div>
                    <div>
                      {diffBytes > 0 ? (
                        <span className={isDiffTooLarge ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
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
                    className="block w-full font-mono text-xs p-3.5 bg-transparent text-emerald-300 placeholder-zinc-600 focus:outline-none leading-relaxed selection:bg-indigo-900 selection:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                <label
                  htmlFor="pr-url-input"
                  className="block text-[11px] text-zinc-400 uppercase tracking-wider"
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
                  className="block w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <p className="text-[11px] text-zinc-500">
                  ReviewPilot queries public pull request diffs via the GitHub API and isolates the patch in an XML quarantine boundary.
                </p>
              </div>
            )}

            {/* Custom AI Provider Configuration */}
            <div className="pt-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="inline-flex items-center space-x-1.5 text-zinc-400 hover:text-white transition"
              >
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom AI Provider API Key (Optional)</span>
                {showKeyConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showKeyConfig && (
                <div className="mt-2.5 p-3.5 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2 text-xs">
                  <p className="text-zinc-300 text-[11px]">
                    Enter your personal <strong>Anthropic Claude</strong> key (<code>sk-ant-...</code>) or <strong>Google Gemini</strong> key (<code>AIza...</code>):
                  </p>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="sk-ant-... or AIza..."
                    className="w-full bg-[#05070C] border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono text-emerald-300 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-500">
                    * If left empty, ReviewPilot defaults to the preconfigured backend system models.
                  </p>
                </div>
              )}
            </div>

            {/* Analysis Progress Stepper */}
            {isAnalyzing && (
              <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-900/40 space-y-2 font-mono text-xs">
                <div className="font-semibold text-indigo-300 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Executing Pipeline...</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className={`p-1.5 rounded border text-center transition ${analysisStep >= 1 ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-600 border-zinc-800'}`}>
                    1. Diff Quarantine
                  </div>
                  <div className={`p-1.5 rounded border text-center transition ${analysisStep >= 2 ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-600 border-zinc-800'}`}>
                    2. LLM Inference
                  </div>
                  <div className={`p-1.5 rounded border text-center transition ${analysisStep >= 3 ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-600 border-zinc-800'}`}>
                    3. Zod Self-Healing
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
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-mono font-semibold text-zinc-950 bg-white hover:bg-zinc-200 disabled:opacity-50 transition shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Code Changes...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
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
