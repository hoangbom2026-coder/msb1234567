import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi as api } from '@/lib/admin-api';
import { 
  ShieldCheck, 
  Key, 
  Lock,
  LockKeyhole,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Cpu,
  Zap,
  Fingerprint,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export default function AdminSecurityPage() {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpdatePassword = async () => {
    if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
        toast({ title: "Thông báo", description: "Mật khẩu xác nhận không khớp.", variant: "destructive" });
        return;
    }
    
    if (passwords.newPassword.length < 6) {
        toast({ title: "Lỗi mật khẩu", description: "Yêu cầu độ dài tối thiểu 6 ký tự.", variant: "destructive" });
        return;
    }

    try {
      setLoading(true);
      const res = await api.changePassword(passwords.newPassword);
      if (res.status) {
        toast({ title: "Thành công", description: "Mật khẩu quản trị đã được thay đổi." });
        setPasswords({ newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast({ title: "Lỗi đồng bộ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden font-['Inter']">
      <header className="flex h-20 items-center justify-between px-10 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-red-50 border border-red-100 rounded-sm text-red-600">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Bảo mật Quản trị</h2>
            <p className="text-sm text-slate-500 font-medium">Thay đổi thông tin đăng nhập và quyền truy cập cấp Root.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
             <Badge variant="outline" className="h-9 px-4 rounded-sm border-red-200 bg-red-50 font-bold uppercase text-[10px] text-red-600 gap-2">
                Quyền hạn: ROOT ADMIN
             </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-10 flex flex-col items-center">
        <div className="w-full max-w-lg space-y-10">
            
            <Card className="rounded-sm shadow-sm border-border overflow-hidden">
                <CardHeader className="p-8 text-center border-b bg-slate-50 dark:bg-slate-800/10">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10 mb-4 border border-primary/20">
                        <Fingerprint className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">Cập nhật Mật khẩu mới</CardTitle>
                    <CardDescription className="text-xs uppercase font-bold tracking-wider text-slate-400 mt-1">Sử dụng mật khẩu mạnh để bảo vệ hệ thống</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-sm flex gap-4 items-start">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wider italic">
                            Lưu ý: Mật khẩu mới sẽ áp dụng ngay lập tức cho lần đăng nhập kế tiếp. Vui lòng ghi nhớ mật khẩu trước khi lưu.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold uppercase text-slate-500 ml-1 flex items-center gap-2">
                                <Key size={14} /> Mật khẩu mới
                            </label>
                            <Input 
                                type="password" 
                                placeholder="••••••••••••" 
                                className="h-12 rounded-sm border-border font-bold text-lg focus-visible:ring-primary/20"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold uppercase text-slate-500 ml-1 flex items-center gap-2">
                                <LockKeyhole size={14} /> Xác nhận mật khẩu mới
                            </label>
                            <Input 
                                type="password" 
                                placeholder="••••••••••••" 
                                className="h-12 rounded-sm border-border font-bold text-lg focus-visible:ring-primary/20"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>

                    <Button 
                        className="w-full h-12 rounded-sm bg-primary hover:bg-primary/90 text-black font-bold uppercase text-xs tracking-widest shadow-sm transition-all" 
                        onClick={handleUpdatePassword}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin size-4 mr-2" /> : <ShieldCheck className="mr-2 h-4 w-4" />} 
                        Lưu mật khẩu ngay
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
                <div className="p-5 rounded-sm border bg-slate-50 dark:bg-slate-800/10 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-sm bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-1">Xác thực 2 yếu tố</h4>
                        <p className="text-xs font-bold text-slate-800 dark:text-white uppercase italic">Đã bật</p>
                    </div>
                </div>
                <div className="p-5 rounded-sm border bg-slate-50 dark:bg-slate-800/10 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-sm bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-1">Phiên đăng nhập</h4>
                        <p className="text-xs font-bold text-slate-800 dark:text-white uppercase italic">Đang hoạt động</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
