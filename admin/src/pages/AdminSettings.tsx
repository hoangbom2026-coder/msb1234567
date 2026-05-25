import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import { useToast } from '@/hooks/use-toast'
import {
    Settings,
    ImageIcon,
    Bell,
    ShieldCheck,
    RefreshCw,
    Save,
    Plus,
    Trash2,
    Eye,
    Globe,
    User,
    Clock,
    Key,
    Lock,
    Loader2,
    AlertCircle,
    Zap,
    CheckCircle2,
    Fingerprint,
    ExternalLink,
    Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSearchParams } from 'react-router-dom'

export default function AdminSettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'general';
    const { toast } = useToast();

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <div className="flex-1 p-3 md:p-8 space-y-4 md:space-y-8 font-['Inter']">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-white uppercase italic tracking-tighter">Cài đặt hệ thống</h2>
                    <p className="text-[10px] md:text-sm text-slate-500 font-medium tracking-tight">Trung tâm cấu hình tài nguyên và bảo mật.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
                <TabsList className="bg-slate-100 p-1 h-auto md:h-12 rounded-sm border w-full lg:w-max flex flex-wrap md:grid md:grid-cols-4 gap-1 shadow-inner">
                    <TabsTrigger value="general" className="flex-1 rounded-sm font-black uppercase text-[9px] md:text-[10px] gap-2 px-4 md:px-8 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Settings size={14} /> <span className="truncate">Chung</span>
                    </TabsTrigger>
                    <TabsTrigger value="banners" className="flex-1 rounded-sm font-black uppercase text-[9px] md:text-[10px] gap-2 px-4 md:px-8 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <ImageIcon size={14} /> <span className="truncate">Banner</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex-1 rounded-sm font-black uppercase text-[9px] md:text-[10px] gap-2 px-4 md:px-8 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Bell size={14} /> <span className="truncate">Thông báo</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex-1 rounded-sm font-black uppercase text-[9px] md:text-[10px] gap-2 px-4 md:px-8 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <ShieldCheck size={14} /> <span className="truncate">Bảo mật</span>
                    </TabsTrigger>
                    <TabsTrigger value="banks" className="flex-1 rounded-sm font-black uppercase text-[9px] md:text-[10px] gap-2 px-4 md:px-8 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                        <Wallet size={14} /> <span className="truncate">Ngân hàng</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0 outline-none animate-in fade-in duration-300">
                    <GeneralSettingsTab />
                </TabsContent>

                <TabsContent value="banners" className="mt-0 outline-none animate-in fade-in duration-300">
                    <BannersTab />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0 outline-none animate-in fade-in duration-300">
                    <NotificationsTab />
                </TabsContent>

                <TabsContent value="security" className="mt-0 outline-none animate-in fade-in duration-300">
                    <SecurityTab />
                </TabsContent>

                <TabsContent value="banks" className="mt-0 outline-none animate-in fade-in duration-300">
                    <BanksTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function GeneralSettingsTab() {
    const [settings, setSettings] = useState<any>({
        site_name: "Marina Bay Sands",
        site_description: "Premium Gaming Experience",
        maintenance: false,
        marquee_text: "Welcome to Marina Bay Sands. Good luck with your bets!"
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        try {
            const res = await adminApi.getSystemConfig();
            if (res.status) setSettings(res.data);
        } catch (error) { console.error(error); }
    }

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await adminApi.updateSystemConfig(settings);
            if (res.status) {
                toast({ title: "Thành công", description: "Đã lưu cấu hình game chung." });
                fetchData();
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Lỗi", description: error.message });
        } finally { setLoading(false); }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 rounded-sm shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-sm font-black uppercase italic tracking-tighter">Thông tin cơ bản ứng dụng</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Tên thương hiệu</Label>
                            <Input className="h-11 rounded-none border-border font-bold" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Marquee (Chạy ngang)</Label>
                            <Input className="h-11 rounded-none border-border font-bold" value={settings.marquee_text} onChange={(e) => setSettings({ ...settings, marquee_text: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Mô tả Meta / SEO</Label>
                        <div className="relative">
                            <Textarea className="min-h-[100px] rounded-none border-border font-medium" value={settings.site_description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, site_description: e.target.value })} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t p-4 md:p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Switch id="maintenance" checked={settings.maintenance === 1 || settings.maintenance === true} onCheckedChange={(v) => setSettings({ ...settings, maintenance: v ? 1 : 0 })} />
                        <Label htmlFor="maintenance" className="text-[10px] font-black uppercase text-slate-500 cursor-pointer">Chế độ bảo trì toàn sảnh</Label>
                    </div>
                    <Button className="rounded-none bg-button font-black px-10 h-11 uppercase gap-2" onClick={handleSave} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin size-4" /> : <Save size={16} />} Lưu thay đổi
                    </Button>
                </CardFooter>
            </Card>
            <div className="lg:col-span-4 space-y-6">
                <Card className="rounded-sm bg-slate-100 border-none">
                    <CardHeader className="py-4 border-b border-white/10">
                        <CardTitle className="text-[10px] font-black uppercase text-slate-500">Thông số kỹ thuật</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-slate-400">API VERSION</span>
                            <span className="text-slate-800">1.0.4-LATEST</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-slate-400">DB CONTEXT</span>
                            <span className="text-emerald-600">CONNECTED</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function BannersTab() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getBanners();
            if (res.status) setData(res.data || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

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
                toast({ title: "Thành công", description: "Đã cập nhật banner." });
                setIsDialogOpen(false);
                fetchData();
            }
        } catch (error: any) { toast({ variant: "destructive", title: "Lỗi", description: error.message }); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa banner này?")) return;
        try {
            const res = await adminApi.deleteBanner(id);
            if (res.status) { toast({ title: "Thành công", description: "Đã gỡ bỏ banner." }); fetchData(); }
        } catch (error: any) { toast({ variant: "destructive", title: "Lỗi", description: error.message }); }
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
                    <div className="h-10 w-20 rounded-sm overflow-hidden border bg-slate-100">
                        <img src={row.original.image_url} className="h-full w-full object-cover" alt="" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{row.original.image_url}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => (
                <Badge className={cn(
                    "rounded-none uppercase text-[8px] font-black px-2 py-0.5 border-none",
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:text-primary" onClick={() => handleOpenDialog(row.original)}><Eye size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-red-500 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}><Trash2 size={16} /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 md:p-4 border rounded-sm gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary/10 rounded-none flex items-center justify-center text-primary shrink-0"><ImageIcon size={18} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh sách tài nguyên Banner</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none rounded-none h-9 font-black text-[9px] uppercase" onClick={fetchData} disabled={loading}><RefreshCw size={12} className={loading ? "animate-spin" : ""} /></Button>
                    <Button size="sm" className="flex-[2] sm:flex-none rounded-none h-9 font-black text-[9px] uppercase gap-2 px-4 md:px-6 shadow-md" onClick={() => handleOpenDialog()}><Plus size={14} /> <span className="truncate">Thêm ảnh</span></Button>
                </div>
            </div>
            <div className="bg-card border rounded-sm overflow-hidden">
                <DataTable columns={columns} data={data} searchKey="image_url" />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-none p-0 overflow-hidden font-['Inter']">
                    <DialogHeader className="p-6 bg-slate-900 text-white space-y-1">
                        <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Cấu hình Banner</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase">Thêm hoặc cập nhật biểu ngữ quảng cáo cho trang chủ.</DialogDescription>
                    </DialogHeader>
                    <div className="p-10 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Đường dẫn ảnh (URL)</Label>
                            <Input className="h-11 rounded-none border-border font-mono text-xs" value={editingBanner?.image_url || ""} onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Liên kết trang (Link)</Label>
                            <Input className="h-11 rounded-none border-border font-mono text-xs" value={editingBanner?.link_url || ""} onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Thứ tự</Label>
                                <Input type="number" className="h-11 rounded-none border-border" value={editingBanner?.sort_order || 0} onChange={(e) => setEditingBanner({ ...editingBanner, sort_order: parseInt(e.target.value) })} />
                            </div>
                            <div className="flex items-center justify-between border-b self-end h-11 pb-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">Hiển thị</span>
                                <Switch checked={editingBanner?.status === 1} onCheckedChange={(v) => setEditingBanner({ ...editingBanner, status: v ? 1 : 0 })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-slate-50 border-t flex gap-3">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-none font-black text-[10px] uppercase">Hủy</Button>
                        <Button onClick={handleSave} disabled={isSubmitting || !editingBanner?.image_url} className="rounded-none bg-button font-black text-[10px] uppercase px-12">Lưu dữ liệu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function NotificationsTab() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newNotif, setNewNotif] = useState({ title: "", content: "", type: "all", user_id: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getNotifications();
            if (res.status) setData(res.data || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async () => {
        if (!newNotif.title || !newNotif.content) return;
        setIsSubmitting(true);
        try {
            const res = await adminApi.createNotification(newNotif);
            if (res.status) {
                toast({ title: "Thành công", description: "Thông báo đã phát." });
                setIsCreateOpen(false);
                setNewNotif({ title: "", content: "", type: "all", user_id: "" });
                fetchData();
            }
        } catch (error: any) { toast({ variant: "destructive", title: "Lỗi", description: error.message }); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Xác nhận xóa bản tin?")) return;
        try {
            const res = await adminApi.deleteNotification(id);
            if (res.status) { toast({ title: "Thành công", description: "Đã xóa bản tin." }); fetchData(); }
        } catch (error: any) { toast({ variant: "destructive", title: "Lỗi", description: error.message }); }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "title",
            header: "Bản tin",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className={cn("h-7 w-7 rounded-none flex items-center justify-center border", row.original.type === 'all' ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600")}>
                        {row.original.type === 'all' ? <Globe size={12} /> : <User size={12} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-[11px] text-slate-800 uppercase tracking-tighter truncate max-w-[200px]">{row.original.title}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{row.original.type === 'all' ? 'Toàn trạm' : 'Kênh riêng'}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "content",
            header: "Nội dung",
            cell: ({ row }) => <span className="text-[10px] text-slate-500 font-medium truncate max-w-[250px]">{row.original.content}</span>
        },
        {
            accessorKey: "created_at",
            header: "Thời gian",
            cell: ({ row }) => <span className="text-[10px] text-slate-400 font-black">{new Date(parseInt(row.original.created_at)).toLocaleString()}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end pr-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-red-500 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}><Trash2 size={16} /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 border rounded-sm">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary/10 rounded-none flex items-center justify-center text-primary"><Bell size={18} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kênh truyền tin hệ thống (Broadcasting)</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-none h-9 font-black text-[9px] uppercase" onClick={fetchData} disabled={loading}><RefreshCw size={12} className={loading ? "animate-spin" : ""} /></Button>
                    <Button size="sm" className="rounded-none h-9 font-black text-[9px] uppercase gap-2 px-6 shadow-md" onClick={() => setIsCreateOpen(true)}><Plus size={14} /> Phát bản tin</Button>
                </div>
            </div>
            <div className="bg-card border rounded-sm overflow-hidden min-h-[400px]">
                <DataTable columns={columns} data={data} searchKey="title" />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-none p-0 overflow-hidden font-['Inter']">
                    <DialogHeader className="p-6 bg-slate-900 text-white space-y-1">
                        <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Phát bản tin mới</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase">Gửi thông báo mới tới người dùng hoặc toàn hệ thống.</DialogDescription>
                    </DialogHeader>
                    <div className="p-10 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Phạm vi</Label>
                                <Select value={newNotif.type} onValueChange={(v) => setNewNotif({ ...newNotif, type: v })}>
                                    <SelectTrigger className="h-11 rounded-none border-border font-black text-[10px] uppercase"><SelectValue /></SelectTrigger>
                                    <SelectContent className="font-['Inter'] font-black uppercase text-[10px]">
                                        <SelectItem value="all">TOÀN HỆ THỐNG</SelectItem>
                                        <SelectItem value="user">GỬI CÁ NHÂN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newNotif.type === 'user' && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase">Tài khoản (Username)</Label>
                                    <Input className="h-11 rounded-none border-border font-black" value={newNotif.user_id} onChange={(e) => setNewNotif({ ...newNotif, user_id: e.target.value })} />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Tiêu đề bản tin</Label>
                            <Input className="h-11 rounded-none border-border font-black" value={newNotif.title} onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Nội dung chi tiết</Label>
                            <Textarea className="min-h-[100px] rounded-none border-border font-medium" value={newNotif.content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNotif({ ...newNotif, content: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-slate-50 border-t flex gap-3">
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-none font-black text-[10px] uppercase">Hủy</Button>
                        <Button onClick={handleCreate} disabled={isSubmitting || !newNotif.title || !newNotif.content} className="rounded-none bg-button font-black text-[10px] uppercase px-12">Phát hành ngay</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function SecurityTab() {
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleUpdatePassword = async () => {
        if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
            toast({ title: "Thông báo", description: "Xác nhận mật khẩu thất bại.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const res = await adminApi.changePassword(passwords.newPassword);
            if (res.status) {
                toast({ title: "Thành công", description: "Đã cập nhật mật khẩu quản trị." });
                setPasswords({ newPassword: '', confirmPassword: '' });
            }
        } catch (error: any) { toast({ variant: "destructive", title: "Lỗi", description: error.message }); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="rounded-sm shadow-sm overflow-hidden border-border transition-all hover:shadow-md">
                    <CardHeader className="bg-slate-50 border-b py-6 text-center">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-none bg-primary/10 mb-2 border border-primary/20"><Fingerprint className="h-7 w-7 text-primary" /></div>
                        <CardTitle className="text-sm font-black uppercase italic tracking-tighter">Đổi mật khẩu Quản trị</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Key size={12} /> Mật khẩu mới</Label>
                                <Input type="password" placeholder="••••••••" className="h-11 rounded-none border-border font-bold text-lg" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Lock size={12} /> Xác nhận lại</Label>
                                <Input type="password" placeholder="••••••••" className="h-11 rounded-none border-border font-bold text-lg" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                            </div>
                        </div>
                        <Button className="w-full h-11 rounded-none bg-button text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg" onClick={handleUpdatePassword} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin size-4" /> : <ShieldCheck size={16} />} Lưu mật khẩu mới
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-sm bg-blue-50/50 border-blue-100 border shadow-none">
                        <CardHeader className="py-4 border-b border-blue-100 flex-row items-center gap-3 space-y-0">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <CardTitle className="text-[10px] font-black uppercase text-blue-700">Trạng thái bảo vệ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center bg-white p-3 border rounded-none">
                                <span className="text-[10px] font-black uppercase text-slate-400">Xác thực 2 yếu tố</span>
                                <Badge className="bg-emerald-500 rounded-none text-[8px] font-black">ACTIVE</Badge>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 border rounded-none">
                                <span className="text-[10px] font-black uppercase text-slate-400">Truy cập IP Whitelist</span>
                                <Badge className="bg-amber-500 rounded-none text-[8px] font-black">DISABLED</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 bg-slate-900 rounded-sm text-center space-y-3">
                        <ShieldCheck size={32} className="text-primary mx-auto opacity-50" />
                        <p className="text-[10px] font-black text-white/50 uppercase italic tracking-widest">Hệ thống đang được bảo vệ bởi Root Admin Proxy</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function BanksTab() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getSystemBanks();
            if (res.status) setData(res.data || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenDialog = (bank: any = null) => {
        setEditingBank(bank || { bank_name: "", account_number: "", account_name: "", status: 1 });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingBank.bank_name || !editingBank.account_number) return;
        setIsSubmitting(true);
        try {
            const res = await adminApi.updateSystemBank(editingBank);
            if (res.status) {
                toast({ title: "Thành công", description: "Đã cập nhật thông tin ngân hàng." });
                setIsDialogOpen(false);
                fetchData();
            }
        } catch (error: any) { toast({ variant: "destructive", title: "Lỗi", description: error.message }); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Xác nhận xóa tài khoản ngân hàng này?")) return;
        try {
            const res = await adminApi.deleteSystemBank(id);
            if (res.status) { toast({ title: "Thành công", description: "Đã xóa tài khoản." }); fetchData(); }
        } catch (error: any) { toast({ variant: "destructive", title: "Lỗi", description: error.message }); }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "bank_name",
            header: "Tên Ngân hàng",
            cell: ({ row }) => <span className="font-black text-slate-800 uppercase text-xs">{row.original.bank_name}</span>
        },
        {
            accessorKey: "account_number",
            header: "Số tài khoản",
            cell: ({ row }) => <span className="font-mono font-black text-indigo-600">{row.original.account_number}</span>
        },
        {
            accessorKey: "account_name",
            header: "Chủ tài khoản",
            cell: ({ row }) => <span className="text-[10px] font-black uppercase text-slate-500">{row.original.account_name}</span>
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => (
                <Badge className={cn(
                    "rounded-none uppercase text-[8px] font-black px-2 py-0.5 border-none",
                    row.original.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                    {row.original.status === 1 ? 'HOẠT ĐỘNG' : 'KHÓA'}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2 pr-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:text-primary" onClick={() => handleOpenDialog(row.original)}><Eye size={16} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-red-500 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}><Trash2 size={16} /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 md:p-4 border rounded-sm gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary/10 rounded-none flex items-center justify-center text-primary shrink-0"><Wallet size={18} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quản lý tài khoản thụ hưởng hệ thống</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none rounded-none h-9 font-black text-[9px] uppercase" onClick={fetchData} disabled={loading}><RefreshCw size={12} className={loading ? "animate-spin" : ""} /></Button>
                    <Button size="sm" className="flex-[2] sm:flex-none rounded-none h-9 font-black text-[9px] uppercase gap-2 px-4 md:px-6 shadow-md" onClick={() => handleOpenDialog()}><Plus size={14} /> <span className="truncate">Thêm ngân hàng</span></Button>
                </div>
            </div>
            <div className="bg-card border rounded-sm overflow-hidden">
                <DataTable columns={columns} data={data} searchKey="bank_name" />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-none p-0 overflow-hidden font-['Inter']">
                    <DialogHeader className="p-6 bg-slate-900 text-white space-y-1">
                        <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Cấu hình Tài khoản Thụ hưởng</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase">Người dùng sẽ chuyển tiền vào tài khoản này để nạp điểm.</DialogDescription>
                    </DialogHeader>
                    <div className="p-10 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Tên Ngân hàng</Label>
                            <Input className="h-11 rounded-none border-border font-black uppercase" value={editingBank?.bank_name || ""} onChange={(e) => setEditingBank({ ...editingBank, bank_name: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Số tài khoản</Label>
                            <Input className="h-11 rounded-none border-border font-black text-indigo-600" value={editingBank?.account_number || ""} onChange={(e) => setEditingBank({ ...editingBank, account_number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Chủ tài khoản</Label>
                            <Input className="h-11 rounded-none border-border font-black uppercase" value={editingBank?.account_name || ""} onChange={(e) => setEditingBank({ ...editingBank, account_name: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="flex items-center justify-between border-b h-11 pb-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">Trạng thái hoạt động</span>
                            <Switch checked={editingBank?.status === 1} onCheckedChange={(v) => setEditingBank({ ...editingBank, status: v ? 1 : 0 })} />
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-slate-50 border-t flex gap-3">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-none font-black text-[10px] uppercase">Hủy</Button>
                        <Button onClick={handleSave} disabled={isSubmitting || !editingBank?.bank_name} className="rounded-none bg-button font-black text-[10px] uppercase px-12">Lưu dữ liệu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
