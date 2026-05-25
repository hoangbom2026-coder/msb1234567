import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, ShieldCheck, UserCog, Wallet, Ban, Unlock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export type User = {
  id: string | number
  phone: string
  name_real: string | null
  money: number
  level: number
  status: number
  role: string
  code: string
  invite: string | null
  today_bet?: number
  today_profit?: number
  total_recharge?: number
  total_withdraw?: number
  created_at?: string | number
}

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="p-0 hover:bg-transparent font-black uppercase text-[10px] tracking-widest"
        >
          Tài khoản
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const user = row.original;
        return (
            <div className="flex flex-col">
                <span className="font-bold text-sm">{user.phone}</span>
                <span className="text-[9px] text-muted-foreground font-black opacity-50">UID: {user.id}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'role',
    header: 'Phân quyền',
    cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
            <Badge 
                variant={role === 'admin' ? 'default' : 'secondary'}
                className={role === 'admin' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 font-black uppercase text-[9px]" : "font-black uppercase text-[9px]"}
            >
                {role === 'admin' ? <ShieldCheck className="w-2.5 h-2.5 mr-1" /> : null}
                {role}
            </Badge>
        )
    }
  },
  {
    accessorKey: 'money',
    header: () => <div className="text-right font-black uppercase text-[10px] tracking-widest">Số dư hiện tại</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('money'))
      return <div className="text-right font-black text-primary text-sm tracking-tight">{amount.toLocaleString()} <span className="text-[10px] opacity-50">USDT</span></div>
    },
  },
  {
    accessorKey: 'total_recharge',
    header: () => <div className="text-right font-black uppercase text-[10px] tracking-widest">Tổng Nạp</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.original.total_recharge as any || 0)
      return <div className="text-right font-bold text-emerald-500 text-xs">+{amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: 'total_withdraw',
    header: () => <div className="text-right font-black uppercase text-[10px] tracking-widest">Tổng Rút</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.original.total_withdraw as any || 0)
      return <div className="text-right font-bold text-rose-500 text-xs">-{amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: 'today_profit',
    header: () => <div className="text-right font-black uppercase text-[10px] tracking-widest">Lãi/Lỗ Today</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.original.today_profit as any || 0)
      return (
        <div className={`text-right font-black text-xs ${amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {amount > 0 ? '+' : ''}{amount.toLocaleString()}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
        const status = row.getValue('status') as number;
        return (
             <Badge variant={status === 1 ? 'outline' : 'destructive'} className={status === 1 ? 'bg-green-500/10 text-green-500 border-green-500/20 font-black text-[9px] uppercase' : 'font-black text-[9px] uppercase'}> 
                {status === 1 ? 'Active' : 'Banned'}
            </Badge>
        )
    }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const user = row.original
      const meta = table.options.meta as any;
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-[#0c192c] border-primary/20 text-white">
            <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-[0.2em] opacity-50">Thao tác</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigator.clipboard.writeText(user.id.toString())}>
              Sao chép UID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/20" onClick={() => meta?.onAdjustBalance(user)}>
                <Wallet className="w-4 h-4 text-primary" /> Điều chỉnh số dư
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-primary/20" onClick={() => meta?.onChangeRole(user)}>
                <UserCog className="w-4 h-4 text-primary" /> Phân quyền Role
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            
            {user.status === 1 ? (
                <DropdownMenuItem className="text-rose-500 gap-2 cursor-pointer focus:bg-rose-500/20" onClick={() => meta?.onUpdateStatus(user, 0)}>
                    <Ban className="w-4 h-4" /> Khóa tài khoản
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem className="text-emerald-500 gap-2 cursor-pointer focus:bg-emerald-500/20" onClick={() => meta?.onUpdateStatus(user, 1)}>
                    <Unlock className="w-4 h-4" /> Mở khóa tài khoản
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
