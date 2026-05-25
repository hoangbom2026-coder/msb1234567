import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    DollarSign,
    Users,
    Loader2,
    TrendingUp,
    Zap,
    ShieldCheck,
    PieChart as PieChartIcon,
    Sword,
    Target,
    Waves,
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    History,
    Crown,
    CreditCard,
    MessageSquare,
    Settings,
} from "lucide-react";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/lib/admin-api';
import { Badge } from "@/components/ui/badge";
import { formatTime } from '@/lib/time-utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [topPlayers, setTopPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [statsRes, topRes] = await Promise.all([
                adminApi.getStats(),
                adminApi.getTopPlayers()
            ]);
            if (statsRes.status) setStats(statsRes.data);
            if (topRes.status) setTopPlayers(topRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 md:py-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] font-black text-slate-500 mt-4 uppercase tracking-widest">Đang kết nối...</p>
            </div>
        );
    }

    const chartData = stats?.trends?.recharge?.map((item: any, index: number) => ({
        date: item.date,
        recharge: item.amount,
        withdraw: stats?.trends?.withdraw?.[index]?.amount || 0
    })).reverse() || [];

    return (
        <div className="flex-1 space-y-3 md:space-y-4 font-['Inter'] animate-in fade-in duration-500 pb-10">
            { }
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 md:px-0">
                <div>
                    <h2 className="text-lg md:text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase italic">Trung tâm Điều hành</h2>
                    <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hệ thống Giám sát dữ liệu Thời gian thực</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-sm border border-slate-200">
                    <div className="text-left sm:text-right">
                        <span className="text-[8px] font-black text-emerald-500 flex items-center sm:justify-end gap-1 uppercase leading-none mb-0.5">
                            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Mã hóa SSL
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 block whitespace-nowrap italic">{new Date().toLocaleTimeString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            { }
            {(stats?.pending_withdraw > 0 || stats?.unread_chats > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {stats?.pending_withdraw > 0 && (
                        <Link to="/admin/transactions" className="flex items-center justify-between p-2 md:p-2.5 bg-rose-500/5 border border-rose-500/20 rounded-sm group hover:bg-rose-500/10 transition-all shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 md:h-8 md:w-8 bg-rose-500 flex items-center justify-center text-white rounded-sm shadow-md animate-pulse shrink-0">
                                    <CreditCard size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-rose-600 uppercase tracking-tight italic truncate">Giao dịch Rút tiền</p>
                                    <p className="text-[8px] font-bold text-rose-500/70 uppercase truncate">{stats?.pending_withdraw} yêu cầu đang chờ</p>
                                </div>
                            </div>
                            <ArrowUpRight className="text-rose-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" size={14} />
                        </Link>
                    )}
                    {stats?.unread_chats > 0 && (
                        <Link to="/admin/chat" className="flex items-center justify-between p-2 md:p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-sm group hover:bg-amber-500/10 transition-all shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 md:h-8 md:w-8 bg-amber-500 flex items-center justify-center text-white rounded-sm shadow-md shrink-0">
                                    <MessageSquare size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-amber-600 uppercase tracking-tight italic truncate">Hỗ trợ Trực tuyến</p>
                                    <p className="text-[8px] font-bold text-amber-500/70 uppercase truncate">{stats?.unread_chats} tin nhắn mới</p>
                                </div>
                            </div>
                            <ArrowUpRight className="text-amber-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" size={14} />
                        </Link>
                    )}
                </div>
            )}

            { }
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="Lợi nhuận Game"
                    value={stats?.gaming_profit}
                    icon={<Sword size={16} />}
                    color="blue"
                    sub={`Tổng tham gia : ${stats?.total_bet?.toLocaleString()}`}
                    trend={`${stats?.total_bet > 0 ? ((stats.gaming_profit / stats.total_bet) * 100).toFixed(1) : 0}%`}
                />
                <StatCard
                    label="Lợi nhuận Hệ thống"
                    value={stats?.profit}
                    icon={<DollarSign size={16} />}
                    color="emerald"
                    sub={`Lợi nhuận ròng (Nạp - Rút)`}
                    trend="Tài chính"
                />
                <StatCard
                    label="Tổng Thành viên"
                    value={stats?.total_users}
                    icon={<Users size={16} />}
                    color="indigo"
                    sub={`Mới hôm nay: +${stats?.new_users_today}`}
                    trend="Thành viên"
                />
                <StatCard
                    label="Trực tuyến"
                    value={stats?.online_users || 0}
                    icon={<Waves size={16} />}
                    color="amber"
                    sub={`Rút đang chờ: ${stats?.pending_withdraw}`}
                    trend="Vận hành"
                />
            </div>

            { }
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                <QuickActionCard href="/admin/users" label="Thành viên" icon={<Users className="text-indigo-500" size={16} />} />
                <QuickActionCard href="/admin/games/results" label="Kết quả" icon={<Target className="text-blue-500" size={16} />} />
                <QuickActionCard href="/admin/games/bets" label="Cược" icon={<History className="text-violet-500" size={16} />} />
                <QuickActionCard href="/admin/transactions" label="Tài chính" icon={<DollarSign className="text-emerald-500" size={16} />} />
                <QuickActionCard href="/admin/chat" label="Hỗ trợ" icon={<MessageSquare className="text-amber-500" size={16} />} />
                <QuickActionCard href="/admin/settings" label="Hệ thống" icon={<Settings className="text-slate-500" size={16} />} />
            </div>

            { }
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-8 overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 px-3 py-2 border-b">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                            <TrendingUp size={12} className="text-primary" /> Biến động rút tiền (15 ngày)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => val?.split?.('-')?.slice?.(1)?.reverse?.()?.join('/') || val} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '2px', fontSize: '9px', fontWeight: 700 }} />
                                <Area type="monotone" dataKey="withdraw" stroke="#ef4444" strokeWidth={2} fill="url(#colorWithdraw)" name="Rút tiền" />
                                <defs>
                                    <linearGradient id="colorWithdraw" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-4 overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 px-3 py-2 border-b">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                            <PieChartIcon size={12} className="text-primary" /> Hiệu suất cược
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                        <div className="h-[140px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Cược', value: stats?.total_bet, color: '#3b82f6' },
                                    { name: 'Trúng', value: stats?.total_payout, color: '#f43f5e' },
                                    { name: 'Lời', value: stats?.gaming_profit, color: '#f59e0b' },
                                ]}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} />
                                    <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={30}>
                                        {[1, 2, 3].map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#f43f5e' : '#f59e0b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tỷ lệ giữ (RTP)</span>
                                <span className="text-lg font-black text-slate-800 italic">
                                    {stats?.total_bet > 0 ? ((stats.gaming_profit / stats.total_bet) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            { }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                { }
                <Card className="overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 px-3 py-2 border-b flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                            <Crown size={12} className="text-amber-500" /> TOP CƯỢC 24H
                        </CardTitle>
                        <Badge variant="outline" className="h-4 text-[8px] font-black border-amber-500/20 text-amber-600 bg-amber-500/5 px-1.5">LIVE</Badge>
                    </CardHeader>
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="h-8">
                                <TableHead className="px-3">Tài khoản</TableHead>
                                <TableHead className="px-3 text-right">Tổng tham gia </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(topPlayers || []).slice(0, 5).map((player, idx) => (
                                <TableRow key={idx} className="h-10 group">
                                    <TableCell className="py-1 px-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-5 w-5 flex items-center justify-center text-[8px] font-black rounded-sm border shrink-0", idx === 0 ? "bg-amber-400 text-amber-900" : "bg-slate-100")}>
                                                {idx + 1}
                                            </div>
                                            <span className="text-[11px] font-black truncate">{player.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-3 text-[11px] font-black text-slate-600">
                                        {player.total_bet.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                { }
                <Card className="overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 px-3 py-2 border-b">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                            <History size={12} className="text-indigo-500" /> BIẾN ĐỘNG GẦN ĐÂY
                        </CardTitle>
                    </CardHeader>
                    <div className="p-2.5 space-y-2 overflow-y-auto max-h-[250px] custom-scrollbar">
                        {stats?.recent?.transactions?.slice(0, 5).map((tx: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 border border-slate-100 rounded-sm hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-6 w-6 flex items-center justify-center rounded-sm shrink-0", tx.type === 'recharge' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                        {tx.type === 'recharge' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black leading-none mb-0.5 truncate">{tx.phone}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{tx.type === 'recharge' ? 'Nạp' : 'Rút'} • Chờ</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black">{parseFloat(tx.money).toLocaleString()} $</p>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                                        {formatTime(tx.created_at || tx.time)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function QuickActionCard({ href, label, icon }: any) {
    return (
        <Link to={href} className="group relative bg-white border border-slate-200 rounded-sm p-2 hover:border-primary hover:shadow-sm transition-all flex flex-col items-center justify-center gap-1.5 overflow-hidden text-center min-h-[60px]">
            <div className="p-1.5 rounded-full bg-slate-50 transition-all group-hover:bg-primary/10 shrink-0">
                {icon}
            </div>
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 group-hover:text-primary leading-tight">{label}</span>
        </Link>
    );
}

function StatCard({ label, value, icon, color, sub, trend }: any) {
    const colorClasses: any = {
        blue: "text-blue-600 border-blue-100 bg-blue-50",
        emerald: "text-emerald-600 border-emerald-100 bg-emerald-50",
        indigo: "text-indigo-600 border-indigo-100 bg-indigo-50",
        amber: "text-amber-600 border-amber-100 bg-amber-50",
    };

    return (
        <Card className="rounded-sm shadow-sm group hover:border-primary/50 transition-colors">
            <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className={cn("p-1.5 rounded-sm border", colorClasses[color])}>
                        {icon}
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black text-slate-400 border-slate-200 rounded-none uppercase tracking-widest px-1 py-0">
                        {trend}
                    </Badge>
                </div>
                <div>
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5 opacity-70">{label}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-800 tracking-tighter italic">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase">USDT</span>
                    </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">{sub}</span>
                    <Activity size={10} className="text-slate-200 group-hover:text-primary transition-colors" />
                </div>
            </CardContent>
        </Card>
    );
}
