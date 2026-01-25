'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
}

export function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                // Calculate unread
                setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
            console.log('Fetch complete. Notifications:', notifications.length);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
        } catch (error) {
            console.error(error);
            fetchNotifications(); // Revert on error
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            });
        } catch (error) {
            console.error(error);
            fetchNotifications();
        }
    };

    useEffect(() => {
        console.log('NotificationsPopover mounted');
    }, []);

    const toggleOpen = () => {
        console.log('Toggling notifications, current state:', isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="relative p-2 hover:bg-[var(--border)] rounded-lg transition-colors text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--error)] rounded-full animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl z-50 animate-fadeIn origin-top-right overflow-hidden">
                    <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                        <h3 className="font-semibold">Уведомления</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                            >
                                <Check size={12} />
                                Прочитать все
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-[var(--foreground-muted)]">
                                Загрузка...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-[var(--foreground-muted)] flex flex-col items-center">
                                <BellOff size={24} className="mb-2 opacity-50" />
                                <p>Нет новых уведомлений</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[var(--border)]">
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className={`p-4 hover:bg-[var(--background)] transition-colors relative group ${!notification.isRead ? 'bg-[var(--primary)]/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm mb-1 ${!notification.isRead ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--foreground)]'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-[var(--foreground-muted)] mb-1">
                                                    {notification.content}
                                                </p>
                                                <p className="text-[10px] text-[var(--foreground-muted)]/70">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ru })}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="w-2 h-2 mt-1.5 rounded-full bg-[var(--primary)] hover:scale-150 transition-transform"
                                                    title="Пометить как прочитанное"
                                                />
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
