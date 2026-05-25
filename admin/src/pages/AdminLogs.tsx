import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  RefreshCw,
  Eye,
  Calendar,
  ShieldCheck,
  Terminal,
  AlertCircle,
  Activity,
  UserCheck,
  Loader2,
  Clock
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/admin-api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/time-utils';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs();
      if (res.status) setLogs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
      const matchesSearch = 
        log.admin_phone?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      if (activeTab === 'all') return true;
      
      const action = log.action?.toLowerCase() || '';
      if (activeTab === 'security') return action.includes('login') || action.includes('password');
      if (activeTab === 'finance') return action.includes('withdraw') || action.includes('balance');
      if (activeTab === 'game') return action.includes('game') || action.includes('result');
      
      return true;
  });

  const getLogIcon = (action: string) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('login')) return <UserCheck size={14} />;
    if (act.includes('password')) return <ShieldCheck size={14} />;
    if (act.includes('balance')) return <Activity size={14} />;
    if (act.includes('game')) return <Terminal size={14} />;
    return <AlertCircle size={14} />;
  };

  return (
    <div className="flex-1 p-3 md:p-8 space-y-4 md:space-y-6 font-['Inter']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-white uppercase italic">Nhật ký Hệ thống</h2>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium">Lịch sử thao tác của đội ngũ quản trị.</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto rounded-sm gap-2 border-border h-10 px-6 font-bold text-xs uppercase" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Cập nhật
        </Button>
      </div>

      <Card className="rounded-sm shadow-sm border-border overflow-hidden">
        <CardHeader className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/10 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs defaultValue="all" className="w-full lg:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 p-1 border border-border rounded-sm flex flex-wrap h-auto">
                <TabsTrigger value="all" className="flex-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-[9px] md:text-[10px] uppercase px-3 md:px-4 h-8 transition-all">Tất cả</TabsTrigger>
                <TabsTrigger value="security" className="flex-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-[9px] md:text-[10px] uppercase px-3 md:px-4 h-8 transition-all">Bảo mật</TabsTrigger>
                <TabsTrigger value="finance" className="flex-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-[9px] md:text-[10px] uppercase px-3 md:px-4 h-8 transition-all">Tài chính</TabsTrigger>
                <TabsTrigger value="game" className="flex-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-black font-bold text-[9px] md:text-[10px] uppercase px-3 md:px-4 h-8 transition-all truncate">Game</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full lg:w-80">
              <Input 
                placeholder="Tìm kiếm hành động..." 
                className="h-10 rounded-sm border-border font-medium text-sm focus-visible:ring-primary/20" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/5 hover:bg-slate-50 dark:hover:bg-slate-800/5">
                <TableRow className="h-10">
                  <TableHead className="w-[60px] text-center font-bold text-[9px] md:text-[10px] uppercase tracking-wider">Icon</TableHead>
                  <TableHead className="min-w-[150px] font-bold text-[9px] md:text-[10px] uppercase tracking-wider">Quản trị viên</TableHead>
                  <TableHead className="min-w-[150px] font-bold text-[9px] md:text-[10px] uppercase tracking-wider">Hành động</TableHead>
                  <TableHead className="min-w-[120px] font-bold text-[9px] md:text-[10px] uppercase tracking-wider text-center">Đối tượng</TableHead>
                  <TableHead className="min-w-[150px] font-bold text-[9px] md:text-[10px] uppercase tracking-wider">Thời điểm</TableHead>
                  <TableHead className="text-right font-bold text-[9px] md:text-[10px] uppercase tracking-wider pr-8">Xem</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                   <TableCell colSpan={6} className="h-60 text-center">
                     <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                     <p className="text-sm font-bold text-slate-400 uppercase">Đang tải dữ liệu...</p>
                   </TableCell>
                 </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400 italic">Không tìm thấy bản ghi nhật ký.</TableCell>
                </TableRow>
              ) : filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-center">
                    <div className="mx-auto h-7 w-7 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-border">
                        {getLogIcon(log.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-800 dark:text-white">{log.admin_phone || 'SYSTEM'}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IP: {log.ip_address}</span>
                      </div>
                  </TableCell>
                  <TableCell className="font-bold text-[13px] text-slate-700 dark:text-white/80">{log.action}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-sm font-bold text-[10px] uppercase border-slate-200 dark:border-slate-800 text-primary">
                        {log.target}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-slate-500">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:text-primary">
                          <Eye size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[550px] rounded-sm p-0 overflow-hidden font-['Inter'] translate-y-[-10%]">
                        <DialogHeader className="p-6 bg-slate-50 border-b space-y-1">
                          <DialogTitle className="text-lg font-bold flex items-center gap-2">
                              <Terminal size={18} className="text-primary" /> Chi tiết bản ghi ID #{log.id}
                          </DialogTitle>
                          <DialogDescription className="text-[10px] text-slate-400 font-bold uppercase">Thông tin chi tiết về hành động và dữ liệu thực thi.</DialogDescription>
                        </DialogHeader>
                        <div className="p-8 space-y-6">
                           <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 rounded-sm border bg-slate-50 dark:bg-slate-900 shadow-inner">
                              <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Thực hiện bởi</p>
                                <p className="font-bold text-md text-slate-800 dark:text-white">{log.admin_phone || 'Tự động'}</p>
                                <p className="text-[10px] text-slate-400 font-medium">IP: {log.ip_address}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Thời gian</p>
                                <p className="font-bold text-sm text-slate-800 dark:text-white">
                                    {formatDateTime(log.created_at)}
                                </p>
                                <Clock size={12} className="ml-auto mt-1 text-slate-300" />
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hành động</p>
                                    <p className="font-bold text-red-600">{log.action}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Đối tượng</p>
                                    <p className="font-bold text-blue-600">{log.target}</p>
                                </div>
                           </div>

                           <div className="space-y-3">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dữ liệu thực thi (JSON Payload)</p>
                                <pre className="p-5 bg-slate-900 rounded-sm text-[12px] font-mono overflow-auto border border-border text-emerald-400 max-h-[200px] shadow-inner">
                                    {JSON.stringify(typeof log.details === 'string' ? JSON.parse(log.details) : log.details, null, 2)}
                                </pre>
                           </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
