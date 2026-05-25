"use client"

import { useState, useEffect } from 'react'
import { PageHeader } from "@/components/layout/page-header"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

export function TransactionView({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'recharge' | 'withdraw'>('recharge')

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/transaction/history?type=${type}`)
        if (res.data && res.data.status) {
          setHistory(res.data.data)
        }
      } catch (error) {
        console.error("Lỗi lấy lịch sử giao dịch:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()

    // Real-time update listener
    const handleTxUpdate = () => {
      fetchHistory();
    };

    const socket = (window as any).socket;
    if (socket) {
      socket.on('transactionUpdate', handleTxUpdate);
      return () => {
        socket.off('transactionUpdate', handleTxUpdate);
      };
    }
  }, [type])

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return { text: 'Đang chờ', class: 'text-yellow-500 bg-yellow-500/10' }
      case 1: return { text: 'Thành công', class: 'text-green-500 bg-green-500/10' }
      case 2: return { text: 'Từ chối', class: 'text-red-500 bg-red-500/10' }
      default: return { text: 'Không xác định', class: 'text-gray-500 bg-gray-500/10' }
    }
  }

  return (
    <div className="min-h-[100dvh] max-w-[560px] mx-auto bg-background flex flex-col">
      <PageHeader title="Lịch sử giao dịch" onBack={onBack} showBottomBorder />

      {/* Tabs */}
      <div className="flex p-4 gap-2">
        <button 
          onClick={() => setType('recharge')}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all",
            type === 'recharge' ? "bg-button" : "bg-white/5 text-white/40"
          )}
        >
          Nạp tiền
        </button>
        <button 
          onClick={() => setType('withdraw')}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all",
            type === 'withdraw' ? "bg-button" : "bg-white/5 text-white/40"
          )}
        >
          Rút tiền
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
        {loading ? (
          <div className="py-20 text-center text-white/20 font-bold animate-pulse">Đang tải...</div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p className="text-xs font-bold uppercase tracking-widest">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const status = getStatusLabel(item.status)
              return (
                <div key={item.id_order} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-[#ffc53e] uppercase tracking-tighter">#{item.id_order}</p>
                    <p className="text-white font-bold text-sm">{parseFloat(item.money).toLocaleString()} USDT</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                      {new Date(parseInt(item.time)).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right flex flex-col gap-2 items-end">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg", status.class)}>
                      {status.text}
                    </span>
                    {item.admin_note && (
                      <p className="text-[9px] text-red-400 italic max-w-[120px] truncate">{item.admin_note}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
