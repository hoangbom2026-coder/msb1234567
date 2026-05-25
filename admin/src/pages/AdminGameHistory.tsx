import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/admin-api';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/time-utils';
import {
  History,
  RefreshCw,
  Search,
  Filter,
  Gamepad2,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminGameHistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameRooms, setGameRooms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeTab !== 'all') params.game_id = activeTab;

      const res = await adminApi.getGameHistory(params);
      if (res.status) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải lịch sử phiên.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await adminApi.getGames();
      if (res.status) {
        setGameRooms(res.data || []);
      }
    } catch (error) { console.error(error); }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "period",
      header: "Kỳ quay",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-800 text-sm">#{row.original.period}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.original.game_name || row.original.game_id}</span>
        </div>
      )
    },
    {
      accessorKey: "result",
      header: "Kết quả",
      cell: ({ row }) => {
        const result = row.original.result;
        if (!result) return <span className="text-slate-400">---</span>;

        let resArr: any[] = [];
        try {
          resArr = typeof result === 'string' ? JSON.parse(result) : (Array.isArray(result) ? result : [result]);
        } catch (e) { resArr = [result]; }

        return (
          <div className="flex gap-1">
            {resArr.map((n: any, i: number) => (
              <div key={i} className="w-6 h-6 rounded-sm bg-slate-900 text-primary flex items-center justify-center text-[10px] font-black border-b border-primary shadow-sm">
                {n}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "total_bet",
      header: "Tổng tham gia ",
      cell: ({ row }) => (
        <span className="font-black text-slate-700">{(row.original.total_bet || 0).toLocaleString()} $</span>
      )
    },
    {
      accessorKey: "total_payout",
      header: "Tổng trả",
      cell: ({ row }) => (
        <span className="font-black text-rose-500">{(row.original.total_payout || 0).toLocaleString()} $</span>
      )
    },
    {
      id: "profit",
      header: "Lợi nhuận",
      cell: ({ row }) => {
        const profit = (row.original.total_bet || 0) - (row.original.total_payout || 0);
        return (
          <Badge className={cn(
            "rounded-none font-black text-[10px] uppercase",
            profit >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}>
            {profit >= 0 ? '+' : ''}{profit.toLocaleString()} $
          </Badge>
        );
      }
    },
    {
      accessorKey: "created_at",
      header: "Thời gian kết thúc",
      cell: ({ row }) => (
        <span className="text-[10px] font-bold text-slate-500">
          {formatDateTime(row.original.created_at || row.original.time || row.original.end_time)}
        </span>
      )
    }
  ];

  return (
    <div className="flex-1 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 font-['Inter'] animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black tracking-tighter text-slate-800 dark:text-white uppercase italic">Lịch sử Phiên Game</h2>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-70">Dữ liệu kết quả và dòng tiền</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-sm gap-2 border-slate-200 h-9 px-4 font-black text-[10px] uppercase shadow-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Làm mới
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-slate-100 p-1 h-auto md:h-11 rounded-none border-b-2 border-slate-200 flex flex-wrap md:flex-nowrap w-full lg:w-max min-w-full lg:min-w-0">
              <TabsTrigger value="all" className="flex-1 sm:flex-none rounded-none font-black uppercase text-[9px] md:text-[10px] gap-2 px-4 md:px-6 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary transition-all">TẤT CẢ SẢNH</TabsTrigger>
              {gameRooms.map(game => (
                <TabsTrigger key={game.game_id} value={game.game_id} className="flex-1 sm:flex-none rounded-none font-black uppercase text-[9px] md:text-[10px] gap-2 px-4 md:px-6 py-2 md:py-0 data-[state=active]:bg-white data-[state=active]:text-primary transition-all whitespace-nowrap">
                  {game.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        <Card className="m-0 border border-slate-200 rounded-none overflow-hidden bg-white shadow-sm flex flex-col min-h-[400px] md:min-h-[600px]">
          <div className="p-3 md:p-4 bg-slate-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History size={16} className="text-slate-400" />
              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">Dữ liệu kết quả hệ thống</span>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <DataTable columns={columns} data={data} searchKey="period" />
          </div>
        </Card>
      </div>
    </div>
  );
}
