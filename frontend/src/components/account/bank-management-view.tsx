import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/layout/page-header"
import { Card, Section } from "@/components/shared/container"
import { Loader2, Plus, Landmark } from 'lucide-react'
import api from '@/lib/api'

interface BankManagementViewProps {
    onBack: () => void;
}

export const BankManagementView = ({ onBack }: BankManagementViewProps) => {
    const [userBank, setUserBank] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAddBank, setShowAddBank] = useState(false);
    const [newBank, setNewBank] = useState({ name: '', number: '', owner: '' });
    const { toast } = useToast();

    const fetchBank = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/user/getBanking');
            if (data.status && data.data) {
                setUserBank(data.data);
                setShowAddBank(false);
            } else {
                setShowAddBank(true);
            }
        } catch (e) {
            setShowAddBank(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBank(); }, []);

    const handleAddBank = async () => {
        if (!newBank.name || !newBank.number || !newBank.owner) {
            toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin." });
            return;
        }
        try {
            const { data } = await api.post('/user/addbanking', {
                nameBank: newBank.name,
                accountNumber: newBank.number,
                ownerName: newBank.owner
            });
            if (data.status) {
                toast({ title: "Thành công", description: "Đã thêm ngân hàng thành công." });
                fetchBank();
            } else {
                toast({ variant: "destructive", title: "Lỗi", description: data.message });
            }
        } catch (e: any) {
            toast({ variant: "destructive", title: "Lỗi", description: "Có lỗi xảy ra." });
        }
    };

    const maskAccountNumber = (number: string) => {
        if (!number) return '';
        return '******' + number.slice(-4);
    };

    return (
        <div className="flex flex-col flex-1 pb-10">
            <PageHeader title="Quản lý ngân hàng" onBack={onBack} showBottomBorder />

            <div className="flex-1 p-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                        <Loader2 className="animate-spin text-[#ffc53e] mb-4" size={40} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Đang tải...</span>
                    </div>
                ) : showAddBank ? (
                    <Section title="Thêm ngân hàng mới">
                        <Card className="p-6 bg-[#132235] border-white/5 space-y-6">
                            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-4">
                                <p className="text-[10px] text-orange-400 font-bold uppercase leading-relaxed">
                                    Lưu ý: Vui lòng nhập chính xác thông tin ngân hàng. Tên chủ tài khoản phải khớp với thông tin đăng ký để việc rút tiền diễn ra thuận lợi.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Tên ngân hàng</label>
                                    <input
                                        placeholder="VD: VCB, ACB, Techcombank..."
                                        className="w-full bg-white/5 border border-white/10 h-14 px-4 text-white font-bold focus:border-primary outline-none tracking-widest"
                                        value={newBank.name}
                                        onChange={e => setNewBank({ ...newBank, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Số tài khoản</label>
                                    <input
                                        placeholder="Nhập số tài khoản ngân hàng"
                                        className="w-full bg-white/5 border border-white/10 h-14 px-4 text-white font-bold focus:border-primary outline-none tracking-widest"
                                        value={newBank.number}
                                        onChange={e => setNewBank({ ...newBank, number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Họ tên chủ thẻ</label>
                                    <input
                                        placeholder="NHẬP CHỮ IN HOA KHÔNG DẤU"
                                        className="w-full bg-white/5 border border-white/10 h-14 px-4 text-white font-bold focus:border-primary outline-none tracking-widest uppercase"
                                        value={newBank.owner}
                                        onChange={e => setNewBank({ ...newBank, owner: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddBank}
                                className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] h-16 shadow-lg active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                            >
                                Lưu tài khoản ngân hàng
                            </button>
                        </Card>
                    </Section>
                ) : (
                    <Section title="Tài khoản đã liên kết">
                        <Card className="relative overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-white/10 p-6 shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Landmark size={120} className="text-white" />
                            </div>
                            
                            <div className="flex flex-col h-40 justify-between relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-[#ffc53e] uppercase tracking-[0.2em] mb-1">Ngân hàng</span>
                                        <h3 className="text-xl font-black text-white uppercase">{userBank.bankName}</h3>
                                    </div>
                                    <img src="/images/profile/wallet.png" className="h-10 w-auto opacity-50" alt="Wallet" />
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Số tài khoản</span>
                                    <p className="text-2xl font-mono text-white tracking-[0.3em]">
                                        {maskAccountNumber(userBank.accountNumber)}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Chủ tài khoản</span>
                                        <p className="text-sm font-black text-white uppercase">{userBank.ownerName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        </div>
                                        <span className="text-[10px] font-black text-green-500 uppercase">Đang hoạt động</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <p className="text-[10px] text-gray-600 font-bold uppercase text-center mt-6 tracking-widest">
                            Liên hệ CSKH nếu bạn muốn thay đổi thông tin ngân hàng.
                        </p>
                    </Section>
                )}
            </div>
        </div>
    );
};
