const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres:c35cd060225145bdbba17c1d467e7f7b@77.37.68.145:5432/teslaPay?schema=public&sslmode=disable';

const sqlFile = process.argv[2];

if (!sqlFile) {
    console.error('Please provide a SQL file to execute.');
    process.exit(1);
}

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const sql = fs.readFileSync(sqlFile, 'utf8');
        await client.connect();
        console.log(`Connected. Executing ${sqlFile}...`);

        await client.query(sql);

        console.log('✅ Successfully executed SQL script.');
        await client.end();
    } catch (err) {
        console.error('❌ Error executing SQL:', err);
        process.exit(1);
    }
}

run();
