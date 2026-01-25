'use client';

import { useEffect, useRef } from 'react';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

interface TelegramLoginButtonProps {
    botName: string;
    onAuth?: (user: TelegramUser) => void;
    authUrl?: string; // New prop for redirect flow
    cornerRadius?: number;
    requestAccess?: boolean;
    usePic?: boolean;
    className?: string;
}

export function TelegramLoginButton({
    botName,
    onAuth,
    authUrl,
    cornerRadius = 10,
    requestAccess = true,
    usePic = true,
    className,
}: TelegramLoginButtonProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        // Clean up previous script if any
        ref.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', 'large');

        if (cornerRadius !== undefined) {
            script.setAttribute('data-radius', cornerRadius.toString());
        }
        if (requestAccess) {
            script.setAttribute('data-request-access', 'write');
        }
        if (!usePic) {
            script.setAttribute('data-userpic', 'false');
        }

        // Use redirect auth if authUrl is present
        if (authUrl) {
            script.setAttribute('data-auth-url', authUrl);
        } else {
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        }

        script.async = true;

        // Define callback only if using JS flow
        if (!authUrl) {
            // @ts-ignore
            window.onTelegramAuth = (user: TelegramUser) => {
                console.log('Telegram Widget Callback fired!', user);
                if (onAuth) onAuth(user);
            };
        }

        ref.current.appendChild(script);

        return () => {
            if (!authUrl) {
                // @ts-ignore
                delete window.onTelegramAuth;
            }
        };
    }, [botName, onAuth, authUrl, cornerRadius, requestAccess, usePic]);

    return <div ref={ref} className={className} />;
}
