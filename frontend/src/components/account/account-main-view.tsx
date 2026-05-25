import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth-store"

interface AccountMainViewProps {
    user: any;
    setActiveView: (view: string) => void;
    logout: () => void;
}

export const AccountMainView = ({ user, setActiveView, logout }: AccountMainViewProps) => {
    return (
        <div className="flex flex-col flex-1 pb-10 px-2 pt-4">
            {/* Header/Avatar Block */}
            <div className="rounded-lg py-4 mb-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="relative">
                            <div className="w-20 h-20 p-1">
                                <img src="/images/logo.png" className="object-cover w-full h-full" alt="Avatar" />
                            </div>
                        </div>
                        <div className="ml-4 text-white">
                            <div className="font-medium text-lg">{user?.username || 'Guest'}</div>
                            <div className="text-gray-400 text-sm">{user?.phone || 'Chưa cập nhật'}</div>
                            <div className="text-gray-400 text-sm">UID: {user?.id || '---'}</div>
                        </div>
                    </div>
                    <div className="text-[#ffc53e] px-4 py-1 rounded font-bold text-[18px]">
                        VIP {user?.level || 0}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-0.5 bg-[#171c25] rounded-lg px-2 py-2 text-center">
                    <div>
                        <div className="text-white text-sm mb-2">Tổng tiền</div>
                        <div className="text-[#FFD700] font-bold text-xl mb-1">{(user?.money || 0).toLocaleString()}</div>
                        <div className="flex items-center justify-center">
                            <img src="/images/profile/dollar.png" alt="logo" className="h-4" />
                            <span className="text-gray-400 text-sm mt-0.5 ml-1">USDT</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-white text-sm mb-2">Tổng hôm nay</div>
                        <div className="text-[#FFD700] font-bold text-xl mb-1">{(user?.todayBet || 0).toLocaleString()}</div>
                        <div className="flex items-center justify-center">
                            <img src="/images/profile/dollar.png" alt="logo" className="h-4" />
                            <span className="text-gray-400 text-sm mt-0.5 ml-1">USDT</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-white text-sm mb-2">Lãi/lỗ hôm nay</div>
                        <div className="text-[#FFD700] font-bold text-xl mb-1">{(user?.todayProfit || 0).toLocaleString()}</div>
                        <div className="flex items-center justify-center">
                            <img src="/images/profile/dollar.png" alt="logo" className="h-4" />
                            <span className="text-gray-400 text-sm text-center mt-0.5 ml-1">USDT</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid 1: Transactions */}
            <div className="grid grid-cols-4 gap-4 bg-[#171c25] py-2 rounded-lg mb-6">
                <div onClick={() => setActiveView('deposit')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/deposit.png" className="w-12 h-12" alt="Nạp Tiền" />
                    </div>
                    <span className="text-white text-xs font-medium leading-tight max-w-full text-center">Nạp Tiền</span>
                </div>
                <div onClick={() => setActiveView('withdraw')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/withdraw.png" className="w-12 h-12" alt="Rút Tiền" />
                    </div>
                    <span className="text-white text-xs font-medium leading-tight max-w-full text-center">Rút Tiền</span>
                </div>
                <div onClick={() => setActiveView('transaction')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/rebate.png" className="w-12 h-12" alt="Giao dịch" />
                    </div>
                    <span className="text-white text-xs font-medium leading-tight max-w-full text-center">Giao dịch</span>
                </div>
                <div onClick={() => setActiveView('bet-history')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/record.png" className="w-12 h-12" alt="Ghi" />
                    </div>
                    <span className="text-white text-xs font-medium leading-tight max-w-full text-center">Ghi</span>
                </div>
            </div>

            {/* Grid 2: Account actions */}
            <div className="grid grid-cols-4 gap-4 bg-[#171c25] py-2 rounded-lg mb-6">
                <div onClick={() => setActiveView('bank')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/wallet.png" className="w-10 h-10" alt="Ví Của Tôi" />
                    </div>
                    <span className="text-[#ffffffa6] text-xs font-medium leading-tight max-w-full text-center">Ví Của Tôi</span>
                </div>
                <div onClick={() => setActiveView('me')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/forum.png" className="w-10 h-10" alt="Thông Tin Của Tôi" />
                    </div>
                    <span className="text-[#ffffffa6] text-xs font-medium leading-tight max-w-full text-center">Thông Tin Của Tôi</span>
                </div>
                <div onClick={() => setActiveView('security')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/setting.png" className="w-10 h-10" alt="Mật Khẩu Thanh Toán" />
                    </div>
                    <span className="text-[#ffffffa6] text-xs font-medium leading-tight max-w-full text-center">Mật Khẩu Thanh Toán</span>
                </div>
                <div onClick={() => setActiveView('password')} className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                        <img src="/images/profile/interestTreasure.png" className="w-10 h-10" alt="Mật Khẩu Đăng Nhập" />
                    </div>
                    <span className="text-[#ffffffa6] text-xs font-medium leading-tight max-w-full text-center">Mật Khẩu Đăng Nhập</span>
                </div>
            </div>

            {/* Logout */}
            <div className="w-full h-[44px] mt-6">
                <button onClick={logout} className="w-full h-full rounded-lg text-gray-300 bg-[#171c25] active:scale-95 transition-all">
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};
