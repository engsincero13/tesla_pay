const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString) {
    connectionString = connectionString.replace(/:\/\/([^:]+):"([^"]+)"@/, '://$1:$2@');
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected. Inserting Consórcio...');

        const userRes = await client.query("SELECT id FROM users LIMIT 1");
        if (userRes.rows.length === 0) {
            console.log('No user found');
            process.exit(1);
        }
        const userId = userRes.rows[0].id;

        // Check if exists first just in case
        const check = await client.query(
            "SELECT id FROM categories WHERE name = $1 AND user_id = $2",
            ['Consórcio', userId]
        );

        if (check.rows.length > 0) {
            console.log('Category "Consórcio" already exists.');
        } else {
            await client.query(
                "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'GERAL')",
                [userId, 'Consórcio']
            );
            console.log('✅ Category "Consórcio" inserted successfully.');
        }

        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
