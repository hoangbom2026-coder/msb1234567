import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useToast } from '@/hooks/use-toast'
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Layout,
  ExternalLink,
  Zap,
  CheckCircle2,
  Settings2
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
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function AdminBannersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBanners();
      if (res.status) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách Banner." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (banner: any = null) => {
      setEditingBanner(banner || { image_url: "", link_url: "", status: 1, sort_order: 0 });
      setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingBanner.image_url) return;
    setIsSubmitting(true);
    try {
      const res = await adminApi.updateBanner(editingBanner);
      if (res.status) {
        toast({ title: "Thành công", description: "Đã cập nhật tài nguyên hiển thị." });
        setIsDialogOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn gỡ bỏ banner này?")) return;
    try {
      const res = await adminApi.deleteBanner(id);
      if (res.status) {
        toast({ title: "Thành công", description: "Đã gỡ bỏ tài nguyên khỏi sảnh." });
        fetchData();
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
        accessorKey: "sort_order",
        header: "Thứ tự",
        cell: ({ row }) => <span className="font-bold text-slate-400">#{row.original.sort_order}</span>
    },
    {
        accessorKey: "image_url",
        header: "Hình ảnh",
        cell: ({ row }) => (
            <div className="flex items-center gap-4">
                <div className="h-10 w-20 rounded-sm overflow-hidden border bg-slate-100 dark:bg-slate-800">
                    <img src={row.original.image_url} className="h-full w-full object-cover" alt="" loading="lazy" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[150px]">{row.original.image_url}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "link_url",
        header: "Đường dẫn (Link)",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[11px] font-bold text-primary">
                <ExternalLink size={12} />
                {row.original.link_url || 'MẶC ĐỊNH'}
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
            <Badge className={cn(
                "rounded-sm uppercase text-[9px] font-bold px-2 py-0.5 border-none",
                row.original.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            )}>
                {row.original.status === 1 ? 'HIỂN THỊ' : 'ẨN'}
            </Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2 pr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:text-primary" onClick={() => handleOpenDialog(row.original)}>
                    <Eye size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm text-red-500 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}>
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white uppercase italic">Quản lý Banner</h2>
          <p className="text-xs text-slate-500 font-medium">Cấu hình các hình ảnh hiển thị tại trang chủ ứng dụng.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-sm gap-2 border-border h-9 px-3 font-bold text-[10px] uppercase shadow-sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Cập nhật
            </Button>
            <Button className="rounded-sm gap-2 h-9 px-4 font-bold text-[10px] uppercase shadow-sm" onClick={() => handleOpenDialog()}>
                <Plus size={14} /> Thêm ảnh
            </Button>
        </div>
      </div>

      <div className="bg-card border rounded-sm shadow-sm overflow-hidden min-h-[500px]">
        <DataTable columns={columns} data={data} searchKey="image_url" />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-sm p-0 overflow-hidden font-['Inter']">
          <div className="p-6 bg-slate-50 border-b">
              <DialogTitle className="text-xl font-bold">{editingBanner?.id ? 'Chỉnh sửa tài nguyên' : 'Đăng ký Banner mới'}</DialogTitle>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-400">Đường dẫn ảnh (URL)</Label>
                <Input 
                    placeholder="https://domain.com/image.png"
                    className="h-12 rounded-sm border-border font-mono text-xs focus-visible:ring-primary/20"
                    value={editingBanner?.image_url || ""}
                    onChange={(e) => setEditingBanner({...editingBanner, image_url: e.target.value})}
                />
            </div>
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-400">Đường dẫn điều hướng (Link)</Label>
                <Input 
                    placeholder="vd: /promotion hoặc link ngoài"
                    className="h-12 rounded-sm border-border font-mono text-xs focus-visible:ring-primary/20"
                    value={editingBanner?.link_url || ""}
                    onChange={(e) => setEditingBanner({...editingBanner, link_url: e.target.value})}
                />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-slate-400">Thứ tự ưu tiên</Label>
                    <Input 
                        type="number"
                        className="h-12 rounded-sm border-border font-bold focus-visible:ring-primary/20"
                        value={editingBanner?.sort_order || 0}
                        onChange={(e) => setEditingBanner({...editingBanner, sort_order: parseInt(e.target.value)})}
                    />
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-sm border border-border self-end h-12">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Hiển thị</span>
                    <Switch checked={editingBanner?.status === 1} onCheckedChange={(v) => setEditingBanner({...editingBanner, status: v ? 1 : 0})} />
                </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-sm font-bold text-xs uppercase">Hủy bỏ</Button>
            <Button 
                onClick={handleSave}
                disabled={isSubmitting || !editingBanner?.image_url}
                className="rounded-sm font-bold text-xs uppercase px-10 bg-button hover:opacity-90"
            >Lưu ảnh</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
