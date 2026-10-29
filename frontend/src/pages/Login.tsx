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
  CheckCircle2,
  Server,
  Settings,
  Sparkles,
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
        x: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.from('.login-card-pane', {
        x: 20,
        opacity: 0,
        duration: 0.6,
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

  const handleFillDemo = () => {
    setEmail('alex@reviewpilot.dev');
    setPassword('password123');
    setError(null);
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
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div ref={loginRef} className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Context */}
        <div className="login-context-pane hidden lg:block lg:col-span-5 space-y-5 font-mono">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
            <Code2 className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ReviewPilot Engineering</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
              Autonomous Code Intelligence
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              Sign in to triage unified diffs, inspect line-level security findings, and manage team acceptance precision.
            </p>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs text-zinc-400 font-mono">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>XML &lt;diff_content&gt; injection defense</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Zod self-healing deterministic schema</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Continuous false-positive tracking</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Form */}
        <div className="login-card-pane lg:col-span-7">
          <div className="rounded-xl border border-zinc-800 bg-[#090C10] p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  Sign in to ReviewPilot
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  Access your developer audit suite
                </p>
              </div>

              {/* 1-Click Demo Fill Button */}
              <button
                type="button"
                onClick={handleFillDemo}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white text-xs font-mono transition"
                title="Populate test account credentials"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Demo Account</span>
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                id="login-error-alert"
                className="flex items-start space-x-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
                <div className="space-y-1">
                  <p className="font-medium">{error}</p>
                  {apiStatus === 'disconnected' && (
                    <button
                      type="button"
                      onClick={() => setShowApiConfig(true)}
                      className="text-[11px] underline text-rose-300 hover:text-rose-200"
                    >
                      Update API Endpoint Configuration &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            <form className="space-y-4 font-mono text-xs" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  htmlFor="login-email-input"
                  className="block text-[11px] text-zinc-400 uppercase tracking-wider"
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
                  placeholder="alex@reviewpilot.dev"
                  className="block w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="login-password-input"
                  className="block text-[11px] text-zinc-400 uppercase tracking-wider"
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
                  className="block w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  id="login-submit-btn"
                  data-testid="login-submit-btn"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-md font-semibold text-zinc-950 bg-white hover:bg-zinc-200 disabled:opacity-50 transition shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live API Health & Config Bar */}
            <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    apiStatus === 'connected'
                      ? 'bg-emerald-400'
                      : apiStatus === 'checking'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-400'
                  }`}
                />
                <span>
                  API:{' '}
                  {apiStatus === 'connected'
                    ? 'Connected (v1)'
                    : apiStatus === 'checking'
                    ? 'Probing...'
                    : 'Disconnected'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="hover:text-zinc-300 transition flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>Endpoint config</span>
              </button>
            </div>

            {/* API Endpoint Modal / Expander */}
            {showApiConfig && (
              <form onSubmit={handleSaveApiHost} className="p-3 bg-zinc-900/80 rounded-md border border-zinc-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-indigo-400" />
                    <span>Backend Base URL</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetApiHost}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Reset
                  </button>
                </div>
                <input
                  type="text"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder="http://127.0.0.1:5000"
                  className="w-full bg-[#05070C] border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowApiConfig(false)}
                    className="px-2.5 py-0.5 rounded text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-0.5 rounded bg-zinc-800 text-white font-medium hover:bg-zinc-700"
                  >
                    Save & Test
                  </button>
                </div>
              </form>
            )}

            <div className="text-center font-mono text-xs text-zinc-500 pt-1">
              Need an account?{' '}
              <Link to="/register" className="text-white hover:underline font-semibold">
                Register free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
