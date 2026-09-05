import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/Home';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';

import BettingPage from '@/pages/Betting';
import AccountPage from '@/pages/Account';
import HistoryPage from '@/pages/History';
import SupportPage from '@/pages/Support';
import TransactionPage from '@/pages/Transaction';
import NotFoundPage from '@/pages/404';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import { Toaster } from 'sonner';

function App() {
  return (
    <Router basename="/app">
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes (Wrapped in DashboardLayout) */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout><HomePage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/betting/:gameCode" element={<ProtectedRoute><DashboardLayout hideHeader={true} hideBottomNav={true}><BettingPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/betting" element={<ProtectedRoute><DashboardLayout hideHeader={true} hideBottomNav={true}><BettingPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><DashboardLayout hideHeader={true}><AccountPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><DashboardLayout hideHeader={true}><HistoryPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><DashboardLayout hideBottomNav={true}><SupportPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/transaction" element={<ProtectedRoute><DashboardLayout hideHeader={true}><TransactionPage /></DashboardLayout></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="*" element={<DashboardLayout><NotFoundPage /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
