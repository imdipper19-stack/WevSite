import crypto from 'crypto';

const API_URL = process.env.PLATEGA_API_URL || 'https://app.platega.io'; // Removed /api
const MERCHANT_ID = process.env.PLATEGA_MERCHANT_ID;
const API_KEY = process.env.PLATEGA_API_KEY;
const SECRET_KEY = process.env.PLATEGA_SECRET_KEY; // Only for callback verification if distinct

if (!MERCHANT_ID || !API_KEY) {
    console.warn('Platega credentials (MERCHANT_ID or API_KEY) are missing in environment variables.');
}

export interface CreatePaymentParams {
    amount: number;
    description: string;
    orderId: string;
    currency?: string;
    paymentMethod?: number; // 2 = SBP (QR)
    successUrl?: string; // return
    failUrl?: string;
    email?: string; // for receipt?
}

export interface CreatePaymentResponse {
    paymentMethod: string;
    transactionId: string;
    redirect: string;
    status: string;
    expiresIn?: string;
    qr?: string; // base64
    merchantId?: string;
    paymentDetails?: string | object;
}

export interface CallbackPayload {
    id: string; // transaction ID
    amount: number;
    currency: string;
    status: 'CONFIRMED' | 'CANCELED' | 'CHARGEBACK' | string;
    paymentMethod: number;
    externalId?: string;
    description?: string;
    [key: string]: any;
}

export class PlategaClient {
    private static getHeaders() {
        // Corrected based on testing: X-MerchantId (no dash), X-Secret (API Key)
        return {
            'Content-Type': 'application/json',
            'X-MerchantId': MERCHANT_ID || '',
            'X-Secret': API_KEY || '',
        };
    }

    static async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
        const url = `${API_URL}/transaction/process`;

        const body = {
            paymentMethod: params.paymentMethod || 2, // Default to SBP/QR (2)
            paymentDetails: {
                amount: params.amount,
                currency: params.currency || 'RUB',
            },
            description: params.description,
            return: params.successUrl || 'https://google.com', // Placeholder if not provided
            failedUrl: params.failUrl || 'https://google.com',
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`Platega createPayment failed: ${res.status} ${text}`);
            throw new Error(`Platega API error: ${res.status} ${text}`);
        }

        const data = await res.json();
        return data as CreatePaymentResponse;
    }

    static verifyCallback(payload: any, secretHeader: string): boolean {
        if (!SECRET_KEY) {
            // User said secret is not needed, so we might skip verification or
            // if we don't have it, we just return true (insecure but requested)
            // However, docs say X-Secret is sent.
            // Ideally we check if SECRET_KEY is set.
            return true;
        }

        // If secret key IS set, we should check equality. 
        // Docs implied the header IS the secret.
        // "Поставщик отправляет заголовки X-MerchantId и X-Secret"
        // Usually this means X-Secret == OUR_SECRET_KEY
        return secretHeader === SECRET_KEY;
    }
}
