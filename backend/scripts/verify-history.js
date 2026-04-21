require('dotenv').config();
const { Pool } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    try {
        console.log('🔍 Verifying inserted data...');
        const res = await pool.query(`
            SELECT changed_at::date as date, operational_balance, reserve_balance 
            FROM financial_history 
            WHERE changed_at >= '2026-01-23'
            ORDER BY changed_at ASC
        `);

        console.table(res.rows);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

verify();
