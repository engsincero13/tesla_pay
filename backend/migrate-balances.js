require('dotenv').config({ path: '../.env.local' });
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString) {
    connectionString = connectionString.replace(/:\/\/([^:]+):"([^"]+)"@/, '://$1:$2@');
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        await client.connect();
        console.log('Running migration for financial_balances...');

        await client.query(`
        CREATE TABLE IF NOT EXISTS financial_balances (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            operational_balance DECIMAL(15, 2) DEFAULT 0,
            reserve_balance DECIMAL(15, 2) DEFAULT 0,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_balances_user_id ON financial_balances(user_id);
    `);

        console.log('✅ Table created.');

        // Seed initial values for the demo user if not exists
        const userRes = await client.query("SELECT id FROM users LIMIT 1");
        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;
            await client.query(`
            INSERT INTO financial_balances (user_id, operational_balance, reserve_balance)
            VALUES ($1, 45231.00, 120000.00)
            ON CONFLICT (user_id) DO NOTHING
        `, [userId]);
            console.log('✅ Initial balances seeded.');
        }

        await client.end();
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
