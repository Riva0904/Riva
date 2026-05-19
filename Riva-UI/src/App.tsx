import './App.scss';
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { getTheme, applyTheme } from './api/settings';
import AppLayout from './AppLayout';

// Eagerly loaded — needed on first paint
import HomePage       from './pages/Home-page/HomePage';
import LoginPage      from './pages/Auth/LoginPage';
import RegisterPage   from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import PublicInvitePage   from './pages/Public/PublicInvitePage';

// Lazy loaded — only fetched when the user navigates there
const AdminPage          = lazy(() => import('./pages/Admin/AdminPage'));
const UserDashboard      = lazy(() => import('./pages/User/UserDashboard'));
const SettingsPage       = lazy(() => import('./pages/User/Settings/SettingsPage'));
const PaymentPage        = lazy(() => import('./pages/Payment/PaymentPage'));
const TemplatesPage      = lazy(() => import('./pages/Templates/TemplatesPage'));
const CreateInvitationPage = lazy(() => import('./pages/Invitation/CreateInvitationPage'));

const THEME_CACHE_KEY = 'riva_theme_cache';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="logo-icon text-2xl animate-pulse">R</div>
      <p className="text-sm text-slate-400 font-semibold">Loading…</p>
    </div>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [pathname]);
  return null;
}

function App() {
  useEffect(() => {
    getTheme()
      .then(t => {
        applyTheme(t.colorStart, t.colorEnd, t.gradientDir, undefined, t.gradientText ?? 'auto');
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(t));
      })
      .catch(() => {});

    const email = localStorage.getItem('riva_email');
    const mode  = ((email ? localStorage.getItem(`riva_theme_${email}`) : null) ?? 'light') as 'light' | 'dark';
    document.documentElement.setAttribute('data-theme', mode);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"            element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/templates"   element={<TemplatesPage />} />
          <Route path="/invite/:slug" element={<PublicInvitePage />} />

          {/* ── Auth ── */}
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── User ── */}
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/settings"  element={<SettingsPage />} />

          {/* ── Invitation ── */}
          <Route path="/invitation/new/:templateId"    element={<CreateInvitationPage />} />
          <Route path="/invitation/:invitationId/edit" element={<CreateInvitationPage />} />

          {/* ── Payment ── */}
          <Route path="/payment" element={<PaymentPage />} />

          {/* ── Admin ── */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
