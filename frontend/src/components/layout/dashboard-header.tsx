
import { Link } from "react-router-dom";
;
import { useAuth } from '@/hooks/use-auth-store';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, Wallet, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({ title: 'Đã đăng xuất', description: 'Hẹn gặp lại bạn.' });
    navigate('/');
  };

  return (
    <header className="bg-black bg-opacity-30 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo-mbs.png" alt="MBS Logo" width={40} height={40} loading="lazy" />
              <span className="text-xl font-bold text-white tracking-wider hidden sm:block">MARINA BAY SANDS</span>
            </Link>
          </div>

          {/* Right section with User Info and Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-4">
                {/* Balance */}
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-semibold text-sm">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.money || 0)}
                  </span>
                </div>

                {/* Deposit/Withdraw Buttons */}
                <div className="hidden md:flex space-x-2">
                    <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black">
                        <Zap className="w-4 h-4 mr-2" />
                        Nạp tiền
                    </Button>
                    <Button size="sm" variant="outline">
                        Rút tiền
                    </Button>
                </div>
              </div>
            )}

            {/* User Dropdown */}
            <div className="relative">
                <Button onClick={handleLogout} variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                     <LogOut className="h-6 w-6 text-gray-400" />
                </Button>
            </div>

             {user?.role === 'admin' && (
                <a href="/admin" target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                        <LayoutDashboard className="w-4 h-4 mr-2"/>
                        Admin Panel
                    </Button>
                </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
