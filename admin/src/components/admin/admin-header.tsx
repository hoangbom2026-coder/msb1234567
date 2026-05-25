import { AdminMobileNav } from "./admin-mobile-nav";
import { UserNav } from "@/components/admin/users/user-nav";
import { Search, Bell, Zap, Maximize } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function AdminHeader() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 sticky top-0 z-30 shrink-0 font-['Inter'] shadow-sm">
            {}
            <div className="md:hidden">
                <AdminMobileNav />
            </div>

            {}
            <div className="hidden lg:flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Thời gian Hệ thống</span>
                    <span className="text-sm font-black text-slate-700 dark:text-white font-mono tabular-nums leading-none">
                        {time.toLocaleTimeString('vi-VN', { hour12: false })}
                    </span>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <div className="relative h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Server Live</span>
                </div>
            </div>

            {}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-[500px]">
                <div className="relative w-full group">
                    <Input
                        type="search"
                        placeholder="Tìm kiếm nhanh UID, Số điện thoại hoặc Mã lệnh..."
                        className="h-9 w-full bg-slate-50 dark:bg-slate-900 border-border rounded-sm text-xs font-bold focus-visible:ring-primary/20 transition-all border-dashed"
                    />
                </div>
            </div>

            {}
            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 mr-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary rounded-sm transition-all hover:bg-slate-50">
                        <Bell size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-amber-500 rounded-sm transition-all hover:bg-slate-50">
                        <Zap size={18} />
                    </Button>
                </div>
                
                <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
                
                <div className="flex items-center gap-4 ml-2">
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
