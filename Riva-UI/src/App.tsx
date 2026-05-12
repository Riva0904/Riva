import './App.scss';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getTheme, applyTheme } from './api/settings';
import AppLayout from './AppLayout';
import HomePage from './pages/Home-page/HomePage';
import AdminPage from './pages/Admin/AdminPage';
import UserDashboard from './pages/User/UserDashboard';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import CreateInvitationPage from './pages/Invitation/CreateInvitationPage';
import PublicInvitePage from './pages/Public/PublicInvitePage';
import SettingsPage from './pages/User/Settings/SettingsPage';
import PaymentPage from './pages/Payment/PaymentPage';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import TemplatesPage from './pages/Templates/TemplatesPage';

const USER_MODE_KEY = 'riva_theme_mode';

function App() {
  useEffect(() => {
    // 1. Apply admin gradient colors
    getTheme()
      .then(t => applyTheme(t.colorStart, t.colorEnd, t.gradientDir))
      .catch(() => {});

    // 2. Apply user's own dark/light preference (stored in localStorage)
    const userMode = (localStorage.getItem(USER_MODE_KEY) ?? 'light') as 'light' | 'dark';
    document.documentElement.setAttribute('data-theme', userMode);
  }, []);

  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"                 element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/templates"        element={<TemplatesPage />} />
        <Route path="/invite/:slug"     element={<PublicInvitePage />} />

        {/* ── Auth ── */}
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

        {/* ── User ── */}
        <Route path="/dashboard"        element={<UserDashboard />} />
<Route path="/settings"         element={<SettingsPage />} />

        {/* Invitation editor */}
        <Route path="/invitation/new/:templateId"    element={<CreateInvitationPage />} />
        <Route path="/invitation/:invitationId/edit" element={<CreateInvitationPage />} />

        {/* ── Payment & Subscription ── */}
        <Route path="/payment"          element={<PaymentPage />} />
        <Route path="/subscription"     element={<SubscriptionPage />} />

        {/* ── Admin ── */}
        <Route path="/admin"            element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
