"use client"

import { GameResult, GameCountdown, BettingGrid } from "./game-elements"
import { type User } from "@/lib/auth-store"

interface BallViewProps {
  user: User | null;
  currentSession: string;
  lastSession: string;
  timeLeft: string;
  lastResults: number[];
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  ballCount: number;
  ballMax: number;
  gameType?: string;
  oddsConfig?: any;
}

export function BallView({ 
  currentSession, 
  lastSession,
  timeLeft, 
  lastResults, 
  selectedTypes, 
  onToggleType, 
  ballCount, 
  ballMax,
  oddsConfig
}: BallViewProps) {
  
  const positions = [
    'Quán quân', 'Á Quân', 'Á Quân 2', 'Vị trí thứ 4', 'Vị trí thứ 5', 
    'Vị trí thứ 6', 'Vị trí thứ 7', 'Vị trí thứ 8'
  ].slice(0, ballCount)

  const getOptionOdds = (code: string) => {
    if (!oddsConfig) return "1.98";
    return (oddsConfig[code] || oddsConfig.common || "1.98").toString();
  };

  return (
    <>
      <div className="px-4">
        <GameResult session={lastSession} results={lastResults} type="ball" />
      </div>
      <div className="px-4">
        <GameCountdown session={currentSession} timeLeft={timeLeft} />
      </div>

      <div className="flex-1 p-4 overflow-auto custom-scrollbar">
        <div className="space-y-4">
          {positions.map((pos, idx) => {
            const hasDragonTiger = idx < 5;
            const options = [
              { label: 'Đại', odds: getOptionOdds(`pos${idx}-b`), code: `pos${idx}-b` },
              { label: 'Đơn', odds: getOptionOdds(`pos${idx}-l`), code: `pos${idx}-l` },
              { label: 'Tiểu', odds: getOptionOdds(`pos${idx}-s`), code: `pos${idx}-s` },
              { label: 'Đôi', odds: getOptionOdds(`pos${idx}-c`), code: `pos${idx}-c` }
            ];

            if (hasDragonTiger) {
              options.splice(2, 0, { label: 'Rồng', odds: getOptionOdds(`pos${idx}-rong`), code: `pos${idx}-rong` });
              options.push({ label: 'Hổ', odds: getOptionOdds(`pos${idx}-ho`), code: `pos${idx}-ho` });
            }

            return (
              <BettingGrid 
                key={pos}
                title={pos}
                cols={hasDragonTiger ? 3 : 2}
                options={options}
                selectedTypes={selectedTypes}
                onToggleType={onToggleType}
              />
            );
          })}

          {positions.map((pos, idx) => (
            <BettingGrid 
              key={`${pos}-numbers`}
              title={pos}
              cols={3}
              options={Array.from({ length: ballMax }).map((_, i) => {
                const val = ballMax === 10 ? i : i + 1;
                const code = `pos${idx}-${val}`;
                return {
                  label: val.toString(),
                  odds: getOptionOdds(code), 
                  code: code
                };
              })}
              selectedTypes={selectedTypes}
              onToggleType={onToggleType}
            />
          ))}
        </div>
      </div>
    </>
  )
}
