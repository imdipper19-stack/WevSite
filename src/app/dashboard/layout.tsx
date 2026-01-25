'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Coins,
    Home,
    ShoppingCart,
    Clock,
    Settings,
    HelpCircle,
    LogOut,

    Menu,
    X,
    ChevronDown,
    User,
    Shield,
    Star,
    Lock
} from 'lucide-react';
import { SupportBot } from '@/components/SupportBot';
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

                    {/* Balance Card */}
                    <div className="p-4">
                        <div className="p-4 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-xl text-white">
                            <p className="text-sm text-white/70 mb-1">Баланс</p>
                            <p className="text-2xl font-bold mb-3">
                                {(user?.balance || 0).toLocaleString('ru-RU')} ₽
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <Coins className="w-4 h-4" />
                                <span>{(user?.coins || 0).toLocaleString('ru-RU')} монет</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2">
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
                                            : 'text-[var(--foreground-muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
                                        }
                  `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}

                        {/* Admin link for ADMIN users */}
                        {user?.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-[var(--warning)] hover:bg-[var(--warning)]/10"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Shield size={20} />
                                <span className="font-medium">Админ-панель</span>
                            </Link>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="p-4 border-t border-[var(--border)]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Выйти</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-[var(--card-bg)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6">
                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 -ml-2"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Search (Desktop) */}
                    <div className="hidden lg:block flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Поиск..."
                                className="w-full px-4 py-2 pl-10 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <NotificationsPopover />

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 p-1.5 hover:bg-[var(--border)] rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {userInitial}
                                </div>
                                <span className="hidden sm:block font-medium">{user?.firstName || 'Пользователь'}</span>
                                <ChevronDown size={16} className="hidden sm:block text-[var(--foreground-muted)]" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-lg z-50 py-2 animate-fadeIn">
                                        <div className="px-4 py-2 border-b border-[var(--border)]">
                                            <p className="font-medium">{user?.firstName || 'Пользователь'}</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">{user?.email}</p>
                                            {user?.role === 'ADMIN' && (
                                                <span className="text-xs text-[var(--warning)] font-medium">Администратор</span>
                                            )}
                                        </div>
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--border)] transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <User size={18} />
                                            <span>Профиль</span>
                                        </Link>
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--border)] transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Settings size={18} />
                                            <span>Настройки</span>
                                        </Link>
                                        {user?.role === 'ADMIN' && (
                                            <Link
                                                href="/admin"
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--border)] transition-colors text-[var(--warning)]"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Shield size={18} />
                                                <span>Админ-панель</span>
                                            </Link>
                                        )}
                                        <div className="border-t border-[var(--border)] mt-2 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2 text-[var(--error)] hover:bg-[var(--error)]/10 w-full transition-colors"
                                            >
                                                <LogOut size={18} />
                                                <span>Выйти</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
            <SupportBot />
        </div>
    );
}
