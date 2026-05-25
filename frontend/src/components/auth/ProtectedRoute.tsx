import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth-store';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, user, fetchUser, token } = useAuth();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            if (token && !user) {
                try {
                    await fetchUser();
                } catch (e) {
                    // Ignore error, will be handled by isLoggedIn check
                }
            }
            setIsChecking(false);
        };
        verifyAuth();
    }, [token, user, fetchUser]);

    if (isChecking) {
        return (
            <div className="w-full bg-[#0b0f17] min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#ffc53e] h-8 w-8" />
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
