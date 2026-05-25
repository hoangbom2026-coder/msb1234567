import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth-store';
import api from '@/lib/api';
import { PageHeader } from '@/components/layout/page-header';
import { WithdrawView } from '@/components/transaction/withdraw-view';
import { HistoryView } from '@/components/transaction/history-view';

export default function TransactionPage() {
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'deposit';
    const navigate = useNavigate();
    const { toast } = useToast();
    const { fetchUser, user } = useAuth();

    const [money, setMoney] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (view === 'deposit') {
            navigate('/support', { replace: true });
        } else {
            fetchUser();
        }
    }, [view, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleDepositSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!money || parseFloat(money) <= 0) {
            return toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập số tiền hợp lệ" });
        }
        if (!file) {
            return toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng tải lên ảnh xác thực" });
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('money', money);
            formData.append('image', file);

            const res = await api.post('/user/deposit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && res.data.status) {
                toast({ title: "Thành công", description: "Yêu cầu nạp tiền đã được gửi, vui lòng chờ duyệt." });
                setMoney('');
                setFile(null);
                setPreview(null);
                fetchUser();
            } else {
                throw new Error(res.data.message || "Gửi yêu cầu thất bại");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Lỗi", description: error.message || "Đã có lỗi xảy ra" });
        } finally {
            setLoading(false);
        }
    };

    if (view === 'withdraw') {
        return <WithdrawView />
    }

    if (view === 'history') {
        return <HistoryView />
    }

    return null;
}

