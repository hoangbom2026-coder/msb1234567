import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  User,
  UserPlus,
  Wallet,
  Activity,
  Award,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  Lock,
  Plus,
  Share2,
  Copy,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Settings2,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth-store'

export default function AdminUserCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';
  const { toast } = useToast();

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  return (
    <div className="flex-1 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 font-['Inter']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-white uppercase italic tracking-tighter">Trung tâm Thành viên</h2>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium tracking-tight">Quản lý hội viên, cây đại lý và hệ thống mã mời thông minh.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 h-auto md:h-12 rounded-sm border w-full lg:w-max flex flex-wrap md:grid md:grid-cols-2 gap-1 shadow-inner overflow-hidden">
          <TabsTrigger value="users" className="flex-1 rounded-sm font-black uppercase text-[10px] gap-2 px-4 md:px-8 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
            <Users size={14} /> <span className="truncate">Hội viên</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex-1 rounded-sm font-black uppercase text-[10px] gap-2 px-4 md:px-8 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
            <Share2 size={14} /> <span className="truncate">Đại lý</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0 outline-none animate-in fade-in duration-300">
          <UsersManagerSubTab />
        </TabsContent>

        <TabsContent value="agents" className="mt-0 outline-none animate-in fade-in duration-300">
          <AgentsManagerSubTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UsersManagerSubTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const { toast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      if (res.status) {
        setData(res.data.rows || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải danh sách.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditData({ ...user, password: '', password_withdraw: '', invite_code: user.invite_code || user.code || '' });
    setIsEditOpen(true);
  };

  const handleCreateUser = async () => {
    if (!editData.phone || !editData.password) return;
    setSaving(true);
    try {
      const res = await adminApi.updateUser({ ...editData, isCreate: true });
      if (res.status) {
        toast({ title: 'Thành công', description: `Đã tạo ${editData.role === 'agent' ? 'Đại lý' : 'Thành viên'} mới.` });
        setIsCreateOpen(false);
        setEditData({});
        fetchData();
      }
    } catch (error: any) { toast({ variant: 'destructive', title: 'Lỗi', description: error.message }); }
    finally { setSaving(false); }
  }

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await adminApi.updateUser(editData);
      if (res.status) {
        toast({ title: 'Thành công', description: 'Đã cập nhật hồ sơ hội viên.' });
        setIsEditOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi', description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!adjustAmount || isNaN(parseFloat(adjustAmount))) return;
    setSaving(true);
    try {
      const res = await adminApi.adjustBalance(selectedUser.id, parseFloat(adjustAmount), adjustType);
      if (res.status) {
        toast({ title: 'Thành công', description: `Đã ${adjustType === 'add' ? 'cộng' : 'trừ'} ${adjustAmount} USDT.` });
        setIsAdjustOpen(false);
        setAdjustAmount('');
        fetchData();
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi', description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "phone",
      header: "Hội viên",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-100 rounded-sm border flex items-center justify-center font-black text-[10px] text-slate-400">
            {row.original.id}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[13px] text-slate-800 dark:text-white leading-none mb-1">{row.original.phone}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.original.name_real || 'CHƯA ĐỊNH DANH'}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "money",
      header: "Số dư khả dụng",
      cell: ({ row }) => (
        <div className="flex flex-col items-start">
          <span className="font-black text-sm text-emerald-600">{parseFloat(row.original.money).toLocaleString()} $</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Vốn thực</span>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => {
        const roles: any = { admin: 'QUẢN TRỊ', agent: 'ĐẠI LÝ', cskh: 'CSKH', user: 'HỘI VIÊN' };
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="rounded-none border-slate-200 text-[9px] font-black uppercase px-2 w-fit">{roles[row.original.role] || row.original.role}</Badge>
            {row.original.upline_phone && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase italic">
                <Share2 size={10} /> {row.original.upline_phone}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "agent",
      header: "Đại lý quản lý",
      cell: ({ row }) => (
        <div className="flex flex-col hidden sm:flex">
          <span className="font-black text-slate-800 text-[11px] italic">{row.original.agent_phone || row.original.upline_phone || 'HỆ THỐNG'}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Mã: {row.original.invite_code_used || '---'}</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge className={cn("rounded-none text-[8px] font-black border-none px-2", row.original.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
          {row.original.status === 1 ? 'HOẠT ĐỘNG' : 'BỊ KHÓA'}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-blue-600 hover:bg-blue-50" onClick={() => { setSelectedUser(row.original); setAdjustType('add'); setIsAdjustOpen(true); }}><DollarSign size={16} /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-slate-600 hover:bg-slate-100" onClick={() => handleEdit(row.original)}><Settings2 size={16} /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <StatCompact label="Tổng hội viên" value={total} icon={<Users size={16} />} color="blue" />
        <StatCompact label="Đang trực tuyến" value={data.filter(u => u.status === 1).length} icon={<Activity size={16} />} color="emerald" />
        <StatCompact label="Hạng VIP" value={data.filter(u => u.level > 1).length} icon={<Award size={16} />} color="amber" />
        <StatCompact label="Tổng vốn USDT" value={data.reduce((sum, u) => sum + parseFloat(u.money), 0).toFixed(0)} icon={<Wallet size={16} />} color="indigo" />
      </div>

      <Card className="rounded-sm shadow-sm border-border overflow-hidden min-h-[500px]">
        <div className="p-3 md:p-4 bg-slate-50 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-0">
          <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
            <h3 className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">Danh mục hội viên</h3>
            <Button onClick={() => { setEditData({ role: 'user', status: 1 }); setIsCreateOpen(true); }} className="h-7 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[8px] md:text-[9px] uppercase px-3 md:px-4 gap-1 md:gap-2 shadow-lg">
              <Plus size={12} /> THÊM
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 font-black text-[8px] md:text-[9px] uppercase gap-2 self-end sm:self-auto" onClick={fetchData} disabled={loading}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> <span className="hidden xs:inline">Làm mới</span>
          </Button>
        </div>
        <DataTable columns={columns} data={data} searchKey="phone" />
      </Card>

      { }
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-none p-0 overflow-hidden font-['Inter'] shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white space-y-1">
            <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Điều chỉnh số dư</DialogTitle>
            <DialogDescription className="text-[9px] text-primary uppercase font-black tracking-widest opacity-80">
              {selectedUser?.phone} (ID: {selectedUser?.id})
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="bg-slate-50 p-4 border flex justify-between items-center rounded-none border-dashed">
              <span className="text-[10px] font-black uppercase text-slate-400">Số dư hiện tại:</span>
              <span className="text-lg font-black text-slate-800">{parseFloat(selectedUser?.money || 0).toLocaleString()} USD</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={adjustType === 'add' ? 'default' : 'outline'}
                className={cn("rounded-none font-black text-[10px] uppercase h-11", adjustType === 'add' ? "bg-emerald-500 hover:bg-emerald-600" : "")}
                onClick={() => setAdjustType('add')}
              >
                <Plus size={14} className="mr-1" /> CỘNG TIỀN (+)
              </Button>
              <Button
                variant={adjustType === 'sub' ? 'destructive' : 'outline'}
                className="rounded-none font-black text-[10px] uppercase h-11"
                onClick={() => setAdjustType('sub')}
              >
                <Trash2 size={14} className="mr-1" /> TRỪ TIỀN (-)
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Số USD thay đổi</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xl text-slate-300">$</span>
                <Input
                  type="number"
                  placeholder="Nhập số tiền..."
                  className="h-14 rounded-none border-slate-200 font-black text-2xl italic pl-8 focus-visible:ring-primary/20"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t flex gap-2">
            <Button variant="ghost" onClick={() => setIsAdjustOpen(false)} className="flex-1 rounded-none text-[10px] font-black uppercase" disabled={saving}>HỦY LỆNH</Button>
            <Button onClick={handleAdjustBalance} disabled={saving || !adjustAmount} className="flex-[2] rounded-none text-[10px] font-black uppercase bg-button shadow-lg">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : "XÁC NHẬN "}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-none p-0 overflow-hidden font-['Inter'] shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white flex items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Hồ sơ người dùng</DialogTitle>
              <DialogDescription className="text-[9px] text-primary uppercase font-black tracking-widest">ID: {selectedUser?.id}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-4 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Tài khoản (Username)</Label>
              <Input className="h-11 rounded-none font-black border-slate-200" value={editData.phone || ''} readOnly={!isAdmin} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Họ và tên</Label>
              <Input className="h-11 rounded-none font-black border-slate-200" value={editData.name_real || ''} onChange={e => setEditData({ ...editData, name_real: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Vai trò hệ thống</Label>
              <select className="w-full h-11 px-3 rounded-none border border-slate-200 text-xs font-black uppercase focus:outline-none focus:ring-1 focus:ring-primary" value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}>
                <option value="user">THÀNH VIÊN</option>
                <option value="agent">ĐẠI LÝ</option>
                <option value="cskh">CSKH</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Mã mời cá nhân ({editData.role === 'agent' ? 'AGENT CODE' : 'CSKH CODE'})</Label>
              <Input className="h-11 rounded-none border-slate-200 font-black text-rose-500 bg-rose-50/50" value={editData.invite_code || ''} onChange={e => setEditData({ ...editData, invite_code: e.target.value.toUpperCase() })} placeholder="VD: 838688" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Trạng thái</Label>
              <select className="w-full h-11 px-3 rounded-none border border-slate-200 text-xs font-black uppercase focus:outline-none focus:ring-1 focus:ring-primary" value={editData.status} onChange={e => setEditData({ ...editData, status: parseInt(e.target.value) })}>
                <option value={1}>ĐANG HOẠT ĐỘNG</option>
                <option value={0}>BỊ KHÓA / CẤM</option>
              </select>
            </div>

            <div className="col-span-2 pt-6 border-t mt-4 space-y-6">
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2"><Lock size={12} /> Kho tài khoản & Bảo mật (Xác minh Root)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400">Mật khẩu đăng nhập mới</Label>
                  <Input type="password" placeholder="••••••••" className="h-11 rounded-none border-slate-200" onChange={e => setEditData({ ...editData, password: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400">Mật khẩu rút tiền mới</Label>
                  <Input type="password" placeholder="••••••••" className="h-11 rounded-none border-slate-200" onChange={e => setEditData({ ...editData, password_withdraw: e.target.value })} />
                </div>
              </div>

              <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2 mt-6"><Wallet size={12} /> Thông tin Ngân hàng Rút tiền</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400">Tên Ngân hàng</Label>
                  <Input className="h-11 rounded-none border-slate-200 font-black uppercase" value={editData.bank_name || ''} onChange={e => setEditData({ ...editData, bank_name: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400">Số tài khoản</Label>
                  <Input className="h-11 rounded-none border-slate-200 font-black" value={editData.account_number || ''} onChange={e => setEditData({ ...editData, account_number: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400">Chủ tài khoản</Label>
                  <Input className="h-11 rounded-none border-slate-200 font-black uppercase" value={editData.account_name || ''} onChange={e => setEditData({ ...editData, account_name: e.target.value.toUpperCase() })} />
                </div>
              </div>

              <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2 mt-6"><Share2 size={12} /> Hệ thống Đại lý (Upline)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400">ID Đại lý quản lý (agent_id)</Label>
                  <Input type="number" className="h-11 rounded-none border-slate-200 font-black" value={editData.agent_id || 0} onChange={e => setEditData({ ...editData, agent_id: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400">Mã người giới thiệu (invite)</Label>
                  <Input className="h-11 rounded-none border-slate-200 font-black uppercase" value={editData.invite || ''} onChange={e => setEditData({ ...editData, invite: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <p className="text-[8px] text-slate-400 italic mt-1">Lưu ý: agent_id là ID tài khoản của đại lý cấp trên. invite là mã mời của người giới thiệu trực tiếp.</p>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-none text-[10px] font-black uppercase">ĐÓNG</Button>
            <Button onClick={handleUpdate} disabled={saving} className="rounded-none text-[10px] font-black uppercase bg-button px-12 shadow-lg">LƯU HỒ SƠ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-none p-0 overflow-hidden font-['Inter'] shadow-2xl">
          <DialogHeader className="p-6 bg-emerald-600 text-white flex items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Thêm thành viên mới</DialogTitle>
              <DialogDescription className="text-[9px] text-white/70 uppercase font-black tracking-widest">Khởi tạo đại lý hoặc khách hàng mới</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400">Tài khoản (Username)</Label>
              <div className="relative">
                <Input value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="h-11 rounded-none border-primary/20 font-black" placeholder="Nhập tên đăng nhập..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400">Mật khẩu đăng nhập</Label>
              <Input type="password" value={editData.password || ''} onChange={e => setEditData({ ...editData, password: e.target.value })} className="h-11 rounded-none" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400">Vai trò</Label>
                <select className="w-full h-11 px-3 border rounded-none font-black text-[10px] uppercase" value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}>
                  <option value="user">THÀNH VIÊN</option>
                  {isAdmin && <option value="agent">ĐẠI LÝ</option>}
                  <option value="cskh">CSKH</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400">ID Đại lý (agent_id)</Label>
                <Input type="number" value={editData.agent_id || 0} onChange={e => setEditData({ ...editData, agent_id: parseInt(e.target.value) })} className="h-11 rounded-none font-black" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400">Mã mời (invite)</Label>
                <Input value={editData.invite || ''} onChange={e => setEditData({ ...editData, invite: e.target.value.toUpperCase() })} className="h-11 rounded-none uppercase font-black" placeholder="Mã người giới thiệu..." />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-none text-[10px] font-black uppercase" disabled={saving}>Hủy</Button>
            <Button onClick={handleCreateUser} disabled={saving} className="flex-1 rounded-none text-[10px] font-black uppercase bg-button h-11 shadow-lg">KHỞI TẠO TÀI KHOẢN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentsManagerSubTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [newInvite, setNewInvite] = useState({ code: '', user_id: '', remark: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReferrals();
      if (res.status) setData(res.data.rows || []);

      if (isAdmin) {
        const resInvites = await adminApi.getInviteCodes();
        if (resInvites.status) setInviteCodes(resInvites.data || []);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [isAdmin]);

  const handleCreateUser = async () => {
    if (!editData.phone || !editData.password) return;
    setSaving(true);
    try {
      const res = await adminApi.updateUser({ ...editData, isCreate: true });
      if (res.status) {
        toast({ title: 'Thành công', description: `Đã tạo ${editData.role === 'agent' ? 'Đại lý' : 'CSKH'} mới.` });
        setIsCreateOpen(false);
        setEditData({});
        fetchData();
      }
    } catch (error: any) { toast({ variant: 'destructive', title: 'Lỗi', description: error.message }); }
    finally { setSaving(false); }
  }

  const handleCreateInvite = async () => {
    if (!newInvite.code || !isAdmin) return;
    setIsSubmitting(true);
    try {
      const res = await adminApi.createInviteCode(newInvite);
      if (res.status) {
        toast({ title: 'Thành công', description: 'Đã phát hành mã mời Admin mới.' });
        setNewInvite({ code: '', user_id: '', remark: '' });
        fetchData();
      }
    } catch (error: any) { toast({ variant: 'destructive', title: 'Lỗi', description: error.message }); }
    finally { setIsSubmitting(false); }
  }

  const handleDeleteInvite = async (id: number) => {
    if (!confirm("Xác nhận gỡ bỏ mã mời?") || !isAdmin) return;
    try {
      const res = await adminApi.deleteInviteCode(id);
      if (res.status) { toast({ title: 'Thành công', description: 'Đã gỡ mã mời.' }); fetchData(); }
    } catch (error: any) { toast({ variant: 'destructive', title: 'Lỗi', description: error.message }); }
  }

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Xác nhận xóa tài khoản ${user.phone}? Thao tác này không thể hoàn tác.`)) return;
    try {
      const res = await adminApi.updateUser({ id: user.id, isDelete: true });
      if (res.status) {
        toast({ title: 'Thành công', description: 'Đã xóa tài khoản.' });
        fetchData();
      }
    } catch (error: any) { toast({ variant: 'destructive', title: 'Lỗi', description: error.message }); }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "phone",
      header: isAdmin ? "Tài khoản Đại lý" : "Thành viên cấp dưới (F1)",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSelectedUser(row.original); setIsEditOpen(true); }}>
          <div className="h-9 w-9 bg-slate-900 text-primary rounded-none border border-primary/20 flex items-center justify-center font-black text-[10px] group-hover:bg-primary group-hover:text-black transition-colors">
            {row.original.id}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm text-slate-800 italic uppercase tracking-tighter group-hover:text-primary transition-colors">{row.original.phone}</span>
            <span className="text-[10px] text-slate-400 font-bold">{row.original.name_real || row.original.name_user || '---'}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "invite_code",
      header: "Mã mời (AGENT)",
      cell: ({ row }) => (
        <Badge className="bg-slate-900 text-primary font-black text-[10px] rounded-none px-3 border-none italic">
          {row.original.invite_code || row.original.code || 'NULL'}
        </Badge>
      )
    },
    {
      accessorKey: "referral_count",
      header: "Hệ thống F1",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-800 text-sm">{row.original.referral_count || 0} hội viên</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Trực thuộc quản lý</span>
        </div>
      )
    },
    {
      accessorKey: "total_ref_recharge",
      header: "Hiệu suất mạng lưới",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-black text-emerald-600">{(parseFloat(row.original.total_ref_recharge) || 0).toLocaleString()} USDT</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">Doanh số nạp (All)</span>
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end pr-2 gap-1.5">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-none text-[9px] font-black uppercase gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setSelectedUser(row.original);
                  setEditData({ ...row.original, invite_code: row.original.invite_code || row.original.code || '' });
                  setIsEditOpen(true);
                }}
              >
                <Settings2 size={14} /> Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-none text-[9px] font-black uppercase gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  setEditData({ role: 'cskh', status: 1, remark: `CSKH của ${row.original.phone}`, parent_id: row.original.id });
                  setIsCreateOpen(true);
                }}
              >
                <UserPlus size={14} /> Thêm CSKH
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-none text-[9px] font-black uppercase gap-2 border-rose-200 text-rose-500 hover:bg-rose-50"
                onClick={() => handleDeleteUser(row.original)}
              >
                <Trash2 size={14} /> Xóa
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" className="h-8 rounded-none text-[9px] font-black uppercase gap-2" onClick={() => { setSelectedUser(row.original); }}>
            <TrendingUp size={14} /> Cây hệ thống
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card className="rounded-sm bg-slate-50/50 border-border p-5 border-dashed">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Tạo mã mời Admin</Label>
              <Input placeholder="VD: KING888" value={newInvite.code} onChange={e => setNewInvite({ ...newInvite, code: e.target.value.toUpperCase() })} className="h-11 rounded-none font-black text-lg text-primary tracking-widest border-slate-200" />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">UID (Tùy chọn)</Label>
              <Input placeholder="ID..." value={newInvite.user_id} onChange={e => setNewInvite({ ...newInvite, user_id: e.target.value })} className="h-11 rounded-none bg-white" />
            </div>
            <div className="flex-[2] space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400">Ghi chú</Label>
              <Input placeholder="Tên đại lý / Chiến dịch..." value={newInvite.remark} onChange={e => setNewInvite({ ...newInvite, remark: e.target.value })} className="h-11 rounded-none bg-white" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateInvite} disabled={isSubmitting} className="h-11 rounded-none bg-button font-black uppercase text-[10px] px-8 gap-2">
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus size={18} />} Phát hành
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className={cn("grid grid-cols-1 gap-4 md:gap-6", isAdmin ? "lg:grid-cols-12" : "lg:grid-cols-1")}>
        <div className={isAdmin ? "lg:col-span-8" : "lg:col-span-1"}>
          <Card className="rounded-none shadow-sm border-border overflow-hidden">
            <div className="p-4 bg-slate-900 border-b flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> HIỆU NĂNG ĐẠI LÝ MASTER (TOTAL)
              </h3>
              <Badge className="rounded-none bg-primary/20 text-primary border-none text-[8px] font-black italic">Hệ thống cấp cao</Badge>
            </div>
            <DataTable columns={columns} data={data} searchKey="phone" />
          </Card>
        </div>

        {isAdmin && (
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-none border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-100 py-4 border-b border-white/5">
                <CardTitle className="text-[10px] font-black uppercase italic tracking-widest text-slate-600 flex items-center gap-2">
                  <Zap size={14} /> MÃ MỜI ĐẶC QUYỀN (ROOT)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                <div className="p-4 bg-amber-50 border-b border-amber-100">
                  <p className="text-[9px] font-bold text-amber-700 leading-tight uppercase">Mã đặc quyền cho quản trị viên 0000000000 (838699) và đại lý đối tác AGENT8386 (838688).</p>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400">Mã (Code)</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {inviteCodes.map(ic => (
                      <tr key={ic.id} className="hover:bg-slate-50 group">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-black text-rose-500 bg-rose-50 px-2">{ic.code}</code>
                              {ic.code === '838699' && <Badge className="rounded-none h-4 bg-slate-900 text-[7px] p-1">ROOT</Badge>}
                              {ic.code === '838688' && <Badge className="rounded-none h-4 bg-primary text-black text-[7px] p-1">MASTER</Badge>}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[150px] mt-1">{ic.remark || 'Tài khoản đặc hữu'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 transition-colors" onClick={() => handleDeleteInvite(ic.id)}><Trash2 size={14} /></Button>
                        </td>
                      </tr>
                    ))}
                    {inviteCodes.length === 0 && (
                      <tr><td colSpan={2} className="p-8 text-center text-[10px] font-black text-slate-300 italic">Chưa cấu hình mã đặc quyền</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-none p-0 overflow-hidden font-['Inter'] shadow-2xl">
          <DialogHeader className="p-6 bg-emerald-600 text-white flex items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-lg font-black uppercase italic tracking-tighter">Thêm nhân sự cấp dưới</DialogTitle>
              <DialogDescription className="text-[9px] text-white/70 uppercase font-black tracking-widest">{editData.remark}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400">Số điện thoại (Tài khoản)</Label>
              <Input value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="h-11 rounded-none font-black" placeholder="Nhập số điện thoại..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-slate-400">Mật khẩu đăng nhập</Label>
              <Input type="password" value={editData.password || ''} onChange={e => setEditData({ ...editData, password: e.target.value })} className="h-11 rounded-none" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400">Vai trò</Label>
                <Input value={editData.role} readOnly className="h-11 rounded-none bg-slate-50 font-black text-xs uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400">Mã mời cá nhân</Label>
                <Input value={editData.invite_code || ''} onChange={e => setEditData({ ...editData, invite_code: e.target.value.toUpperCase() })} className="h-11 rounded-none border-emerald-200 font-black text-emerald-600 text-center" placeholder="VD: CSKH01" />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-none text-[10px] font-black uppercase" disabled={saving}>Hủy</Button>
            <Button onClick={handleCreateUser} disabled={saving} className="flex-1 rounded-none text-[10px] font-black uppercase bg-emerald-600 text-white h-11 shadow-lg">XÁC NHẬN TẠO CSKH</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCompact({ label, value, icon, color, isString }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
  }
  return (
    <Card className="rounded-none shadow-sm border-border">
      <CardContent className="p-3 md:p-4 flex items-center gap-4">
        <div className={cn("h-10 w-10 flex items-center justify-center border shrink-0", colorMap[color])}>
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className={cn("font-black text-slate-800", isString ? "text-xs" : "text-lg")}>
            {typeof value === 'number' && !isString ? value.toLocaleString() : value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
