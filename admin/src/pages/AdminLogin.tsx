import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth-store';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !password) {
            toast({ title: "Thông báo", description: "Vui lòng nhập đầy đủ thông tin.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await login(phone, password);
            toast({ title: "Thành công", description: "Đăng nhập hệ thống quản trị thành công." });
            navigate('/admin');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error.message || 'Sai tài khoản hoặc mật khẩu' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050a12] p-6 font-['Inter']">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-3">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 mb-2">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">MB SANDS ADMIN</h1>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Hệ thống Quản trị Nội bộ - Bảo mật tuyệt đối</p>
                </div>

                <Card className="rounded-sm border-white/5 bg-slate-900/50 backdrop-blur-md shadow-2xl overflow-hidden">
                    <form onSubmit={handleLogin}>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Tài khoản</Label>
                                    <div className="relative">
                                        <Input
                                            id="phone"
                                            autoComplete="username"
                                            className="h-12 bg-white/5 border-white/10 rounded-sm text-white focus-visible:ring-primary/20 transition-all font-bold"
                                            placeholder="Tài khoản."
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Mật Khẩu</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="current-password"
                                            className="h-12 bg-white/5 border-white/10 rounded-sm text-white focus-visible:ring-primary/20 transition-all font-bold"
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-sm bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/10 transition-all active:scale-95"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                Đăng nhập hệ thống
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">&copy; 2024 Marina Bay Sands Protocol. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
