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
  Sparkles,
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
        x: -30,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
      });
      gsap.from('.register-card-pane', {
        x: 30,
        opacity: 0,
        duration: 0.75,
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
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div ref={registerRef} className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Context */}
        <div className="register-context-pane hidden lg:block lg:col-span-5 space-y-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 p-0.5 shadow-[0_0_20px_-3px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center text-indigo-400">
              <Code2 className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Free Developer Tier</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white leading-snug">
              Start automated code reviews today.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create an account to review raw unified diffs, inspect GitHub PRs, and build an auditable AI precision record.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs text-slate-300">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full access to Claude 3.5 Sonnet analysis</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Rate limited to 10 reviews/hour per user</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% private: Zero data retention on code diffs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Register Card */}
        <div className="register-card-pane lg:col-span-7">
          <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Create an account
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Join ReviewPilot to review your first pull request in seconds
              </p>
            </div>

            {error && (
              <div
                id="register-error-alert"
                className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  htmlFor="register-email-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-400"
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
                  className="block w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="register-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-400"
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
                  className="block w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="register-confirm-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-400"
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
                  className="block w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="register-submit-btn"
                  data-testid="register-submit-btn"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition shadow-[0_0_25px_-3px_rgba(99,102,241,0.5)] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  id="register-to-login-link"
                  className="font-bold text-indigo-400 hover:text-indigo-300"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
