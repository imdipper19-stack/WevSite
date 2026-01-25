import { create } from 'zustand';

interface Order {
    id: string;
    orderNumber: string;
    coinsAmount: number;
    totalPrice: number;
    status: string;
    statusText: string;
    createdAt: string;
    completedAt?: string;
}

interface OrdersState {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };

    // Actions
    fetchOrders: (filter?: string) => Promise<void>;
    createOrder: (coinsAmount: number, paymentMethod: string) => Promise<{ success: boolean; order?: Order; error?: string }>;
    clearError: () => void;
}

const statusTexts: Record<string, string> = {
    PENDING_PAYMENT: 'Ожидает оплаты',
    PAID: 'Оплачен',
    PROCESSING: 'В обработке',
    AWAITING_CREDENTIALS: 'Ожидает данных',
    IN_PROGRESS: 'В процессе',
    COMPLETED: 'Выполнен',
    CANCELLED: 'Отменен',
    REFUNDED: 'Возврат',
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
    orders: [],
    isLoading: false,
    error: null,
    pagination: {
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
    },

    fetchOrders: async (filter = 'all') => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/orders?status=${filter}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            const ordersWithText = data.orders.map((order: Order) => ({
                ...order,
                statusText: statusTexts[order.status] || order.status,
            }));

            set({
                orders: ordersWithText,
                pagination: data.pagination,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Ошибка загрузки заказов',
                isLoading: false
            });
        }
    },

    createOrder: async (coinsAmount, paymentMethod) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coinsAmount, paymentMethod }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error };
            }

            // Refresh orders list
            await get().fetchOrders();

            return {
                success: true,
                order: {
                    ...data.order,
                    statusText: statusTexts[data.order.status],
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Ошибка создания заказа'
            };
        }
    },

    clearError: () => set({ error: null }),
}));
