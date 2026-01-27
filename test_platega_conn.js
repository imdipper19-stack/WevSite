const https = require('https');

const merchantId = '3a5396ab-8494-4234-b07e-bc7eeeab2bfe';
const apiKey = 'sLJIJxksSAdWuP3CoJOdGWTTGCnjaranDzDb7B9OMHJ89qbB2Td4vQIdTcFF9SnHNVDYD7nFkLCsOjgF2wVxYVjadwAnR1KxjtSc';

const body = JSON.stringify({
    paymentMethod: 2,
    paymentDetails: {
        amount: 100,
        currency: "RUB"
    },
    description: "Test payment verification 2",
    return: "https://google.com",
    failedUrl: "https://google.com",
    payload: ""
});

function testUrl(path, label) {
    const options = {
        hostname: 'app.platega.io',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-MerchantId': merchantId, // No dash
            'X-Secret': apiKey, // Trying API Key as Secret
            // 'Authorization': `Bearer ${apiKey}`, // Removing Bearer for now to isolate
            'Content-Length': body.length
        }
    };

    console.log(`[${label}] Testing: https://app.platega.io${path} with X-MerchantId and X-Secret`);

    const req = https.request(options, res => {
        console.log(`[${label}] Status: ${res.statusCode}`);
        res.on('data', d => {
            console.log(`[${label}] Body: ${d.toString().substring(0, 200)}...`);
        });
    });

    req.on('error', error => {
        console.error(`[${label}] Error:`, error.message);
    });

    req.write(body);
    req.end();
}

testUrl('/transaction/process', 'CORRECTED_HEADERS');
