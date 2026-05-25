import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useToast } from '@/hooks/use-toast'
import { 
  Bell, 
  Plus, 
  Trash2, 
  Send, 
  User, 
  Globe,
  Clock,
  RefreshCw,
  Activity,
  Zap,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminNotificationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newNotif, setNewNotif] = useState({
      title: "",
      content: "",
      type: "all",
      user_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotifications();
      if (res.status) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách thông báo." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newNotif.title || !newNotif.content) return;
    setIsSubmitting(true);
    try {
      const res = await adminApi.createNotification(newNotif);
      if (res.status) {
        toast({ title: "Thành công", description: "Thông báo đã được gửi thành công." });
        setIsCreateOpen(false);
        setNewNotif({ title: "", content: "", type: "all", user_id: "" });
        fetchData();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    try {
      const res = await adminApi.deleteNotification(id);
      if (res.status) {
        toast({ title: "Thành công", description: "Đã xóa bản ghi thông báo." });
        fetchData();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
        accessorKey: "title",
        header: "Tiêu đề",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className={cn(
                    "h-8 w-8 rounded-sm flex items-center justify-center border",
                    row.original.type === 'all' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                )}>
                    {row.original.type === 'all' ? <Globe size={14} /> : <User size={14} />}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 dark:text-white leading-none mb-1">{row.original.title}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đối tượng: {row.original.type === 'all' ? 'Toàn hệ thống' : 'Cá nhân'}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "content",
        header: "Nội dung vắn tắt",
        cell: ({ row }) => <span className="text-xs text-slate-500 font-medium truncate max-w-[300px]">{row.original.content}</span>
    },
    {
        accessorKey: "created_at",
        header: "Ngày gửi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <Clock size={12} />
                {new Date(parseInt(row.original.created_at)).toLocaleString()}
            </div>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end pr-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm text-red-500 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}>
                    <Trash2 size={16} />
                </Button>
            </div>
        )
    }
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 font-['Inter']">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white uppercase italic">Thông báo hệ thống</h2>
          <p className="text-xs text-slate-500 font-medium">Gửi và quản lý thông báo đến ứng dụng người dùng.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-sm gap-2 border-border h-9 px-3 font-bold text-[10px] uppercase shadow-sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Cập nhật
            </Button>
            <Button className="rounded-sm gap-2 h-9 px-4 font-bold text-[10px] uppercase shadow-sm" onClick={() => setIsCreateOpen(true)}>
                <Plus size={14} /> Soạn thông báo
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox label="Đã phát" value={data.length} icon={<Bell size={14} />} color="blue" />
          <StatBox label="Cộng đồng" value={data.filter(d => d.type === 'all').length} icon={<Globe size={14} />} color="emerald" />
          <StatBox label="Định danh" value={data.filter(d => d.type === 'user').length} icon={<User size={14} />} color="indigo" />
          <StatBox label="Trạng thái" value="Ổn định" icon={<Zap size={14} />} color="amber" />
      </div>

      <div className="bg-card border rounded-sm shadow-sm overflow-hidden min-h-[500px]">
        <DataTable columns={columns} data={data} searchKey="title" />
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-sm p-0 overflow-hidden font-['Inter']">
          <DialogHeader className="p-6 bg-slate-50 border-b space-y-1">
              <DialogTitle className="text-xl font-bold">Khởi tạo thông báo mới</DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cấu hình nội dung gửi đến người dùng</DialogDescription>
          </DialogHeader>
          <div className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-slate-400">Hình thức gửi</Label>
                    <Select value={newNotif.type} onValueChange={(v) => setNewNotif({...newNotif, type: v})}>
                        <SelectTrigger className="h-12 rounded-sm border-border font-bold focus-visible:ring-primary/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm font-['Inter'] font-bold uppercase text-[10px]">
                            <SelectItem value="all">GỬI CHO TẤT CẢ</SelectItem>
                            <SelectItem value="user">GỬI CÁ NHÂN (UID)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {newNotif.type === 'user' && (
                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase text-slate-400">SĐT/ID Người nhận</Label>
                        <Input 
                            placeholder="Nhập SĐT..."
                            className="h-12 rounded-sm border-border font-bold focus-visible:ring-primary/20"
                            value={newNotif.user_id}
                            onChange={(e) => setNewNotif({...newNotif, user_id: e.target.value})}
                        />
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-400">Tiêu đề thông báo</Label>
                <Input 
                    placeholder="VD: Bảo trì hệ thống, Khuyến mãi..."
                    className="h-12 rounded-sm border-border font-bold text-md focus-visible:ring-primary/20"
                    value={newNotif.title}
                    onChange={(e) => setNewNotif({...newNotif, title: e.target.value})}
                />
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-400">Nội dung chi tiết</Label>
                <Textarea 
                    placeholder="Nhập nội dung cần gửi..."
                    className="min-h-[120px] rounded-sm border-border font-medium focus-visible:ring-primary/20"
                    value={newNotif.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNotif({...newNotif, content: e.target.value})}
                />
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-sm font-bold text-xs uppercase">Hủy bỏ</Button>
            <Button 
                onClick={handleCreate}
                disabled={isSubmitting || !newNotif.title || !newNotif.content}
                className="rounded-sm font-bold text-xs uppercase px-10 bg-button hover:opacity-90"
            >Gửi ngay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatBox({ label, value, icon, color }: any) {
    const colorMap: any = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
    }
    return (
        <Card className="rounded-sm shadow-sm border-border">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("h-10 w-10 flex items-center justify-center rounded-sm border", colorMap[color])}>
                    {icon}
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                   <p className="text-xl font-bold text-slate-800 dark:text-white leading-none">
                       {typeof value === 'number' ? value.toLocaleString() : value}
                   </p>
                </div>
            </CardContent>
        </Card>
    )
}
