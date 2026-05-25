"use client"

import { cn } from "@/lib/utils"

export interface GameProps {
  currentSession: string;
  lastSession: string;
  timeLeft: string;
  lastResults: number[];
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  oddsConfig?: any;
  user: any; 
}

export function GameResult({ session, results, type }: { session: string, results: number[], type: 'dice' | 'ball' }) {
  return (
    <div className="bg-[#171c25] p-4 rounded-lg mt-4">
      <span className="flex items-center gap-2 text-lg font-bold text-white">{session} <span>Số kỳ</span></span>
      <div className={cn("flex justify-between mt-4", 
        type === 'dice' ? "" : (
          cn("grid gap-2 w-full", 
            results.length === 10 ? "grid-cols-10" : (results.length === 8 ? "grid-cols-8" : (results.length === 5 ? "grid-cols-5" : "grid-cols-6"))
          )
        )
      )}>
        {results.map((val, i) => (
          type === 'dice' ? (
            <div key={i} className="w-12">
              <img src={`/sgp/s${val}.png`} className="w-full" alt={`dice-${val}`} loading="lazy" />
            </div>
          ) : (
            <div key={i} className="w-full leading-4 text-xl text-black font-bold aspect-square bg-white rounded-full border-4 border-dashed border-[#ffc53e] flex justify-center items-center">
              {val}
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export function GameCountdown({ session, timeLeft }: { session: string, timeLeft: string }) {
  const seconds = parseInt(timeLeft.split(':')[0] || '0') * 60 + parseInt(timeLeft.split(':')[1] || '0');
  
  const openTimeSeconds = seconds + 15;
  const openMins = Math.floor(openTimeSeconds / 60).toString().padStart(2, '0');
  const openSecs = (openTimeSeconds % 60).toString().padStart(2, '0');
  const openTimeStr = `${openMins}:${openSecs}`;

  return (
    <div className="p-4 rounded-lg bg-[#171c25] mt-4">
      <div className="flex justify-between">
        <p className="flex gap-2 py-1 font-bold text-white">{session}<span>Số kỳ</span></p>
        <div className="text-xl text-white">
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <div className="text-white">Tham gia:</div>
              <div className="px-4 py-1 rounded-lg min-w-[80px]">
                <span className="font-bold text-green-500">{timeLeft}</span>
              </div>
            </div>
            <div className="flex items-center mt-1">
              <div className="text-white">Mở thưởng</div>
              <div className="px-4 py-1 rounded-lg min-w-[80px]">
                <span className="font-bold text-red-500">{openTimeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BettingGrid({ 
  title, 
  options, 
  cols = 3, 
  selectedTypes, 
  onToggleType 
}: { 
  title: string, 
  options: { label: string, odds: string, code?: string, special?: boolean }[], 
  cols?: number,
  selectedTypes: string[],
  onToggleType: (type: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 mb-4 text-white rounded-lg shadow bg-black/30 sm:p-2">
      <label className="text-[20px] sm:text-lg font-semibold mb-2">{title}</label>
      <div className={cn("grid w-full gap-4 sm:gap-2", 
        cols === 3 ? "grid-cols-3" : (cols === 2 ? "grid-cols-2" : "grid-cols-4"))}>
        {options.map((opt, i) => {
          const code = opt.code || opt.label;
          const isSelected = selectedTypes.includes(code);
          return (
            <div 
              key={i}
              onClick={() => onToggleType(code)}
              className={cn(
                "flex flex-col items-center justify-center rounded-md px-3 sm:px-1 py-1 cursor-pointer transition-all duration-200 active:scale-95",
                isSelected 
                  ? "bg-[#ffc53e] text-black" 
                  : "bg-[#404b5e] text-white"
              )}
            >
              <span className={cn("text-center sm:text-[14px]", isSelected ? "font-bold text-black" : "")}>
                {opt.label}
              </span>
              <span className={cn(isSelected ? "text-black/80 font-bold" : "text-[#aaa]")}>
                {opt.odds}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
