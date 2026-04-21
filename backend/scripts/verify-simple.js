require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function verify() {
    try {
        console.log('--- START VERIFICATION ---');

        const q = `
            SELECT id, changed_at, operational_balance, reserve_balance 
            FROM financial_history 
            where changed_at > '2026-01-20'
            ORDER BY changed_at ASC
        `;
        const res = await pool.query(q);

        console.log(`Row Count: ${res.rows.length}`);
        res.rows.forEach(r => {
            console.log(`Row: ${r.changed_at.toISOString().split('T')[0]} | Op: ${r.operational_balance} | Res: ${r.reserve_balance}`);
        });

        console.log('--- END VERIFICATION ---');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

verify();
