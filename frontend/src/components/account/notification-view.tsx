import { useState, useEffect } from 'react'
import { PageHeader } from "@/components/layout/page-header"
import { Card, Section } from "@/components/shared/container"
import { Bell, Loader2, Info } from 'lucide-react'
import api from '@/lib/api'

interface NotificationViewProps {
    onBack: () => void;
}

export const NotificationView = ({ onBack }: NotificationViewProps) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const { data } = await api.get('/user/notification/all');
                if (data.status) setNotifications(data.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchNotes();
    }, []);

    return (
        <div className="flex flex-col flex-1 pb-10">
            <PageHeader title="Thông báo hệ thống" onBack={onBack} showBottomBorder />
            
            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                        <Loader2 className="animate-spin text-[#ffc53e] mb-4" size={40} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Đang tải...</span>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((note) => (
                            <Card key={note.id} className="p-5 bg-[#132235] border-white/5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#ffc53e] shadow-[0_0_8px_#ffc53e]" />
                                        <h4 className="font-black text-[#ffc53e] uppercase text-[13px] tracking-tight">{note.title}</h4>
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                                        {new Date(note.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div className="pl-4 border-l border-white/10">
                                    <p className="text-xs text-gray-300 leading-relaxed font-medium">{note.content}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center opacity-10">
                        <Bell size={64} className="text-white mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Không có thông báo mới</p>
                    </div>
                )}
            </div>

            <Section className="mt-auto pt-10">
                <div className="p-4 bg-[#ffc53e]/5 border border-[#ffc53e]/10 rounded-2xl flex gap-3">
                    <Info className="text-[#ffc53e] shrink-0" size={18} />
                    <p className="text-[10px] text-[#ffc53e]/60 font-bold leading-relaxed uppercase">
                        Vui lòng kiểm tra thông báo thường xuyên để không bỏ lỡ các chương trình khuyến mãi và cập nhật quan trọng từ Marina Bay Sands.
                    </p>
                </div>
            </Section>
        </div>
    );
};
