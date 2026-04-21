require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({
    connectionString,
});

async function verify() {
    try {
        console.log('🔎 Verifying inserted data...');

        const query = `
            SELECT 
                to_char(changed_at, 'YYYY-MM-DD') as date,
                operational_balance,
                reserve_balance
            FROM financial_history
            WHERE changed_at >= '2026-01-23' AND changed_at <= '2026-01-30'
            ORDER BY changed_at ASC
        `;

        const res = await pool.query(query);
        console.table(res.rows);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

verify();
