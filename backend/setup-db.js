require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString) {
    connectionString = connectionString.replace(/:\/\/([^:]+):"([^"]+)"@/, '://$1:$2@');
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runSchema() {
    try {
        await client.connect();
        console.log('Connected to DB. Reading schema.sql...');

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await client.query(schemaSql);

        console.log('✅ Schema applied successfully! Tables created.');
        await client.end();
    } catch (err) {
        console.error('❌ Failed to run schema:', err);
        process.exit(1);
    }
}

runSchema();
