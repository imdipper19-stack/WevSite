
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { TonClient, WalletContractV4, internal, external, beginCell, storeMessage } = require("ton");
const { mnemonicToWalletKey, sign } = require("ton-crypto");

// Node 18+ has native fetch
const myFetch = globalThis.fetch;

// =================CONFIG=================
const USERNAME = '@BAG1BAG1';
const QUANTITY = 50;
const FRAGMENT_HASH = '390bc6dad2e1e75434';
const FRAGMENT_COOKIE = 'stel_ssid=30d08c4d6c7bfb8cc4_15772389599455901386; stel_dt=-180; stel_token=d1a6a1e783c54d2bb92a60617de2ab30d1a6a1fdd1a6aac787b6e50370dad016e1768; stel_ton_token=TzivBNbGKAGbwXtaaRdNy8_5M643D6o_d0UbXjVQs25ghazRAlBzC3mIMeBRSjVKOt6oL3BVKfk3txry57Df4lFOrlGXsK2HNXRoJTbgGQe6kWogjCZ3cxGB9aUJVGotleTSW9KhC4lJ-4w_gXu6-hnOA362ajKI7dJPjsk94zcwUoYxTmnby_zjZX1-9CvlZRPtDKyK';
const MNEMONIC = 'sniff unable punch put thumb distance history wheat shallow lizard trip infant mistake surge ripple goddess update resemble improve enter arrive mad bacon dust';
const TON_API_KEY = "AGAI6AUZN5C7RPQAAAAOSX3E3HQ4ZAJV635FYAV4KBS4QDWZCBXWX6D4RDGY52QPXHLGWZQ";
// ========================================

const FRAGMENT_URL = 'https://fragment.com/api';
const FRAGMENT_STARS_ADDRESS = 'UQCFJEP4WZ_mpdo0_kMEmsTgvrMHG7K_tWY16pQhKHwoOtFz';

const cleanUsername = (u) => u.replace(/^@/, '');

const getHeaders = (cookie) => ({
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": cookie,
    "Host": "fragment.com",
    "Origin": "https://fragment.com",
    "Referer": "https://fragment.com/stars/buy",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
});

