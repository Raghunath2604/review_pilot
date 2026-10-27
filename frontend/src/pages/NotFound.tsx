import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="bg-[#FAF8FF] bg-mesh-radial min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center text-indigo-600 mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The page you are looking for does not exist or has been moved to another URL.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:from-indigo-500 hover:to-violet-500 transition shadow-md shadow-indigo-600/20 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
