import {
  LayoutDashboard,
  Users,
  Wallet,
  Gamepad2,
  MessageSquare,
  Settings,
  ShieldCheck,
  Bell,
  Image as ImageIcon,
  History,
  UserPlus,
  Activity,
  Zap,
  Lock,
  Target,
  SlidersHorizontal
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles?: string[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[];
}

export const ADMIN_NAV_ITEMS: NavGroup[] = [
  {
    group: "Bàn làm việc",
    items: [
      {
        href: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'agent', 'cskh', 'ROOT']
      }
    ]
  },
  {
    group: "Hội viên",
    items: [
      {
        href: '/admin/users',
        label: 'Quản lý Thành viên',
        icon: Users,
        roles: ['admin', 'agent', 'cskh', 'ROOT']
      }
    ]
  },
  {
    group: "Vận hành Game",
    items: [
      {
        href: '/admin/games/results',
        label: 'Điều phối Kết quả',
        icon: Target,
        roles: ['admin', 'ROOT']
      },
      {
        href: '/admin/games/profit-schedule',
        label: 'House Edge Schedule',
        icon: SlidersHorizontal,
        roles: ['admin', 'ROOT']
      },
      {
        href: '/admin/games/history',
        label: 'Lịch sử Phiên',
        icon: History,
        roles: ['admin', 'ROOT']
      },
      {
        href: '/admin/games',
        label: 'Cấu hình Sảnh',
        icon: Settings,
        roles: ['admin', 'ROOT']
      }
    ]
  },
  {
    group: "Tài chính & Chat",
    items: [
      {
        href: '/admin/transactions',
        label: 'Giao dịch',
        icon: Wallet,
        roles: ['admin', 'cskh', 'ROOT']
      },
      {
        href: '/admin/chat',
        label: 'Hỗ trợ khách',
        icon: MessageSquare,
        roles: ['admin', 'cskh', 'ROOT']
      }
    ]
  },
  {
    group: "Hệ thống",
    items: [
      {
        href: '/admin/settings',
        label: 'Thiết lập sảnh',
        icon: Zap,
        roles: ['admin', 'ROOT']
      },
      {
        href: '/admin/logs',
        label: 'Lịch sử Admin',
        icon: History,
        roles: ['admin', 'ROOT']
      }
    ]
  }
];
