import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { GAMES } from '@/lib/constants'
import { cn } from "@/lib/utils"

export function BetHistoryView({ onBack }: { onBack: () => void }) {
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState({ totalBet: 0, totalWin: 0 })
    const [history, setHistory] = useState<any[]>([])
    const [filters, setFilters] = useState({
        room_id: 'all',
        time: 'all',
        status: '' // '', won, lost, pending
    })

    const fetchBetHistory = async () => {
        try {
            setLoading(true)
            const res = await api.get('/user/bet-history', { params: filters })
            if (res.data && res.data.status) {
                setHistory(res.data.data.list || [])
                setSummary(res.data.data.summary || { totalBet: 0, totalWin: 0 })
            }
        } catch (error) {
            console.error("Failed to fetch bet history", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBetHistory()

        const handleResult = () => {
            fetchBetHistory();
        };

        const socket = (window as any).socket;
        if (socket) {
            socket.on('result', handleResult);
            return () => {
                socket.off('result', handleResult);
            };
        }
    }, [filters])

    const statusTabs = [
        { label: 'Tất cả', value: '' },
        { label: 'Đã trúng thưởng', value: 'won' },
        { label: 'Không trúng thưởng', value: 'lost' },
        { label: 'Chờ giải thưởng', value: 'pending' }
    ]

    return (
        <div className="flex flex-col flex-1 pb-20">
            <div className="pb-8">
                <div className="h-[44px] w-full flex mb-5 shadow-[0_1px_6px_#132235] px-2.5 flex-shrink-0 !shadow-none">
                    <div className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer" onClick={onBack}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
                        </svg>
                    </div>
                    <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
                        <p className="leading-none">Lịch sử tham gia</p>
                    </div>
                    <div className="w-[30px] flex-shrink-0 flex items-center"></div>
                </div>

                <div className="w-full px-4 py-2 mx-auto bg-transparent rounded-lg">
                    <div className="flex flex-row gap-4 mb-6">
                        <select
                            value={filters.room_id}
                            onChange={(e) => setFilters({ ...filters, room_id: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border !border-[#087c95] text-white bg-[#23334c] focus-within:outline-none"
                        >
                            <option value="all">Tất cả</option>
                            {GAMES.map(game => (
                                <option key={game.id} value={game.id}>{game.name}</option>
                            ))}
                        </select>
                        <select
                            value={filters.time}
                            onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border !border-[#087c95] text-white bg-[#23334c] focus-within:outline-none"
                        >
                            <option value="all">Tất cả</option>
                            <option value="today">Hôm nay</option>
                            <option value="yesterday">Hôm qua</option>
                            <option value="thisWeek">Tuần này</option>
                            <option value="thisMonth">Tháng này</option>
                            <option value="lastMonth">Tháng trước</option>
                        </select>
                    </div>

                    <div className="flex max-w-full gap-2 py-2 pb-2 mb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 scroll-smooth">
                        {statusTabs.map((tab) => {
                            const isActive = filters.status === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilters({ ...filters, status: tab.value })}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm min-w-fit font-medium transition-all",
                                        isActive
                                            ? "text-white bg-gradient-to-b from-[#13a2ba] to-[#087c95] shadow-md"
                                            : "bg-[#2c5c61] text-gray-400 hover:bg-gray-200 hover:text-gray-800"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-2 py-4 font-medium uppercase text-md">
                        <span className="text-green-500">Tổng thắng: {summary.totalWin.toLocaleString()}</span>
                        <span className="text-blue-500">Tổng tham gia : {summary.totalBet.toLocaleString()}</span>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <Loader2 className="animate-spin text-[#13a2ba] mb-4" size={32} />
                                <span className="text-xs text-gray-400 uppercase">Đang tải...</span>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
                        ) : (
                            history.map((item, idx) => (
                                <div key={idx} className="p-4 bg-[#23334c] border border-white/5 rounded-lg flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[#13a2ba] font-bold text-sm">
                                            {item.game_name || item.game_id}
                                        </h4>
                                        <div className={cn(
                                            "text-[10px] font-bold px-2 py-1 rounded",
                                            item.status === 1 ? 'bg-green-500/20 text-green-500' :
                                                item.status === 2 ? 'bg-gray-500/20 text-gray-400' :
                                                    'bg-amber-500/20 text-amber-500'
                                        )}>
                                            {item.status === 1 ? 'Thắng' : item.status === 2 ? 'Thua' : 'Chờ giải'}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Kỳ số: <span className="text-white">{item.period}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                                        <div className="text-xs text-gray-400">
                                            Tham gia: <span className="text-blue-400 font-bold">{parseFloat(item.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Thắng: <span className={cn("font-bold", item.win_amount > 0 ? "text-green-500" : "text-gray-400")}>{parseFloat(item.win_amount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
