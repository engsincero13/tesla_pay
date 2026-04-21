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

const NEW_CATEGORIES = [
    "Aluguel / Moradia",
    "Energia / Água",
    "Internet / Telefone",
    "Alimentação",
    "Transporte / Combustível",
    "Saúde",
    "Educação",
    "Lazer",
    "Assinaturas / Software",
    "Serviços Domésticos",
    "Cartão de Crédito",
    "Empréstimos / Financiamentos",
    "Investimentos",
    "Impostos",
    "Equipe / Salários",
    "Manutenção",
    "Serviços Contábeis",
    "Seguros",
    "Consórcio",
    "Outros"
];

async function updateCategories() {
    try {
        await client.connect();
        console.log('Updating categories...');

        // 1. Remove the constraint checking for PF/PJ so we can have generic categories
        try {
            await client.query(`ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check`);
            console.log('✅ Constraint dropped (if existed).');
        } catch (e) {
            console.log('Info: Could not drop constraint (might not exist or different name). Proceeding...');
        }

        // 2. Clear existing categories
        await client.query('DELETE FROM categories');
        console.log('✅ Old categories deleted.');

        // 3. Insert new unified categories
        const userRes = await client.query("SELECT id FROM users LIMIT 1");
        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;

            for (const cat of NEW_CATEGORIES) {
                await client.query(
                    "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'GERAL')",
                    [userId, cat]
                );
            }
        }

        console.log('✅ New unified categories inserted.');
        await client.end();
    } catch (err) {
        console.error('❌ Update failed:', err);
        process.exit(1);
    }
}

updateCategories();
