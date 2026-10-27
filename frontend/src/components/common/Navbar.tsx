import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, PlusCircle, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              ReviewPilot
            </span>
          </Link>

          {/* Links & User Actions */}
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                id="nav-dashboard-link"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/new"
                id="nav-new-review-btn"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm shadow-indigo-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Review</span>
              </Link>

              <div className="h-5 w-px bg-slate-800" />

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/60 max-w-[180px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  id="nav-logout-btn"
                  title="Sign out"
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
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
                className="px-3.5 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-link"
                className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
