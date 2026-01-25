'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] pb-20 pt-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <Link href="/" className="inline-block mb-8">
                    <Button variant="ghost" leftIcon={<ArrowLeft size={18} />}>
                        Вернуться на главную
                    </Button>
                </Link>

                <div className="card p-8 sm:p-12 animate-fadeIn">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-8 gradient-text">Политика конфиденциальности</h1>

                    <div className="prose prose-invert max-w-none space-y-8 text-[var(--foreground-muted)]">

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">1. Общие положения</h2>
                            <p className="mb-2">
                                1.1. Настоящая Политика конфиденциальности (далее — «Политика») регулирует порядок обработки и защиты информации, которую Пользователь передаёт при использовании сервиса Vidlecta (далее — «Сервис»).
                            </p>
                            <p>
                                1.2. Используя Сервис, Пользователь подтверждает своё согласие с условиями Политики. Если Пользователь не согласен с условиями — он обязан прекратить использование Сервиса.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">2. Сбор информации</h2>
                            <p className="mb-2">2.1. Сервис может собирать следующие типы данных:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>идентификаторы аккаунта (логин, ID, никнейм и т.п.);</li>
                                <li>техническую информацию (IP-адрес, данные о браузере, устройстве и операционной системе);</li>
                                <li>историю взаимодействий с Сервисом.</li>
                            </ul>
                            <p className="mt-2">
                                2.2. Сервис не требует от Пользователя предоставления паспортных данных, документов, фотографий или другой личной информации, кроме минимально необходимой для работы.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">3. Использование информации</h2>
                            <p className="mb-2">3.1. Сервис может использовать полученную информацию исключительно для:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>обеспечения работы функционала;</li>
                                <li>связи с Пользователем (в том числе для уведомлений и поддержки);</li>
                                <li>анализа и улучшения работы Сервиса.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">4. Передача информации третьим лицам</h2>
                            <p className="mb-2">4.1. Администрация не передаёт полученные данные третьим лицам, за исключением случаев:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>если это требуется по закону;</li>
                                <li>если это необходимо для исполнения обязательств перед Пользователем (например, при работе с платёжными системами);</li>
                                <li>если Пользователь сам дал на это согласие.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">5. Хранение и защита данных</h2>
                            <p className="mb-2">
                                5.1. Данные хранятся в течение срока, необходимого для достижения целей обработки.
                            </p>
                            <p>
                                5.2. Администрация принимает разумные меры для защиты данных, но не гарантирует абсолютную безопасность информации при передаче через интернет.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">6. Отказ от ответственности</h2>
                            <p className="mb-2">
                                6.1. Пользователь понимает и соглашается, что передача информации через интернет всегда сопряжена с рисками.
                            </p>
                            <p>
                                6.2. Администрация не несёт ответственности за утрату, кражу или раскрытие данных, если это произошло по вине третьих лиц или самого Пользователя.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">7. Изменения в Политике</h2>
                            <p className="mb-2">
                                7.1. Администрация вправе изменять условия Политики без предварительного уведомления.
                            </p>
                            <p>
                                7.2. Продолжение использования Сервиса после внесения изменений означает согласие Пользователя с новой редакцией Политики.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
