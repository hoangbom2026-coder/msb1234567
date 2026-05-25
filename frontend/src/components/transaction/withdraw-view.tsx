import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-store'
import api from '@/lib/api'

export function WithdrawView() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const { user, fetchUser } = useAuth()

    const [money, setMoney] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [withdrawFee, setWithdrawFee] = useState(8)
    const [minWithdraw, setMinWithdraw] = useState(100)

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/config/system');
                if (res.data && res.data.status) {
                    setWithdrawFee(parseFloat(res.data.data.withdraw_fee || '8'));
                    setMinWithdraw(parseFloat(res.data.data.min_withdraw || '100'));
                }
            } catch (err) {
                console.error("Failed to fetch withdraw_fee", err);
            }
        };
        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const amount = parseFloat(money);
        if (!money || isNaN(amount) || amount <= 0) {
            return toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập số tiền hợp lệ" })
        }

        if (amount < minWithdraw) {
            return toast({ variant: "destructive", title: "Lỗi", description: `Số tiền rút tối thiểu là ${minWithdraw.toLocaleString()} $` })
        }

        if (!password) {
            return toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập mật khẩu thanh toán" })
        }

        try {
            setLoading(true)
            const res = await api.post('/user/withdraw', {
                money: amount,
                password: password
            })

            if (res.data && res.data.status) {
                toast({ title: "Thành công", description: "Yêu cầu rút tiền đã được gửi, vui lòng chờ duyệt." })
                setMoney('')
                setPassword('')
                fetchUser()
            } else {
                throw new Error(res.data.message || "Gửi yêu cầu thất bại")
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Đã có lỗi xảy ra";
            toast({ variant: "destructive", title: "Lỗi", description: errorMessage })
            if (errorMessage.includes("chưa thiết lập mật khẩu thanh toán")) {
                setTimeout(() => navigate('/account?view=security'), 2000);
            }
        } finally {
            setLoading(false)
        }
    }

    const feeValue = money ? (parseFloat(money) * (withdrawFee / 100)) : 0
    const availableBalance = user?.money || 0

    return (
        <div className="min-h-screen bg-[#0b0f17]">
            <div className="h-[44px] w-full flex mb-5 shadow-[0_1px_6px_#132235] px-2.5 flex-shrink-0 !shadow-none">
                <div className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer" onClick={() => navigate(-1)}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
                    </svg>
                </div>
                <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
                    <p className="leading-none">Rút Tiền</p>
                </div>
                <div className="w-[30px] flex-shrink-0 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-5 h-5">
                        <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                        <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                <div className="p-4 bg-white rounded-t-lg">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Số Dư Khả Dụng</span>
                        <span className="text-lg font-bold text-blue-600">{availableBalance.toLocaleString()}</span>
                    </div>
                    <div className="relative">
                        <input 
                            type="number" 
                            placeholder="Vui Lòng Nhập Số Tiền Rút" 
                            className="w-full py-4 pl-4 pr-4 text-base !text-black placeholder-gray-400 bg-transparent border-0 focus:outline-none" 
                            value={money}
                            onChange={(e) => setMoney(e.target.value)}
                        />
                    </div>
                    <div className="border-b border-gray-200"></div>
                </div>

                <div className="p-4 bg-white rounded-lg">
                    <input 
                        type="password" 
                        placeholder="Xin mời nhập mật khẩu thanh toán" 
                        className="w-full py-2 text-base !text-black placeholder:text-gray-400 bg-transparent border-0 focus:outline-none" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="border-b border-gray-200"></div>
                </div>

                <div className="p-4 bg-white rounded-t-lg">
                    <div className="flex items-center justify-between mb-2 text-left">
                        <span className="font-medium text-red-600">Phí Xử Lý</span>
                        <span className="px-2 py-1 text-sm font-bold text-gray-800 rounded">{withdrawFee}%</span>
                    </div>
                    <div className="flex items-center justify-end mb-2 text-left text-gray-800">
                        ≈ {feeValue.toLocaleString()}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">
                        Đối với các giao dịch rút tiền hiện tại của bạn, phí xử lý sẽ được khấu trừ vào số tiền rút của bạn. Nếu như bạn không thể rút tiền, Vui lòng liên hệ CSKH để được hỗ trợ
                    </p>
                </div>

                <div>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#ffc107] hover:bg-[#e0a800] disabled:opacity-50 text-black font-bold py-4 px-6 rounded-[2rem] transition-colors duration-200 uppercase tracking-wide text-lg flex items-center justify-center gap-2"
                    >
                        {loading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    )
}
