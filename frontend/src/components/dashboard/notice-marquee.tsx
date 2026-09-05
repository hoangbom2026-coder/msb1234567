export function NoticeMarquee() {
    return (
        <div className="px-2 py-3">
            <div className="w-full relative bg-[rgba(19,34,53,1)] rounded-lg overflow-hidden border border-white/5 shadow-md">
                <div className="absolute w-[40px] h-full left-0 top-0 flex justify-center items-center bg-[rgba(19,34,53,1)] z-10 border-r border-white/5">
                    <img src="/app/home/notice-icon.png" alt="Notice" className="h-4" loading="lazy" />
                </div>
                <div className="pl-[40px] pr-[10px] py-3 overflow-hidden">
                    <p className="inline-block whitespace-nowrap text-[#d4af37] text-sm font-medium animate-marquee-rtl">
                        Wellcome to Marina Bay Sands
                    </p>
                </div>
            </div>
        </div>
    );
}