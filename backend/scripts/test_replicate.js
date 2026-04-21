const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:c35cd060225145bdbba17c1d467e7f7b@77.37.68.145:5432/teslaPay?schema=public&sslmode=disable';

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testReplication() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // 1. Check User ID (Get the demo user)
        const userRes = await client.query("SELECT id FROM users WHERE email = 'demo@teslapay.com'");
        if (userRes.rows.length === 0) {
            console.log('User not found!');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log('User ID:', userId);

        // 2. Check Jan Data Count
        // JS Month 0 = JAN. API expects sourceMonth (0) => SQL (0+1) = 1.
        const sourceMonth = 0;
        const sourceYear = 2026;

        const countQuery = `
            SELECT COUNT(*) FROM accounts_payable 
            WHERE user_id = $1 
            AND EXTRACT(MONTH FROM due_date) = $2
            AND EXTRACT(YEAR FROM due_date) = $3
        `;
        const janCount = await client.query(countQuery, [userId, sourceMonth + 1, sourceYear]); // Month 1
        console.log(`January 2026 Items Found: ${janCount.rows[0].count}`);

        // 3. Try the Replicate Query manually
        const replicateQuery = `
            INSERT INTO accounts_payable (
                user_id, supplier_id, amount, due_date, status, workspace, category, method, pix_key
            )
            SELECT 
                $1, supplier_id, amount, 
                due_date + INTERVAL '1 month',
                'Pendente', workspace, category, method, pix_key
            FROM accounts_payable
            WHERE user_id = $1 
            AND EXTRACT(MONTH FROM due_date) = $2
            AND EXTRACT(YEAR FROM due_date) = $3
            RETURNING id, due_date;
        `;

        // Use a transaction so we don't mess up if we want to run it again, OR just let it run and see.
        // Let's just run it. If it duplicates, we'll see.
        const result = await client.query(replicateQuery, [userId, sourceMonth + 1, sourceYear]);
        console.log(`Replication Inserted Rows: ${result.rowCount}`);
        if (result.rowCount > 0) {
            console.log('Sample Inserted Date:', result.rows[0].due_date);
        }

        // 4. Check Feb Data Count
        const febCount = await client.query(countQuery, [userId, sourceMonth + 2, sourceYear]); // Month 2
        console.log(`February 2026 Items Found: ${febCount.rows[0].count}`);

        await client.end();

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testReplication();
