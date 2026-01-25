'use client';

import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Shield,
    Smartphone,
    LogOut,
    Trash2,
    ChevronRight,
    Check
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';

// Mock user data
const mockUser = {
    firstName: 'Александр',
    lastName: 'Петров',
    email: 'alex@example.com',
    phone: '+7 (999) 123-45-67',
    avatar: 'А',
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFaEnabled: false,
};

const tabs = [
    { id: 'profile', name: 'Профиль', icon: User },
    { id: 'security', name: 'Безопасность', icon: Shield },
    { id: 'notifications', name: 'Уведомления', icon: Bell },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Profile form state
    const [firstName, setFirstName] = useState(mockUser.firstName);
    const [lastName, setLastName] = useState(mockUser.lastName);

    // Notification settings
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        orderUpdates: true,
        promotions: false,
    });

    const handleSaveProfile = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Настройки</h1>
                <p className="text-[var(--foreground-muted)]">Управление аккаунтом и настройками</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card padding="sm">
                        <CardContent>
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left
                      ${activeTab === tab.id
                                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                                : 'hover:bg-[var(--border)] text-[var(--foreground-muted)]'
                                            }
                    `}
                                    >
                                        <tab.icon size={18} />
                                        <span className="font-medium">{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Личные данные</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {mockUser.avatar}
                                        </div>
                                        <div>
                                            <Button variant="secondary" size="sm">
                                                Изменить фото
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Имя"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                        <Input
                                            label="Фамилия"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Mail size={20} className="text-[var(--foreground-muted)]" />
                                            <div>
                                                <p className="font-medium">{mockUser.email}</p>
                                                <p className="text-sm text-[var(--foreground-muted)]">Email</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {mockUser.isEmailVerified && (
                                                <span className="flex items-center gap-1 text-sm text-[var(--success)]">
                                                    <Check size={14} /> Подтверждён
                                                </span>
                                            )}
                                            <Button variant="ghost" size="sm">
                                                Изменить
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Phone size={20} className="text-[var(--foreground-muted)]" />
                                            <div>
                                                <p className="font-medium">{mockUser.phone}</p>
                                                <p className="text-sm text-[var(--foreground-muted)]">Телефон</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {mockUser.isPhoneVerified && (
                                                <span className="flex items-center gap-1 text-sm text-[var(--success)]">
                                                    <Check size={14} /> Подтверждён
                                                </span>
                                            )}
                                            <Button variant="ghost" size="sm">
                                                Изменить
                                            </Button>
                                        </div>
                                    </div>

                                    <Button variant="primary" isLoading={isLoading} onClick={handleSaveProfile}>
                                        Сохранить изменения
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Пароль</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input type="password" label="Текущий пароль" placeholder="••••••••" />
                                    <Input type="password" label="Новый пароль" placeholder="••••••••" hint="Минимум 8 символов, буквы и цифры" />
                                    <Input type="password" label="Подтвердите пароль" placeholder="••••••••" />
                                    <Button variant="primary">Сменить пароль</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Двухфакторная аутентификация</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Smartphone size={24} className="text-[var(--foreground-muted)]" />
                                            <div>
                                                <p className="font-medium">Google Authenticator</p>
                                                <p className="text-sm text-[var(--foreground-muted)]">
                                                    {mockUser.twoFaEnabled ? 'Включено' : 'Отключено'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant={mockUser.twoFaEnabled ? "danger" : "primary"}>
                                            {mockUser.twoFaEnabled ? 'Отключить' : 'Включить'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-[var(--error)]/20">
                                <CardHeader>
                                    <CardTitle className="text-[var(--error)]">Опасная зона</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Выйти со всех устройств</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">Завершить все активные сессии</p>
                                        </div>
                                        <Button variant="secondary" leftIcon={<LogOut size={16} />}>
                                            Выйти
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                        <div>
                                            <p className="font-medium">Удалить аккаунт</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">Это действие необратимо</p>
                                        </div>
                                        <Button variant="danger" leftIcon={<Trash2 size={16} />}>
                                            Удалить
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки уведомлений</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: 'email', label: 'Email уведомления', description: 'Получать уведомления на почту' },
                                    { key: 'push', label: 'Push уведомления', description: 'Уведомления в браузере' },
                                    { key: 'orderUpdates', label: 'Обновления заказов', description: 'Статусы и сообщения по заказам' },
                                    { key: 'promotions', label: 'Акции и новости', description: 'Скидки и специальные предложения' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">{item.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications[item.key as keyof typeof notifications]}
                                                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
