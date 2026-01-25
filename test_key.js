
const fetch = require('node-fetch');

const API_KEY = 'AGAI6AUZN5C7RPQAAAAOSX3E3HQ4ZAJV635FYAV4KBS4QDWZCBXWX6D4RDGY52QPXHLGWZQ';
const ENDPOINT = 'https://toncenter.com/api/v2/jsonRPC';

async function test() {
    console.log('Testing Key:', API_KEY);

    // Test with Header
    try {
        console.log('\n--- Testing via Header X-API-Key ---');
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({
                id: '1',
                jsonrpc: '2.0',
                method: 'getConsensusBlock',
                params: {}
            })
        });

        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Success!', data);
        } else {
            console.log('Text:', await res.text());
        }
    } catch (e) {
        console.error('Header Error:', e.message);
    }

    // Test with Query Param
    try {
        console.log('\n--- Testing via Query Param api_key ---');
        const res = await fetch(`${ENDPOINT}?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: '1',
                jsonrpc: '2.0',
                method: 'getConsensusBlock',
                params: {}
            })
        });
        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Success!', data);
        } else {
            console.log('Text:', await res.text());
        }
    } catch (e) {
        console.error('Query Error:', e.message);
    }
}

test();
