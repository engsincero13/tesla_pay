require('dotenv').config();
const { Pool } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({ connectionString });

async function diagnose() {
    try {
        console.log('\n=== platform_balance_snapshots (últimos 5) ===');
        const ps = await pool.query(`
            SELECT id, snapshot_date, total_amount, created_at, updated_at
            FROM platform_balance_snapshots
            ORDER BY updated_at DESC
            LIMIT 5
        `);
        ps.rows.forEach(r => {
            console.log({
                snapshot_date: r.snapshot_date,
                total_amount: r.total_amount,
                created_at: r.created_at,
                updated_at: r.updated_at,
            });
        });

        console.log('\n=== financial_history (últimos 5 por effective_date) ===');
        const fh = await pool.query(`
            SELECT operational_balance, effective_date, changed_at, change_type
            FROM financial_history
            ORDER BY COALESCE(effective_date, DATE(changed_at)) DESC, changed_at DESC
            LIMIT 5
        `);
        fh.rows.forEach(r => console.log(r));

        console.log('\n=== RESULTADO: o que o frontend recebe hoje ===');
        const today = new Date().toISOString().split('T')[0];
        console.log('Data usada como filtro (UTC):', today);
        const result = await pool.query(`
            SELECT operational_balance, effective_date, changed_at
            FROM financial_history
            WHERE COALESCE(effective_date, DATE(changed_at)) <= $1::date
            ORDER BY COALESCE(effective_date, DATE(changed_at)) DESC, changed_at DESC
            LIMIT 1
        `, [today]);
        console.log('Registro retornado:', result.rows[0] || 'NENHUM');

    } catch (err) {
        console.error('Erro:', err.message);
    } finally {
        await pool.end();
    }
}

diagnose();
