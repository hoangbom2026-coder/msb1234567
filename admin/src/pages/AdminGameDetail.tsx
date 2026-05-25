import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/lib/admin-api'
import { useToast } from '@/hooks/use-toast'
import { 
  Gamepad, 
  Settings2, 
  ArrowLeft, 
  Save, 
  Loader2,
  TrendingUp,
  Target,
  Zap,
  Activity,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminGameDetailPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<any>({
    name: "",
    game_type: "",
    odds: { ho: "1.98", rong: "1.98", common: "1.98", special: "1.98" },
    status: 1,
    min_bet: "1000",
    max_bet: "10000000",
    cycle_time: "60"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminApi.getGames()
        const found = res.data.find((g: any) => g.id.toString() === gameId || g.game_id === gameId)
        if (found) {
          setGame(found)
          
          let currentOdds: any = { ho: "1.98", rong: "1.98", common: "1.98", special: "1.98" };
          if (found.odds) {
              if (typeof found.odds === 'object') {

                  currentOdds = { ...currentOdds };
                  Object.entries(found.odds).forEach(([k, v]) => {
                      currentOdds[k] = v?.toString() || "1.98";
                  });
              } else {
                  const val = found.odds.toString();
                  currentOdds = { ho: val, rong: val, common: val, special: val };
              }
          }

          const config = typeof found.config === 'string' ? JSON.parse(found.config) : (found.config || {});

          setFormData({
            name: found.name,
            game_type: found.type || found.game_type,
            odds: currentOdds,
            status: found.status,
            min_bet: config.min_bet?.toString() || "1000",
            max_bet: config.max_bet?.toString() || "10000000",
            cycle_time: (found.cycle_seconds || config.round_duration || "60").toString()
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [gameId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await adminApi.updateGame(gameId as string, formData)
      if (res.status) {
        toast({ title: 'Thành công', description: 'Đã cập nhật thông số trò chơi.' })
        navigate('/admin/games')
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi', description: error.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
        <p className="text-sm font-bold text-slate-500 mt-4 uppercase">Đang đồng bộ thông số...</p>
    </div>
  )

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 font-['Inter']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-sm border-border" onClick={() => navigate('/admin/games')}>
                <ArrowLeft size={18} />
            </Button>
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Cấu hình: {game?.name}</h2>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">{game?.game_type} - ID: {game?.id}</p>
            </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
             <Button variant="ghost" className="flex-1 sm:flex-none rounded-sm font-bold text-xs uppercase text-slate-400" onClick={() => navigate('/admin/games')}>Hủy bỏ</Button>
             <Button className="flex-1 sm:flex-none rounded-sm gap-2 h-11 px-8 font-bold text-xs uppercase shadow-sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin size-4" /> : <Save size={18} />} Lưu thay đổi
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          <div className="lg:col-span-8 space-y-4 md:space-y-8">
              <Card className="rounded-sm shadow-sm border-border overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/20 border-b p-4 md:p-6">
                      <div className="flex items-center gap-3">
                        <Settings2 size={20} className="text-primary" />
                        <div>
                            <CardTitle className="text-base md:text-lg font-bold">Thông số vận hành</CardTitle>
                            <CardDescription className="text-[10px] md:text-xs">Thiết lập các giới hạn và tỷ lệ cho sảnh game này.</CardDescription>
                        </div>
                      </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                         <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase text-slate-500">Tên hiển thị sảnh</Label>
                            <Input 
                                className="h-12 rounded-sm border-border font-bold text-md focus-visible:ring-primary/20"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase text-slate-500">Thời gian mỗi phiên (Giây)</Label>
                            <div className="relative">
                                <Input 
                                    type="number"
                                    className="h-12 rounded-sm border-border font-bold text-lg text-primary focus-visible:ring-primary/20"
                                    value={formData.cycle_time}
                                    onChange={(e) => setFormData({...formData, cycle_time: e.target.value})}
                                />
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                             <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                                <Target size={14} className="text-primary" /> Thiết lập Tỷ lệ trả thưởng chi tiết
                             </Label>
                             <div className="flex gap-2">
                                <Input 
                                    placeholder="Đặt nhanh tất cả..." 
                                    className="h-8 w-32 text-[10px] font-bold"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if(!val || isNaN(parseFloat(val))) return;
                                        const newOdds = { ...formData.odds };
                                        Object.keys(newOdds).forEach(k => newOdds[k] = val);
                                        setFormData({...formData, odds: newOdds});
                                    }}
                                />
                             </div>
                        </div>

                         <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                           {}
                           {game?.game_id.includes('K3') && (
                             <>
                               {}
                               <div className="space-y-3">
                                   <Badge variant="outline" className="rounded-sm bg-slate-50 text-[10px] font-bold uppercase tracking-tighter">Tổng cả 2 bên (Tài/Xỉu/Đơn/Đôi/Rồng/Hổ)</Badge>
                                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                      {[
                                          { key: 'b', label: 'Đại', color: 'text-amber-600' },
                                          { key: 's', label: 'Tiểu', color: 'text-blue-600' },
                                          { key: 'l', label: 'Đơn', color: 'text-emerald-600' },
                                          { key: 'c', label: 'Đôi', color: 'text-purple-600' },
                                          { key: 'rong', label: 'Rồng', color: 'text-red-600' },
                                          { key: 'ho', label: 'Hổ', color: 'text-slate-600' },
                                      ].map((item) => (
                                          <OddsInput key={item.key} item={item} formData={formData} setFormData={setFormData} />
                                      ))}
                                   </div>
                               </div>

                               {}
                               <div className="space-y-3">
                                   <Badge variant="outline" className="rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-tighter">Con số tổng hợp (3 - 18)</Badge>
                                   <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                      {Array.from({ length: 16 }, (_, i) => i + 3).map(n => (
                                          <OddsInput 
                                              key={`sum-${n}`} 
                                              item={{ key: `sum-${n}`, label: `${n}`, color: 'text-emerald-600' }} 
                                              formData={formData} 
                                              setFormData={setFormData} 
                                              compact
                                          />
                                      ))}
                                   </div>
                               </div>

                               {}
                               {[1, 2, 3].map(ballNum => (
                                   <div key={ballNum} className="space-y-3 border-t pt-4">
                                       <Badge variant="outline" className="rounded-sm bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-tighter">Quả bóng {ballNum === 1 ? 'đầu tiên' : `thứ ${ballNum}`}</Badge>
                                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                           {[
                                               { key: `ball${ballNum}-b`, label: 'Đại', color: 'text-amber-600' },
                                               { key: `ball${ballNum}-s`, label: 'Tiểu', color: 'text-blue-600' },
                                               { key: `ball${ballNum}-l`, label: 'Đơn', color: 'text-emerald-600' },
                                               { key: `ball${ballNum}-c`, label: 'Đôi', color: 'text-purple-600' },
                                               ...[1, 2, 3, 4, 5, 6].map(n => ({ key: `ball${ballNum}-${n}`, label: `${n}`, color: 'text-slate-800' }))
                                           ].map((item) => (
                                               <OddsInput key={item.key} item={item} formData={formData} setFormData={setFormData} />
                                           ))}
                                       </div>
                                   </div>
                               ))}

                               {}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-4">
                                   <div className="space-y-3">
                                       <Badge variant="outline" className="rounded-sm bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-tighter">Cùng Một Số (Cặp)</Badge>
                                       <div className="grid grid-cols-3 gap-3">
                                           {[1, 2, 3, 4, 5, 6].map(n => (
                                               <OddsInput key={`pair-${n}`} item={{ key: `pair-${n}`, label: `[${n},${n}]`, color: 'text-purple-600' }} formData={formData} setFormData={setFormData} compact />
                                           ))}
                                       </div>
                                   </div>
                                   <div className="space-y-3">
                                       <Badge variant="outline" className="rounded-sm bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-tighter">Số Yard liên tiếp (Bộ 3)</Badge>
                                       <div className="grid grid-cols-3 gap-3">
                                           {[1, 2, 3, 4, 5, 6].map(n => (
                                               <OddsInput key={`triple-${n}`} item={{ key: `triple-${n}`, label: `[${n},${n},${n}]`, color: 'text-red-700' }} formData={formData} setFormData={setFormData} compact />
                                           ))}
                                       </div>
                                   </div>
                               </div>
                             </>
                           )}

                           {}
                           {game?.game_id.includes('WINGO') && (
                             <div className="space-y-3">
                                 <Badge variant="outline" className="rounded-sm bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-tighter">Wingo & Màu sắc (Green/Red/Violet)</Badge>
                                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                     {[
                                         { key: 'green', label: 'Xanh (Green)', color: 'text-emerald-500' },
                                         { key: 'red', label: 'Đỏ (Red)', color: 'text-red-500' },
                                         { key: 'violet', label: 'Tím (Violet)', color: 'text-purple-500' },
                                         ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ key: n.toString(), label: `Số ${n}`, color: 'text-slate-800' }))
                                     ].map((item) => (
                                         <OddsInput key={item.key} item={item} formData={formData} setFormData={setFormData} />
                                     ))}
                                 </div>
                             </div>
                           )}

                           {}
                           {(game?.game_id.includes('5D') || game?.game_id.includes('SPACE') || game?.game_id.includes('PRO') || game?.game_id.includes('PK10') || game?.game_id.includes('X10')) && (
                             <div className="space-y-8 pt-4">
                                {[
                                    { idx: 0, label: 'Quán quân (Vị trí 1)', hasRongHo: true },
                                    { idx: 1, label: 'Á Quân (Vị trí 2)', hasRongHo: true },
                                    { idx: 2, label: 'Á Quân 2 (Vị trí 3)', hasRongHo: true },
                                    { idx: 3, label: 'Vị trí thứ 4', hasRongHo: true },
                                    { idx: 4, label: 'Vị trí thứ 5', hasRongHo: true },
                                    { idx: 5, label: 'Vị trí thứ 6', hasRongHo: false },
                                    { idx: 6, label: 'Vị trí thứ 7', hasRongHo: false },
                                    { idx: 7, label: 'Vị trí thứ 8', hasRongHo: false },
                                    { idx: 8, label: 'Vị trí thứ 9', hasRongHo: false },
                                    { idx: 9, label: 'Vị trí thứ 10', hasRongHo: false },
                                ].map(pos => {
                                    const gameId = game?.game_id || "";
                                    const isRacing = gameId.includes('SPACE') || gameId.includes('PRO') || gameId.includes('PK10') || gameId.includes('X10');
                                    const is11x5 = gameId.includes('11X5');
                                    
                                    const maxNum = is11x5 ? 11 : (isRacing ? 10 : 10);
                                    const startNum = (isRacing || is11x5) ? 1 : 0;
                                    
                                    return (
                                        <div key={pos.idx} className="space-y-3 border-b pb-6 last:border-0">
                                            <Badge variant="outline" className="rounded-sm bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-tighter">{pos.label}</Badge>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                {[
                                                    { key: `pos${pos.idx}-b`, label: 'Đại', color: 'text-amber-600' },
                                                    { key: `pos${pos.idx}-s`, label: 'Tiểu', color: 'text-blue-600' },
                                                    { key: `pos${pos.idx}-l`, label: 'Đơn', color: 'text-emerald-600' },
                                                    { key: `pos${pos.idx}-c`, label: 'Đôi', color: 'text-purple-600' },
                                                    ...(pos.hasRongHo ? [
                                                        { key: `pos${pos.idx}-rong`, label: 'Rồng', color: 'text-red-500' },
                                                        { key: `pos${pos.idx}-ho`, label: 'Hổ', color: 'text-slate-500' }
                                                    ] : []),
                                                    ...Array.from({ length: maxNum }, (_, i) => {
                                                        const n = i + startNum;
                                                        return { key: `pos${pos.idx}-${n}`, label: `Số ${n}`, color: 'text-slate-800' };
                                                    })
                                                ].map((item) => (
                                                    <OddsInput key={item.key} item={item} formData={formData} setFormData={setFormData} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>
                           )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 pt-8 border-t">
                         <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase text-slate-500">Cược tối thiểu</Label>
                            <Input 
                                type="number"
                                className="h-12 rounded-sm border-border font-bold text-md focus-visible:ring-primary/20"
                                value={formData.min_bet}
                                onChange={(e) => setFormData({...formData, min_bet: e.target.value})}
                            />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase text-slate-500">Cược tối đa</Label>
                            <Input 
                                type="number"
                                className="h-12 rounded-sm border-border font-bold text-md focus-visible:ring-primary/20"
                                value={formData.max_bet}
                                onChange={(e) => setFormData({...formData, max_bet: e.target.value})}
                            />
                         </div>
                      </div>
                  </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-sm border bg-slate-50 dark:bg-slate-800/10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-sm bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trạng thái bảo mật</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">DỮ LIỆU ĐÃ ĐƯỢC XÁC THỰC</p>
                    </div>
                </div>
                <div className="p-6 rounded-sm border bg-slate-50 dark:bg-slate-800/10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-sm bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tính toàn vẹn</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">KIỂM SOÁT TỐT (100%)</p>
                    </div>
                </div>
              </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-sm shadow-sm border-border overflow-hidden">
                  <CardHeader className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 p-6">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={20} className="text-amber-600" />
                        <CardTitle className="text-lg font-bold text-amber-800 dark:text-amber-500">Lưu ý rủi ro</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="p-8">
                      <ul className="space-y-4">
                          <li className="flex gap-3 items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Thay đổi <b>Tỷ lệ (Odds)</b> sẽ ảnh hưởng trực tiếp đến lợi nhuận nhà cái ngay lập tức.</p>
                          </li>
                          <li className="flex gap-3 items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"><b>Thời gian phiên</b> quá ngắn có thể gây áp lực lên hệ thống xử lý giao dịch đồng thời.</p>
                          </li>
                          <li className="flex gap-3 items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Vui lòng kiểm tra kỹ các <b>mức cược</b> để tránh sai sót trong luồng tiền.</p>
                          </li>
                      </ul>
                  </CardContent>
              </Card>

              <Card className="rounded-sm shadow-sm border-border overflow-hidden">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800/20 border-b p-6">
                       <CardTitle className="text-lg font-bold">Thao tác nóng</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                      <Button variant="outline" className="w-full justify-start rounded-sm h-11 border-border font-bold text-xs uppercase gap-3">
                          <TrendingUp size={16} className="text-primary" /> Reset Thống kê Game
                      </Button>
                      <Button variant="outline" className="w-full justify-start rounded-sm h-11 border-border font-bold text-xs uppercase gap-3 text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Zap size={16} /> Ngắt kết nối tất cả User
                      </Button>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  )
}

function OddsInput({ item, formData, setFormData, compact }: any) {
    return (
        <div className="space-y-2">
            {!compact && <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider truncate block">{item.label}</Label>}
            <div className="relative">
                <Input 
                    placeholder={compact ? item.label : ""}
                    className={cn(
                        "rounded-sm border-border font-bold", 
                        compact ? "h-9 text-xs" : "h-11 text-md",
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
    )
}
