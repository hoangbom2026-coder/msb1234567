import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Shield,
  Settings,
  MessageSquare,
  Zap,
  Gamepad,
  History,
  ChevronRight,
  LogOut,
  Ticket,
  Bell,
  Lock,
  PieChart,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";

import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav-config";

const AdminSidebar = ({ className }: { className?: string }) => {
  const pathname = useLocation().pathname;
  const { logout, user } = useAuth();
  const role = user?.role || 'user';

  const renderNavItem = (item: any) => {

    if (item.roles && !item.roles.includes(role)) return null;
    
    const isActive = item.href === pathname || (item.href && item.href !== '/admin' && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href || item.label}
        to={item.href}
        className={cn(
          'flex items-center px-3 py-2.5 text-[10px] font-black transition-all group relative uppercase tracking-tighter',
          isActive
            ? 'bg-primary text-black'
            : 'text-slate-500 hover:bg-white/5 hover:text-slate-100'
        )}
      >
        <Icon size={14} className="mr-2.5 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/20" />}
      </Link>
    );
  };

  const renderGroup = (group: any) => (
    <div key={group.group} className="mb-3">
      <h3 className="px-3 mb-1 text-[8px] font-black text-slate-500 uppercase tracking-[2px] opacity-70">{group.group}</h3>
      <div className="space-y-0.5">
        {group.items.map((item: any) => renderNavItem(item))}
      </div>
    </div>
  );

  return (
    <aside className={cn("w-52 h-screen flex flex-col bg-[#0a0f18] border-r border-border shrink-0 font-['Inter'] z-40 relative shadow-2xl", className)}>
      <div className="p-4 border-b border-white/5 bg-black/20">
        <Link to="/admin" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-primary flex items-center justify-center text-black font-black text-lg rounded-sm shadow-[0_0_15px_-3px_rgba(var(--primary),0.5)] group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-black text-white leading-none tracking-tighter group-hover:text-primary transition-colors truncate">MARINA BAY SANDS</span>
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black mt-1 truncate">Sytem Administrator</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="flex flex-col px-1.5">
          {ADMIN_NAV_ITEMS
            .filter(group => !group.roles || group.roles.includes(role))
            .map(renderGroup)}
        </nav>
      </div>

      <div className="p-3 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="bg-white/5 p-2 mb-3 flex items-center gap-2 border border-white/5 rounded-sm">
          <div className="h-7 w-7 bg-slate-800 border border-white/10 flex items-center justify-center text-white font-black text-[10px] rounded-sm">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-wider">Admin</p>
            <div className="flex items-center gap-1">
              <span className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Active</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-center text-slate-400 hover:text-white hover:bg-red-500/80 font-black text-[9px] uppercase h-8 rounded-sm transition-all gap-2 border-white/5 hover:border-red-500 shadow-sm"
          onClick={() => logout()}
        >
          <LogOut size={12} />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
