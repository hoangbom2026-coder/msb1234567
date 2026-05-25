import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth-store";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-sm border border-border p-0">
          <Avatar className="h-full w-full rounded-sm">
            <AvatarImage src="/avatars/admin.png" alt="admin" />
            <AvatarFallback className="rounded-sm bg-primary text-black font-bold text-xs">{user?.phone?.substring(user.phone.length - 2) || "AD"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 rounded-sm font-['Inter'] shadow-lg border-border" align="end" forceMount>
        <DropdownMenuLabel className="p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" />
                <p className="text-xs font-bold leading-none uppercase tracking-wider">{user?.phone || "Quản trị viên"}</p>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Quyền hạn: {user?.role === 'admin' ? 'Hệ thống (Root)' : user?.role === 'agent' ? 'Đại lý (Agent)' : 'Hỗ trợ (CSKH)'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="p-1">
          {user?.role === 'admin' && (
            <>
              <DropdownMenuItem className="h-10 rounded-sm gap-3 cursor-pointer" onClick={() => navigate('/admin/security')}>
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold">Bảo mật hệ thống</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="h-10 rounded-sm gap-3 cursor-pointer" onClick={() => navigate('/admin/settings')}>
                <Settings className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold">Cấu hình vận hành</span>
              </DropdownMenuItem>
            </>
          )}
          {user?.role !== 'admin' && (
            <DropdownMenuItem className="h-10 rounded-sm gap-3 cursor-pointer" onClick={() => navigate('/admin')}>
               <User className="h-4 w-4 text-slate-400" />
               <span className="text-sm font-bold">Hồ sơ cá năng</span>
             </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="p-1">
            <DropdownMenuItem className="h-10 rounded-sm gap-3 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-bold">Đăng xuất an toàn</span>
            </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
