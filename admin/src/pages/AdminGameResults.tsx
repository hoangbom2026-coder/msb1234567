import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/admin-api';
import { useToast } from '@/hooks/use-toast';
import { Target, RotateCcw, CheckCircle2, AlertTriangle, BarChart3, Clock, History, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

export default function AdminGameResultsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [gameRooms, setGameRooms] = useState<any[]>([]);
  const [cheatResult, setCheatResult] = useState<any>(null);
  const [estimatedProfit, setEstimatedProfit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [now, setNow] = useState(Date.now());
  const { toast } = useToast();

  const fetchRooms = async () => {
    try {
      const res = await adminApi.getGames();
      if (res.status) {
        const sorted = (res.data || []).sort((a: any, b: any) => {
          const order = ['5K3', '10K3', 'LUCKY_SPACE', 'GOOD_LUCK', 'SPEED_PRO', 'LOTTERY_5MIN', 'LOTTERY_X10', 'SPEED_11X5'];
          return order.indexOf(a.game_id) - order.indexOf(b.game_id);
        });
        setGameRooms(sorted);
        if (sorted.length > 0 && !activeTab) setActiveTab(sorted[0].game_id);
      }
    } catch (error) { console.error(error); }
  }

  const fetchSessions = async () => {
    try {
      const res = await adminApi.getOpenSessions();
      if (res.status) {
        setSessions(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchSessions();

    const pollTimer = setInterval(fetchSessions, 2000);

    return () => clearInterval(pollTimer);
  }, []);

  useEffect(() => {
    const s = sessions.find(sess => sess.game_id === activeTab);
    if (s && !cheatResult) {
      resetCheatData(s);
    }
  }, [activeTab, sessions]);

  const resetCheatData = (s: any) => {
    const gid = s.game_id || '';
    if (s.room_type === 'k3') setCheatResult([1, 1, 1]);
    else if (s.room_type === '5d') {
      let count = 10;
      let startVal = 0;
      if (gid === 'LUCKY_SPACE' || gid === 'SPEED_PRO') { count = 8; startVal = 1; }
      else if (gid === 'SPEED_11X5') { count = 10; startVal = 0; }
      setCheatResult(new Array(count).fill(startVal));
    } else {
      setCheatResult([0]);
    }
  }

  useEffect(() => {
    const s = sessions.find(sess => sess.game_id === activeTab);
    if (!s || cheatResult === null) return;

    const stats = s.bet_stats || [];
    let totalBet = 0;
    let totalPayout = 0;

    for (const bet of stats) {
      const amount = parseFloat(bet.total_amount);
      totalBet += amount;
      let isWin = false;
      const type = bet.type;
      const select = bet.select;

      if (s.room_type === 'k3') {
        const sum = cheatResult.reduce((a: any, b: any) => a + b, 0);
        if (type === 'big_small') {
          if (select === 'big' && sum >= 11) isWin = true;
          if (select === 'small' && sum <= 10) isWin = true;
        } else if (type === 'odd_even') {
          if (select === 'odd' && sum % 2 !== 0) isWin = true;
          if (select === 'even' && sum % 2 === 0) isWin = true;
        }
      } else if (s.room_type === '5d' || s.room_type === 'wingo') {
        const lastNum = cheatResult[cheatResult.length - 1];
        if (type === 'big_small') {
          if (select === 'big' && lastNum >= 5) isWin = true;
          if (select === 'small' && lastNum <= 4) isWin = true;
        } else if (type === 'odd_even') {
          if (select === 'odd' && lastNum % 2 !== 0) isWin = true;
          if (select === 'even' && lastNum % 2 === 0) isWin = true;
        }
      }

      if (isWin) totalPayout += (amount * 1.96);
    }
    setEstimatedProfit(totalBet - totalPayout);
  }, [cheatResult, activeTab, sessions]);

  const handleCheatSubmit = async (sessionId: string) => {
    if (cheatResult === null) return;
    try {
      const res = await adminApi.setManualResult(sessionId, cheatResult);
      if (res.status) {
        toast({ title: "Thành công", description: "Đã can thiệp kết quả thành công." });
        fetchSessions();
      }
    } catch (error: any) { console.error(error); }
  };

  const applySuggestion = (s: any, suggestion: string) => {
    if (!suggestion || suggestion === 'Ngẫu nhiên') return;
    const parts = suggestion.split(' + ');
    const isBig = parts[0] === 'Tài';
    const isOdd = parts[1] === 'Lẻ';

    let nr = [...cheatResult];
    if (s.room_type === 'k3') {
        if (isBig && !isOdd) nr = [6, 6, 4];
        if (isBig && isOdd) nr = [6, 6, 5];
        if (!isBig && isOdd) nr = [1, 1, 1];
        if (!isBig && !isOdd) nr = [1, 1, 2];
    } else {
        const lastIdx = nr.length - 1;
        if (isBig && isOdd) nr[lastIdx] = 9;
        if (isBig && !isOdd) nr[lastIdx] = 8;
        if (!isBig && isOdd) nr[lastIdx] = 1;
        if (!isBig && !isOdd) nr[lastIdx] = 0;
    }
    setCheatResult(nr);
    toast({ title: "Đã nạp gợi ý", description: `Đã tự động chọn bộ số khớp với: ${suggestion}` });
  }

  const calculatePercent = (val: number, total: number) => {
    if (!total || total === 0) return 50;
    return (val / total) * 100;
  }

  return (
    <div className="flex-1 p-2 md:p-6 lg:p-8 space-y-4 md:space-y-6 font-['Inter'] animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white uppercase italic tracking-tighter">Bàng điều khiển game</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60">Chỉnh sửa kết quả</p>
        </div>
        <div className="flex gap-2">
            <Link to="/admin/games/history">
                <Button variant="outline" className="rounded-sm gap-2 border-slate-200 h-10 px-6 font-black text-[10px] uppercase shadow-sm hover:bg-slate-50">
                    <History className="h-4 w-4" /> XEM LỊCH SỬ PHIÊN
                </Button>
            </Link>
            <Button variant="outline" className="rounded-sm gap-2 border-slate-200 h-10 px-6 font-black text-[10px] uppercase shadow-sm" onClick={fetchSessions} disabled={loading}>
                <RotateCcw className={cn("h-4 w-4", loading && "animate-spin")} /> Cập nhật dòng tiền
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCheatResult(null); }} className="w-full space-y-6">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="bg-slate-100 p-1 h-12 rounded-sm border inline-flex w-max min-w-full lg:min-w-0 shadow-inner">
            {gameRooms.map(game => (
              <TabsTrigger key={game.game_id} value={game.game_id} className="rounded-sm font-black uppercase text-[10px] gap-2 px-6 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                {game.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {gameRooms.map(game => {
          const s = sessions.find(sess => sess.game_id === game.game_id);
          if (!s) return null;

          const totalBS = (s.analysis?.big_small?.big + s.analysis?.big_small?.small) || 0;
          const totalOE = (s.analysis?.odd_even?.odd + s.analysis?.odd_even?.even) || 0;
          const suggestion = s.suggestion || 'Ngẫu nhiên';
          const tLeft = Math.max(0, Math.floor((Number(s.end_time) - now) / 1000));

          return (
            <TabsContent key={game.game_id} value={game.game_id} className="mt-0 outline-none animate-in slide-in-from-bottom-2 duration-400">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-8">
                {/* Left Panel - Analysis */}
                <div className="lg:col-span-5 space-y-3">
                  <Card className="rounded-none border-0 border-l-4 border-l-primary bg-white shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b p-3 flex flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="h-8 w-8 bg-white border rounded-sm flex items-center justify-center p-1 shadow-sm">
                          <img src={`/images/listgame/${game.game_id?.toLowerCase()}.png`} className="w-full h-full object-contain icon-primary" alt="" />
                        </div>
                        <div>
                          <h3 className="font-black text-xs text-slate-800 uppercase italic leading-none">{s.room_name}</h3>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Kỳ: #{s.period?.slice(-6)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center hidden sm:flex">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5 tracking-widest text-center">KẾT QUẢ SẼ ÁP DỤNG</p>
                        <div className="flex justify-center gap-1 items-center">
                          {cheatResult && Array.isArray(cheatResult) && cheatResult.map((n: number, i: number) => (
                            <div key={i} className="w-7 h-7 rounded-sm bg-slate-900 text-primary flex items-center justify-center text-xs font-black border-b-2 border-primary shadow-lg">{n}</div>
                          ))}
                        </div>
                      </div>

                      <CountdownTimer endTime={s.end_time} />
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-50 border rounded-none text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Dòng tiền</p>
                          <p className="text-lg font-black text-slate-800 italic">{s.total_bet_money?.toLocaleString()} $</p>
                        </div>
                        <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-none text-center flex flex-col justify-center items-center">
                          <p className="text-[8px] font-black text-emerald-600/60 uppercase mb-0.5">Lợi nhuận dự kiến</p>
                          <p className={cn("text-lg font-black italic leading-none", estimatedProfit >= 0 ? "text-emerald-600" : "text-rose-500")}>
                            {estimatedProfit.toLocaleString()} $
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <ChartRow label="TÀI / XỈU" total={totalBS} partA={s.analysis?.big_small?.big} partALabel="TÀI" partBLabel="XỈU" colorA="bg-rose-500" colorB="bg-blue-500" />
                        <ChartRow label="LẺ / CHẴN" total={totalOE} partA={s.analysis?.odd_even?.odd} partALabel="LẺ" partBLabel="CHẴN" colorA="bg-amber-500" colorB="bg-slate-800" />
                      </div>

                      {}
                      <div className="pt-4 border-t border-dashed mt-4">
                           <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black uppercase text-slate-400">Gợi ý từ hệ thống</span>
                                <Badge variant="outline" className="h-4 text-[8px] font-black border-primary/20 text-primary bg-primary/5 px-2">AI ANALYTICS</Badge>
                           </div>
                           <div className="bg-slate-900 p-3 flex items-center justify-between rounded-sm shadow-inner group">
                                <div className="flex items-center gap-3">
                                     <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                          <Zap size={12} />
                                     </div>
                                     <p className="text-[11px] font-black text-white uppercase tracking-tighter italic">{suggestion}</p>
                                </div>
                                <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-[10px] font-black text-primary hover:text-white uppercase tracking-widest"
                                    onClick={() => applySuggestion(s, suggestion)}
                                >
                                    ÁP DỤNG <ArrowRight size={10} className="ml-1" />
                                </Button>
                           </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {}
                <div className="lg:col-span-7">
                  <Card className="rounded-none border-0 shadow-2xl bg-white min-h-full flex flex-col">
                    <CardHeader className="bg-[#0a0f18] text-white py-3 px-6 border-b border-white/10 hidden md:flex items-center justify-between flex-row">
                      <CardTitle className="text-xs font-black uppercase italic tracking-tighter text-primary">BẢNG ĐIỀU PHỐI KẾT QUẢ ONLINE</CardTitle>
                      <div className="flex justify-center gap-1 items-center">
                          {cheatResult && Array.isArray(cheatResult) && cheatResult.map((n: number, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-sm bg-slate-800 text-emerald-400 flex items-center justify-center text-sm font-black border-emerald-500/50 border shadow-lg">{n}</div>
                          ))}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      {}
                      <div className="space-y-4 flex-1">
                        {s.room_type === 'k3' && cheatResult && (
                          <div className="grid grid-cols-3 gap-6">
                            {[0, 1, 2].map((idx) => (
                              <div key={idx} className="space-y-4">
                                <p className="text-[9px] text-center font-black uppercase text-slate-400 tracking-widest">Xúc xắc {idx + 1}</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {[1, 2, 3, 4, 5, 6].map(n => (
                                    <button
                                      key={n}
                                      className={cn(
                                        "h-8 w-full rounded-sm font-black text-[10px] transition-all border",
                                        cheatResult[idx] === n ? "bg-primary text-black border-primary scale-105 shadow-md" : "bg-white border-slate-200 hover:bg-slate-50"
                                      )}
                                      onClick={() => { const nr = [...cheatResult]; nr[idx] = n; setCheatResult(nr); }}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {(s.room_type === '5d' || s.room_type === 'wingo') && cheatResult && (
                          <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {cheatResult.map((val: number, idx: number) => (
                              <div key={idx} className="bg-slate-50 p-3 border rounded-none flex items-center gap-3">
                                <span className="text-[9px] font-black w-14 text-slate-400 uppercase shrink-0">Vị trí {idx + 1}</span>
                                <div className="flex-1 flex flex-wrap gap-1">
                                  {Array.from({ length: 10 }).map((_, n) => (
                                    <button
                                      key={n}
                                      className={cn("w-6 h-6 text-[10px] font-black border rounded-none", cheatResult[idx] === n ? "bg-primary text-black border-primary" : "bg-white border-slate-200")}
                                      onClick={() => { const nr = [...cheatResult]; nr[idx] = n; setCheatResult(nr); }}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t flex items-center justify-between mt-auto">
                        <p className="text-[10px] font-bold text-slate-400 italic">Hệ thống sẽ khóa động tự động khi còn &lt; 5s.</p>
                        <Button 
                          size="lg" 
                          onClick={() => handleCheatSubmit(s.id)}
                          className="h-12 bg-button hover:opacity-90 font-black px-10 rounded-none gap-3 uppercase shadow-2xl transition-all active:scale-95"
                        >
                          <CheckCircle2 className="text-white" size={18} /> XÁC NHẬN CHỐT KẾT QUẢ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function ChartRow({ label, total, partA, partALabel, partBLabel, colorA, colorB }: any) {
  const pctA = calculatePercentLocal(partA, total);
  const pctB = 100 - pctA;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[8px] font-black text-primary italic">Khối cược: {(total || 0).toLocaleString()} $</span>
      </div>
      <div className="h-2 w-full bg-slate-100 border rounded-none overflow-hidden flex relative">
        <div className={`h-full transition-all duration-1000 ${colorA}`} style={{ width: `${pctA}%` }} />
        <div className={`h-full transition-all duration-1000 flex-1 ${colorB}`} />
        <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none">
            <span className="text-[7px] font-black text-white drop-shadow-md">{partALabel}: {pctA.toFixed(0)}%</span>
            <span className="text-[7px] font-black text-white drop-shadow-md">{partBLabel}: {pctB.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

function calculatePercentLocal(val: number, total: number) {
  if (!total || total === 0) return 50;
  return (val / total) * 100;
}

function CountdownTimer({ endTime }: { endTime: string | number }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calcTimer = () => {
      const ms = Number(endTime);
      if (!ms) return 0;
      return Math.max(0, Math.floor((ms - Date.now()) / 1000));
    };

    setTimeLeft(calcTimer());
    const interval = setInterval(() => {
      setTimeLeft(calcTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className={cn("text-2xl md:text-3xl font-black tabular-nums tracking-tighter", timeLeft < 15 ? "text-rose-500 animate-pulse" : "text-slate-800")}>
      {timeLeft}s
    </div>
  )
}
