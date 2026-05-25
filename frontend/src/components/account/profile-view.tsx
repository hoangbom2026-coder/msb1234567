import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import api from '@/lib/api'

interface ProfileViewProps {
    user: any;
    onBack: () => void;
    fetchUser: () => void;
}

export const ProfileView = ({ user, onBack, fetchUser }: ProfileViewProps) => {
    const [formData, setFormData] = useState({
        fullname: user?.fullName || user?.name_real || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!formData.fullname) {
            toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập họ tên/biệt danh." });
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/user/updateProfile', {
                fullName: formData.fullname,
                email: formData.email,
                phone: formData.phone // Pass phone if backend supports it
            });
            if (data.status) {
                toast({ title: "Thành công", description: "Đã cập nhật thông tin cá nhân." });
                fetchUser();
            } else {
                toast({ variant: "destructive", title: "Lỗi", description: data.message });
            }
        } catch (e: any) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật thông tin." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f17]">
            <div className="h-[44px] w-full flex mb-5 shadow-[0_1px_6px_#132235] px-2.5 flex-shrink-0 !shadow-none">
                <div className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer" onClick={onBack}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
                    </svg>
                </div>
                <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
                    <p className="leading-none">Thông Tin Của Tôi</p>
                </div>
                <div className="w-[30px] flex-shrink-0 flex items-center"></div>
            </div>
            
            <div className="px-4 py-6">
                <div className="bg-white rounded-lg p-6 mx-auto max-w-md">
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
                        
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Biệt Danh</label>
                            <input 
                                name="fullname" 
                                type="text" 
                                placeholder="Biệt Danh" 
                                className="w-full px-3 py-3 text-sm border-transparent placeholder:text-sm !text-black bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                value={formData.fullname}
                                onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Địa Chỉ Email</label>
                            <input 
                                name="email" 
                                type="text" 
                                placeholder="Vui Lòng Nhập Địa Chỉ Email" 
                                className="w-full px-3 py-3 text-sm border-transparent !text-black placeholder:text-sm bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">Số Điện Thoại</label>
                            <input 
                                name="phone" 
                                type="text" 
                                placeholder="0123456789" 
                                className="w-full px-3 py-3 text-sm border-transparent placeholder:text-sm !text-black bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#FFC53E] hover:bg-[#e0a800] disabled:opacity-50 text-black font-bold py-4 px-6 rounded-lg transition-colors duration-200 mt-6"
                        >
                            {loading ? "Đang xử lý..." : "Xác nhận"}
                        </button>
                        
                    </form>
                </div>
            </div>
        </div>
    );
};
