import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getApiHost, setCustomApiHost } from '../services/api';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Code2,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Server,
  RefreshCw,
  Settings,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Connection Health State
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customHost, setCustomHost] = useState(getApiHost());

  const { login } = useAuth();
  const navigate = useNavigate();
  const loginRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.login-context-pane', {
        x: -30,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
      });
      gsap.from('.login-card-pane', {
        x: 30,
        opacity: 0,
        duration: 0.75,
        delay: 0.1,
        ease: 'power3.out',
      });
    },
    { scope: loginRef }
  );

  const checkBackendHealth = async () => {
    setApiStatus('checking');
    try {
      await api.checkHealth();
      setApiStatus('connected');
    } catch {
      setApiStatus('disconnected');
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const handleSaveApiHost = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiHost(customHost);
    checkBackendHealth();
    setShowApiConfig(false);
  };

  const handleResetApiHost = () => {
    setCustomApiHost('');
    setCustomHost(import.meta.env.VITE_API_BASE_URL || '');
    setTimeout(checkBackendHealth, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div ref={loginRef} className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Context & Proof */}
        <div className="login-context-pane hidden lg:block lg:col-span-5 space-y-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 p-0.5 shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center text-indigo-400">
              <Code2 className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>ReviewPilot Studio</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-snug">
              Welcome back to precision code reviews.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in to access your review dashboard, analyze pull requests, and track AI precision metrics.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs text-slate-300">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Isolated &lt;diff_content&gt; injection defense</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Auditable false-positive precision tracking</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>GitHub REST API pull request integration</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Frosted Form */}
        <div className="login-card-pane lg:col-span-7">
          <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Sign in
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your credentials to access your code review workspace
                </p>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                id="login-error-alert"
                className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
                <div className="space-y-1">
                  <p className="font-medium">{error}</p>
                  {apiStatus === 'disconnected' && (
                    <button
                      type="button"
                      onClick={() => setShowApiConfig(true)}
                      className="text-xs underline font-semibold text-rose-300 hover:text-rose-200"
                    >
                      Update API Endpoint Configuration &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  Email Address
                </label>
                <input
                  id="login-email-input"
                  data-testid="login-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="block w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  Password
                </label>
                <input
                  id="login-password-input"
                  data-testid="login-password-input"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="login-submit-btn"
                  data-testid="login-submit-btn"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition shadow-[0_0_25px_-3px_rgba(99,102,241,0.5)] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live API Health & Config Bar */}
            <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus === 'connected'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : apiStatus === 'checking'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="font-mono text-[11px] truncate max-w-[200px] text-slate-300">
                  {apiStatus === 'connected'
                    ? 'API Live'
                    : apiStatus === 'checking'
                    ? 'Connecting API...'
                    : 'API Disconnected'}
                </span>
                <button
                  type="button"
                  onClick={checkBackendHealth}
                  title="Refresh API Connection"
                  className="text-slate-400 hover:text-white p-0.5 rounded transition"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="inline-flex items-center space-x-1 text-slate-400 hover:text-white transition text-[11px]"
              >
                <Settings className="w-3 h-3" />
                <span>API Settings</span>
              </button>
            </div>

            {/* Collapsible API Endpoint Configuration */}
            {showApiConfig && (
              <form onSubmit={handleSaveApiHost} className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Server className="w-3.5 h-3.5" />
                    Custom API Endpoint
                  </span>
                  <button
                    type="button"
                    onClick={handleResetApiHost}
                    className="text-indigo-400 hover:text-indigo-300 underline text-[11px]"
                  >
                    Reset Default
                  </button>
                </div>
                <input
                  type="url"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="https://your-api.trycloudflare.com"
                  className="w-full bg-[#05070C] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowApiConfig(false)}
                    className="px-2.5 py-1 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                  >
                    Save & Test
                  </button>
                </div>
              </form>
            )}

            <div className="text-center pt-1">
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  id="login-to-register-link"
                  className="font-bold text-indigo-400 hover:text-indigo-300"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
