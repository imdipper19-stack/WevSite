'use client';

import { useState, useEffect } from 'react';
import {
    Save,
    CreditCard,
    Globe,
    Shield,
    Wallet,
    Loader2
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: string, value: string | number) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                alert('Настройки сохранены');
            } else {
                alert('Ошибка сохранения');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сети');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Настройки системы</h1>
                    <p className="text-[var(--foreground-muted)]">
                        Глобальные параметры платформы
                    </p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
            </div>

            {/* Finance Settings */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                        Финансы и Курсы
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* TON Rate removed as requested */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Цена 1 Звезды (RUB)</label>
                            <Input
                                type="number"
                                value={settings.stars_price_rub || ''}
                                onChange={(e) => handleChange('stars_price_rub', parseFloat(e.target.value))}
                                placeholder="1.5"
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">Стоимость продажи клиенту</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Цена 1 TikTok монеты (RUB)</label>
                            <Input
                                type="number"
                                value={settings.tiktok_coin_price_rub || ''}
                                onChange={(e) => handleChange('tiktok_coin_price_rub', parseFloat(e.target.value))}
                                placeholder="1.5"
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">Стоимость продажи клиенту</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Wallet & Fragment Settings */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-yellow-500" />
                        Настройки Auto-Delivery (Fragment)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Мнемо-фраза (24 слова)</label>
                            <Input
                                type="password"
                                value={settings.ton_wallet_mnemonic || ''}
                                onChange={(e) => handleChange('ton_wallet_mnemonic', e.target.value)}
                                placeholder="word1 word2 ..."
                            />
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">
                                Секретная фраза кошелька для оплаты газа и транзакций TON.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fragment Hash</label>
                                <Input
                                    type="text"
                                    value={settings.fragment_hash || ''}
                                    onChange={(e) => handleChange('fragment_hash', e.target.value)}
                                    placeholder="390bc..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fragment Cookie</label>
                                <Input
                                    type="text"
                                    value={settings.fragment_cookie || ''}
                                    onChange={(e) => handleChange('fragment_cookie', e.target.value)}
                                    placeholder="stel_ssid=..."
                                />
                            </div>
                        </div>
                        <p className="text-xs text-[var(--foreground-muted)]">
                            Эти данные нужны для авторизации на fragment.com и покупки звёзд.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Settings */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[var(--info)]" />
                        Контакты
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email для уведомлений</label>
                            <Input
                                value={settings.admin_notification_email || ''}
                                onChange={(e) => handleChange('admin_notification_email', e.target.value)}
                                placeholder="admin@vidlecta.ru"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
