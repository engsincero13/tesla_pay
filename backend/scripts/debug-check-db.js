require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('🔌 Connecting...');

        // Check current time in DB
        const timeRes = await pool.query('SELECT NOW() as now');
        console.log('DB Time:', timeRes.rows[0].now);

        // Check records
        const query = `
            SELECT id, changed_at, operational_balance, reserve_balance, change_type 
            FROM financial_history 
            ORDER BY changed_at DESC
            LIMIT 20
        `;
        const res = await pool.query(query);

        console.log(`Found ${res.rows.length} records.`);

        const dumpPath = path.join(__dirname, 'db_dump.txt');
        fs.writeFileSync(dumpPath, JSON.stringify(res.rows, null, 2));
        console.log(`Dumped to ${dumpPath}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
