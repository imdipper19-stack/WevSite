'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Ban,
    Edit2,
    Eye,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    balance: number;
    ordersCount: number;
    status: string;
    createdAt: string;
    totalSpent: number;
}

const roleLabels: Record<string, { label: string; color: string }> = {
    buyer: { label: 'Покупатель', color: 'bg-blue-500/10 text-blue-500' },
    executor: { label: 'Исполнитель', color: 'bg-purple-500/10 text-purple-500' },
    admin: { label: 'Админ', color: 'bg-red-500/10 text-red-500' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: 'Активен', color: 'bg-[var(--success)]/10 text-[var(--success)]' },
    banned: { label: 'Заблокирован', color: 'bg-[var(--error)]/10 text-[var(--error)]' },
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [roleFilter, setRoleFilter] = useState('all');

    // Edit Modal State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [saving, setSaving] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: searchQuery,
                role: roleFilter
            });
            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotalPages(data.pagination.pages);
                setTotalUsers(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBanUser = async (userId: string, isBanned: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBanned })
            });

            if (res.ok) {
                // Update local state optimizing for speed
                setUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, status: isBanned ? 'banned' : 'active' } : u
                ));
            } else {
                alert('Не удалось изменить статус пользователя');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        if (!confirm(`Изменить роль пользователя на ${newRole}?`)) return;

        try {
            // Optimistic update
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));

            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole.toUpperCase() })
            });

            if (!res.ok) {
                const data = await res.json();
                alert('Ошибка: ' + (data.error || 'Не удалось изменить роль'));
                fetchUsers(); // Revert
            }
        } catch (error) {
            console.error(error);
            fetchUsers();
        }
    };

    const openEditModal = (user: User) => {
        const [first, ...rest] = user.name.split(' ');
        setEditingUser(user);
        setEditForm({
            firstName: first || '',
            lastName: rest.join(' ') || '', // Approximation
            email: user.email || '',
            password: ''
        });
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    email: editForm.email,
                    password: editForm.password || undefined
                })
            });

            if (res.ok) {
                setEditingUser(null);
                fetchUsers();
            } else {
                alert('Ошибка сохранения');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timeout);
    }, [page, searchQuery, roleFilter]);

    const toggleSelectUser = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Пользователи</h1>
                    <p className="text-[var(--foreground-muted)]">Всего: {totalUsers} пользователей</p>
                </div>
            </div>

            {/* Filters */}
            <Card padding="sm">
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                            <input
                                type="text"
                                placeholder="Поиск по имени или email..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none"
                            >
                                <option value="all">Все роли</option>
                                <option value="buyer">Покупатели</option>
                                <option value="executor">Исполнители</option>
                                <option value="admin">Админы</option>
                            </select>

                            {selectedUsers.length > 0 && (
                                <Button
                                    variant="danger"
                                    leftIcon={<Ban size={16} />}
                                    onClick={() => handleBanUser(selectedUsers[0], true)} // Bulk to be implemented
                                >
                                    Блок. ({selectedUsers.length})
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                <th className="text-left p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length && users.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-[var(--border)]"
                                    />
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Пользователь</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Роль</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Баланс</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Всего купил</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Заказов</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--foreground-muted)]">Дата рег.</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--primary)]" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-[var(--foreground-muted)]">
                                        Пользователи не найдены
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                                className="rounded border-[var(--border)]"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium whitespace-nowrap">{user.name}</p>
                                                    <p className="text-sm text-[var(--foreground-muted)]">{user.email || 'Нет email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium border-none focus:outline-none cursor-pointer ${roleLabels[user.role]?.color || 'bg-gray-100'}`}
                                            >
                                                <option value="buyer">Покупатель</option>
                                                <option value="executor">Исполнитель</option>
                                                <option value="admin">Админ</option>
                                            </select>
                                        </td>
                                        <td className="p-4 font-medium">{user.balance.toLocaleString()}₽</td>
                                        <td className="p-4 font-medium text-[var(--primary)]">{user.totalSpent?.toLocaleString() || 0}₽</td>
                                        <td className="p-4">{user.ordersCount}</td>
                                        <td className="p-4 text-[var(--foreground-muted)] whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                                                    <Edit2 size={16} />
                                                </Button>
                                                {user.status === 'banned' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-[var(--success)]"
                                                        onClick={() => handleBanUser(user.id, false)}
                                                        title="Разблокировать"
                                                    >
                                                        <UserCheck size={16} />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-[var(--error)]"
                                                        onClick={() => handleBanUser(user.id, true)}
                                                        title="Заблокировать"
                                                    >
                                                        <UserX size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
                    <p className="text-sm text-[var(--foreground-muted)]">
                        Страница {page} из {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
                    <Card className="w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Редактирование пользователя</h2>
                            <button onClick={() => setEditingUser(null)}><UserX size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Имя</label>
                                    <Input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Фамилия</label>
                                    <Input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Email</label>
                                <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Новый пароль (оставьте пустым чтобы не менять)</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={editForm.password}
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setEditingUser(null)}>Отмена</Button>
                                <Button onClick={handleSaveUser} isLoading={saving}>Сохранить</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
