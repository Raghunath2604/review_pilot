import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, PlusCircle, LogOut, LayoutDashboard, Terminal, ArrowRight, GitPullRequest } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#090C10]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:border-zinc-700 transition-colors">
              <Code2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center space-x-2 font-mono">
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                ReviewPilot
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                v2.4
              </span>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gemini 3.1 & Claude</span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links for Unauthenticated Visitors */}
          {!user && (
            <div className="hidden md:flex items-center space-x-6 text-xs font-mono text-zinc-400">
              <a href="#live-preview" className="hover:text-white transition-colors flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interactive Diff</span>
              </a>
              <a href="#comparison" className="hover:text-white transition-colors">
                Comparison Matrix
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Audit Vectors
              </a>
              <a href="#integration" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>CI/CD</span>
              </a>
            </div>
          )}

          {/* Links & User Actions */}
          {user ? (
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <Link
                to="/"
                id="nav-dashboard-link"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
                  location.pathname === '/' || location.pathname === '/dashboard'
                    ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/new"
                id="nav-new-review-btn"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Review</span>
              </Link>

              <div className="h-4 w-px bg-zinc-800" />

              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-zinc-900/80 border border-zinc-800 rounded-md px-2.5 py-1 font-mono text-xs">
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[9px] flex items-center justify-center">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-zinc-300 max-w-[140px] truncate text-[11px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  id="nav-logout-btn"
                  title="Sign out"
                  className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5 font-mono text-xs">
              <Link
                to="/login"
                id="nav-login-link"
                className="px-3 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-link"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
