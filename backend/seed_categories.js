const { Client } = require('pg');
require('dotenv').config();

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

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const client = new Client({ connectionString });

const seed = async () => {
    try {
        await client.connect();
        console.log("Connected to DB");

        const res = await client.query('SELECT COUNT(*) FROM categories');
        const count = parseInt(res.rows[0].count);

        if (count === 0) {
            console.log("Categories table is empty. Seeding...");

            for (const name of CATEGORIES_PF) {
                await client.query('INSERT INTO categories (name, type) VALUES ($1, $2)', [name, 'PF']);
            }
            console.log(`Inserted ${CATEGORIES_PF.length} PF categories.`);

            for (const name of CATEGORIES_PJ) {
                await client.query('INSERT INTO categories (name, type) VALUES ($1, $2)', [name, 'PJ']);
            }
            console.log(`Inserted ${CATEGORIES_PJ.length} PJ categories.`);

        } else {
            console.log(`Categories table already has ${count} items. Skipping seed.`);
        }

    } catch (err) {
        console.error("Error seeding:", err);
    } finally {
        await client.end();
    }
};

seed();
