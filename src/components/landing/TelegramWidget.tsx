'use client';

import { Send } from 'lucide-react';

interface TelegramWidgetProps {
    href?: string;
}

export function TelegramWidget({ href = 'https://t.me/BAG1BAG1' }: TelegramWidgetProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group pointer-events-auto"
            title="Чат с поддержкой"
        >
            <span className="absolute inset-0 rounded-full bg-[#0088cc] animate-ping opacity-75 group-hover:opacity-100 duration-1000"></span>
            <div className="relative w-14 h-14 bg-[#0088cc] rounded-full shadow-lg shadow-[#0088cc]/30 flex items-center justify-center text-white transform transition-transform group-hover:scale-110 group-hover:-translate-y-1">
                <Send size={24} className="-ml-1 mt-0.5" />
            </div>
            {/* Tooltip Label */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-black px-3 py-1.5 rounded-lg shadow-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Написать в поддержку
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-white"></div>
            </div>
        </a>
    );
}
