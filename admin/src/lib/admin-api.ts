import { getStoredToken as getAuthToken } from '@/hooks/use-auth-store';
import api from '@/lib/api';

async function adminRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${baseUrl}/admin${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {

            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('admin-auth-storage');
            window.location.href = '/login';
            throw new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
        }
        try {
            const errorData = await response.json();
            const message = errorData.message || `HTTP error! status: ${response.status}`;
            if (response.status === 403) {
                throw new Error(`⛔ Không đủ quyền: ${message}`);
            }
            throw new Error(message);
        } catch (e: any) {
            if (e.message.startsWith('⛔')) throw e;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    return response.json();
}

export const adminApi = {
    getStats: () => adminRequest('/stats'),
    getTopPlayers: () => adminRequest('/top-players'),
    
    getUsers: (params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return adminRequest(`/users${query}`);
    },
    
    getReferrals: (params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return adminRequest(`/referrals${query}`);
    },
    
    updateUserStatus: (userId: string | number, status: number) => 
        adminRequest('/users/status', {
            method: 'POST',
            body: JSON.stringify({ userId, status })
        }),

    updateUserRole: (userId: string | number, role: string) => 
        adminRequest('/users/role', {
            method: 'POST',
            body: JSON.stringify({ userId, role })
        }),

    updateUser: (data: any) => 
        adminRequest('/users/update', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    adjustBalance: (userId: string | number, amount: number, type?: 'add' | 'sub') => 
        adminRequest('/users/adjust-balance', {
            method: 'POST',
            body: JSON.stringify({ userId, amount, type: type || (amount >= 0 ? 'add' : 'sub') })
        }),

    getTransactions: (type?: 'recharge' | 'withdraw') => 
        adminRequest(`/transactions${type ? `?type=${type}` : ''}`),

    approveTransaction: (type: 'recharge' | 'withdraw', id_order: string | number, status: number) =>
        adminRequest('/transactions/approve', {
            method: 'POST',
            body: JSON.stringify({ type, id_order, status })
        }),

    getGames: () => adminRequest('/games'),

    updateGame: (game_id: string | number, data: any) => 
        adminRequest(`/games/update/${game_id}`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    getOpenSessions: () => adminRequest('/games/sessions/open'),

    getGameHistory: (params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return adminRequest(`/games/sessions/history${query}`);
    },
    
    getBets: (params?: any) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return adminRequest(`/games/bets${query}`);
    },

    setManualResult: (sessionId: string | number, result: any) => 
        adminRequest('/games/set-result', {
            method: 'POST',
            body: JSON.stringify({ sessionId, result })
        }),

    getChatConversations: () => adminRequest('/chat/conversations'),

    getChatMessages: (conversationId: string | number) => 
        adminRequest(`/chat/messages/${conversationId}`),

    markConversationAsRead: (conversationId: string | number) => 
        adminRequest(`/chat/read/${conversationId}`, { method: 'POST' }),

    uploadChatImage: (formData: FormData) => 
        adminRequest('/chat/upload', {
            method: 'POST',
            body: formData
        }),

    getNotifications: () => adminRequest('/notifications'),
    createNotification: (data: any) => adminRequest('/notifications/create', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteNotification: (id: number | string) => adminRequest(`/notifications/delete/${id}`, { method: 'DELETE' }),

    getSystemConfig: () => adminRequest('/config'),
    updateSystemConfig: (data: any) => adminRequest('/config/update', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getSystemBanks: () => adminRequest('/banks'),
    updateSystemBank: (data: any) => adminRequest('/banks/update', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteSystemBank: (id: number | string) => adminRequest(`/banks/delete/${id}`, { method: 'DELETE' }),

    getBanners: () => adminRequest('/banners'),
    updateBanner: (data: any) => adminRequest('/banners/update', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    deleteBanner: (id: number) => adminRequest(`/banners/delete/${id}`, { method: 'DELETE' }),

    getAuditLogs: () => adminRequest('/logs'),

    getInviteCodes: () => adminRequest('/invite-codes'),
    createInviteCode: (data: any) => adminRequest('/invite-codes/create', { method: 'POST', body: JSON.stringify(data) }),
    updateInviteCode: (id: number, data: any) => adminRequest(`/invite-codes/update/${id}`, { method: 'POST', body: JSON.stringify(data) }),
    deleteInviteCode: (id: number) => adminRequest(`/invite-codes/delete/${id}`, { method: 'DELETE' }),

    changePassword: (newPassword: string) => adminRequest('/change-password', { method: 'POST', body: JSON.stringify({ newPassword }) }),

    // Profit schedule
    getProfitSchedules:   (room_id?: number) => adminRequest(`/profit-schedule${room_id ? `?room_id=${room_id}` : ''}`),
    getProfitRooms:       () => adminRequest('/profit-schedule/rooms'),
    getLiveEdgePreview:   () => adminRequest('/profit-schedule/live-preview'),
    createProfitSchedule: (data: any) => adminRequest('/profit-schedule', { method: 'POST', body: JSON.stringify(data) }),
    updateProfitSchedule: (id: number, data: any) => adminRequest(`/profit-schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProfitSchedule: (id: number) => adminRequest(`/profit-schedule/${id}`, { method: 'DELETE' }),
};

/**
 * Detect locale từ IP (public endpoint — không cần auth).
 */
export const getLocaleFromIP = async () => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${baseUrl}/config/locale`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.status ? data.data : null;
    } catch {
        return null;
    }
};
