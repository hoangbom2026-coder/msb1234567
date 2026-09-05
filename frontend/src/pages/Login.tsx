import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Languages, User as UserIcon, Lock } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password);
      toast({ title: "Đăng nhập thành công!" });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: error?.message || "Tài khoản hoặc mật khẩu không đúng.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0">
        <img src="/app/images/bg_register.jpg" alt="Background" className="object-cover w-full h-full" loading="lazy" />
      </div>
      
      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        <div className="mb-8 text-center">
            <img src="/app/all/left-top-1751727228593.png" className="w-48 mx-auto" alt="Logo" loading="lazy" />
        </div>

        <div className="w-full space-y-6">
            <div className="flex flex-col items-start w-full">
                <p className="text-sm text-white font-medium mb-4">Sands International Chào Đón Bạn</p>
                <div className="bg-[#087c95] text-white py-2 px-6 rounded-xl inline-block mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Tài khoản</span>
                </div>
            </div>

            <form className="w-full space-y-4" onSubmit={handleLogin}>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 font-medium"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div className="relative group">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        className="w-full h-12 px-4 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-lg text-white text-lg font-bold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                        style={{ backgroundImage: 'linear-gradient(rgb(19, 162, 186), rgb(8, 124, 149))' }}
                    >
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </div>
            </form>

            <div className="flex justify-between w-full mt-6 text-sm font-bold text-white uppercase tracking-tight">
                <Link to="/support" className="transition-colors hover:text-yellow-400">CSKH</Link>
                <Link to="/register" className="transition-colors hover:text-yellow-400">Đăng Ký Người Dùng Mới</Link>
            </div>
        </div>

        <div className="mt-12 text-sm text-center text-white opacity-80 font-medium uppercase tracking-widest">
            <p>Phiên Bản Hệ Thống: 1.2.0.2366</p>
        </div>
      </div>
    </div>
  );
}
