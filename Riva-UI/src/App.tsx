import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout';
import HomePage from './pages/Home-page/HomePage';
import AdminPage from './pages/Admin/AdminPage';
import UserDashboard from './pages/User/UserDashboard';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin"     element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
