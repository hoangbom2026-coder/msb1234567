import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings2, 
  Save, 
  Loader2,
  Target,
  Zap,
  RefreshCw,
  LayoutGrid,
  AlertTriangle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminGamesPage() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("")
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getGames()
      if (res.status) {
        const sorted = (res.data || []).sort((a: any, b: any) => {
            const order = ['5K3', '10K3', 'LUCKY_SPACE', 'GOOD_LUCK', 'SPEED_PRO', 'LOTTERY_5MIN', 'LOTTERY_X10', 'SPEED_11X5'];
            return order.indexOf(a.game_id) - order.indexOf(b.game_id);
        });
        setGames(sorted)
        if (sorted.length > 0 && !activeTab) setActiveTab(sorted[0].game_id)
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  const handleBulkUpdateLimits = async () => {
    if (!confirm("Xác nhận áp dụng Min 1$ và Max 1000$ cho TẤT CẢ các sảnh game?")) return;
    setLoading(true);
    try {
        let successCount = 0;
        for (const game of games) {
            const config = typeof game.config === 'string' ? JSON.parse(game.config) : (game.config || {});
            const updateData = {
                id: game.id,
                game_id: game.game_id,
                name: game.name,
                status: game.status,
                min_bet: "1",
                max_bet: "1000",
                cycle_time: (game.cycle_seconds || config.round_duration || "60").toString()
            };
            const res = await adminApi.updateGame(game.game_id, updateData);
            if (res.status) successCount++;
        }
        toast({ title: "Đồng bộ thành công", description: `Đã áp dụng hạn mức 1$ - 1000$ cho ${successCount}/${games.length} sảnh game.` });
        fetchData();
    } catch (error: any) { toast({ variant: 'destructive', title: 'Lỗi đồng bộ', description: error.message }); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="text-sm font-black text-slate-500 mt-4 uppercase tracking-widest italic">Đang đồng bộ cấu hình hệ thống...</p>
    </div>
  )

  return (
    <div className="flex-1 p-2 md:p-6 lg:p-8 space-y-4 md:space-y-6 font-['Inter'] animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 md:p-4 shadow-sm border-l-4 border-primary gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 uppercase italic tracking-tighter leading-none">Cấu hình Game</h2>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60 mt-2">Quản lý tham số odds và biên lợi nhuận</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-none h-9 md:h-10 px-3 md:px-6 font-black text-[9px] md:text-[10px] uppercase shadow-sm border-dashed border-rose-200 text-rose-600 hover:bg-rose-50" onClick={handleBulkUpdateLimits}>
                <Zap size={14} className="mr-1 md:mr-2" /> ĐỒNG BỘ 1-1000$
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none rounded-none h-9 md:h-10 px-3 md:px-6 font-black text-[9px] md:text-[10px] uppercase shadow-sm" onClick={fetchData}>
                <RefreshCw size={14} className="mr-1 md:mr-2" /> LÀM MỚI
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="overflow-x-auto pb-1 scrollbar-hide bg-white p-1 shadow-sm">
            <TabsList className="bg-slate-50 p-1 h-11 rounded-none border-b-2 border-slate-100 flex w-max min-w-full">
            {games.map(game => (
                <TabsTrigger key={game.game_id} value={game.game_id} className="rounded-none font-black uppercase text-[10px] gap-2 px-5 data-[state=active]:bg-slate-900 data-[state=active]:text-primary transition-all whitespace-nowrap">
                    {game.name}
                </TabsTrigger>
            ))}
            </TabsList>
        </div>

        {games.map(game => (
            <TabsContent key={game.game_id} value={game.game_id} className="mt-0 outline-none">
                <GameConfigPanel game={game} />
            </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function GameConfigPanel({ game: initialGame }: { game: any }) {
    const [formData, setFormData] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (!initialGame) return;
        let currentOdds: any = {};
        if (initialGame.odds) {
            if (typeof initialGame.odds === 'object') {
                Object.entries(initialGame.odds).forEach(([k, v]) => { currentOdds[k] = v?.toString() || "1.98"; });
            } else {
                const val = initialGame.odds.toString();
                currentOdds = { b: val, s: val, l: val, c: val };
            }
        }
        const config = typeof initialGame.config === 'string' ? JSON.parse(initialGame.config) : (initialGame.config || {});
        setFormData({
            id: initialGame.id,
            game_id: initialGame.game_id,
            name: initialGame.name,
            odds: currentOdds,
            status: initialGame.status,
            min_bet: config.min_bet?.toString() || "1",
            max_bet: config.max_bet?.toString() || "1000",
            cycle_time: (initialGame.cycle_seconds || config.round_duration || "60").toString()
        })
    }, [initialGame])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await adminApi.updateGame(formData.game_id, formData)
            if (res.status) toast({ title: 'Thành công', description: `Đã cập nhật ${formData.name}.` });
        } catch (error: any) { toast({ variant: 'destructive', title: 'Lỗi', description: error.message }); }
        finally { setSaving(false); }
    }

    if (!formData) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-start h-full">
            {}
            <div className="lg:col-span-12">
                 <div className="bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-3 shadow-lg gap-4">
                      <div className="flex items-center gap-3">
                           <Badge className="bg-primary text-black font-black uppercase rounded-none px-2 text-[8px] md:text-[10px]">EDIT</Badge>
                           <h3 className="font-black text-[10px] md:text-xs uppercase italic tracking-tighter truncate">Sảnh: {formData.name}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full sm:w-auto">
                           <div className="flex items-center gap-2 flex-1 sm:flex-none">
                                <span className="text-[8px] font-black opacity-40 uppercase whitespace-nowrap">Odds x:</span>
                                <Input 
                                    className="h-8 w-16 bg-white/5 border-white/20 text-white font-black text-xs text-center rounded-none"
                                    onBlur={(e) => {
                                        const v = e.target.value;
                                        if(!v || isNaN(parseFloat(v))) return;
                                        const newOdds = { ...formData.odds };
                                        Object.keys(newOdds).forEach(k => newOdds[k] = v);
                                        setFormData({...formData, odds: newOdds});
                                    }}
                                />
                           </div>
                           <Button className="flex-1 sm:flex-none rounded-none bg-button font-black text-[9px] md:text-[10px] uppercase h-9 px-4 md:px-8 shadow-lg active:scale-95 transition-all" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="animate-spin size-3 mr-2" /> : <Save size={16} className="mr-2" />} LƯU
                           </Button>
                      </div>
                 </div>
            </div>

            {}
            <div className="lg:col-span-3 space-y-4">
                 <Card className="rounded-none border-0 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b py-3 px-4">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-2"><Settings2 size={14} /> THÔNG SỐ VẬN HÀNH</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-5">
                         <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-slate-600">Tên hiển thị</Label>
                            <Input className="h-9 rounded-none font-black text-xs italic bg-slate-50 border-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                         </div>
                         <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-slate-600">Thời gian kỳ (S)</Label>
                            <div className="relative">
                                <Input type="number" className="h-9 rounded-none font-black text-sm text-primary bg-primary/5" value={formData.cycle_time} onChange={e => setFormData({...formData, cycle_time: e.target.value})} />
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-slate-600">Trạng thái sảnh</Label>
                            <select className="w-full h-9 px-2 rounded-none border font-black text-[10px] uppercase bg-slate-50" value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                                <option value={1}>🟢 ĐANG MỞ</option>
                                <option value={0}>🔴 ĐÓNG / BẢO TRÌ</option>
                            </select>
                         </div>
                         <div className="pt-2 border-t border-dashed space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-600 italic">Cược tối thiểu (Min)</Label>
                                <Input className="h-9 rounded-none font-black text-xs" value={formData.min_bet} onChange={e => setFormData({...formData, min_bet: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-600 italic">Cược tối đa (Max)</Label>
                                <Input className="h-9 rounded-none font-black text-xs" value={formData.max_bet} onChange={e => setFormData({...formData, max_bet: e.target.value})} />
                            </div>
                         </div>
                    </CardContent>
                 </Card>

                 <div className="p-4 bg-amber-50 border-l-4 border-amber-500 space-y-2 shadow-sm">
                      <div className="flex items-center gap-2 text-amber-900 font-black text-[10px] uppercase"><AlertTriangle size={14} /> Khuyến nghị an toàn</div>
                      <p className="text-[9px] text-amber-700 font-bold leading-relaxed">Khi thay đổi Odds lên cao quá mức (&gt; 2.0), rủi ro "âm" dòng tiền sẽ tăng lên đáng kể. Hãy cân đối dựa trên lượng User.</p>
                 </div>
            </div>

            {}
            <div className="lg:col-span-9">
                 <Card className="rounded-none border-0 shadow-sm min-h-[600px]">
                    <CardHeader className="bg-slate-50 border-b py-3 px-6">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-2"><Target size={14} /> CHI TIẾT CƠ CẤU ODDS (8 SẢNH GAME)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 max-h-[750px] overflow-y-auto custom-scrollbar space-y-8">
                        {}
                        {formData.game_id.includes('K3') && (
                            <div className="space-y-8">
                                <OddsGroup label="Tổng hợp chính (K3)" items={[
                                    { key: 'b', label: 'Tài', color: 'text-rose-500' }, { key: 's', label: 'Xỉu', color: 'text-blue-500' },
                                    { key: 'l', label: 'Lẻ', color: 'text-amber-500' }, { key: 'c', label: 'Chẵn', color: 'text-slate-800' },
                                    { key: 'rong', label: 'Rồng', color: 'text-emerald-500' }, { key: 'ho', label: 'Hổ', color: 'text-rose-600' }
                                ]} formData={formData} setFormData={setFormData} />
                                
                                <OddsGroup label="Cược tổng xúc xắc (Sum 3-18)" items={Array.from({ length: 16 }, (_, i) => ({ key: `sum-${i + 3}`, label: `${i + 3}`, color: 'text-indigo-600' }))} formData={formData} setFormData={setFormData} compact />
                                
                                {[1, 2, 3].map(pos => (
                                    <OddsGroup key={pos} label={`Vị trí xắc ${pos}`} items={[
                                        { key: `ball${pos}-b`, label: 'Tài', color: 'text-rose-500' }, { key: `ball${pos}-s`, label: 'Xỉu', color: 'text-blue-500' },
                                        { key: `ball${pos}-l`, label: 'Lẻ', color: 'text-amber-500' }, { key: `ball${pos}-c`, label: 'Chẵn', color: 'text-slate-800' },
                                        ...[1, 2, 3, 4, 5, 6].map(n => ({ key: `ball${pos}-${n}`, label: `${n}`, color: 'text-slate-500' }))
                                    ]} formData={formData} setFormData={setFormData} compact />
                                ))}

                                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                                     <OddsGroup label="Cặp (Double)" items={[1, 2, 3, 4, 5, 6].map(n => ({ key: `pair-${n}`, label: `[${n},${n}]`, color: 'text-purple-600' }))} formData={formData} setFormData={setFormData} compact />
                                     <OddsGroup label="Bộ 3 (Triple)" items={[1, 2, 3, 4, 5, 6].map(n => ({ key: `triple-${n}`, label: `[${n},${n},${n}]`, color: 'text-rose-600' }))} formData={formData} setFormData={setFormData} compact />
                                </div>
                            </div>
                        )}

                        {}
                        {(formData.game_id.includes('WINGO') || formData.game_id.includes('5D') || formData.game_id.includes('SPACE') || formData.game_id.includes('PRO') || formData.game_id.includes('GOOD_LUCK') || formData.game_id.includes('LOTTERY')) && (
                            <>
                                {}
                                {Array.from({ length: 10 }).map((_, pIdx) => {
                                    const gid = formData.game_id;

                                    const isLimited = gid.includes('WINGO') || gid.includes('5D') || gid.includes('LOTTERY');
                                    if (isLimited && pIdx >= 5) return null;

                                    return (
                                        <OddsGroup key={pIdx} label={`Vị trí ${pIdx + 1} (${pIdx === 0 ? 'Quán Quân' : pIdx === 1 ? 'Á Quân' : 'Thứ hạng ' + (pIdx+1)})`} items={[
                                            { key: `pos${pIdx}-b`, label: 'Tài', color: 'text-rose-600' },
                                            { key: `pos${pIdx}-s`, label: 'Xỉu', color: 'text-blue-600' },
                                            { key: `pos${pIdx}-l`, label: 'Lẻ', color: 'text-amber-600' },
                                            { key: `pos${pIdx}-c`, label: 'Chẵn', color: 'text-slate-800' },
                                            ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ key: `pos${pIdx}-${n}`, label: `Số ${n}`, color: 'text-slate-500' }))
                                        ]} formData={formData} setFormData={setFormData} compact />
                                    );
                                })}
                            </>
                        )}

                        {formData.game_id.includes('WINGO') && (
                            <OddsGroup label="Màu sắc Wing Go" items={[
                                { key: 'green', label: 'Xanh', color: 'text-emerald-500' },
                                { key: 'red', label: 'Đỏ', color: 'text-red-500' },
                                { key: 'violet', label: 'Tím', color: 'text-purple-500' },
                            ]} formData={formData} setFormData={setFormData} />
                        )}

                        {}
                        {formData.game_id.includes('11X5') && (
                            <div className="space-y-10">
                                <div className="p-4 bg-primary/5 border border-primary/20 text-[10px] font-black uppercase text-primary inline-flex gap-2 items-center"><Info size={14} /> Cách thức trả thưởng 11x5: Áp dụng tỉ lệ cho từng tổ hợp chọn và từng quả bóng.</div>
                                
                                <OddsGroup label="Tỉ lệ tổ hợp (Pick 1-8)" items={[
                                    { key: 'pick1', label: 'Chọn 1', color: 'text-slate-900' }, { key: 'pick2', label: 'Chọn 2', color: 'text-slate-900' },
                                    { key: 'pick3', label: 'Chọn 3', color: 'text-indigo-600' }, { key: 'pick4', label: 'Chọn 4', color: 'text-emerald-600' },
                                    { key: 'pick5', label: 'Chọn 5', color: 'text-blue-600' }, { key: 'pick6', label: 'Chọn 6', color: 'text-amber-600' },
                                    { key: 'pick7', label: 'Chọn 7', color: 'text-rose-600' }, { key: 'pick8', label: 'Chọn 8', color: 'text-purple-600' }
                                ]} formData={formData} setFormData={setFormData} />

                                {[0, 1, 2, 3, 4].map(bIdx => (
                                    <OddsGroup key={bIdx} label={`Quả bóng ${bIdx + 1}`} items={[
                                        { key: `ball${bIdx}-b`, label: 'Tài', color: 'text-rose-600' }, { key: `ball${bIdx}-s`, label: 'Xỉu', color: 'text-blue-600' },
                                        { key: `ball${bIdx}-l`, label: 'Lẻ', color: 'text-amber-600' }, { key: `ball${bIdx}-c`, label: 'Chẵn', color: 'text-slate-800' },
                                        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => ({ key: `ball${bIdx}-${n}`, label: `Số ${n}`, color: 'text-slate-500' }))
                                    ]} formData={formData} setFormData={setFormData} compact />
                                ))}
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
        </div>
    )
}

function OddsGroup({ label, items, formData, setFormData, compact }: any) {
    return (
        <div className="space-y-3">
            <Badge variant="outline" className="rounded-none bg-slate-100 text-[10px] font-black uppercase tracking-widest border-slate-300 px-3 py-0.5 text-slate-700">{label}</Badge>
            <div className={cn("grid gap-2", compact ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10" : "grid-cols-2 lg:grid-cols-6")}>
                {items.map((item: any) => (
                    <div key={item.key} className="space-y-1">
                        {!compact && <Label className="text-[9px] font-black uppercase text-slate-600 tracking-tighter truncate block">{item.label}</Label>}
                        <div className="relative group">
                            <Input 
                                placeholder={compact ? item.label : ""}
                                className={cn(
                                    "rounded-none border-slate-200 font-black transition-all focus-visible:ring-primary/20 bg-white shadow-sm", 
                                    compact ? "h-7 text-[10px] text-center px-1" : "h-9 text-xs",
                                    item.color
                                )}
                                value={formData.odds?.[item.key] || ""}
                                onChange={(e) => setFormData({
                                    ...formData, 
                                    odds: { ...formData.odds, [item.key]: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
