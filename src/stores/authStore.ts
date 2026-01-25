import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: string;
    balance: number;
    coins: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: { firstName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setLoading: (isLoading) => set({ isLoading }),

            login: async (email, password) => {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        return { success: false, error: data.error };
                    }

                    set({ user: data.user, isAuthenticated: true });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: 'Ошибка подключения к серверу' };
                }
            },

            register: async (data) => {
                try {
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        return { success: false, error: result.error };
                    }

                    set({ user: result.user, isAuthenticated: true });
                    return { success: true };
                } catch (error) {
                    return { success: false, error: 'Ошибка подключения к серверу' };
                }
            },

            logout: async () => {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } finally {
                    set({ user: null, isAuthenticated: false });
                }
            },

            fetchUser: async () => {
                set({ isLoading: true });
                try {
                    const response = await fetch('/api/users/me');

                    if (response.ok) {
                        const user = await response.json();
                        set({ user, isAuthenticated: true });
                    } else {
                        set({ user: null, isAuthenticated: false });
                    }
                } catch {
                    set({ user: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
