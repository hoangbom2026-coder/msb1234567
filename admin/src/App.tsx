import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdminChat from './pages/AdminChat';
import AdminGames from './pages/AdminGames';
import AdminGameDetail from './pages/AdminGameDetail';
import AdminGameResults from './pages/AdminGameResults';
import AdminGameHistory from './pages/AdminGameHistory';
import AdminSettings from './pages/AdminSettings';
import AdminLogs from './pages/AdminLogs';
import AdminLogin from './pages/AdminLogin';
import AdminSidebar from './components/admin/admin-sidebar';
import { AdminHeader } from './components/admin/admin-header';
import { AuthProvider, useAuth } from './hooks/use-auth-store';
import { Toaster } from './components/ui/toaster';
import '@/styles/globals.css'

function AdminLayout() {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const hostname = window.location.hostname;

  if (hostname === 'agent.iiit.pro' && user?.role !== 'agent') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0f18] text-white p-4 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2 uppercase italic text-rose-500">Truy cập bị từ chối</h1>
          <p className="text-slate-400">Đường dẫn này chỉ dành cho Đại lý.</p>
          <button onClick={() => { localStorage.clear(); window.open('https://agent.iiit.pro/login', '_self'); }} className="mt-4 px-6 py-2 bg-primary text-black font-bold uppercase text-xs">Đăng nhập tài khoản Đại lý</button>
        </div>
      </div>
    );
  }

  if (hostname === 'cskh.iiit.pro' && user?.role !== 'cskh') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0f18] text-white p-4 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2 uppercase italic text-blue-500">Truy cập bị từ chối</h1>
          <p className="text-slate-400">Đường dẫn này chỉ dành cho CSKH.</p>
          <button onClick={() => { localStorage.clear(); window.open('https://cskh.iiit.pro/login', '_self'); }} className="mt-4 px-6 py-2 bg-primary text-black font-bold uppercase text-xs">Đăng nhập tài khoản CSKH</button>
        </div>
      </div>
    );
  }

  const isAdminDomain = hostname === 'admin.iiit.pro';
  const isAuthorizedAdmin = user?.role === 'admin' || user?.role === 'ROOT';

  if (isAdminDomain && !isAuthorizedAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0f18] text-white p-4 text-center">
        <div>
          <h1 className="text-2xl font-black mb-2 uppercase italic text-primary">Khu vực Quản trị tối cao</h1>
          <p className="text-slate-400">Tài khoản của bạn không có quyền truy cập khu vực này.</p>
          <button onClick={() => { localStorage.clear(); window.open('https://admin.iiit.pro/login', '_self'); }} className="mt-4 px-6 py-2 bg-primary text-black font-bold uppercase text-xs">Về trang đăng nhập</button>
        </div>
      </div>
    );
  }

  if (hostname === 'iiit.pro' || hostname === 'www.iiit.pro') {
    window.location.href = 'https://marinabaysands.iiit.pro';
    return null;
  }

  const allowedRoles = ['admin', 'agent', 'cskh', 'ROOT'];
  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  const pathname = location.pathname;

  if (role === 'agent') {
    const forbidden = ['/admin/settings', '/admin/games/results', '/admin/banks', '/admin/transactions'];
    if (forbidden.some(p => pathname.startsWith(p))) return <Navigate to="/admin" replace />;
  }

  if (role === 'cskh') {
    const forbidden = ['/admin/settings', '/admin/referrals'];
    if (forbidden.some(p => pathname.startsWith(p))) return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex h-screen bg-[#0a0f18] text-foreground overflow-hidden font-['Inter'] antialiased">
      <AdminSidebar className="hidden md:flex" />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />
        <main className="flex-1 p-2 md:p-3 overflow-y-auto bg-slate-50 dark:bg-slate-950 scrollbar-thin">
          <div className="max-w-[2000px] mx-auto w-full space-y-3">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="games" element={<AdminGames />} />
            <Route path="games/:gameId" element={<AdminGameDetail />} />
            <Route path="games/results" element={<AdminGameResults />} />
            <Route path="games/history" element={<AdminGameHistory />} />
            <Route path="games/bets" element={<AdminGameHistory />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
          {}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
