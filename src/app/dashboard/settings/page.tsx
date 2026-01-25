'use client';

import { useState, useEffect, useCallback } from 'react';
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
    Check,
    Loader2,
    Camera,
    Copy,
    Upload
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { getCroppedImg } from '@/lib/canvasUtils';

interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    role: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    twoFaEnabled: boolean;
    avatarUrl?: string | null;
}

const tabs = [
    { id: 'profile', name: 'Профиль', icon: User },
    { id: 'security', name: 'Безопасность', icon: Shield },
    { id: 'notifications', name: 'Уведомления', icon: Bell },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Cropper state
    const [showCropper, setShowCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Notification settings
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        orderUpdates: true,
        promotions: false,
    });

    // 2FA State
    const [twoFaSetupStep, setTwoFaSetupStep] = useState<'idle' | 'qr'>('idle');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const start2FASetup = async () => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/auth/2fa/generate', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setQrCode(data.qrCodeUrl);
                setSecret(data.secret);
                setTwoFaSetupStep('qr');
            } else {
                setMessage({ type: 'error', text: 'Ошибка генерации 2FA' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка сети' });
        } finally {
            setIsLoading(false);
        }
    };

    const enable2FA = async () => {
        if (!verificationCode) return;
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/auth/2fa/enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, code: verificationCode })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(prev => prev ? { ...prev, twoFaEnabled: true } : null);
                setTwoFaSetupStep('idle');
                setQrCode('');
                setSecret('');
                setVerificationCode('');
                setMessage({ type: 'success', text: '2FA успешно включена!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Неверный код' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка проверки' });
        } finally {
            setIsLoading(false);
        }
    };

    const disable2FA = async () => {
        if (!confirm('Вы уверены? Ваш аккаунт станет менее защищенным.')) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/2fa/disable', { method: 'POST' });
            if (res.ok) {
                setUser(prev => prev ? { ...prev, twoFaEnabled: false } : null);
                setMessage({ type: 'success', text: '2FA отключена' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/user/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setFirstName(data.user.firstName || '');
                    setLastName(data.user.lastName || '');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsFetching(false);
            }
        }
        fetchUser();
    }, []);

    const handleSaveProfile = async () => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName }),
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setMessage({ type: 'success', text: 'Профиль сохранен!' });
            } else {
                setMessage({ type: 'error', text: 'Ошибка при сохранении' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Ошибка сети' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Пароли не совпадают' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Пароль должен быть минимум 8 символов' });
            return;
        }

        setIsChangingPassword(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Пароль успешно изменен!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.error || 'Ошибка при смене пароля' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Ошибка сети' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Только JPG, PNG, GIF' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Файл слишком большой (макс 5MB)' });
            return;
        }

        // Create object URL for cropper
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setShowCropper(true);

        // Reset input immediately so same file can be selected again
        e.target.value = '';
    };

    const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCroppedAvatar = async () => {
        if (!selectedImage || !croppedAreaPixels) return;

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);

            if (!croppedBlob) {
                setMessage({ type: 'error', text: 'Ошибка обработки изображения' });
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('avatar', croppedBlob, 'avatar.jpg');

            const res = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setUser(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : null);
                setMessage({ type: 'success', text: 'Фото профиля обновлено' });
                setShowCropper(false);
                setSelectedImage(null);
            } else {
                setMessage({ type: 'error', text: data.error || 'Ошибка загрузки' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Ошибка сети' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setSelectedImage(null);
    };

    const userInitial = user?.firstName?.charAt(0).toUpperCase() || 'U';

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            {/* Cropper Modal */}
            {showCropper && selectedImage && (
                <ImageCropper
                    imageSrc={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                    onSave={handleSaveCroppedAvatar}
                    isLoading={isLoading}
                />
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Настройки</h1>
                <p className="text-[var(--foreground-muted)]">Управление аккаунтом и настройками</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--error)]/10 text-[var(--error)]'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card padding="sm">
                        <CardContent>
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
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
                                    <div className="flex items-start gap-6 pb-6 border-b border-[var(--border)]">
                                        <div className="relative">
                                            {user?.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt="Avatar"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-[var(--bg-secondary)] shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 bg-gradient-to-br from-[#6A11CB] to-[#2575FC] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-sm">
                                                    {userInitial}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <h3 className="font-semibold">Фото профиля</h3>
                                                <div className="flex gap-2 flex-wrap">
                                                    <input
                                                        type="file"
                                                        id="avatar-upload"
                                                        className="hidden"
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        onChange={handleAvatarChange}
                                                    />
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        leftIcon={<Upload size={16} />}
                                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                                        isLoading={isLoading}
                                                    >
                                                        Загрузить фото
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-xs text-[var(--foreground-muted)]">
                                                JPG, PNG или GIF. Макс. 5MB.
                                            </p>
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
                                                <p className="font-medium">{user?.email || 'Не указан'}</p>
                                                <p className="text-sm text-[var(--foreground-muted)]">Email</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {user?.isEmailVerified && (
                                                <span className="flex items-center gap-1 text-sm text-[var(--success)]">
                                                    <Check size={14} /> Подтверждён
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Phone size={20} className="text-[var(--foreground-muted)]" />
                                            <div>
                                                <p className="font-medium">{user?.phone || 'Не указан'}</p>
                                                <p className="text-sm text-[var(--foreground-muted)]">Телефон</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {user?.isPhoneVerified && (
                                                <span className="flex items-center gap-1 text-sm text-[var(--success)]">
                                                    <Check size={14} /> Подтверждён
                                                </span>
                                            )}
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
                                    <CardTitle>Сменить пароль</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        type="password"
                                        label="Текущий пароль"
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <Input
                                        type="password"
                                        label="Новый пароль"
                                        placeholder="••••••••"
                                        hint="Минимум 8 символов, буквы и цифры"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <Input
                                        type="password"
                                        label="Подтвердите пароль"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <Button
                                        variant="primary"
                                        onClick={handleChangePassword}
                                        isLoading={isChangingPassword}
                                        disabled={!currentPassword || !newPassword || !confirmPassword}
                                    >
                                        Сменить пароль
                                    </Button>
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
                                                    {user?.twoFaEnabled ? 'Включено' : 'Отключено'}
                                                </p>
                                            </div>
                                        </div>
                                        {!user?.twoFaEnabled && twoFaSetupStep === 'idle' && (
                                            <Button variant="primary" onClick={start2FASetup} isLoading={isLoading}>
                                                Включить
                                            </Button>
                                        )}
                                        {user?.twoFaEnabled && (
                                            <Button variant="danger" onClick={disable2FA} isLoading={isLoading}>
                                                Отключить
                                            </Button>
                                        )}
                                    </div>

                                    {/* Setup Flow */}
                                    {twoFaSetupStep === 'qr' && !user?.twoFaEnabled && (
                                        <div className="mt-6 pt-6 border-t border-[var(--border)] animate-fadeIn">
                                            <h4 className="font-semibold mb-4">Настройка 2FA</h4>
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="bg-white p-4 rounded-xl border border-[var(--border)] w-fit">
                                                    {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />}
                                                </div>
                                                <div className="space-y-4 flex-1">
                                                    <div>
                                                        <p className="text-sm text-[var(--foreground-muted)] mb-2">
                                                            1. Сканируйте QR-код приложением (Google Authenticator)
                                                        </p>
                                                        <p className="text-sm text-[var(--foreground-muted)] mb-2">
                                                            Или введите ключ вручную:
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <code className="bg-[var(--background-secondary)] px-3 py-2 rounded-lg font-mono text-sm border border-[var(--border)]">
                                                                {secret}
                                                            </code>
                                                            <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(secret)}>
                                                                <Copy size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <p className="text-sm text-[var(--foreground-muted)] mb-2">
                                                            2. Введите код подтверждения:
                                                        </p>
                                                        <div className="flex gap-2 max-w-xs">
                                                            <Input
                                                                placeholder="000 000"
                                                                value={verificationCode}
                                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                className="text-center tracking-widest"
                                                            />
                                                            <Button variant="primary" onClick={enable2FA} disabled={!verificationCode || verificationCode.length !== 6 || isLoading} isLoading={isLoading}>
                                                                Подтвердить
                                                            </Button>
                                                        </div>
                                                        <Button variant="ghost" size="sm" onClick={() => setTwoFaSetupStep('idle')} className="mt-2 p-0 h-auto text-[var(--foreground-muted)]">
                                                            Отмена
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                        <Button variant="secondary" leftIcon={<LogOut size={16} />} disabled>
                                            Выйти
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                        <div>
                                            <p className="font-medium">Удалить аккаунт</p>
                                            <p className="text-sm text-[var(--foreground-muted)]">Это действие необратимо</p>
                                        </div>
                                        <Button variant="danger" leftIcon={<Trash2 size={16} />} disabled>
                                            Удалить
                                        </Button>
                                    </div>
                                    <p className="text-xs text-[var(--foreground-muted)]">
                                        Удаление аккаунта в разработке
                                    </p>
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
