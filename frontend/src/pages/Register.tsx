import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Code2,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const Register: React.FC = () => {
  const registerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useGSAP(
    () => {
      gsap.from('.register-context-pane', {
        x: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.from('.register-card-pane', {
        x: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
        ease: 'power3.out',
      });
    },
    { scope: registerRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div ref={registerRef} className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Context */}
        <div className="register-context-pane hidden lg:block lg:col-span-5 space-y-5 font-mono">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
            <Code2 className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Free Developer Tier</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
              Autonomous Code Reviews
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              Create an account to review raw unified diffs, inspect GitHub PRs, and build an auditable AI precision record.
            </p>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs text-zinc-400 font-mono">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Full access to Claude 3.5 & Gemini 3.1 analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Rate limited to 10 reviews/hour per user</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>100% private: Zero code training data retention</span>
            </div>
          </div>
        </div>

        {/* Right Column: Register Card */}
        <div className="register-card-pane lg:col-span-7">
          <div className="rounded-xl border border-zinc-800 bg-[#090C10] p-6 sm:p-8 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-white font-mono">
                Create an account
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Join ReviewPilot to review your first pull request in seconds
              </p>
            </div>

            {error && (
              <div
                id="register-error-alert"
                className="flex items-start space-x-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4 font-mono text-xs" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  htmlFor="register-email-input"
                  className="block text-[11px] text-zinc-400 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <input
                  id="register-email-input"
                  data-testid="register-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="block w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="register-password-input"
                  className="block text-[11px] text-zinc-400 uppercase tracking-wider"
                >
                  Password (min. 8 characters)
                </label>
                <input
                  id="register-password-input"
                  data-testid="register-password-input"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="register-confirm-password-input"
                  className="block text-[11px] text-zinc-400 uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password-input"
                  data-testid="register-confirm-password-input"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  id="register-submit-btn"
                  data-testid="register-submit-btn"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-md font-semibold text-zinc-950 bg-white hover:bg-zinc-200 disabled:opacity-50 transition shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center font-mono text-xs text-zinc-500 pt-1">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
