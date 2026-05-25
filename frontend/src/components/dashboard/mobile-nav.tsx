import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const location = useLocation();
    
    const navItems = [
        { label: 'Trang chủ', path: '/', icon0: '/images/nav/tab_home_0.png', icon1: '/images/nav/tab_home_1.png' },
        { label: 'Lịch sử tham gia', path: '/account?view=bet-history', icon0: '/images/nav/tab_promo_0.png', icon1: '/images/nav/tab_promo_1.png' },
        { label: 'CSKH', path: '/support', icon0: '/images/nav/tab_service_0.png', icon1: '/images/nav/tab_service_1.png' },
        { label: 'Tài khoản', path: '/account', icon0: '/images/nav/tab_user_0.png', icon1: '/images/nav/tab_user_1.png' },
    ];

    return (
        <div className="fixed w-full max-w-[560px] bottom-0 left-1/2 -translate-x-1/2 bg-[#151a23] backdrop-blur-[20px] grid grid-cols-4 z-[9999] border-t border-white/5 shadow-2xl">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path.split('?')[0]));
                return (
                    <Link 
                        key={item.path} 
                        to={item.path} 
                        className="flex flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-all"
                    >
                        <img src={isActive ? item.icon1 : item.icon0} alt={item.label} className="h-8 w-auto object-contain" loading="lazy" />
                        <label className={cn(
                            "text-[10px] uppercase font-bold leading-none whitespace-nowrap tracking-tighter",
                            isActive ? "text-[#ffc53e]" : "text-gray-400"
                        )}>
                            {item.label}
                        </label>
                    </Link>
                );
            })}
        </div>
    );
}
