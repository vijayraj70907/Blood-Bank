import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import Chatbot from './components/Chatbot';

// Pages
import LandingPage from './pages/Landing/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/auth/AuthPages';
import AdminPortal from './pages/admin/AdminPortal';
import DonorPortal from './pages/donor/DonorPortal';
import PatientPortal from './pages/patient/PatientPortal';
import SuperAdminPortal from './pages/superadmin/SuperAdminPortal';

/* ─── Loading Screen ─── */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-red-lg">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" className="blood-drop">
            <path d="M20 2C20 2 4 20 4 30C4 39.4 11.2 46 20 46C28.8 46 36 39.4 36 30C36 20 20 2 20 2Z"
              fill="url(#ld)" />
            <defs><linearGradient id="ld" x1="20" y1="2" x2="20" y2="46"><stop stopColor="#ff6b6b" /><stop offset="1" stopColor="#fff" /></linearGradient></defs>
          </svg>
        </div>
      </div>
      <p className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
        Blood<span className="text-primary-600">Bridge</span>
      </p>
      <p className="text-gray-500 text-sm mb-4">Save Lives Through Blood Donation</p>
      <div className="spinner" />
    </div>
  );
}

/* ─── Public Layout ─── */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-0">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}

/* ─── Protected Route ─── */
function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

/* ─── Not Found ─── */
function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-center p-4">
      <div className="text-9xl font-display font-black text-primary-100 dark:text-primary-950">404</div>
      <div className="text-8xl -mt-10">🩸</div>
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h1>
      <p className="text-gray-500 mt-2 max-w-sm">The page you're looking for doesn't exist. Let's get you back to saving lives!</p>
      <a href="/" className="btn-primary mt-6">Go Home</a>
    </div>
  );
}

/* ─── App ─── */
function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/contact" element={<LandingPage />} />
        <Route path="/blood-banks" element={<LandingPage />} />
        <Route path="/donate" element={<LandingPage />} />
        <Route path="/search" element={<LandingPage />} />
        <Route path="/emergency" element={<LandingPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Dashboard */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/*" element={<AdminPortal />} />
        </Route>
      </Route>

      {/* Donor Dashboard */}
      <Route element={<ProtectedRoute roles={['donor']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/donor/*" element={<DonorPortal />} />
        </Route>
      </Route>

      {/* Patient Dashboard */}
      <Route element={<ProtectedRoute roles={['patient']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/patient/*" element={<PatientPortal />} />
        </Route>
      </Route>

      {/* Super Admin Dashboard */}
      <Route element={<ProtectedRoute roles={['superadmin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/superadmin/*" element={<SuperAdminPortal />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--card-bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#d63031', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
