import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-store'
import { formatDateTime, formatTime, formatDate } from '@/lib/time-utils'
import { 
  ArrowDownCircle, 
  ArrowUpCircle,
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  RefreshCw,
  History,
  ShieldAlert,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminTransactionsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<'recharge' | 'withdraw'>('recharge')
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const canApprove = currentUser?.role === 'admin' || currentUser?.role === 'cskh' || currentUser?.role === 'ROOT'

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getTransactions(activeType)
      if (res.status) {
        setData(res.data || [])
      }
    } catch (error) {
      console.error(error)
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải danh sách giao dịch.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeType])

  const handleApprove = async (id: string, status: number) => {
    if (!canApprove) return toast({ variant: 'destructive', title: 'Từ chối', description: 'Bạn không có quyền thực hiện hành động này.' });
    try {
      const res = await adminApi.approveTransaction(activeType, id, status)
      if (res.status) {
        toast({ title: 'Thành công', description: 'Giao dịch đã được xử lý.' })
        fetchData()
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi', description: error.message })
    }
  }

  const columns: ColumnDef<any>[] = [
    {
        accessorKey: "phone",
        header: "Tài khoản (SĐT)",
        cell: ({ row }) => (
            <div className="flex flex-col min-w-[150px]">
                <span className="font-black text-slate-800 dark:text-white text-sm tracking-tighter">{row.original.phone}</span>
                <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">{row.original.id_order}</span>
            </div>
        )
    },
    {
        accessorKey: "money",
        header: "Số tiền",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className={cn("font-black text-sm italic", activeType === 'withdraw' ? "text-rose-500" : "text-emerald-500")}>
                    {activeType === 'withdraw' ? '-' : '+'}{parseFloat(row.original.money).toLocaleString()} $
                </span>
                {activeType === 'withdraw' && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Phí: {parseFloat(row.original.fee || 0).toLocaleString()}</span>}
            </div>
        )
    },
    {
        id: "details",
        header: activeType === 'withdraw' ? "Thông tin Rút" : "Thông tin Nạp",
        cell: ({ row }) => (
            <div className="flex flex-col max-w-[250px] min-w-[150px]">
                {activeType === 'withdraw' ? (
                    <>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{row.original.bank_name}</span>
                        <span className="text-xs font-mono font-black text-indigo-600">{row.original.account_number}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 italic">{row.original.account_name}</span>
                    </>
                ) : (
                    <>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Nạp tiền vào: {row.original.bank_name || 'Hệ thống'}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 italic">Mã nạp: {row.original.recharge_code || '---'}</span>
                    </>
                )}
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
            <Badge className={cn(
                "rounded-none uppercase text-[8px] font-black px-2 py-0 border-none shadow-sm",
                row.original.status === 0 ? "bg-amber-400 text-amber-950" : 
                row.original.status === 1 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            )}>
                {row.original.status === 0 ? 'Chờ duyệt' : 
                 row.original.status === 1 ? 'Thành công' : 'Bị từ chối'}
            </Badge>
        )
    },
    {
        accessorKey: "time",
        header: "Thời điểm",
        cell: ({ row }) => {
            const timeVal = row.original.time || row.original.created_at;
            if (!timeVal) return <span className="text-[10px] text-slate-400">N/A</span>;
            return (
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-800 font-black uppercase tracking-tighter">
                        {formatTime(timeVal)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {formatDate(timeVal)}
                    </span>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end pr-2">
                {row.original.status === 0 ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:bg-slate-100"><MoreVertical size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-slate-200 w-48 font-['Inter'] shadow-xl p-1">
                            <DropdownMenuLabel className="text-[9px] uppercase text-slate-400 font-black tracking-widest px-3 py-2">Thao tác phê duyệt</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            {canApprove ? (
                                <>
                                    <DropdownMenuItem className="py-2.5 text-xs font-black uppercase tracking-wider gap-2 text-emerald-600 cursor-pointer hover:bg-emerald-50 rounded-none transition-colors" onClick={() => handleApprove(row.original.id_order, 1)}>
                                        <CheckCircle2 size={14} /> Chấp nhận đơn
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-2.5 text-xs font-black uppercase tracking-wider gap-2 text-rose-500 cursor-pointer hover:bg-rose-50 rounded-none transition-colors" onClick={() => handleApprove(row.original.id_order, 2)}>
                                        <XCircle size={14} /> Từ chối lệnh
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <DropdownMenuItem className="py-2.5 text-xs font-black uppercase tracking-wider gap-2 text-slate-400 cursor-not-allowed opacity-50 rounded-none">
                                    <ShieldAlert size={14} /> Quyền hạn hạn chế
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className={cn(
                        "h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100",
                        row.original.status === 1 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {row.original.status === 1 ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                )}
            </div>
        )
    }
  ]

  return (
    <div className="flex-1 p-3 md:p-8 space-y-4 md:space-y-8 font-['Inter'] animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase italic">Phê duyệt Giao dịch</h2>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-70">
              {currentUser?.role === 'ROOT' ? 'Root Administrator Proxy Control' : 'Hệ thống Quản trị Tài chính'}
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-sm gap-2 border-slate-200 h-9 px-4 font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 transition-all" onClick={fetchData} disabled={loading}>
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Làm mới
            </Button>
        </div>
      </div>

      <Tabs value={activeType} onValueChange={(v: any) => setActiveType(v)} className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 h-11 rounded-none border-b-2 border-slate-200 flex w-full lg:w-max shadow-inner">
            <TabsTrigger value="recharge" className="flex-1 lg:flex-none rounded-none font-black uppercase text-[10px] gap-2 px-8 data-[state=active]:bg-white data-[state=active]:text-emerald-600 transition-all">
                <ArrowUpCircle size={14} /> Nạp tiền
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex-1 lg:flex-none rounded-none font-black uppercase text-[10px] gap-2 px-8 data-[state=active]:bg-white data-[state=active]:text-rose-600 transition-all">
                <ArrowDownCircle size={14} /> Rút tiền
            </TabsTrigger>
        </TabsList>

        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className={cn(
                        "px-4 md:px-6 h-10 md:h-11 rounded-none shadow-sm flex items-center gap-3 font-black uppercase text-[9px] md:text-[10px] tracking-widest border",
                        activeType === 'recharge' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                        {activeType === 'recharge' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                        <span className="truncate">Danh sách Lệnh {activeType === 'recharge' ? 'Nạp' : 'Rút'} Tiền</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6 justify-between sm:justify-end">
                        <StatMini label="Đang chờ duyệt" value={data.filter(t => t.status === 0).length} color="amber" />
                        <div className="h-8 w-px bg-slate-100 hidden sm:block" />
                        <StatMini 
                            label={`Tổng ${activeType === 'recharge' ? 'nạp' : 'rút'}`} 
                            value={data.filter(t => t.status === 1).reduce((s,t) => s + parseFloat(t.money || 0), 0).toLocaleString()} 
                            suffix="$"
                            color={activeType === 'recharge' ? 'emerald' : 'rose'} 
                        />
                    </div>
                </div>

                <Card className="m-0 border border-slate-200 rounded-sm overflow-hidden bg-white shadow-sm flex flex-col min-h-[400px] md:min-h-[600px]">
                    <div className="flex-1 overflow-x-auto">
                        <DataTable columns={columns} data={data} searchKey="phone" />
                    </div>
                </Card>
        </div>
      </Tabs>
    </div>
  )
}

function StatMini({ label, value, suffix = "", color }: any) {
    const colorClasses: any = {
        amber: "text-amber-500",
        rose: "text-rose-500",
        emerald: "text-emerald-500",
    };
    return (
        <div className="flex flex-col items-end min-w-[100px]">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 opacity-70">{label}</span>
            <span className={cn("text-xl font-black italic leading-none", colorClasses[color])}>
                {value} <span className="text-[9px] font-bold text-slate-300 not-italic">{suffix}</span>
            </span>
        </div>
    )
}
