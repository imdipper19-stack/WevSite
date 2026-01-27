const https = require('https');

const merchantId = '3a5396ab-8494-4234-b07e-bc7eeeab2bfe';
const apiKey = 'sLJIJxksSAdWuP3CoJOdGWTTGCnjaranDzDb7B9OMHJ89qbB2Td4vQIdTcFF9SnHNVDYD7nFkLCsOjgF2wVxYVjadwAnR1KxjtSc';

const invalidBody = JSON.stringify({
    paymentMethod: 2,
    paymentDetails: {
        amount: 100.50, // Float test
        currency: "RUB"
    },
    description: "Test error reproduction",
    return: "https://google.com",
    failedUrl: "https://google.com",
    payload: JSON.stringify({ orderId: "123" }),
    externalId: "should_fail" // <--- The culprit
});

const validBody = JSON.stringify({
    paymentMethod: 2,
    paymentDetails: {
        amount: 100.50,
        currency: "RUB"
    },
    description: "Test error fix",
    return: "https://google.com",
    failedUrl: "https://google.com",
    payload: JSON.stringify({ orderId: "123" })
    // externalId removed
});

function testRequest(body, label) {
    const options = {
        hostname: 'app.platega.io',
        path: '/transaction/process',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-MerchantId': merchantId,
            'X-Secret': apiKey,
            'Content-Length': Buffer.byteLength(body)
        }
    };

    console.log(`[${label}] Testing with body length: ${body.length}`);

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

testRequest(invalidBody, 'INVALID_BODY');
setTimeout(() => testRequest(validBody, 'VALID_BODY'), 2000);
