import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth-store';
import { BannerSlider } from '@/components/dashboard/banner-slider';
import { NoticeMarquee } from '@/components/dashboard/notice-marquee';
import { UserActionBar } from '@/components/dashboard/user-action-bar';
import { GameList } from '@/components/dashboard/game-list';

export default function HomePage() {
    const { user, fetchUser, logout } = useAuth();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <div className="flex flex-col flex-1 pb-8">
            <BannerSlider />
            <NoticeMarquee />
            <UserActionBar user={user} onLogout={logout} />

            <GameList />

            {/* Promotion Banner */}
            <div className="px-4">
                <img 
                    src="/images/lottery0.png" 
                    className="shadow-2xl rounded-xl w-full border border-white/5" 
                    alt="Lottery Promotion" 
                    loading="lazy"
                />
            </div>
        </div>
    );
}
