import { Link, useLocation } from 'react-router-dom';
import { Menu, LayoutDashboard, Users, CreditCard, Shield, Settings, MessageSquare, Zap, Gamepad, History, LogOut, Ticket, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth-store";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ADMIN_NAV_ITEMS } from '@/lib/admin-nav-config';

export function AdminMobileNav() {
  const pathname = useLocation().pathname;
  const { logout, user } = useAuth();
  const role = user?.role || 'user';

  const renderNavItem = (item: any, isChild = false) => {

    if (item.roles && !item.roles.includes(role)) return null;

    const isActive = item.href === pathname || (item.href && item.href !== '/admin' && pathname.startsWith(item.href));
    const Icon = item.icon;

    if (item.children) {
      return (
        <Accordion key={item.label} type="single" collapsible className="w-full border-none">
          <AccordionItem value={item.label} className="border-none">
            <AccordionTrigger className={cn(
              "flex items-center p-3.5 text-xs font-black uppercase tracking-widest transition-all rounded-xl hover:bg-white/5 hover:no-underline",
              isActive ? "text-primary bg-primary/5" : "text-white/60"
            )}>
              <div className="flex items-center">
                <Icon className={cn("h-4 w-4 mr-3", isActive ? "text-primary" : "text-white/40")} />
                {item.label}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2 pt-1 ml-6 border-l border-white/5 pl-4 flex flex-col gap-1">
                {item.children.map((child: any) => renderNavItem(child, true))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <SheetTrigger asChild key={item.href || item.label}>
        <Link
          to={item.href}
          className={cn(
            'flex items-center p-3.5 text-xs font-bold rounded-xl transition-all group',
            isActive
              ? 'bg-primary text-black shadow-lg shadow-primary/20'
              : 'text-white/60 hover:bg-white/5 hover:text-white',
            isChild && 'py-2.5 font-bold normal-case text-[11px] uppercase tracking-wider'
          )}
        >
          <Icon className={cn(
            "h-4 w-4 mr-3 shrink-0",
            isActive ? "text-black" : "text-white/40 group-hover:text-white/80"
          )} />
          <span className="flex-1 truncate">{item.label}</span>
        </Link>
      </SheetTrigger>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-white/5 border-white/10 text-primary hover:bg-white/10 rounded-xl h-10 w-10">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col bg-[#050a12] border-white/5 text-white p-6 custom-scrollbar w-[85vw] max-w-[320px]">
        <nav className="flex flex-col h-full">
          <Link
            to="/admin"
            className="flex items-center gap-3 mb-10"
          >
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-amber-600 rounded-xl flex items-center justify-center text-black font-black shadow-lg">
              M
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter uppercase text-white leading-none">MBS ADMIN</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Management Console</span>
            </div>
          </Link>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 -mr-2 scrollbar-hide">
            {ADMIN_NAV_ITEMS
              .filter(group => !group.roles || group.roles.includes(role))
              .map((group) => (
                <div key={group.group} className="mb-4">
                    <p className="px-3 mb-2 text-[9px] font-black text-slate-500 uppercase tracking-[2px] opacity-50">{group.group}</p>
                    <div className="space-y-1">
                        {group.items.map((item) => renderNavItem(item))}
                    </div>
                </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/5">
             <Button
                variant="ghost"
                className="w-full justify-center text-rose-500 hover:text-white hover:bg-rose-500 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl transition-all gap-3 border border-rose-500/20 shadow-lg shadow-rose-500/5"
                onClick={() => logout()}
            >
                <LogOut size={16} />
                Đăng xuất tài khoản
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
