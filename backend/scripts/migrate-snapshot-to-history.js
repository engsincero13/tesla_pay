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

async function migrate() {
    try {
        console.log('🔄 synchronizing financial_balances to financial_history...');

        // 1. Get current snapshot
        const snapshotRes = await pool.query('SELECT * FROM financial_balances ORDER BY id ASC LIMIT 1');
        if (snapshotRes.rows.length === 0) {
            console.log('⚠️ No data in financial_balances. Nothing to migrate.');
            return;
        }
        const snapshot = snapshotRes.rows[0];

        // 2. Get latest history
        const historyRes = await pool.query('SELECT * FROM financial_history ORDER BY changed_at DESC LIMIT 1');
        const latestHistory = historyRes.rows.length > 0 ? historyRes.rows[0] : null;

        // 3. Compare
        const snapOp = Number(snapshot.operational_balance).toFixed(2);
        const snapRes = Number(snapshot.reserve_balance).toFixed(2);

        let histOp = null;
        let histRes = null;

        if (latestHistory) {
            histOp = Number(latestHistory.operational_balance).toFixed(2);
            histRes = Number(latestHistory.reserve_balance).toFixed(2);
        }

        console.log(`Snapshot: Op=${snapOp}, Res=${snapRes}`);
        console.log(`History : Op=${histOp}, Res=${histRes}`);

        if (snapOp !== histOp || snapRes !== histRes) {
            console.log('🚀 differences found. Creating new history record from snapshot...');
            await pool.query(`
                INSERT INTO financial_history 
                (balance_id, operational_balance, reserve_balance, changed_at, change_type)
                VALUES (NULL, $1, $2, NOW(), 'MIGRATION_SNAPSHOT')
            `, [snapshot.operational_balance, snapshot.reserve_balance]);
            console.log('✅ Migration record inserted.');
        } else {
            console.log('✅ Data is already in sync.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

migrate();
