'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Coins,
    LayoutDashboard,
    Home,
    ShoppingCart,
    Clock,
    Settings,
    HelpCircle,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
    Star
} from 'lucide-react';
import { NotificationsPopover } from '@/components/NotificationsPopover';

interface DashboardLayoutProps {
    children: ReactNode;
}

interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: string;
    balance: number;
    coins: number;
    avatarUrl?: string | null;
    totalSpent?: number;
    completedOrders?: number;
}

const navigation = [
    { name: 'Главная', href: '/dashboard', icon: Home },
    { name: 'TikTok Монеты', href: '/dashboard/buy', icon: Coins },
    { name: 'Telegram Stars', href: '/dashboard/buy-stars', icon: Star },
    { name: 'Мои заказы', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'История', href: '/dashboard/history', icon: Clock },
    { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
    { name: 'Поддержка', href: '/dashboard/support', icon: HelpCircle },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/user/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else if (res.status === 401) {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        }
        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const userInitial = user?.firstName?.charAt(0).toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[var(--card-bg)] border-r border-[var(--border)]
          transform transition-transform duration-300 lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)]">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-lg flex items-center justify-center">
                                <Coins className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text">Vidlecta</span>
                        </Link>
                        <button
                            className="lg:hidden p-1"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stats Card (Replaced Balance) */}
                    <div className="p-4">
                        <div className="p-4 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-xl text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-3 opacity-90">
                                <Coins className="w-4 h-4" />
                                <span className="text-sm font-medium">Ваша статистика</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-white/70">Всего потрачено</p>
                                    <p className="text-xl font-bold">
                                        {(user?.totalSpent || 0).toLocaleString('ru-RU')} ₽
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                                    <ShoppingCart className="w-4 h-4 text-white/80" />
                                    <span className="text-sm">
                                        Заказов: {(user?.completedOrders || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors
                    ${isActive
                                            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                            : 'text-[var(--foreground-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                                        }
                  `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                        {/* Admin Link if role is ADMIN */}
                        {user?.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-[var(--warning)] hover:bg-[var(--warning)]/10"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Coins size={20} />
                                <span className="font-medium">Админ-панель</span>
                            </Link>
                        )}
                        {user?.role === 'EXECUTOR' && (
                            <Link
                                href="/dashboard/executor"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-[var(--primary)] hover:bg-[var(--primary)]/10"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Coins size={20} />
                                <span className="font-medium">Панель Исполнителя</span>
                            </Link>
                        )}
                    </nav>

                    {/* User Profile (Mobile Sidebar Footer) */}
                    <div className="p-4 border-t border-[var(--border)] lg:hidden">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)] font-semibold">
                                {userInitial}
                            </div>
                            <div>
                                <p className="font-medium">{user?.firstName}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-[var(--error)] text-sm font-medium w-full p-2 hover:bg-[var(--error)]/5 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Выйти
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-[var(--card-bg)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
                    <button
                        className="lg:hidden p-1 -ml-2"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <NotificationsPopover />

                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 hover:bg-[var(--background)] p-1.5 rounded-lg transition-colors"
                            >
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover border border-[var(--border)]"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {userInitial}
                                    </div>
                                )}
                                <ChevronDown size={16} className={`text-[var(--foreground-muted)] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-lg z-50 animate-fadeIn">
                                        <div className="p-3 border-b border-[var(--border)]">
                                            <p className="font-medium">{user?.firstName}</p>
                                            <p className="text-xs text-[var(--foreground-muted)] truncate">{user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background)] rounded-lg" onClick={() => setUserMenuOpen(false)}>
                                                <Settings size={16} />
                                                Настройки
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/5 rounded-lg w-full text-left"
                                            >
                                                <LogOut size={16} />
                                                Выйти
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
