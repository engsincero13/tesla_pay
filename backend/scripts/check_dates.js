const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:c35cd060225145bdbba17c1d467e7f7b@77.37.68.145:5432/teslaPay?schema=public&sslmode=disable' });

async function check() {
    const res = await pool.query(`SELECT "dueDate", status, amount, category FROM "AccountPayable" WHERE status IN ('PAID', 'PENDING') ORDER BY "dueDate" DESC LIMIT 10`);
    console.log("Latest due dates:");
    res.rows.forEach(r => console.log(r.dueDate));
    process.exit(0);
}
check();
