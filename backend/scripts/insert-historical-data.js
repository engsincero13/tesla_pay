require('dotenv').config(); // Load from current dir (backend/.env)
const { Pool } = require('pg');

// Handle connection string like in server.js
let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({
    connectionString,
    // ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const historicalData = [
    { date: '2026-01-23', operational: 63336.40, reserve: 118500.00 },
    { date: '2026-01-24', operational: 72619.38, reserve: 118500.00 },
    { date: '2026-01-25', operational: 76685.70, reserve: 118500.00 },
    { date: '2026-01-26', operational: 77573.68, reserve: 118500.00 },
    { date: '2026-01-27', operational: 67999.43, reserve: 118500.00 },
    { date: '2026-01-28', operational: 69769.27, reserve: 118500.00 },
    { date: '2026-01-29', operational: 131251.65, reserve: 118500.00 },
];

async function run() {
    try {
        console.log('🔌 Connecting to database...');

        // 1. Get the main balance ID (Singleton)
        const res = await pool.query('SELECT id FROM financial_balances ORDER BY id ASC LIMIT 1');

        // 2. Insert/Update History
        // Schema mismatch workaround: financial_history.balance_id is int, but we have a UUID.
        // We will insert NULL for balance_id since the chart query doesn't usage it.

        console.log('🧹 Cleaning up existing records for target dates...');
        for (const data of historicalData) {
            await pool.query(`
                DELETE FROM financial_history 
                WHERE DATE(changed_at) = $1
            `, [data.date]);
        }

        console.log('➕ Inserting new historical records...');
        for (const data of historicalData) {
            console.log(`   -> ${data.date}`);
            // Set time to end of day (23:59:59) so it captures the "closing" balance concept better? 
            // Or noon? User didn't specify. Noon is safer vs timezone shifts.
            const timestamp = `${data.date} 12:00:00`;

            await pool.query(`
                INSERT INTO financial_history 
                (balance_id, operational_balance, reserve_balance, changed_at, change_type)
                VALUES (NULL, $1, $2, $3, 'MANUAL_HISTORY_INSERT')
            `, [data.operational, data.reserve, timestamp]);
        }

        console.log('🎉 Done processing historical data.');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

run();
