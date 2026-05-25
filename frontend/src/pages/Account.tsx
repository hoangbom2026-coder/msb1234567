import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth-store"
import { useToast } from "@/hooks/use-toast"
import { AccountMainView } from "@/components/account/account-main-view"
import { ProfileView } from "@/components/account/profile-view"
import { BankManagementView } from "@/components/account/bank-management-view"
import { SecurityView } from "@/components/account/security-view"
import { NotificationView } from "@/components/account/notification-view"
import { BetHistoryView } from "@/components/account/bet-history-view"
import { ChangePasswordView } from "@/components/account/change-password-view"

export default function AccountPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('view') || 'main';

    const { user, isLoggedIn, logout, fetchUser } = useAuth();
    const [activeView, setActiveView] = useState<string>(initialView);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        } else {
            fetchUser();
        }
    }, [isLoggedIn, navigate, fetchUser]);

    useEffect(() => {
        const view = searchParams.get('view') || 'main';
        setActiveView(view);
    }, [searchParams]);

    const handleSetView = (view: string) => {
        if (view === 'deposit' || view === 'withdraw' || view === 'transaction') {
            navigate(`/transaction?view=${view === 'transaction' ? 'history' : view}`);
            return;
        }
        setSearchParams({ view });
    }

    const handleLogout = () => {
        logout();
        toast({
            title: "Đã đăng xuất",
            description: "Hẹn gặp lại bạn.",
        });
        navigate('/');
    }

    const renderView = () => {
        switch (activeView) {
            case 'main':
                return <AccountMainView user={user} setActiveView={handleSetView} logout={handleLogout} />;
            case 'bet-history':
                return <BetHistoryView onBack={() => handleSetView('main')} />;

            case 'note':
                return <NotificationView onBack={() => handleSetView('main')} />;
            case 'bank':
                return <BankManagementView onBack={() => handleSetView('main')} />;
            case 'me':
                return <ProfileView user={user} onBack={() => handleSetView('main')} fetchUser={fetchUser} />;
            case 'security':
                return <SecurityView onBack={() => handleSetView('main')} />;
            case 'password':
                return <ChangePasswordView onBack={() => handleSetView('main')} />;
            default:
                return <AccountMainView user={user} setActiveView={handleSetView} logout={handleLogout} />;
        }
    }

    return (
        <div className="w-full min-h-screen bg-[#0b0f17]">
            {renderView()}
        </div>
    )
}
