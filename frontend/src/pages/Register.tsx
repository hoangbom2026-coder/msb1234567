import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth-store";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User as UserIcon, Lock, Key, Users } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu không khớp.",
      });
      return;
    }
    setLoading(true);
    try {
      await register(username, password, invite, username, username);
      toast({ title: "Đăng ký thành công!" });
      navigate("/login");
    } catch (error: any) {
      const errorMessage = error.message || 'Đã xảy ra lỗi không mong muốn.';
      toast({ variant: "destructive", title: "Lỗi đăng ký", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center px-6 py-10">
      <div className="absolute inset-0">
            <img src="/app/images/bg_register.jpg" alt="Background" className="object-cover w-full h-full" loading="lazy" />
      </div>
      
      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        <div className="mb-8">
            <img src="/app/all/left-top-1751727228593.png" className="w-40 mx-auto" alt="Logo" loading="lazy" />
        </div>

        <div className="w-full space-y-6">
            <div className="flex flex-col items-start w-full">
                <p className="text-sm text-white font-medium mb-4">Tham gia cùng Marina Bay Sands</p>
                <div className="bg-[#087c95] text-white py-2 px-6 rounded-xl inline-block mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Đăng ký hội viên</span>
                </div>
            </div>

            <form className="w-full space-y-4" onSubmit={handleRegister}>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Tên đăng nhập (Tối thiểu 6 ký tự)"
                        className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 font-medium"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="relative group">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu bảo mật"
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

                <div className="relative group">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Xác nhận lại mật khẩu"
                        className="w-full h-12 px-4 pr-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 font-medium"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Mã giới thiệu (Nếu có)"
                        className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 font-medium"
                        value={invite}
                        onChange={(e) => setInvite(e.target.value)}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-lg text-white text-lg font-bold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                        style={{ backgroundImage: 'linear-gradient(rgb(19, 162, 186), rgb(8, 124, 149))' }}
                    >
                        {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
                    </button>
                </div>
            </form>

            <div className="flex justify-center items-center text-sm font-bold text-white uppercase tracking-tight">
                <span>Đã có tài khoản?</span>
                <Link to="/login" className="ml-2 text-yellow-400 hover:text-white transition-colors underline decoration-2 underline-offset-4">Đăng nhập</Link>
            </div>
        </div>

        <div className="mt-12 text-sm text-center text-white opacity-80 font-medium uppercase tracking-widest">
            <p>© 2024 MARINA BAY SANDS</p>
        </div>
      </div>
    </div>
  );
}
