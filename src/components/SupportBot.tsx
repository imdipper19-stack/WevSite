'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, ChevronRight } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    options?: { label: string; action: string }[];
}

export function SupportBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Привет! Я виртуальный помощник Vidlecta. Чем могу помочь?',
            sender: 'bot',
            options: [
                { label: 'Как купить звезды?', action: 'buy_stars' },
                { label: 'Не пришли монеты', action: 'missing_coins' },
                { label: 'Связаться с оператором', action: 'contact_human' }
            ]
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOptionClick = async (action: string) => {
        // User selection
        const optionLabel = messages[messages.length - 1].options?.find(o => o.action === action)?.label;
        addMessage(optionLabel || '...', 'user');

        setIsTyping(true);

        // Simulate bot thinking
        setTimeout(() => {
            let responseText = '';
            let options: any[] = [];

            switch (action) {
                case 'buy_stars':
                    responseText = 'Для покупки звезд перейдите в раздел "Telegram Stars", выберите нужное количество и нажмите "Купить". После оплаты звезды придут автоматически.';
                    options = [{ label: 'Понятно, спасибо', action: 'end_chat' }];
                    break;
                case 'missing_coins':
                    responseText = 'Обычно зачисление занимает 5-15 минут. Если времени прошло больше, проверьте статус заказа в разделе "Мои заказы". Если там "Выполнено", а монет нет - создайте тикет.';
                    options = [
                        { label: 'Создать тикет', action: 'create_ticket' },
                        { label: 'Подожду еще', action: 'end_chat' }
                    ];
                    break;
                case 'contact_human':
                    responseText = 'Вы можете создать тикет на этой странице, и наш оператор ответит вам в ближайшее время.';
                    break;
                case 'create_ticket':
                    responseText = 'Форма создания тикета находится прямо на этой странице сверху. Заполните тему и сообщение.';
                    break;
                case 'end_chat':
                    responseText = 'Был рад помочь! Если появятся вопросы - обращайтесь.';
                    break;
                default:
                    responseText = 'Извините, я пока не знаю ответа на этот вопрос.';
            }

            addMessage(responseText, 'bot', options);
            setIsTyping(false);
        }, 1000);
    };

    const addMessage = (text: string, sender: 'bot' | 'user', options?: any[]) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text, sender, options }]);
    };

    useEffect(() => {
        console.log('SupportBot mounted');
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-[var(--primary)] text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Помощник Vidlecta</h3>
                                <p className="text-xs opacity-80">Онлайн</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`
                                    max-w-[85%] rounded-2xl px-4 py-3 text-sm
                                    ${msg.sender === 'user'
                                        ? 'bg-[var(--primary)] text-white rounded-br-none'
                                        : 'bg-[var(--card-bg)] border border-[var(--border)] rounded-bl-none'
                                    }
                                `}>
                                    {msg.text}
                                </div>

                                {msg.options && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {msg.options.map((opt) => (
                                            <button
                                                key={opt.action}
                                                onClick={() => handleOptionClick(opt.action)}
                                                className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1.5 rounded-full hover:bg-[var(--primary)]/20 transition-colors"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-start">
                                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl rounded-bl-none px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
}
