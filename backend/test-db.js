require('dotenv').config({ path: '../.env.local' });
const { Client } = require('pg');

console.log('Testing database connection...');

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL not found in .env.local');
    process.exit(1);
}

// Fix for potentially quoted password: postgres://user:"password"@host...
// This regex looks for :"password"@ and replaces it with :password@
connectionString = connectionString.replace(/:\/\/([^:]+):"([^"]+)"@/, '://$1:$2@');

console.log('Connecting using cleaned connection string (password masked)...');

const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        await client.connect();
        console.log('✅ Connected successfully to PostgreSQL database!');
        console.log('🚀 Ready to run schema migrations.');

        // Test a query
        const res = await client.query('SELECT current_database(), current_user, version()');
        console.log('Connection Info:', res.rows[0]);

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
