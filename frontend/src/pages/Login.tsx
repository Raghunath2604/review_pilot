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
    <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div ref={loginRef} className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Context & Proof */}
        <div className="login-context-pane hidden lg:block lg:col-span-5 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
            <Code2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ReviewPilot Engine</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">
              Welcome back to precision code reviews.
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in to access your review dashboard, analyze pull requests, and track AI precision metrics.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200/80 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Isolated &lt;diff_content&gt; injection defense</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Auditable false-positive precision tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>GitHub REST API pull request integration</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Frosted Form */}
        <div className="login-card-pane lg:col-span-7">
          <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Sign in
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your credentials to access your code review workspace
                </p>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                id="login-error-alert"
                className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">{error}</p>
                  {apiStatus === 'disconnected' && (
                    <button
                      type="button"
                      onClick={() => setShowApiConfig(true)}
                      className="text-xs underline font-semibold text-rose-800 hover:text-rose-900"
                    >
                      Update API Endpoint Configuration &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="login-email-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
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
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
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
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="login-submit-btn"
                  data-testid="login-submit-btn"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
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
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus === 'connected'
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                      : apiStatus === 'checking'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="font-mono text-[11px] truncate max-w-[200px]">
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
                  className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="inline-flex items-center space-x-1 text-slate-400 hover:text-indigo-600 transition text-[11px]"
              >
                <Settings className="w-3 h-3" />
                <span>API Settings</span>
              </button>
            </div>

            {/* Collapsible API Endpoint Configuration */}
            {showApiConfig && (
              <form onSubmit={handleSaveApiHost} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                    Custom API Endpoint
                  </span>
                  <button
                    type="button"
                    onClick={handleResetApiHost}
                    className="text-indigo-600 hover:underline text-[11px]"
                  >
                    Reset Default
                  </button>
                </div>
                <input
                  type="url"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="https://your-api.trycloudflare.com"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowApiConfig(false)}
                    className="px-2.5 py-1 rounded text-slate-500 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500"
                  >
                    Save & Test
                  </button>
                </div>
              </form>
            )}

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  id="login-to-register-link"
                  className="font-bold text-indigo-600 hover:text-indigo-500"
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
