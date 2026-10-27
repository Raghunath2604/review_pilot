import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  FileDiff,
  GitPullRequest,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowLeft,
  FileCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
 }`;

const MAX_DIFF_BYTES = 200 * 1024; // 200 KB

export const NewReview: React.FC = () => {
  const [sourceType, setSourceType] = useState<'DIFF' | 'GITHUB_PR'>('DIFF');
  const [diffText, setDiffText] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const navigate = useNavigate();

  const diffBytes = new Blob([diffText]).size;
  const isDiffTooLarge = diffBytes > MAX_DIFF_BYTES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceType === 'DIFF') {
      if (!diffText.trim()) {
        setError('Please paste a diff to review');
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

    setIsAnalyzing(true);

    try {
      const { review } = await api.createReview({
        sourceType,
        diff: sourceType === 'DIFF' ? diffText : undefined,
        prUrl: sourceType === 'GITHUB_PR' ? prUrl : undefined,
      });

      navigate(`/reviews/${review.id}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to submit review');
      setIsAnalyzing(false);
    }
  };

  const loadSampleDiff = () => {
    setSourceType('DIFF');
    setDiffText(SAMPLE_DIFF);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Create New Code Review</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Analyze code changes with Anthropic Claude for bugs, security risks, performance issues, and missing tests.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSampleDiff}
            id="load-sample-diff-btn"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition self-start sm:self-center"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Load Sample Vulnerable Diff</span>
          </button>
        </div>

        {error && (
          <div
            id="review-error-alert"
            className="mt-6 flex items-start space-x-2.5 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Source Tabs */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2">
              Select Diff Source
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="source-type-diff-btn"
                onClick={() => setSourceType('DIFF')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border text-sm font-medium transition ${
                  sourceType === 'DIFF'
                    ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-sm shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileDiff className="w-4 h-4 text-indigo-400" />
                <span>Paste Unified Diff</span>
              </button>

              <button
                type="button"
                id="source-type-github-btn"
                onClick={() => setSourceType('GITHUB_PR')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border text-sm font-medium transition ${
                  sourceType === 'GITHUB_PR'
                    ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-sm shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <GitPullRequest className="w-4 h-4 text-indigo-400" />
                <span>GitHub Pull Request</span>
              </button>
            </div>
          </div>

          {/* Conditional Input */}
          {sourceType === 'DIFF' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="diff-textarea"
                  className="block text-xs font-medium uppercase tracking-wider text-slate-300"
                >
                  Unified Diff Content
                </label>
                <span
                  className={`text-xs font-mono ${
                    isDiffTooLarge ? 'text-rose-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {(diffBytes / 1024).toFixed(1)} KB / 200 KB
                </span>
              </div>
              <textarea
                id="diff-textarea"
                data-testid="diff-textarea"
                rows={14}
                value={diffText}
                onChange={(e) => setDiffText(e.target.value)}
                placeholder="Paste unified git diff here (e.g. git diff main...feature)..."
                className="block w-full font-mono text-xs rounded-xl bg-slate-950 border border-slate-800 p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 leading-relaxed"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="pr-url-input"
                className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-2"
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
                className="block w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                ReviewPilot fetches public pull request diffs using the GitHub API with a 200 KB maximum limit.
              </p>
            </div>
          )}

          {/* Submit Action with Analysis State */}
          <div className="pt-2">
            <button
              type="submit"
              id="submit-review-btn"
              data-testid="submit-review-btn"
              disabled={isAnalyzing || (sourceType === 'DIFF' && isDiffTooLarge)}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing diff with Anthropic Claude & validating findings...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Automated Code Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
