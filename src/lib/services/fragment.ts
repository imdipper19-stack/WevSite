import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { TonClient, WalletContractV4, internal } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";
import { OrderStatus } from '@prisma/client';

const FRAGMENT_URL = 'https://fragment.com/api';
const FRAGMENT_STARS_ADDRESS = 'UQCFJEP4WZ_mpdo0_kMEmsTgvrMHG7K_tWY16pQhKHwoOtFz';

// Configuration interface
interface FragmentConfig {
    hash: string;
    cookie: string;
}

// Helper to remove @
const cleanUsername = (username: string) => username.replace(/^@/, '');

// Helper to get headers
const getHeaders = (cookie: string) => ({
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "ru",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": cookie,
    "Host": "fragment.com",
    "Origin": "https://fragment.com",
    "Referer": "https://fragment.com/stars/buy",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
});

// Helper to decode base64 payload to string
const decodePayload = (payload: string): string => {
    try {
        const buffer = Buffer.from(payload, 'base64');
        return buffer.toString('utf-8'); // or latin1
    } catch (e) {
        return '';
    }
};

// Exported verification function
export async function verifyTonTransaction(
    walletAddress: string,
    amount: number,
    comment: string
): Promise<boolean> {
    try {
        // Use TONAPI to check for recent transactions
        // For now, we'll verify against the public API
        const tonApiKey = "AGAI6AUZN5C7RPQAAAAOSX3E3HQ4ZAJV635FYAV4KBS4QDWZCBXWX6D4RDGY52QPXHLGWZQ"; // TODO: Move to env

        const res = await fetch(`https://tonapi.io/v2/blockchain/accounts/${walletAddress}/transactions?limit=20`, {
            headers: { 'Authorization': `Bearer ${tonApiKey}` },
            cache: 'no-store'
        });

        if (!res.ok) return false;

        const data = await res.json();
        const transactions = data.transactions || [];

        // Look for incoming transaction with matching comment and amount
        // Note: Amount in TONAPI is in nanoton
        const expectedNano = BigInt(Math.round(amount * 1e9));

        for (const tx of transactions) {
            if (tx.in_msg && tx.in_msg.value) {
                // Check comment
                let msgComment = '';
                if (tx.in_msg.decoded_body && tx.in_msg.decoded_body.text) {
                    msgComment = tx.in_msg.decoded_body.text;
                }

                // Compare (allow small dust difference?) No, exact match for now.
                // Also check timestamp (should be recent, e.g. < 15 mins)
                const txTime = tx.utime;
                const now = Math.floor(Date.now() / 1000);

                if (now - txTime > 900) continue; // Too old

                if (msgComment === comment && BigInt(tx.in_msg.value) >= expectedNano) {
                    return true;
                }
            }
        }

        return false;
    } catch (e) {
        console.error('Verify TON error:', e);
        return false;
    }
}

export class FragmentService {

