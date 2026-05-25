import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const navItems = [
    { label: 'Trang chủ', href: '/', iconIdx: 'home' },
    { label: 'Lịch sử', href: '/history', iconIdx: 'promo' },
    { label: 'CSKH', href: '/support', iconIdx: 'service' },
    { label: 'Tài khoản', href: '/account', iconIdx: 'user' }
  ]

  return (
    <nav className="fixed w-full max-w-[560px] bottom-0 left-1/2 -translate-x-1/2 bg-[#151a23]/95 backdrop-blur-md grid grid-cols-4 z-[9999] border-t border-white/5 pb-safe h-[64px]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        const iconSrc = `/images/nav/tab_${item.iconIdx}_${isActive ? '1' : '0'}.png`
        
        return (
          <div 
            key={item.href}
            onClick={() => navigate(item.href)}
            className="flex flex-col items-center justify-center gap-1 py-2 cursor-pointer active:scale-90 transition-all duration-200"
          >
            <div className="relative">
              <img src={iconSrc} alt={item.label} className="h-7 w-auto object-contain" loading="lazy" />
              {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#ffc53e] rounded-full shadow-[0_0_8px_#ffc53e]" />}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider transition-colors",
              isActive ? "text-[#ffc53e]" : "text-white/60"
            )}>
              {item.label}
            </span>
          </div>
        )
      })}
    </nav>
  )
}
