const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:c35cd060225145bdbba17c1d467e7f7b@77.37.68.145:5432/teslaPay?schema=public&sslmode=disable';

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        console.log('--- USERS ---');
        const users = await client.query("SELECT id, name, email FROM users");
        console.table(users.rows);

        console.log('\n--- ACCOUNTS COUNT BY USER ---');
        const counts = await client.query("SELECT user_id, count(*) FROM accounts_payable GROUP BY user_id");
        console.table(counts.rows);

        await client.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
