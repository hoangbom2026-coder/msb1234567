"use client"

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Clock, History, Trophy, TrendingUp, ChevronLeft } from "lucide-react"

export function BetNoteView({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<any[]>([])
  const [summary, setSummary] = useState({ totalBet: 0, totalWin: 0 })
  const [loading, setLoading] = useState(true)

  const [timeFilter, setTimeFilter] = useState('today') // today, week, month

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        time: timeFilter,
      })
      const { data } = await api.get(`/user/bet-history?${params.toString()}`)
      if (data.status) {
        setHistory(data.data.list)
        setSummary(data.data.summary)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [timeFilter])

  return (
    <div className="min-h-[100dvh] max-w-[560px] mx-auto main-layout bg-[#0b0f17] flex flex-col">
      {/* Custom Header for BetNoteView (Used inside Account page usually) */}
      <div className="h-[56px] w-full flex mb-2 px-3 flex-shrink-0 sticky top-0 bg-[#0c192c] z-10 border-b border-white/5 items-center">
        <button onClick={onBack} className="p-2 active:scale-90 transition-transform">
          <ChevronLeft className="text-white" size={28} />
        </button>
        <div className="flex-1 flex justify-center items-center text-lg text-white font-bold uppercase tracking-wider">
          Lịch sử tham gia
        </div>
        <div className="w-[40px]"></div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        <div className="bg-[#1a2c3e] p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <TrendingUp size={14} className="text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng tham gia </span>
          </div>
          <p className="text-lg font-black text-white">{summary.totalBet.toLocaleString()} <span className="text-[10px] text-gray-500">USDT</span></p>
        </div>
        <div className="bg-[#1a2c3e] p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <Trophy size={14} className="text-green-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng thắng</span>
          </div>
          <p className="text-lg font-black text-green-400">{summary.totalWin.toLocaleString()} <span className="text-[10px] text-gray-500">USDT</span></p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: 'thisWeek', label: 'Tuần này' },
            { id: 'thisMonth', label: 'Tháng này' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${timeFilter === t.id ? 'bg-[#13a2ba] text-white shadow-lg shadow-[#13a2ba]/20' : 'bg-white/5 text-gray-400 border border-white/5'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p className="text-sm font-bold uppercase tracking-widest text-white">Đang tải dữ liệu...</p>
          </div>
        ) : history.length > 0 ? (
          history.map((item) => (
            <div key={item.id} className="bg-[#1a2c3e] p-4 rounded-2xl border border-white/5 flex justify-between items-center active:scale-[0.98] transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase">{item.bet_type}</span>
                  <span className="text-[10px] font-bold text-gray-500">({item.bet_value})</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock size={10} />
                  <span className="text-[9px] font-bold">{new Date(parseInt(item.created_at)).toLocaleString('vi-VN')}</span>
                </div>
                <p className="text-[9px] text-[#13a2ba] font-bold tracking-tighter uppercase">Kỳ: {item.period}</p>
              </div>

              <div className="text-right space-y-1">
                <p className="text-sm font-black text-white">{parseFloat(item.amount).toLocaleString()} <span className="text-[8px] text-[#ffc53e]">USDT</span></p>
                <div className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${item.status === 1 ? "bg-green-500/10 text-green-500" :
                  item.status === 0 ? "bg-[#13a2ba]/10 text-[#13a2ba]" : "bg-red-500/10 text-red-500"
                  }`}>
                  {item.status === 1 ? 'Đã trúng' : item.status === 0 ? 'Đang chờ' : 'Thất bại'}
                </div>
                {item.status === 1 && (
                  <p className="text-[10px] font-bold text-green-400">+{parseFloat(item.win_amount).toLocaleString()}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <History size={48} className="mb-4 text-white" />
            <p className="text-sm font-bold uppercase tracking-widest text-white">Không có lịch sử tham gia</p>
          </div>
        )}
      </div>
    </div>
  )
}
