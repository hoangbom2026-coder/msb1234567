"use client"

import { GameProps, GameResult, GameCountdown, BettingGrid } from "../game-elements"

export function K3View(props: GameProps) {
  const { currentSession, lastSession, timeLeft, lastResults, selectedTypes, onToggleType, oddsConfig } = props;

  const getOdds = (code: string) => {
    if (!oddsConfig) return "1.98";
    return (oddsConfig[code] || oddsConfig.common || "1.98").toString();
  };

  return (
    <>
      <div className="px-4">
        <GameResult session={lastSession} results={lastResults} type="dice" />
        <GameCountdown session={currentSession} timeLeft={timeLeft} />
      </div>

      <div className="flex-1 p-4 overflow-auto custom-scrollbar">
        <div className="space-y-4">
          {/* 1. Tổng cả 2 bên */}
          <BettingGrid 
            title="Tổng cả 2 bên" 
            options={[
              { label: 'Đại', odds: getOdds('b'), code: 'b' }, 
              { label: 'Đơn', odds: getOdds('l'), code: 'l' }, 
              { label: 'Rồng', odds: getOdds('rong'), code: 'rong', special: true },
              { label: 'Tiểu', odds: getOdds('s'), code: 's' }, 
              { label: 'Đôi', odds: getOdds('c'), code: 'c' }, 
              { label: 'Hổ', odds: getOdds('ho'), code: 'ho', special: true }
            ]} 
            selectedTypes={selectedTypes}
            onToggleType={onToggleType}
          />

          {/* 2. Quả bóng đầu tiên (BSOE) */}
          <BettingGrid 
            title="Quả bóng đầu tiên" 
            cols={2} 
            options={[
              { label: 'Đại', odds: getOdds('ball1-b'), code: 'ball1-b' }, 
              { label: 'Đơn', odds: getOdds('ball1-l'), code: 'ball1-l' }, 
              { label: 'Tiểu', odds: getOdds('ball1-s'), code: 'ball1-s' }, 
              { label: 'Đôi', odds: getOdds('ball1-c'), code: 'ball1-c' }
            ]} 
            selectedTypes={selectedTypes}
            onToggleType={onToggleType}
          />

          {/* 3. Con số tổng hợp (Sum 3-18) */}
          <BettingGrid 
            title="Con số tổng hợp" 
            options={Array.from({length: 16}, (_, i) => {
              const sum = i + 3;
              const code = `sum-${sum}`;
              return { label: sum.toString(), odds: getOdds(code), code };
            })} 
            selectedTypes={selectedTypes}
            onToggleType={onToggleType}
          />

          {/* 4. Quả bóng thứ 2 (BSOE) */}
          <BettingGrid 
            title="Quả bóng thứ 2" 
            cols={2} 
            options={[
              { label: 'Đại', odds: getOdds('ball2-b'), code: 'ball2-b' }, 
              { label: 'Đơn', odds: getOdds('ball2-l'), code: 'ball2-l' }, 
              { label: 'Tiểu', odds: getOdds('ball2-s'), code: 'ball2-s' }, 
              { label: 'Đôi', odds: getOdds('ball2-c'), code: 'ball2-c' }
            ]} 
            selectedTypes={selectedTypes}
            onToggleType={onToggleType}
          />

          {/* 5. Quả bóng thứ 3 (BSOE) */}
          <BettingGrid 
            title="Quả bóng thứ 3" 
            cols={2} 
            options={[
              { label: 'Đại', odds: getOdds('ball3-b'), code: 'ball3-b' }, 
              { label: 'Đơn', odds: getOdds('ball3-l'), code: 'ball3-l' }, 
              { label: 'Tiểu', odds: getOdds('ball3-s'), code: 'ball3-s' }, 
              { label: 'Đôi', odds: getOdds('ball3-c'), code: 'ball3-c' }
            ]} 
            selectedTypes={selectedTypes}
            onToggleType={onToggleType}
          />

          {/* 6-8. Từng quả bóng (Number 1-6) */}
          {['Quả bóng đầu tiên', 'Quả bóng thứ 2', 'Quả bóng thứ 3'].map((title, idx) => (
            <BettingGrid 
              key={idx}
              title={title} 
              options={Array.from({length: 6}, (_, i) => {
                const code = `ball${idx+1}-${i+1}`;
                return {
                  label: (i+1).toString(), 
                  odds: getOdds(code), 
                  code
                };
              })} 
              selectedTypes={selectedTypes}
              onToggleType={onToggleType}
            />
          ))}

          {/* 9. Cùng Một Số (Pairs) */}
          <BettingGrid 
            title="Cùng Một Số" 
            options={Array.from({length: 6}, (_, i) => {
              const code = `pair-${i+1}`;
              return {
                label: `[${i+1},${i+1}]`, 
                odds: getOdds(code), 
                code
              };
            })} 
            selectedTypes={selectedTypes}
            onToggleType={onToggleType}
          />

          {/* 10. Số Yard liên tiếp (Triples) */}
          <BettingGrid 
            title="Số Yard liên tiếp" 
            options={Array.from({length: 6}, (_, i) => {
              const code = `triple-${i+1}`;
              return {
                label: `[${i+1},${i+1},${i+1}]`, 
                odds: getOdds(code), 
                code
              };
            })} 
            selectedTypes={selectedTypes}
            onToggleType={onToggleType}
          />
        </div>
      </div>
    </>
  );
}
