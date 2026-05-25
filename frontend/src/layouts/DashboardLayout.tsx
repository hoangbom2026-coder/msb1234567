import React from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/layout/bottom-nav';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
    hideHeader?: boolean;
    hideBottomNav?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, hideHeader = false, hideBottomNav = false }) => {
    return (
        <div className="w-full bg-black min-h-screen overflow-x-hidden">
            <div className="app-container">
                {!hideHeader && (
                    <header className="fixed w-full max-w-[560px] top-0 left-1/2 bg-[#0c192c] -translate-x-1/2 flex justify-between items-center z-[9999] h-[56px] px-3 shadow-lg">
                        <Link to="/" className="flex-shrink-0 w-[100px] h-full flex items-center">
                            <img src="/images/logo-mbs.png" className="h-[40px] w-full object-contain" alt="Logo" loading="lazy" />
                        </Link>
                        <div className="flex-1 mx-2 bg-[#132235] rounded-lg overflow-hidden">
                            <div className="relative py-3 px-2 overflow-hidden">
                                <div className="flex whitespace-nowrap">
                                    <span className="text-[#ffc53e]/60 text-sm font-medium inline-block animate-marquee-rtl">
                                        Marina Bay Sands Singapore Welcome - Marina Bay Sands Singapore - Kính chào quý khách !
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                <main className={cn(
                    "flex-1 flex flex-col",
                    !hideHeader && "pt-[56px]",
                    !hideBottomNav && "pb-[64px]"
                )}>
                    {children}
                </main>

                {!hideBottomNav && <BottomNav />}
            </div>
        </div>
    );
};

export default DashboardLayout;
