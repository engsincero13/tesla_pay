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

async function run() {
    try {
        console.log('🔌 Connecting...');

        console.log('🔨 Ensuring financial_history table exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS financial_history (
                id SERIAL PRIMARY KEY,
                balance_id INTEGER, 
                operational_balance DECIMAL(15, 2),
                reserve_balance DECIMAL(15, 2),
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                change_type VARCHAR(50)
            );
        `);
        console.log('✅ Table verified.');

        // Now run the insertion logic here directly
        const historicalData = [
            { date: '2026-01-23', operational: 63336.40, reserve: 118500.00 },
            { date: '2026-01-24', operational: 72619.38, reserve: 118500.00 },
            { date: '2026-01-25', operational: 76685.70, reserve: 118500.00 },
            { date: '2026-01-26', operational: 77573.68, reserve: 118500.00 },
            { date: '2026-01-27', operational: 67999.43, reserve: 118500.00 },
            { date: '2026-01-28', operational: 69769.27, reserve: 118500.00 },
            { date: '2026-01-29', operational: 131251.65, reserve: 118500.00 },
        ];

        console.log('🧹 Cleaning up old data for these dates...');
        for (const data of historicalData) {
            await pool.query(`DELETE FROM financial_history WHERE DATE(changed_at) = $1`, [data.date]);
        }

        console.log('➕ Inserting data...');
        for (const data of historicalData) {
            const timestamp = `${data.date} 12:00:00`;
            await pool.query(`
                INSERT INTO financial_history 
                (balance_id, operational_balance, reserve_balance, changed_at, change_type)
                VALUES (NULL, $1, $2, $3, 'MANUAL_HISTORY_INSERT')
            `, [data.operational, data.reserve, timestamp]);
            console.log(`   -> ${data.date} inserted.`);
        }

        console.log('🎉 Success!');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

run();
