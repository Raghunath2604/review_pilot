import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  FileDiff,
  GitPullRequest,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowLeft,
  Zap,
  Terminal,
  Key,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SAMPLE_DIFF = `diff --git a/src/auth/jwt.ts b/src/auth/jwt.ts
index 83a21b..49ef12 100644
--- a/src/auth/jwt.ts
+++ b/src/auth/jwt.ts
@@ -10,6 +10,14 @@ export function verifyToken(token: string) {
+  // Hardcoded fallback secret for testing
+  const secret = process.env.JWT_SECRET || "insecure-default-secret-key-123";
+  
+  // Missing expiration and algorithm verification
+  const payload = eval("(" + token + ")");
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
  const [sourceType, setSourceType] = useState<'DIFF' | 'GITHUB_PR'>('DIFF');
  const [diffText, setDiffText] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(1);

  // Optional custom AI key configuration
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('reviewpilot_custom_llm_key') || ''
      : ''
  );

  const navigate = useNavigate();

  const diffBytes = new Blob([diffText]).size;
  const isDiffTooLarge = diffBytes > MAX_DIFF_BYTES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceType === 'DIFF') {
      if (!diffText.trim()) {
        setError('Please paste a git diff to review');
        return;
      }
      if (isDiffTooLarge) {
        setError('Diff exceeds the 200 KB maximum size limit.');
        return;
      }
    } else {
      if (!prUrl.trim() || !prUrl.includes('github.com')) {
        setError('Please enter a valid GitHub Pull Request URL');
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
    <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen text-slate-900 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              New Code Review
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AI Engine</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Submit unified git diffs or public GitHub pull requests to detect vulnerabilities, performance bottlenecks, and missing tests.
          </p>
        </div>

        {/* Main Review Form Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {error && (
            <div
              id="new-review-error-alert"
              className="flex items-start space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Type Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Input Method
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                id="source-type-diff-btn"
                onClick={() => setSourceType('DIFF')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                  sourceType === 'DIFF'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileDiff className="w-4 h-4" />
                <span>Unified Git Diff</span>
              </button>

              <button
                type="button"
                id="source-type-pr-btn"
                onClick={() => setSourceType('GITHUB_PR')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition border ${
                  sourceType === 'GITHUB_PR'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    Paste Unified Diff
                  </label>

                  {/* 1-Click Sample Preset Buttons */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 font-medium">Load sample:</span>
                    <button
                      type="button"
                      onClick={() => loadSampleDiff('jwt')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition"
                    >
                      Vulnerable JWT
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSampleDiff('redos')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition"
                    >
                      ReDoS Regex
                    </button>
                  </div>
                </div>

                {/* Diff Editor Container */}
                <div className="relative rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-400">
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
                    className="block w-full font-mono text-xs p-4 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="pr-url-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
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
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                  ReviewPilot fetches public pull request diffs via the GitHub REST API and parses unified patches.
                </p>
              </div>
            )}

            {/* Optional Custom AI Provider Configuration */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
              >
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span>Custom AI Provider API Key (Optional)</span>
                {showKeyConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showKeyConfig && (
                <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <p className="text-slate-600">
                    Enter your personal <strong>Anthropic Claude</strong> key (<code>sk-ant-...</code>) or <strong>Google Gemini</strong> key (<code>AIza...</code>) to execute real-time live model inference:
                  </p>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="sk-ant-... or AIza..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    * If left empty, ReviewPilot uses the preconfigured system engine and defensive AST rules.
                  </p>
                </div>
              )}
            </div>

            {/* Analysis Progress Stepper */}
            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 space-y-2.5">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Executing AI Analysis Pipeline...</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold">
                  <div className={`p-2 rounded-lg border ${analysisStep >= 1 ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm' : 'text-slate-400 border-slate-200'}`}>
                    1. Diff Quarantining
                  </div>
                  <div className={`p-2 rounded-lg border ${analysisStep >= 2 ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm' : 'text-slate-400 border-slate-200'}`}>
                    2. LLM Inference
                  </div>
                  <div className={`p-2 rounded-lg border ${analysisStep >= 3 ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm' : 'text-slate-400 border-slate-200'}`}>
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
                className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
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
