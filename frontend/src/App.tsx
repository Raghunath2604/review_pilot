import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewReview } from './pages/NewReview';
import { ReviewDetail } from './pages/ReviewDetail';
import { NotFound } from './pages/NotFound';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const HomeRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-slate-600 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold">Initializing ReviewPilot...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <Landing />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#FAF8FF] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Dynamic Home Route: Landing when logged out, Dashboard when logged in */}
                <Route path="/" element={<HomeRoute />} />

                {/* Direct Landing & Dashboard shortcuts */}
                <Route path="/landing" element={<Landing />} />

                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Dashboard & Review Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/new" element={<NewReview />} />
                  <Route path="/reviews/:id" element={<ReviewDetail />} />
                </Route>

                {/* Legacy/Deprecated Route Redirects */}
                <Route path="/video-ads" element={<Navigate to="/dashboard" replace />} />
                <Route path="/ads" element={<Navigate to="/dashboard" replace />} />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
