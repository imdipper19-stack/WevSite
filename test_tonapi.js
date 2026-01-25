
const fetch = require('node-fetch');

const API_KEY = 'AGAI6AUZN5C7RPQAAAAOSX3E3HQ4ZAJV635FYAV4KBS4QDWZCBXWX6D4RDGY52QPXHLGWZQ';
const ENDPOINT = 'https://tonapi.io/v2/blockchain/blocks?limit=1';

async function test() {
    console.log('Testing Key against TONAPI.IO:', API_KEY);

    try {
        const res = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Success! Block ID:', data.blocks[0].block_id);
        } else {
            console.log('Text:', await res.text());
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
