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
    avatarUrl?: string | null;
}

// ... (existing code)

{/* Right Side */ }
<div className="flex items-center gap-3">
    {/* Notifications */}
    <NotificationsPopover />

    {/* User Dropdown */}
    <div className="relative">
        <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-[var(--border)] rounded-lg transition-colors"
        >
            {user?.avatarUrl ? (
                <img
                    src={user.avatarUrl}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover border border-[var(--border)]"
                />
            ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userInitial}
                </div>
            )}
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
                </header >

    {/* Page Content */ }
    < main className = "flex-1 p-4 lg:p-6 overflow-auto" >
        { children }
                </main >
            </div >
    <SupportBot />
        </div >
    );
}
