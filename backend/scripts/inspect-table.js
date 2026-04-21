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

async function inspect() {
    try {
        console.log('Inspection:');
        const res = await pool.query(`
            SELECT table_name, table_type
            FROM information_schema.tables 
            WHERE table_name = 'financial_history';
        `);
        console.log(res.rows);

        // Check triggers
        const triggers = await pool.query(`
            SELECT event_object_table, trigger_name 
            FROM information_schema.triggers 
            WHERE event_object_table = 'financial_history';
        `);
        console.log('Triggers:', triggers.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspect();
