require('dotenv').config();
const { Pool } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({
    connectionString,
    // SSL removed as per fix
});

async function check() {
    try {
        console.log('\n--- COLUMN TYPES ---');
        const cols = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('financial_balances', 'financial_history')
            ORDER BY table_name, ordinal_position
        `);
        console.table(cols.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