async function main() {
    console.log(`Starting Manual Delivery: ${QUANTITY} stars to ${USERNAME}`);

    try {
        // 1. Search Recipient
        console.log('1. Searching recipient...');
        const query = cleanUsername(USERNAME);
        const searchParams = new URLSearchParams({
            hash: FRAGMENT_HASH,
            query: query,
            method: 'searchStarsRecipient',
            quantity: '50',
        });

        const searchRes = await myFetch(`${FRAGMENT_URL}?hash=${FRAGMENT_HASH}`, {
            method: 'POST',
            headers: getHeaders(FRAGMENT_COOKIE),
            body: searchParams
        });

        if (!searchRes.ok) throw new Error(`Search HTTP ${searchRes.status}`);
        const searchData = await searchRes.json();

        if (!searchData.ok || !searchData.found?.recipient) {
            console.error('Search Response:', JSON.stringify(searchData, null, 2));
            throw new Error('Recipient not found');
        }
        const recipient = searchData.found.recipient;
        console.log(`   Found Recipient: ${recipient}`);

        // 2. Init Buy
        console.log('2. Init Buy Request...');
        const initParams = new URLSearchParams({
            hash: FRAGMENT_HASH,
            recipient: recipient,
            quantity: QUANTITY.toString(),
            method: 'initBuyStarsRequest',
        });

        const initRes = await myFetch(`${FRAGMENT_URL}?hash=${FRAGMENT_HASH}`, {
            method: 'POST',
            headers: getHeaders(FRAGMENT_COOKIE),
            body: initParams
        });
        const initData = await initRes.json();

        if (!initData.req_id) {
            console.error('Init Response:', JSON.stringify(initData, null, 2));
            throw new Error('Failed to init buy request');
        }
        const reqId = initData.req_id;
        const amountTon = Number(initData.amount);
        console.log(`   ReqID: ${reqId}, Amount: ${amountTon} TON`);

        // 3. Get Ref ID
        console.log('3. Getting Payment Ref ID...');
        const refParams = new URLSearchParams({
            hash: FRAGMENT_HASH,
            req_id: reqId,
            method: 'getBuyStarsLink',
            // Default params from script
            transaction: "1",
            show_sender: '0',
            id: reqId
        });

        const refRes = await myFetch(`${FRAGMENT_URL}?hash=${FRAGMENT_HASH}`, {
            method: 'POST',
            headers: getHeaders(FRAGMENT_COOKIE),
            body: refParams
        });
        const refData = await refRes.json();

        if (!refData.ok) {
            console.error('Ref Response:', JSON.stringify(refData, null, 2));
            throw new Error('Failed to get ref data');
        }

        // Extract Payload
        const messages = refData.transaction?.messages || [];
        if (messages.length === 0) throw new Error('No messages in payment data');

        const payloadBase64 = messages[0].payload;
        const decoded = Buffer.from(payloadBase64, 'base64').toString('latin1');
        const match = decoded.match(/Ref#(\S+)/);
        let refId = '';
        if (match && match[1]) {
            refId = match[1];
        } else {
            const split = decoded.split("Ref#");
            if (split.length > 1) refId = split[split.length - 1].trim();
        }

        if (!refId) throw new Error('Could not extract Ref# from payload');
        console.log(`   Ref ID: ${refId}`);

        // 4. Send TON
        console.log('4. Sending TON...');
        const keyPair = await mnemonicToWalletKey(MNEMONIC.split(' '));
        const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
        const walletAddress = wallet.address;
        console.log(`   Wallet: ${walletAddress.toString()}`);

        const comment = `${QUANTITY} Telegram Stars \n\nRef#${refId}`;

        // Get Account Status
        const accountRes = await myFetch(`https://tonapi.io/v2/accounts/${walletAddress.toString()}`, {
            headers: { 'Authorization': `Bearer ${TON_API_KEY}` }
        });
        const accountData = await accountRes.json();
        const status = accountData.status || 'unknown';
        console.log(`   Account Status: ${status}`);

        // Get Seqno
        const seqnoRes = await myFetch(`https://tonapi.io/v2/blockchain/accounts/${walletAddress.toString()}/methods/seqno`, {
            headers: { 'Authorization': `Bearer ${TON_API_KEY}` }
        });
        let seqno = 0;
        if (seqnoRes.ok) {
            const d = await seqnoRes.json();
            if (d.decoded && d.decoded.seqno !== undefined) seqno = Number(d.decoded.seqno);
            else if (d.stack && d.stack.length > 0) seqno = Number(d.stack[0].value || d.stack[0][1]);
        }
        console.log(`   Seqno: ${seqno}`);

        // Build Msg
        const internalMsg = internal({
            to: FRAGMENT_STARS_ADDRESS,
            value: amountTon.toString(),
            body: comment,
            bounce: false,
        });

        const walletId = 698983191;
        const validUntil = Math.floor(Date.now() / 1000) + 600;

        const msgCell = beginCell().store(storeMessage(internalMsg)).endCell();

        const signingMessage = beginCell()
            .storeUint(walletId, 32)
            .storeUint(validUntil, 32)
            .storeUint(seqno, 32)
            .storeUint(0, 8)
            .storeUint(3, 8)
            .storeRef(msgCell)
            .endCell();

        const signature = sign(signingMessage.hash(), keyPair.secretKey);

        const body = beginCell()
            .storeBuffer(signature)
            .storeSlice(signingMessage.beginParse())
            .endCell();

        const shouldInit = status === 'uninit';
        const extMsg = external({
            to: walletAddress,
            init: shouldInit ? wallet.init : undefined,
            body: body
        });

        const finalBoc = beginCell().store(storeMessage(extMsg)).endCell().toBoc().toString('base64');

        // Broadcast
        console.log('   Broadcasting...');
        const broadcastRes = await myFetch('https://tonapi.io/v2/blockchain/message', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TON_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ boc: finalBoc })
        });

        if (!broadcastRes.ok) {
            const t = await broadcastRes.text();
            throw new Error(`Broadcast failed: ${t}`);
        }

        console.log('SUCCESS! Transaction sent.');

    } catch (e) {
        console.error('ERROR:', e);
    }
}

main();