    // 1. Search Recipient
    async searchRecipient(username: string, config: FragmentConfig): Promise<string | null> {
        const query = cleanUsername(username);
        const params = new URLSearchParams({
            hash: config.hash,
            query: query,
            method: 'searchStarsRecipient', // Matches python script
            quantity: '50', // Dummy quantity for search? Python uses actual quantity.
        });

        const res = await fetch(`${FRAGMENT_URL}?hash=${config.hash}`, {
            method: 'POST',
            headers: getHeaders(config.cookie),
            body: params
        });
        console.log(`[${new Date().toISOString()}] Search fetch status: ${res.status}`);

        if (!res.ok) {
            console.error(`Fragment Search Error ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (!data.ok || !data.found?.recipient) return null;

        return data.found.recipient;
    }

    // 2. Init Buy Request
    async initBuyRequest(recipient: string, quantity: number, config: FragmentConfig): Promise<{ req_id: string, amount: number } | null> {
        const params = new URLSearchParams({
            hash: config.hash,
            recipient: recipient,
            quantity: quantity.toString(),
            method: 'initBuyStarsRequest', // stars_delivery.py line 208
        });

        const res = await fetch(`${FRAGMENT_URL}?hash=${config.hash}`, {
            method: 'POST',
            headers: getHeaders(config.cookie),
            body: params
        });

        const data = await res.json();
        console.log(`[${new Date().toISOString()}] Init response: ${JSON.stringify(data)}`);

        // Fragment API doesn't always return ok:true on success for this method
        if (!data.req_id) return null;

        return { req_id: data.req_id, amount: Number(data.amount) };
    }

    // 3. Get Buy details (Ref ID)
    async getBuyDetails(req_id: string, config: FragmentConfig): Promise<{ refId: string } | null> {
        const params = new URLSearchParams({
            hash: config.hash,
            req_id: req_id,
            method: 'getBuyStarsLink',
            account: '{"address":"0:adc5b49f73e4796ecc3c290ad0d89f87fa552b515d173d5295469df9612c24a","chain":"-239","walletStateInit":"te6ccgECFgEAAwQAAgE0AQIBFP8A9KQT9LzyyAsDAFEAAAAAKamjF5hE%2BFriD8Ufe710n9USsAZBzBxLOlXNYCYDiPBRvJZXQAIBIAQFAgFIBgcE%2BPKDCNcYINMf0x%2FT%2F%2FQE0VFDuvKhUVG68qIF%2BQFUEGT5EPKj%2BAAkpMjLH1JAyx9SMMv%2FUhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC%2BwDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy%2F8SExQVAubQAdDTAyFxsJJfBOAi10nBIJJfBOAC0x8hghBwbHVnvSKCEGRzdHK9sJJfBeAD%2BkAwIPpEAcjKB8v%2FydDtRNCBAUDXIfQEMFyBAQj0Cm%2BhMbOSXwfgBdM%2FyCWCEHBsdWe6kjgw4w0DghBkc3RyupJfBuMNCAkCASAKCwB4AfoA9AQw%2BCdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY%2BgIZ9ADLaRfLH1Jgyz8gyYBA%2BwAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz%2FJgED7AJJfA%2BICASAMDQBZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f%2BYN4EoAbeBAUiYcVnzGEAgFYDg8AEbjJftRNDXCx%2BAA9sp37UTQgQFA1yH0BDACyMoHy%2F%2FJ0AGBAQj0Cm%2BhMYAIBIBARABmtznaiaEAga5Drhf%2FAABmvHfaiaEAQa5DrhY%2FAAG7SB%2FoA1NQi%2BQAFyMoHFcv%2FydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z%2FIVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCE8tqEssfyz%2FJc%2FsAAAr0AMntVA%3D%3D"}',
            device: '{"platform":"android","appName":"Tonkeeper","appVersion":"5.0.18","maxProtocolVersion":2,"features":["SendTransaction",{"name":"SendTransaction","maxMessages":4}]}',
            transaction: "1",
            show_sender: '0',
            id: req_id
        });

        const res = await fetch(`${FRAGMENT_URL}?hash=${config.hash}`, {
            method: 'POST',
            headers: getHeaders(config.cookie),
            body: params
        });

        const data = await res.json();
        if (!data.ok) return null;

        // Extract Payload
        const messages = data.transaction?.messages || [];
        if (messages.length === 0) return null;

        const payload = messages[0].payload; // Base64
        if (!payload) return null;

        const decoded = Buffer.from(payload, 'base64').toString('latin1');

        const match = decoded.match(/Ref#(\S+)/);
        if (match && match[1]) {
            return { refId: match[1] };
        }

        // Sometimes Ref# might be at end without space
        const split = decoded.split("Ref#");
        if (split.length > 1) {
            return { refId: split[split.length - 1].trim() };
        }

        return null;
    }

    // Mutex for sequential delivery
    private deliveryMutex = Promise.resolve();

    // Main Delivery Function
    async deliverStars(orderId: string, username: string, quantity: number): Promise<{ success: boolean, txHash?: string, error?: string }> {
        // Queue this request
        return new Promise((resolve) => {
            this.deliveryMutex = this.deliveryMutex.then(async () => {
                try {
                    const result = await this.processDelivery(orderId, username, quantity);
                    resolve(result);
                } catch (e: any) {
                    resolve({ success: false, error: e.message });
                }
            });
        });
    }

    // Internal worker function
    private async processDelivery(orderId: string, username: string, quantity: number): Promise<{ success: boolean, txHash?: string, error?: string }> {
        const { WalletContractV4, internal, external, beginCell, storeMessage, storeStateInit, Cell } = require("ton");
        const { mnemonicToWalletKey, sign } = require("ton-crypto");

        try {
            console.log(`Starting delivery for Order ${orderId} (${quantity} stars to ${username})`);
            // require('fs').appendFileSync('debug.log', ...); // Kept clean

            // Get Settings
            const settings = await getSettings();

            // API Key
            const tonApiKey = "AGAI6AUZN5C7RPQAAAAOSX3E3HQ4ZAJV635FYAV4KBS4QDWZCBXWX6D4RDGY52QPXHLGWZQ";

            if (!settings.fragmentHash || !settings.fragmentCookie) {
                return { success: false, error: 'Fragment API not configured' };
            }

            const config: FragmentConfig = {
                hash: settings.fragmentHash,
                cookie: settings.fragmentCookie,
            };

            // 1. Search (Mock or Real)
            const recipient = await this.searchRecipient(username, config);
            if (!recipient) {
                return { success: false, error: 'Recipient not found' };
            }

            // 2. Init
            const reqData = await this.initBuyRequest(recipient, quantity, config);
            if (!reqData) {
                return { success: false, error: 'Failed to init buy request' };
            }

            // 3. Get Ref ID
            const details = await this.getBuyDetails(reqData.req_id, config);
            if (!details) {
                return { success: false, error: 'Failed to get Ref details' };
            }

            const refId = details.refId;
            const amountTon = reqData.amount;
            const comment = `${quantity} Telegram Stars \n\nRef#${refId}`;

            console.log(`Prepared Transaction: Amount=${amountTon} TON, Comment=${comment}`);


            // 4. Send TON (Manual Construction)
            if (!settings.tonWalletMnemonic) {
                return { success: false, error: 'System wallet mnemonic missing' };
            }

            const keyPair = await mnemonicToWalletKey(settings.tonWalletMnemonic.split(' '));
            const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
            const walletAddress = wallet.address;

            // Get Status first to determine if we need to deploy
            const accountRes = await fetch(`https://tonapi.io/v2/accounts/${walletAddress.toString()}`, {
                headers: { 'Authorization': `Bearer ${tonApiKey}` },
                cache: 'no-store'
            });
            const accountData: any = await accountRes.json();
            const status = accountData.status;

            // Fetch TRUE Seqno via Get Method (bypasses some indexer caching)
            let seqno = 0;
            if (status === 'active') {
                try {
                    const seqnoRes = await fetch(`https://tonapi.io/v2/blockchain/accounts/${walletAddress.toString()}/methods/seqno`, {
                        headers: { 'Authorization': `Bearer ${tonApiKey}` },
                        cache: 'no-store'
                    });

                    if (seqnoRes.ok) {
                        const seqnoData: any = await seqnoRes.json();

                        if (seqnoData.decoded && seqnoData.decoded.seqno !== undefined) {
                            seqno = Number(seqnoData.decoded.seqno);
                        } else if (seqnoData.decoded && seqnoData.decoded.state !== undefined) {
                            // Sometimes it returns 'state' instead of 'seqno'
                            seqno = Number(seqnoData.decoded.state);
                        } else if (seqnoData.stack && seqnoData.stack.length > 0) {
                            // Handle various stack formats (sometimes [type, value], sometimes objects with num)
                            const item = seqnoData.stack[0];
                            if (item && item.value) seqno = Number(item.value);
                            else if (item && item.num) seqno = Number(item.num); // Fix for TonAPI v2
                            else if (Array.isArray(item) && item[1]) seqno = parseInt(item[1], 16) || Number(item[1]);
                            else seqno = 0;
                        }
                    } else {
                        seqno = accountData.seqno || 0;
                    }
                } catch (e: any) {
                    console.error('Failed to fetching seqno', e);
                    seqno = accountData.seqno || 0;
                }
            } else {
                seqno = 0;
            }

            // Final safety check
            if (isNaN(seqno)) seqno = accountData.seqno || 0;

            console.log(`[DEBUG] Wallet Status: ${status}, Fetched Seqno: ${seqno}`);


            // --- MANUAL BUILDER START ---

            // 1. Create Internal Message to Fragment
            const internalMsg = internal({
                to: FRAGMENT_STARS_ADDRESS,
                value: amountTon.toString(),
                body: comment,
                bounce: false,
            });

            // 2. Build Signing Message
            const walletId = 698983191 + 0; // Default subwallet_id + workchain 0
            const validUntil = Math.floor(Date.now() / 1000) + 600; // 10 min ttl

            const msgCell = beginCell().store(storeMessage(internalMsg)).endCell();

            const signingMessage = beginCell()
                .storeUint(walletId, 32)
                .storeUint(validUntil, 32)
                .storeUint(seqno, 32)
                .storeUint(0, 8) // op = 0
                .storeUint(3, 8) // send_mode = 3 (ignore errors, pay fees separately)
                .storeRef(msgCell)
                .endCell();

            // 3. Sign
            const signature = sign(signingMessage.hash(), keyPair.secretKey);

            // 4. Build Body
            const body = beginCell()
                .storeBuffer(signature)
                .storeSlice(signingMessage.beginParse())
                .endCell();

            // 5. Build External Message
            const shouldInit = status === 'uninit';

            const extMsg = external({
                to: walletAddress,
                init: shouldInit ? wallet.init : undefined, // Attach Init ONLY if seqno is 0
                body: body
            });

            // Serialize
            const finalBuilder = beginCell().store(storeMessage(extMsg));
            const finalBoc = finalBuilder.endCell().toBoc().toString('base64');


            // Broadcast via TONAPI
            const broadcastRes = await fetch('https://tonapi.io/v2/blockchain/message', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tonApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ boc: finalBoc }),
                cache: 'no-store'
            });

