const http = require('http');

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': 'e8a8b1b2-1111-4444-8888-222222222222' // Assuming a valid user ID or I need to fetch one
            }
        };

        // We need a valid user ID. Let's try to fetch one first or just rely on a known demo ID if any.
        // Actually, the server checks x-user-id. I should get a real one from the DB first.
    });
}
// Rewriting to get user ID first.

const { Pool } = require('pg');
require('dotenv').config();

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function runTests() {
    try {
        // 1. Get a user ID
        const userRes = await pool.query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log('No users found. Cannot test API.');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log('Using User ID:', userId);

        const doReq = (method, path, body) => {
            return new Promise((resolve, reject) => {
                const req = http.request({
                    hostname: 'localhost',
                    port: 3001,
                    path: '/api' + path,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
                });
                req.on('error', reject);
                if (body) req.write(JSON.stringify(body));
                req.end();
            });
        };

        // 2. GET /balances
        const initial = await doReq('GET', '/balances');
        console.log('GET /balances:', initial.body);

        // 3. POST /balances/adjust (Add 100 to operational)
        console.log('Adjusting +100 operational...');
        await doReq('POST', '/balances/adjust', { operationalDelta: 100 });

        // 4. GET /balances again
        const afterAdjust = await doReq('GET', '/balances');
        console.log('GET /balances (After):', afterAdjust.body);

        // 5. Verify mismatch
        if (afterAdjust.body.operational === initial.body.operational + 100) {
            console.log('✅ Adjust worked correctly on history.');
        } else {
            console.error('❌ Adjust failed or logic incorrect.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

runTests();
