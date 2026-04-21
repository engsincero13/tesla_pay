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

async function check() {
    try {
        console.log('🔍 Checking financial_balances (Snapshot)...');
        const balances = await pool.query('SELECT * FROM financial_balances');
        console.table(balances.rows);

        console.log('🔍 Checking financial_history (Latest 5)...');
        const history = await pool.query('SELECT * FROM financial_history ORDER BY changed_at DESC LIMIT 5');
        console.table(history.rows);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

check();
