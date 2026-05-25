"use client"

import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth-store"
import { type User } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

export function GameHeader({ title, onShowHistory }: { title: string, onShowHistory: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="relative flex justify-between p-4">
      <label className="absolute text-lg text-white -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">{title}</label>
      <div className="flex items-center gap-1" onClick={() => navigate(-1)}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="cursor-pointer text-white" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path d="M11.67 3.87 9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z"></path>
        </svg>
      </div>
      <div className="px-4" onClick={onShowHistory}>
        <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" className="cursor-pointer text-white" height="28" width="28" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18H17V16H7V18Z" fill="currentColor"></path>
          <path d="M17 14H7V12H17V14Z" fill="currentColor"></path>
          <path d="M7 10H11V8H7V10Z" fill="currentColor"></path>
          <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"></path>
        </svg>
      </div>
    </div>
  )
}

export function UserStats({ user }: { user: User | null }) {
  return (
    <div className="p-4">
      <div className="py-4 bg-[#171c25] flex justify-between text-center rounded-lg">
        <div className="w-1/3">
          <div className="flex items-center justify-center text-[1rem] text-white">Tổng tiền</div>
          <div className="text-[#ffc53e] font-bold text-2xl mt-4">
            {(user?.money || 0).toLocaleString()}
          </div>
        </div>
        <div className="w-1/3">
          <div className="flex items-center justify-center text-[1rem] text-white whitespace-nowrap">Tổng hôm nay</div>
          <div className="text-[#ffc53e] font-bold text-2xl mt-4">
            {(user?.todayBet || 0).toLocaleString()}
          </div>
        </div>
        <div className="w-1/3">
          <div className="flex items-center justify-center text-[1rem] text-white">Lãi/lỗ hôm nay</div>
          <div className="text-[#ffc53e] font-bold text-2xl mt-4">
            {(user?.todayProfit || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BettingFooter({
  betAmount,
  setBetAmount,
  onPlaceBet,
  onReset,
  balance,
}: {
  betAmount: number,
  setBetAmount: (val: number) => void,
  onPlaceBet: () => void,
  onReset: () => void,
  balance: number,
  selectedCount?: number
}) {
  const chips = [
    { label: '5', img: 0, val: 5 },
    { label: '50', img: 1, val: 50 },
    { label: '100', img: 2, val: 100 },
    { label: '1000', img: 3, val: 1000 },
    { label: '50%', img: 4, val: Math.floor(balance * 0.5) },
    { label: 'ALL IN', img: 5, val: balance }
  ]

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 p-2 w-full max-w-[560px] bg-[#0c192c] z-50">
      <div className="grid grid-cols-6 gap-2">
        {chips.map((chip, idx) => (
          <div 
            key={idx} 
            className="relative" 
            onClick={() => {
              if (chip.label === 'ALL IN' || chip.label === '50%') {
                setBetAmount(chip.val);
              } else {
                setBetAmount((betAmount || 0) + chip.val);
              }
            }}
          >
            <img src={`/sgp/jydticon${chip.img}.png`} className="w-full cursor-pointer" alt={chip.label} loading="lazy" />
            <span className="absolute text-lg text-black -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 whitespace-nowrap font-bold pointer-events-none">
              {chip.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center w-full gap-2 pt-2 border-t border-slate-800 mt-2">
        <input 
          placeholder="Nhập số tiền" 
          maxLength={10} 
          type="number" 
          className="p-2 text-lg text-black bg-white rounded-md flex-[1.3] outline-none" 
          value={betAmount || ''}
          onChange={(e) => setBetAmount(Number(e.target.value))}
        />
        <button 
          className="flex-1 p-2 rounded-lg bg-[#404b5e] whitespace-nowrap font-bold text-xl text-white" 
          onClick={onReset}
        >
          Cài lại
        </button>
        <button 
          className="flex-1 p-2 text-xl font-bold rounded-lg bg-button whitespace-nowrap text-white" 
          onClick={onPlaceBet}
        >
          Tham gia
        </button>
      </div>
    </div>
  )
}
