import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';
import HomePage from './pages/Home-page/HomePage';
import AdminPage from './pages/Admin/AdminPage';
import UserDashboard from './pages/User/UserDashboard';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import CreateInvitationPage from './pages/Invitation/CreateInvitationPage';
import MyInvitationsPage from './pages/Invitation/MyInvitationsPage';
import PublicInvitePage from './pages/Public/PublicInvitePage';
import ProfilePage from './pages/User/Settings/ProfilePage';
import SettingsPage from './pages/User/Settings/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"                 element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/invite/:slug"     element={<PublicInvitePage />} />

        {/* ── Auth ── */}
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

        {/* ── User ── */}
        <Route path="/dashboard"        element={<UserDashboard />} />
        <Route path="/my-invitations"   element={<MyInvitationsPage />} />
        <Route path="/profile"          element={<ProfilePage />} />
        <Route path="/settings"         element={<SettingsPage />} />

        {/* Invitation editor */}
        <Route path="/invitation/new/:templateId"    element={<CreateInvitationPage />} />
        <Route path="/invitation/:invitationId/edit" element={<CreateInvitationPage />} />

        {/* ── Admin ── */}
        <Route path="/admin"            element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