            if (!broadcastRes.ok) {
                const errText = await broadcastRes.text();
                return { success: false, error: `Broadcast failed: ${errText}` };
            }

            console.log('Transaction broadcasted successfully!');

            // Update Order as Completed
            try {
                await db.order.update({
                    where: { id: orderId },
                    data: {
                        status: OrderStatus.COMPLETED,
                        completedAt: new Date(),
                        // executorId is a relation to User table, cannot put wallet address string here.
                    }
                });
                console.log(`Order ${orderId} marked as COMPLETED.`);
            } catch (dbError: any) {
                console.error(`FAILED to update order ${orderId} status:`, dbError);
                // We still returned success true because money was sent.
                // Log heavily.
                console.error(`[${new Date().toISOString()}] CRITICAL: Failed to update DB for order ${orderId}: ${dbError.message}`);
            }

            return { success: true, txHash: 'broadcasted' };

        } catch (error: any) {
            console.error('Stars Delivery Error:', error);
            console.error(`[${new Date().toISOString()}] Stars Delivery Error for order ${orderId}: ${error.message}`);

            // If an error occurs during processing, mark the order as PROCESSING
            // so it can be retried or manually reviewed.
            try {
                await db.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.PROCESSING }
                });
                console.log(`Order ${orderId} marked as PROCESSING due to error.`);
            } catch (dbError: any) {
                console.error(`FAILED to update order ${orderId} status to PROCESSING after error:`, dbError);
                console.error(`[${new Date().toISOString()}] CRITICAL: Failed to update DB for order ${orderId} to PROCESSING: ${dbError.message}`);
            }
            return { success: false, error: error.message };
        }
    }
}

export const fragmentService = new FragmentService();
