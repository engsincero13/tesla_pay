const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:c35cd060225145bdbba17c1d467e7f7b@77.37.68.145:5432/teslaPay?schema=public&sslmode=disable';

const MOCK_SUPPLIERS = [
    'Dona Maria - Prestação de serviços domésticos',
    'Consórcio - Jet sky Pedra Branca',
    'Fotos Martin 8/10 - fotos nascimento filho',
    'Cartão Will - Cartão de crédito que minha mãe usa',
    'Taxa condominio - Lote Bougain Ville',
    'Cartão Havan',
    'Nubank - Maurício',
    'Neon - Maurício',
    'Cartão BB - Maurício',
    'Ajuda Mari',
    'Visa infinity - Bradesco',
    'Piscineiro',
    'Seu Pedro - Jardinagem',
    'Maurício - Mercado Pago',
    'Maeli - Mercado pago',
    'Inter - Maeli',
    'Inter - Maurício',
    'Itau Personnalité',
    'Financiamento imovel para sogra',
    'Nubank - Maeli',
    'Tiguan 2019 - Parte da folha de pagamento (Dívida fábio)',
    'Nai - serviços contábeis',
    'Conta de Agua - Palhoça',
    'Itau - Azul Visa Infinity',
    'Lote',
    'Cartão caixa',
    'Financiamento da residencia que moro atualmente',
    'Sem parar (tag de estacionamento)',
    'Claro - conta de internet móvel',
    'Adriano - Personal trainer Maurício',
    'Jessica - Personal trainer Maeli',
    'Vivo - Conta de internet móvel',
    'Plano de saúde Bradesco',
    'Cartão Riachuelo',
    'Celesc - Maurício (conta de luz)',
    'Solange - Prestação de serviços domésticos',
    'Aluguel - Maquina de Café',
    'Fábio Pires - folha de pagamento',
    'João Marques - folha de pagamento',
    'Giba - folha de pagamento',
    'Abner Duarte - folha de pagamento',
    'Pablo Neves - folha de pagamento',
    'Geovany Queiroz - folha de pagamento',
    'Emanuelle Duarte - folha de pagamento',
    'Gabriel Petri - folha de pagamento (ultimo pagamento)',
    'Adson Pires - folha de pagamento (ultimo pagamento)',
    'Fernando Thunder - folha de pagamento',
    'Vitor Gabriel - folha de pagamento (ultimo pagamento)',
    'c6 Bank PJ - Cartão de crédito',
    'Vero - Provedor de internet Empresa',
    'Consório - Veículo + Construção',
    'Cafe insumos',
    'Internet empresa',
    'Inter PJ - Cartão de Crédito',
    'Bradesco PJ - Cartão de Crédito',
    'Taxa conta - Bradesco',
    'Pronampe - Empréstimo',
    'Emprestimo Bradesco 1',
    'Emprestimo Bradesco 2',
    'Seguro Empresa',
    'Conta de luz funcionarios Celesc - Pablo e Geo',
    'Celesc - Empresa (conta de luz do escritorio)',
    'Impostos',
    'título de cap - banco do brasil',
    'Seguro de Vida (Bradesco)',
    'Auxilio Aluguel Funcionarios - Pablo e Geovany',
    'Imposto negociacao',
    'Aluguel escritório'
];

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function clean() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // 1. Delete Accounts associated with Mock Suppliers
        const query = `
            DELETE FROM accounts_payable 
            WHERE supplier_id IN (
                SELECT id FROM suppliers WHERE name = ANY($1)
            )
        `;
        const res = await client.query(query, [MOCK_SUPPLIERS]);
        console.log(`Deleted ${res.rowCount} mock accounts.`);

        // 2. Delete the Mock Suppliers themselves
        const supRes = await client.query(`
            DELETE FROM suppliers WHERE name = ANY($1)
        `, [MOCK_SUPPLIERS]);
        console.log(`Deleted ${supRes.rowCount} mock suppliers.`);

        await client.end();
    } catch (err) {
        console.error('Error cleaning DB:', err);
        process.exit(1);
    }
}

clean();
