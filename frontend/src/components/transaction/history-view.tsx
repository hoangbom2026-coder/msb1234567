import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function HistoryView() {
    const navigate = useNavigate()
    const [type, setType] = useState<'recharge' | 'withdraw'>('recharge')
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    const fetchHistory = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/transaction/history?type=${type}`)
            if (res.data && res.data.status) {
                setHistory(res.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch history", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [type])

    const getStatusInfo = (status: number) => {
        switch (status) {
            case 0: return { label: 'Đang xử lý', color: 'text-amber-500' }
            case 1: return { label: 'Thành công', color: 'text-green-500' }
            case 2: return { label: 'Từ chối', color: 'text-red-500' }
            default: return { label: 'Chờ duyệt', color: 'text-gray-500' }
        }
    }

    // Basic pagination logic (frontend slice for now since API might return all)
    const itemsPerPage = 10;
    const totalPages = Math.ceil(history.length / itemsPerPage) || 1;
    const paginatedHistory = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="min-h-screen bg-[#0b0f17] flex flex-col flex-1 pb-10">
            <div className="h-[44px] w-full flex mb-5 px-2.5 flex-shrink-0">
                <div className="w-[30px] flex-shrink-0 flex items-center justify-start cursor-pointer" onClick={() => navigate(-1)}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" className="text-white" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
                    </svg>
                </div>
                <div className="w-full flex-1 flex justify-center items-center text-xl text-white h-full">
                    <p className="leading-none">Lịch sử giao dịch</p>
                </div>
                <div className="w-[30px] flex-shrink-0 flex items-center"></div>
            </div>

            <div className="px-4">
                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 justify-center">
                    <button 
                        onClick={() => { setType('recharge'); setPage(1); }}
                        className={cn(
                            "px-6 py-3 font-medium rounded text-sm transition-all min-w-[140px]",
                            type === 'recharge' 
                                ? "bg-[#ffc107] text-black" 
                                : "bg-transparent border border-white/10 text-gray-400"
                        )}
                    >
                        Lịch sử nạp tiền
                    </button>
                    <button 
                        onClick={() => { setType('withdraw'); setPage(1); }}
                        className={cn(
                            "px-6 py-3 font-medium rounded text-sm transition-all min-w-[140px]",
                            type === 'withdraw' 
                                ? "bg-[#ffc107] text-black" 
                                : "bg-transparent border border-white/10 text-gray-400"
                        )}
                    >
                        Lịch sử rút tiền
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Loader2 className="animate-spin text-[#ffc107] mb-4" size={40} />
                        <span className="text-xs font-black uppercase text-gray-400">Đang tải...</span>
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-20 text-center opacity-50 text-gray-400 text-sm">
                        Không có dữ liệu
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedHistory.map((item, idx) => {
                            const statusInfo = getStatusInfo(item.status)
                            return (
                                <div key={idx} className="p-4 bg-[#17212b] rounded-lg border border-white/5 flex flex-col md:flex-row justify-between items-start gap-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                            <img src="/all/usdt_icon.png" className="w-full h-full object-cover" alt="icon" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-sm uppercase">
                                                {type === 'recharge' ? 'NẠP TIỀN' : 'RÚT TIỀN'}
                                            </span>
                                            <span className="text-[11px] text-gray-400 mt-0.5">
                                                {format(new Date(parseInt(item.time)), 'HH:mm dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-2 md:mt-0 space-y-1">
                                        <div className="text-sm">
                                            <span className="text-gray-400">Số Tiền {type === 'recharge' ? 'Nạp' : 'Rút'}: </span>
                                            <span className="text-white font-bold">
                                                {parseFloat(item.money).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className={cn("text-xs font-medium", statusInfo.color)}>
                                            {statusInfo.label}
                                        </div>
                                        {item.proof_note && (
                                            <div className="text-sm mt-1">
                                                <span className="text-gray-400">Ghi chú: </span>
                                                <span className="text-white font-medium">{item.proof_note}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8 pt-4">
                                <button 
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="w-8 h-8 flex items-center justify-center border border-white/10 rounded bg-transparent text-gray-400 disabled:opacity-50"
                                >
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <div className="w-8 h-8 flex items-center justify-center rounded bg-[#13a2ba] text-white font-bold text-sm">
                                    {page}
                                </div>
                                <button 
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="w-8 h-8 flex items-center justify-center border border-white/10 rounded bg-transparent text-gray-400 disabled:opacity-50"
                                >
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
