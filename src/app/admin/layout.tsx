'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Coins,
    LayoutDashboard,
    Users,
    ShoppingCart,
    DollarSign,
    FileText,
    Settings,
    Bell,
    Search,
    Menu,
    MessageSquare,
    X,
    ChevronDown,
    CheckSquare,
    Star,
    LogOut
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: 'Дашборд', href: '/admin', icon: LayoutDashboard },
    { name: 'Пользователи', href: '/admin/users', icon: Users },
    { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Отзывы', href: '/admin/reviews', icon: Star },
    { name: 'Финансы', href: '/admin/finance', icon: DollarSign },
    { name: 'Контент', href: '/admin/content', icon: FileText },
    { name: 'Поддержка', href: '/admin/support', icon: MessageSquare },
    { name: 'Настройки', href: '/admin/settings', icon: Settings },
    { name: 'Уведомления', href: '/admin/notifications', icon: Bell },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Sidebar Overlay */}
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
          w-64 bg-[#1A1A2E] text-white
          transform transition-transform duration-300 lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-lg flex items-center justify-center">
                                <Coins className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold">Vidlecta</span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-[var(--accent)] rounded font-medium">
                                ADMIN
                            </span>
                        </Link>
                        <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors
                    ${isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }
                  `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <LayoutDashboard size={20} />
                            <span>Личный кабинет</span>
                        </Link>
                        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <LogOut size={20} />
                            <span>На главную</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="h-16 bg-[var(--card-bg)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>

                        {/* Search */}
                        <div className="hidden sm:block relative">
                            <input
                                type="text"
                                placeholder="Поиск..."
                                className="w-64 px-4 py-2 pl-10 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 hover:bg-[var(--border)] rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error)] rounded-full" />
                        </button>
                        <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                A
                            </div>
                            <span className="hidden sm:block font-medium">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
