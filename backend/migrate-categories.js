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

const CATEGORIES_PF = [
    "Moradia (Aluguel/Contas)", "Energia", "Alimentação & Delivery", "Transporte (Combustível/IPVA)",
    "Estacionamento", "Saúde & Bem-estar", "Lazer & Viagens", "Assinaturas & Streaming",
    "Cuidados Pessoais (Academia/Beleza)", "Educação & Livros", "Serviços Domésticos",
    "Financiamentos", "Cartão de Crédito", "Investimentos", "Plano de Saúde", "Serviços Contábeis"
];

const CATEGORIES_PJ = [
    "Equipe", "Aluguel - Empresa", "Impostos", "Cartão de Crédito", "Empréstimos/Financiamentos",
    "Relacionamento Bancário", "Gastos pessoais", "Ferramentas - Empresa"
];

async function migrate() {
    try {
        await client.connect();
        console.log('Running migration for categories...');

        await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(10) CHECK (type IN ('PF', 'PJ')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

        console.log('✅ Categories table created.');

        const userRes = await client.query("SELECT id FROM users LIMIT 1");
        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;

            // Seed PF
            for (const cat of CATEGORIES_PF) {
                await client.query(
                    "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'PF')",
                    [userId, cat]
                );
            }
            // Seed PJ
            for (const cat of CATEGORIES_PJ) {
                await client.query(
                    "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'PJ')",
                    [userId, cat]
                );
            }
            console.log('✅ Initial categories seeded.');
        }

        await client.end();
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
