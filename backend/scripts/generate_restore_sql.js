const fs = require('fs');

// I'll just embed the data here for safety since I can't easily require the other file if it's not exported.
const INITIAL_DATA = [
    { supplierName: 'Dona Maria - Prestação de serviços domésticos', amount: 2000, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Serviços Domésticos', isFixed: true, isEssential: true, pixKey: '91988763261', workspace: 'PF' },
    { supplierName: 'Consórcio - Jet sky Pedra Branca', amount: 3000, dueDate: '2026-01-06', status: 'Pago', method: 'Pix', category: 'Lazer & Viagens', isFixed: true, isEssential: false, pixKey: 'faturamento@megajet.com.br', workspace: 'PF' },
    { supplierName: 'Fotos Martin 8/10 - fotos nascimento filho', amount: 268.10, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Lazer & Viagens', isFixed: false, isEssential: false, pixKey: 'https://www.asaas.com/i/oct0zv06x33ny33p', workspace: 'PF' },
    { supplierName: 'Cartão Will - Cartão de crédito que minha mãe usa', amount: 250.94, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: 'Solicitar ao Mauricio', workspace: 'PF' },
    { supplierName: 'Taxa condominio - Lote Bougain Ville', amount: 230.78, dueDate: '2026-01-07', status: 'Pago', method: 'Boleto', category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: true, pixKey: '75691.40416 01099.225904 01261.780017 7 107200', workspace: 'PF' },
    { supplierName: 'Cartão Havan', amount: 19.99, dueDate: '2026-01-05', status: 'Pago', method: 'Boleto', category: 'Cartão de Crédito', isFixed: true, isEssential: false, pixKey: '23793.64504 45094.000150 12000.287701 1 104200', workspace: 'PF' },
    { supplierName: 'Nubank - Maurício', amount: 3791.89, dueDate: '2026-01-07', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: 'mauricioferreiiira@gmail.com', workspace: 'PF' },
    { supplierName: 'Neon - Maurício', amount: 862.20, dueDate: '2026-01-07', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '6c27a21f-9e77-49a2-813d-660320469279', workspace: 'PF' },
    { supplierName: 'Cartão BB - Maurício', amount: 1335.80, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: 'mauricioferreiracivil@gmail.com', workspace: 'PF' },
    { supplierName: 'Ajuda Mari', amount: 740, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Saúde & Bem-estar', isFixed: true, isEssential: true, workspace: 'PF' },
    { supplierName: 'Visa infinity - Bradesco', amount: 2301.97, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '48998138537', workspace: 'PF' },
    { supplierName: 'Piscineiro', amount: 220, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: false, pixKey: '06990413921', workspace: 'PF' },
    { supplierName: 'Seu Pedro - Jardinagem', amount: 200, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: false, pixKey: '48 99168 3093', workspace: 'PF' },
    { supplierName: 'Maurício - Mercado Pago', amount: 4684.02, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: 'Solicitar chave pix - Maurício', workspace: 'PF' },
    { supplierName: 'Maeli - Mercado pago', amount: 1516.73, dueDate: '2026-01-15', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, workspace: 'PF' },
    { supplierName: 'Inter - Maeli', amount: 3112.83, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '02561037207', workspace: 'PF' },
    { supplierName: 'Inter - Maurício', amount: 1717.61, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '91980987174', workspace: 'PF' },
    { supplierName: 'Itau Personnalité', amount: 13185.11, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', workspace: 'PF' },
    { supplierName: 'Financiamento imovel para sogra', amount: 3789.76, dueDate: '2026-01-15', status: 'Pendente', method: 'Pix', category: 'Financiamentos', isFixed: true, isEssential: true, pixKey: '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', workspace: 'PF' },
    { supplierName: 'Nubank - Maeli', amount: 2015.10, dueDate: '2026-01-15', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: 'engsincero13@gmail.com', workspace: 'PF' },
    { supplierName: 'Tiguan 2019 - Parte da folha de pagamento (Dívida fábio)', amount: 3365.00, dueDate: '2026-01-18', status: 'Pendente', method: 'Pix', category: 'Financiamentos', isFixed: true, isEssential: true, pixKey: '48998138537', workspace: 'PF' },
    { supplierName: 'Nai - serviços contábeis', amount: 100, dueDate: '2026-01-15', status: 'Pendente', method: 'Pix', category: 'Serviços Contábeis', isFixed: true, isEssential: true, pixKey: '34399088000188', workspace: 'PF' },
    { supplierName: 'Conta de Agua - Palhoça', amount: 115, dueDate: '2026-01-15', status: 'Pendente', method: 'Boleto', category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: true, pixKey: '1396700-2', workspace: 'PF' },
    { supplierName: 'Itau - Azul Visa Infinity', amount: 20232.61, dueDate: '2026-01-15', status: 'Pendente', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', workspace: 'PF' },
    { supplierName: 'Lote', amount: 927.00, dueDate: '2026-01-17', status: 'Pendente', method: 'Pix', category: 'Financiamentos', isFixed: true, isEssential: true, pixKey: 'https://grupostatus.cvcrm.com.br/cliente/financeiro', workspace: 'PF' },
    { supplierName: 'Cartão caixa', amount: 221.01, dueDate: '2026-01-17', status: 'Pendente', method: 'Boleto', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '1049818543090021247428786400116680000000000', workspace: 'PF' },
    { supplierName: 'Financiamento da residencia que moro atualmente', amount: 3958.11, dueDate: '2026-01-17', status: 'Pendente', method: 'Pix', category: 'Financiamentos', isFixed: true, isEssential: true, pixKey: '4635c66b-03c8-4fd2-8ace-3252453ce029', workspace: 'PF' },
    { supplierName: 'Sem parar (tag de estacionamento)', amount: 150.00, dueDate: '2026-01-20', status: 'Pendente', method: 'Pix', category: 'Transporte (Combustível/IPVA)', isFixed: true, isEssential: false, workspace: 'PF' },
    { supplierName: 'Claro - conta de internet móvel', amount: 132.00, dueDate: '2026-01-20', status: 'Pendente', method: 'Boleto', category: 'Assinaturas & Streaming', isFixed: true, isEssential: true, workspace: 'PF' },
    { supplierName: 'Adriano - Personal trainer Maurício', amount: 1200.00, dueDate: '2026-01-20', status: 'Pendente', method: 'Pix', category: 'Cuidados Pessoais (Academia/Beleza)', isFixed: true, isEssential: false, pixKey: 'projetoevolucaooficial@gmail.com', workspace: 'PF' },
    { supplierName: 'Jessica - Personal trainer Maeli', amount: 1200.00, dueDate: '2026-01-20', status: 'Pendente', method: 'Pix', category: 'Cuidados Pessoais (Academia/Beleza)', isFixed: true, isEssential: false, pixKey: '09857884962', workspace: 'PF' },
    { supplierName: 'Vivo - Conta de internet móvel', amount: 150.00, dueDate: '2026-01-20', status: 'Pendente', method: 'Boleto', category: 'Assinaturas & Streaming', isFixed: true, isEssential: true, workspace: 'PF' },
    { supplierName: 'Plano de saúde Bradesco', amount: 1745.84, dueDate: '2026-01-23', status: 'Pendente', method: 'Pix', category: 'Plano de Saúde', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PF' },
    { supplierName: 'Cartão Riachuelo', amount: 156.00, dueDate: '2026-01-23', status: 'Pendente', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: false, pixKey: 'https://www.midway.com.br/consulta-bolet', workspace: 'PF' },
    { supplierName: 'Celesc - Maurício (conta de luz)', amount: 588.00, dueDate: '2026-01-21', status: 'Pendente', method: 'Boleto', category: 'Energia', isFixed: true, isEssential: true, workspace: 'PF' },
    { supplierName: 'Solange - Prestação de serviços domésticos', amount: 1840.00, dueDate: '2026-01-30', status: 'Pendente', method: 'Pix', category: 'Serviços Domésticos', isFixed: true, isEssential: true, pixKey: '91988763261', workspace: 'PF' },
    // PJ
    { supplierName: 'Aluguel - Maquina de Café', amount: 400.00, dueDate: '2026-01-05', status: 'Pago', method: 'Boleto', category: 'Aluguel - Empresa', isFixed: true, isEssential: false, pixKey: '13691.70509 00200.233708 00001.163278 3 10', workspace: 'PJ' },
    { supplierName: 'Fábio Pires - folha de pagamento', amount: 15800.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: '91982382088', workspace: 'PJ' },
    { supplierName: 'João Marques - folha de pagamento', amount: 11000.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: '48.527.247/0001-97', workspace: 'PJ' },
    { supplierName: 'Giba - folha de pagamento', amount: 11000.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: 'gilberto.alves.mkt@gmail.com', workspace: 'PJ' },
    { supplierName: 'Abner Duarte - folha de pagamento', amount: 10000.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: '62145064000138', workspace: 'PJ' },
    { supplierName: 'Pablo Neves - folha de pagamento', amount: 5575.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: '00315840200', workspace: 'PJ' },
    { supplierName: 'Geovany Queiroz - folha de pagamento', amount: 3000.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: 'giovanyqueiroz1@gmail.com', workspace: 'PJ' },
    { supplierName: 'Emanuelle Duarte - folha de pagamento', amount: 1981.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: 'emanuelleramos30@gmail.com', workspace: 'PJ' },
    { supplierName: 'Gabriel Petri - folha de pagamento (ultimo pagamento)', amount: 590.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: '130.843.629-71', workspace: 'PJ' },
    { supplierName: 'Adson Pires - folha de pagamento (ultimo pagamento)', amount: 835.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: 'adsonyure96@gmail.com', workspace: 'PJ' },
    { supplierName: 'Fernando Thunder - folha de pagamento', amount: 2500.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: '059.040.672-83', workspace: 'PJ' },
    { supplierName: 'Vitor Gabriel - folha de pagamento (ultimo pagamento)', amount: 1410.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Equipe', isFixed: true, isEssential: true, pixKey: '07224030201', workspace: 'PJ' },
    { supplierName: 'c6 Bank PJ - Cartão de crédito', amount: 1052.24, dueDate: '2026-01-06', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: '00020101021126580014br.gov.bcb.pix0136fe', workspace: 'PJ' },
    { supplierName: 'Vero - Provedor de internet Empresa', amount: 150.00, dueDate: '2026-01-05', status: 'Pago', method: 'Pix', category: 'Gastos pessoais', isFixed: true, isEssential: true, pixKey: 'http://00020101021226900014br.gov.bcb.pix', workspace: 'PJ' },
    { supplierName: 'Consório - Veículo + Construção', amount: 5545.82, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Gastos pessoais', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PJ' },
    { supplierName: 'Cafe insumos', amount: 0, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Ferramentas - Empresa', isFixed: false, isEssential: false, workspace: 'PJ' },
    { supplierName: 'Internet empresa', amount: 131.00, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Gastos pessoais', isFixed: true, isEssential: true, pixKey: 'App Minha Vero', workspace: 'PJ' },
    { supplierName: 'Inter PJ - Cartão de Crédito', amount: 34407.56, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: 'App Inter Empresas', workspace: 'PJ' },
    { supplierName: 'Bradesco PJ - Cartão de Crédito', amount: 58545.80, dueDate: '2026-01-10', status: 'Pago', method: 'Pix', category: 'Cartão de Crédito', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PJ' },
    { supplierName: 'Taxa conta - Bradesco', amount: 177.05, dueDate: '2026-01-15', status: 'Pendente', method: 'Pix', category: 'Relacionamento Bancário', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PJ' },
    { supplierName: 'Pronampe - Empréstimo', amount: 4534.04, dueDate: '2026-01-15', status: 'Pendente', method: 'Pix', category: 'Empréstimos/Financiamentos', isFixed: true, isEssential: true, pixKey: '565b0d35-6ade-4b34-b200-25be2d6d3352', workspace: 'PJ' },
    { supplierName: 'Emprestimo Bradesco 1', amount: 1906.40, dueDate: '2026-01-21', status: 'Pendente', method: 'Pix', category: 'Empréstimos/Financiamentos', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PJ' },
    { supplierName: 'Emprestimo Bradesco 2', amount: 1429.80, dueDate: '2026-01-21', status: 'Pendente', method: 'Pix', category: 'Empréstimos/Financiamentos', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PJ' },
    { supplierName: 'Seguro Empresa', amount: 240.86, dueDate: '2026-01-20', status: 'Pendente', method: 'Pix', category: 'Aluguel - Empresa', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PJ' },
    { supplierName: 'Conta de luz funcionarios Celesc - Pablo e Geo', amount: 70.00, dueDate: '2026-01-21', status: 'Pendente', method: 'Pix', category: 'Gastos pessoais', isFixed: true, isEssential: false, pixKey: 'App celesc', workspace: 'PJ' },
    { supplierName: 'Celesc - Empresa (conta de luz do escritorio)', amount: 409.00, dueDate: '2026-01-21', status: 'Pendente', method: 'Pix', category: 'Aluguel - Empresa', isFixed: true, isEssential: true, pixKey: 'App celesc', workspace: 'PJ' },
    { supplierName: 'Impostos', amount: 36186.19, dueDate: '2026-01-25', status: 'Pendente', method: 'Pix', category: 'Impostos', isFixed: true, isEssential: true, pixKey: 'Solicitar ao Maurício', workspace: 'PJ' },
    { supplierName: 'título de cap - banco do brasil', amount: 300.00, dueDate: '2026-01-30', status: 'Pendente', method: 'Pix', category: 'Gastos pessoais', isFixed: true, isEssential: false, pixKey: '565b0d35-6ade-4b34-b200-25be2d6d3352', workspace: 'PJ' },
    { supplierName: 'Seguro de Vida (Bradesco)', amount: 207.94, dueDate: '2026-01-30', status: 'Pendente', method: 'Pix', category: 'Relacionamento Bancário', isFixed: true, isEssential: true, pixKey: 'pix@teslatreinamentos.com.br', workspace: 'PJ' },
    { supplierName: 'Auxilio Aluguel Funcionarios - Pablo e Geovany', amount: 650.00, dueDate: '2026-01-30', status: 'Pendente', method: 'Pix', category: 'Aluguel - Empresa', isFixed: true, isEssential: true, pixKey: '34191.09016 90802.158775 51572.770009 4 10', workspace: 'PJ' },
    { supplierName: 'Imposto negociacao', amount: 520.00, dueDate: '2026-01-30', status: 'Pendente', method: 'Pix', category: 'Impostos', isFixed: true, isEssential: true, workspace: 'PJ' },
    { supplierName: 'Aluguel escritório', amount: 2807.00, dueDate: '2026-01-30', status: 'Pendente', method: 'Pix', category: 'Aluguel - Empresa', isFixed: true, isEssential: true, pixKey: '34191.09016 90802.238775 51572.770009 9 10', workspace: 'PJ' }
];

let sql = `
-- Script de restauração de dados reais
-- Gerado automaticamente

DO $$
DECLARE 
    v_user_id UUID;
    v_supplier_id UUID;
BEGIN
    -- 1. Garante usuario demo e pega ID
    -- 1. Garante que o usuario do frontend (Giba) exista e usa o ID dele
    -- ID capturado dos logs: 16d33bee-38b4-412e-a3dc-db89c6dedadc
    v_user_id := '16d33bee-38b4-412e-a3dc-db89c6dedadc';
    
    INSERT INTO users (id, name, email, password_hash, force_change_password) 
    VALUES (v_user_id, 'Giba', 'giba@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', FALSE)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name; -- Updates name if exists, ensures we have the record

    -- 2. LIMPEZA TOTAL (Para evitar duplicatas)
    DELETE FROM accounts_payable WHERE user_id = v_user_id;
    -- Opcional: deletar fornecedores se quiser resetar também, mas cuidado com FKs se houver outras referencias (não há neste app simples)
    -- DELETE FROM suppliers WHERE user_id = v_user_id;  <-- Vamos manter suppliers ou deletar? 
    -- O script de insert faz "ON CONFLICT" ou busca existente, então duplicar suppliers não é problema se o nome for unico.
    -- Mas suppliers não tem UNIQUE(name). 
    -- Vamos limpar accounts apenas para garantir que os lancamentos nao dupliquem.


`;

INITIAL_DATA.forEach((item, index) => {
    sql += `
    -- Item ${index + 1}: ${item.supplierName}
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, '${item.supplierName}', '${item.workspace}', '${item.pixKey || ''}', '${item.category}')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = '${item.supplierName}' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        '${item.workspace}', 
        ${item.amount}, 
        '${item.dueDate}', 
        '${item.status}', 
        '${item.method}', 
        '${item.category}', 
        ${item.isFixed}, 
        ${item.isEssential}, 
        '${item.pixKey || ''}', 
        NOW()
    );
    `;
});

sql += `
END $$;
`;

fs.writeFileSync('scripts/restore_data.sql', sql);
console.log('Generated scripts/restore_data.sql');
