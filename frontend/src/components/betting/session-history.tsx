"use client"
import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import api from '@/lib/api'

interface SessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  isDiceGame: boolean;
  ballCount: number;
  gameCode: string;
}

interface RoundHistoryItem {
  round_code: string;
  end_time: string;
  result: number[] | null;
  total_bet: string;
}

export function SessionHistory({ isOpen, onClose, isDiceGame, ballCount, gameCode }: SessionHistoryProps) {
  const [history, setHistory] = useState<RoundHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const res = await api.get('/game/result', {
          params: {
            gameId: gameCode,
            limit: 30
          }
        })
        
        if (res.data.status) {
          const items = (res.data.data || []).map((item: any) => ({
            round_code: item.period,
            end_time: item.end_time,
            result: typeof item.result === 'string' ? JSON.parse(item.result) : item.result,
            total_bet: '0'
          }))
          setHistory(items)
        }
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchHistory()

      // Real-time update
      const handleResult = (data: any) => {
          if (data && data.room_id === gameCode) {
              fetchHistory();
          } else {
              // fallback if room_id is missing or if we want total sync
              fetchHistory();
          }
      };

      const socket = (window as any).socket;
      if (socket) {
          socket.on('result', handleResult);
          return () => {
              socket.off('result', handleResult);
          };
      }
    }
  }, [isOpen, gameCode])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black max-w-[560px] mx-auto flex flex-col">
      {/* Fixed Header */}
      <div className="fixed w-full max-w-[560px] left-1/2 top-0 -translate-x-1/2 p-3 border-b bg-[#0c192c] border-white/10 z-[10000] h-14 flex items-center">
        <button onClick={onClose} className="text-white hover:text-primary transition-colors active:scale-90">
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
            <polyline fill="none" strokeWidth="2" points="9 6 15 12 9 18" transform="matrix(-1 0 0 1 24 0)"></polyline>
          </svg>
        </button>
        <label className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-[20px] font-bold text-white whitespace-nowrap">
          Lịch sử phiên
        </label>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 pt-16 overflow-auto custom-scrollbar p-4 space-y-3 pb-24">
        {loading ? (
          <div className="text-center py-10 text-white/60">Đang tải...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-white/60">Chưa có dữ liệu</div>
        ) : (
          history.map((round, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#171c25] border border-white/5 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[14px] font-bold text-[#aaa]">
                  {round.round_code} Số kỳ
                </span>
                <span className="text-[12px] text-white/40">
                  {new Date(round.end_time).toLocaleTimeString('vi-VN')}
                </span>
              </div>
              <div className={cn(
                isDiceGame ? "flex justify-center items-center gap-4" : 
                "flex flex-wrap justify-center items-center gap-2"
              )}>
                {round.result ? (
                  isDiceGame ? (
                    round.result.map((val, idx) => (
                      <div key={idx} className="w-10">
                        <img 
                          src={`/sgp/s${val}.png`} 
                          className="w-full dice-shadow" 
                          alt="dice" 
                        />
                      </div>
                    ))
                  ) : (
                    round.result.map((val, idx) => (
                      <div 
                        key={idx} 
                        className="w-8 h-8 bg-white rounded-full border-2 border-dashed border-[#ffc53e] flex items-center justify-center text-black font-black text-[14px] shadow-sm"
                      >
                        {val}
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-[12px] text-white/40 italic">Đang chờ...</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
