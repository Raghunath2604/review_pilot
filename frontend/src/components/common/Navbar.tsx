import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, PlusCircle, LogOut, LayoutDashboard, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 p-0.5 shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  ReviewPilot
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AI
                </span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links for Unauthenticated Visitors */}
          {!user && (
            <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <a href="#live-preview" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Live Preview</span>
              </a>
              <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
              <a href="#architecture" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Security</span>
              </a>
            </div>
          )}

          {/* Links & User Actions */}
          {user ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                to="/"
                id="nav-dashboard-link"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/' || location.pathname === '/dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/new"
                id="nav-new-review-btn"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 transition shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Review</span>
              </Link>

              <div className="h-5 w-px bg-slate-200" />

              <div className="flex items-center space-x-2.5">
                <div className="hidden sm:flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-700 max-w-[150px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  id="nav-logout-btn"
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                id="nav-login-link"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-link"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
