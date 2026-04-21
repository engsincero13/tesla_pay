require('dotenv').config({ path: '../.env.local' });
const { Client } = require('pg');

const AccountStatus = {
    PENDING: 'Pendente',
    SCHEDULED: 'Programado',
    PAID: 'Pago',
    OVERDUE: 'Atrasado',
    CANCELLED: 'Cancelado'
};

const PaymentMethod = {
    PIX: 'Pix',
    BOLETO: 'Boleto',
    TRANSFER: 'Transferência',
    CARD: 'Cartão',
    CASH: 'Dinheiro'
};

const INITIAL_DATA = [
    // --- LANÇAMENTOS PF (DADOS DA PLANILHA 1) ---
    { id: 'pf-1', workspace: 'PF', supplierId: 's1', supplierName: 'Dona Maria - Prestação de serviços domésticos', amount: 2000, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Serviços Domésticos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '91988763261' },
    { id: 'pf-2', workspace: 'PF', supplierId: 's2', supplierName: 'Consórcio - Jet sky Pedra Branca', amount: 3000, dueDate: '2026-01-06', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Lazer & Viagens', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: 'faturamento@megajet.com.br' },
    { id: 'pf-3', workspace: 'PF', supplierId: 's3', supplierName: 'Fotos Martin 8/10 - fotos nascimento filho', amount: 268.10, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Lazer & Viagens', isFixed: false, isEssential: false, tags: [], attachments: [], pixKey: 'https://www.asaas.com/i/oct0zv06x33ny33p' },
    { id: 'pf-4', workspace: 'PF', supplierId: 's4', supplierName: 'Cartão Will - Cartão de crédito que minha mãe usa', amount: 250.94, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'Solicitar ao Mauricio' },
    { id: 'pf-5', workspace: 'PF', supplierId: 's5', supplierName: 'Taxa condominio - Lote Bougain Ville', amount: 230.78, dueDate: '2026-01-07', status: AccountStatus.PAID, method: PaymentMethod.BOLETO, category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '75691.40416 01099.225904 01261.780017 7 107200' },
    { id: 'pf-6', workspace: 'PF', supplierId: 's6', supplierName: 'Cartão Havan', amount: 19.99, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.BOLETO, category: 'Cartão de Crédito', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: '23793.64504 45094.000150 12000.287701 1 104200' },
    { id: 'pf-7', workspace: 'PF', supplierId: 's7', supplierName: 'Nubank - Maurício', amount: 3791.89, dueDate: '2026-01-07', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'mauricioferreiiira@gmail.com' },
    { id: 'pf-8', workspace: 'PF', supplierId: 's8', supplierName: 'Neon - Maurício', amount: 862.20, dueDate: '2026-01-07', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '6c27a21f-9e77-49a2-813d-660320469279' },
    { id: 'pf-9', workspace: 'PF', supplierId: 's9', supplierName: 'Cartão BB - Maurício', amount: 1335.80, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'mauricioferreiracivil@gmail.com' },
    { id: 'pf-10', workspace: 'PF', supplierId: 's10', supplierName: 'Ajuda Mari', amount: 740, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Saúde & Bem-estar', isFixed: true, isEssential: true, tags: [], attachments: [] },
    { id: 'pf-11', workspace: 'PF', supplierId: 's11', supplierName: 'Visa infinity - Bradesco', amount: 2301.97, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '48998138537' },
    { id: 'pf-12', workspace: 'PF', supplierId: 's12', supplierName: 'Piscineiro', amount: 220, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: '06990413921' },
    { id: 'pf-13', workspace: 'PF', supplierId: 's13', supplierName: 'Seu Pedro - Jardinagem', amount: 200, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: '48 99168 3093' },
    { id: 'pf-14', workspace: 'PF', supplierId: 's14', supplierName: 'Maurício - Mercado Pago', amount: 4684.02, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'Solicitar chave pix - Maurício' },
    { id: 'pf-15', workspace: 'PF', supplierId: 's15', supplierName: 'Maeli - Mercado pago', amount: 1516.73, dueDate: '2026-01-15', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [] },
    { id: 'pf-16', workspace: 'PF', supplierId: 's16', supplierName: 'Inter - Maeli', amount: 3112.83, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '02561037207' },
    { id: 'pf-17', workspace: 'PF', supplierId: 's17', supplierName: 'Inter - Maurício', amount: 1717.61, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '91980987174' },
    { id: 'pf-18', workspace: 'PF', supplierId: 's18', supplierName: 'Itau Personnalité', amount: 13185.11, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '6731c2e3-a0f2-4fa8-9b79-613ca25ec72' },
    { id: 'pf-19', workspace: 'PF', supplierId: 's19', supplierName: 'Financiamento imovel para sogra', amount: 3789.76, dueDate: '2026-01-15', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Financiamentos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '6731c2e3-a0f2-4fa8-9b79-613ca25ec72' },
    { id: 'pf-20', workspace: 'PF', supplierId: 's20', supplierName: 'Nubank - Maeli', amount: 2015.10, dueDate: '2026-01-15', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'engsincero13@gmail.com' },
    { id: 'pf-21', workspace: 'PF', supplierId: 's21', supplierName: 'Tiguan 2019 - Parte da folha de pagamento (Dívida fábio)', amount: 3365.00, dueDate: '2026-01-18', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Financiamentos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '48998138537' },
    { id: 'pf-22', workspace: 'PF', supplierId: 's22', supplierName: 'Nai - serviços contábeis', amount: 100, dueDate: '2026-01-15', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Serviços Contábeis', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '34399088000188' },
    { id: 'pf-23', workspace: 'PF', supplierId: 's23', supplierName: 'Conta de Agua - Palhoça', amount: 115, dueDate: '2026-01-15', status: AccountStatus.PENDING, method: PaymentMethod.BOLETO, category: 'Moradia (Aluguel/Contas)', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '1396700-2' },
    { id: 'pf-24', workspace: 'PF', supplierId: 's24', supplierName: 'Itau - Azul Visa Infinity', amount: 20232.61, dueDate: '2026-01-15', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '6731c2e3-a0f2-4fa8-9b79-613ca25ec72' },
    { id: 'pf-25', workspace: 'PF', supplierId: 's25', supplierName: 'Lote', amount: 927.00, dueDate: '2026-01-17', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Financiamentos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'https://grupostatus.cvcrm.com.br/cliente/financeiro' },
    { id: 'pf-26', workspace: 'PF', supplierId: 's26', supplierName: 'Cartão caixa', amount: 221.01, dueDate: '2026-01-17', status: AccountStatus.PENDING, method: PaymentMethod.BOLETO, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '1049818543090021247428786400116680000000000' },
    { id: 'pf-27', workspace: 'PF', supplierId: 's27', supplierName: 'Financiamento da residencia que moro atualmente', amount: 3958.11, dueDate: '2026-01-17', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Financiamentos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '4635c66b-03c8-4fd2-8ace-3252453ce029' },
    { id: 'pf-28', workspace: 'PF', supplierId: 's28', supplierName: 'Sem parar (tag de estacionamento)', amount: 150.00, dueDate: '2026-01-20', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Transporte (Combustível/IPVA)', isFixed: true, isEssential: false, tags: [], attachments: [] },
    { id: 'pf-29', workspace: 'PF', supplierId: 's29', supplierName: 'Claro - conta de internet móvel', amount: 132.00, dueDate: '2026-01-20', status: AccountStatus.PENDING, method: PaymentMethod.BOLETO, category: 'Assinaturas & Streaming', isFixed: true, isEssential: true, tags: [], attachments: [] },
    { id: 'pf-30', workspace: 'PF', supplierId: 's30', supplierName: 'Adriano - Personal trainer Maurício', amount: 1200.00, dueDate: '2026-01-20', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Cuidados Pessoais (Academia/Beleza)', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: 'projetoevolucaooficial@gmail.com' },
    { id: 'pf-31', workspace: 'PF', supplierId: 's31', supplierName: 'Jessica - Personal trainer Maeli', amount: 1200.00, dueDate: '2026-01-20', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Cuidados Pessoais (Academia/Beleza)', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: '09857884962' },
    { id: 'pf-32', workspace: 'PF', supplierId: 's32', supplierName: 'Vivo - Conta de internet móvel', amount: 150.00, dueDate: '2026-01-20', status: AccountStatus.PENDING, method: PaymentMethod.BOLETO, category: 'Assinaturas & Streaming', isFixed: true, isEssential: true, tags: [], attachments: [] },
    { id: 'pf-33', workspace: 'PF', supplierId: 's33', supplierName: 'Plano de saúde Bradesco', amount: 1745.84, dueDate: '2026-01-23', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Plano de Saúde', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pf-34', workspace: 'PF', supplierId: 's34', supplierName: 'Cartão Riachuelo', amount: 156.00, dueDate: '2026-01-23', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: 'https://www.midway.com.br/consulta-bolet' },
    { id: 'pf-35', workspace: 'PF', supplierId: 's35', supplierName: 'Celesc - Maurício (conta de luz)', amount: 588.00, dueDate: '2026-01-21', status: AccountStatus.PENDING, method: PaymentMethod.BOLETO, category: 'Energia', isFixed: true, isEssential: true, tags: [], attachments: [] },
    { id: 'pf-36', workspace: 'PF', supplierId: 's36', supplierName: 'Solange - Prestação de serviços domésticos', amount: 1840.00, dueDate: '2026-01-30', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Serviços Domésticos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '91988763261' },
    { id: 'pj-n1', workspace: 'PJ', supplierId: 'vn1', supplierName: 'Aluguel - Maquina de Café', amount: 400.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.BOLETO, category: 'Aluguel - Empresa', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: '13691.70509 00200.233708 00001.163278 3 10' },
    { id: 'pj-n2', workspace: 'PJ', supplierId: 'vn2', supplierName: 'Fábio Pires - folha de pagamento', amount: 15800.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '91982382088' },
    { id: 'pj-n3', workspace: 'PJ', supplierId: 'vn3', supplierName: 'João Marques - folha de pagamento', amount: 11000.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '48.527.247/0001-97' },
    { id: 'pj-n4', workspace: 'PJ', supplierId: 'vn4', supplierName: 'Giba - folha de pagamento', amount: 11000.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'gilberto.alves.mkt@gmail.com' },
    { id: 'pj-n5', workspace: 'PJ', supplierId: 'vn5', supplierName: 'Abner Duarte - folha de pagamento', amount: 10000.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '62145064000138' },
    { id: 'pj-n6', workspace: 'PJ', supplierId: 'vn6', supplierName: 'Pablo Neves - folha de pagamento', amount: 5575.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '00315840200' },
    { id: 'pj-n7', workspace: 'PJ', supplierId: 'vn7', supplierName: 'Geovany Queiroz - folha de pagamento', amount: 3000.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'giovanyqueiroz1@gmail.com' },
    { id: 'pj-n8', workspace: 'PJ', supplierId: 'vn8', supplierName: 'Emanuelle Duarte - folha de pagamento', amount: 1981.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'emanuelleramos30@gmail.com' },
    { id: 'pj-n9', workspace: 'PJ', supplierId: 'vn9', supplierName: 'Gabriel Petri - folha de pagamento (ultimo pagamento)', amount: 590.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '130.843.629-71' },
    { id: 'pj-n10', workspace: 'PJ', supplierId: 'vn10', supplierName: 'Adson Pires - folha de pagamento (ultimo pagamento)', amount: 835.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'adsonyure96@gmail.com' },
    { id: 'pj-n11', workspace: 'PJ', supplierId: 'vn11', supplierName: 'Fernando Thunder - folha de pagamento', amount: 2500.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '059.040.672-83' },
    { id: 'pj-n12', workspace: 'PJ', supplierId: 'vn12', supplierName: 'Vitor Gabriel - folha de pagamento (ultimo pagamento)', amount: 1410.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Equipe', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '07224030201' },
    { id: 'pj-n13', workspace: 'PJ', supplierId: 'vn13', supplierName: 'c6 Bank PJ - Cartão de crédito', amount: 1052.24, dueDate: '2026-01-06', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '00020101021126580014br.gov.bcb.pix0136fe' },
    { id: 'pj-n14', workspace: 'PJ', supplierId: 'vn14', supplierName: 'Vero - Provedor de internet Empresa', amount: 150.00, dueDate: '2026-01-05', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Gastos pessoais', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'http://00020101021226900014br.gov.bcb.pix' },
    { id: 'pj-n15', workspace: 'PJ', supplierId: 'vn15', supplierName: 'Consório - Veículo + Construção', amount: 5545.82, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Gastos pessoais', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pj-n16', workspace: 'PJ', supplierId: 'vn16', supplierName: 'Cafe insumos', amount: 0, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Ferramentas - Empresa', isFixed: false, isEssential: false, tags: [], attachments: [] },
    { id: 'pj-n17', workspace: 'PJ', supplierId: 'vn17', supplierName: 'Internet empresa', amount: 131.00, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Gastos pessoais', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'App Minha Vero' },
    { id: 'pj-n18', workspace: 'PJ', supplierId: 'vn18', supplierName: 'Inter PJ - Cartão de Crédito', amount: 34407.56, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'App Inter Empresas' },
    { id: 'pj-n19', workspace: 'PJ', supplierId: 'vn19', supplierName: 'Bradesco PJ - Cartão de Crédito', amount: 58545.80, dueDate: '2026-01-10', status: AccountStatus.PAID, method: PaymentMethod.PIX, category: 'Cartão de Crédito', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pj-n20', workspace: 'PJ', supplierId: 'vn20', supplierName: 'Taxa conta - Bradesco', amount: 177.05, dueDate: '2026-01-15', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Relacionamento Bancário', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pj-n21', workspace: 'PJ', supplierId: 'vn21', supplierName: 'Pronampe - Empréstimo', amount: 4534.04, dueDate: '2026-01-15', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Empréstimos/Financiamentos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '565b0d35-6ade-4b34-b200-25be2d6d3352' },
    { id: 'pj-n22', workspace: 'PJ', supplierId: 'vn22', supplierName: 'Emprestimo Bradesco 1', amount: 1906.40, dueDate: '2026-01-21', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Empréstimos/Financiamentos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pj-n23', workspace: 'PJ', supplierId: 'vn23', supplierName: 'Emprestimo Bradesco 2', amount: 1429.80, dueDate: '2026-01-21', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Empréstimos/Financiamentos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pj-n24', workspace: 'PJ', supplierId: 'vn24', supplierName: 'Seguro Empresa', amount: 240.86, dueDate: '2026-01-20', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Aluguel - Empresa', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pj-n25', workspace: 'PJ', supplierId: 'vn25', supplierName: 'Conta de luz funcionarios Celesc - Pablo e Geo', amount: 70.00, dueDate: '2026-01-21', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Gastos pessoais', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: 'App celesc' },
    { id: 'pj-n26', workspace: 'PJ', supplierId: 'vn26', supplierName: 'Celesc - Empresa (conta de luz do escritorio)', amount: 409.00, dueDate: '2026-01-21', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Aluguel - Empresa', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'App celesc' },
    { id: 'pj-n27', workspace: 'PJ', supplierId: 'vn27', supplierName: 'Impostos', amount: 36186.19, dueDate: '2026-01-25', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Impostos', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'Solicitar ao Maurício' },
    { id: 'pj-n28', workspace: 'PJ', supplierId: 'vn28', supplierName: 'título de cap - banco do brasil', amount: 300.00, dueDate: '2026-01-30', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Gastos pessoais', isFixed: true, isEssential: false, tags: [], attachments: [], pixKey: '565b0d35-6ade-4b34-b200-25be2d6d3352' },
    { id: 'pj-n29', workspace: 'PJ', supplierId: 'vn29', supplierName: 'Seguro de Vida (Bradesco)', amount: 207.94, dueDate: '2026-01-30', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Relacionamento Bancário', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: 'pix@teslatreinamentos.com.br' },
    { id: 'pj-n30', workspace: 'PJ', supplierId: 'vn30', supplierName: 'Auxilio Aluguel Funcionarios - Pablo e Geovany', amount: 650.00, dueDate: '2026-01-30', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Aluguel - Empresa', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '34191.09016 90802.158775 51572.770009 4 10' },
    { id: 'pj-n31', workspace: 'PJ', supplierId: 'vn31', supplierName: 'Imposto negociacao', amount: 520.00, dueDate: '2026-01-30', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Impostos', isFixed: true, isEssential: true, tags: [], attachments: [] },
    { id: 'pj-n32', workspace: 'PJ', supplierId: 'vn32', supplierName: 'Aluguel escritório', amount: 2807.00, dueDate: '2026-01-30', status: AccountStatus.PENDING, method: PaymentMethod.PIX, category: 'Aluguel - Empresa', isFixed: true, isEssential: true, tags: [], attachments: [], pixKey: '34191.09016 90802.238775 51572.770009 9 10' }
];

let connectionString = process.env.DATABASE_URL;
if (connectionString) {
    // Fix quote issue if present
    connectionString = connectionString.replace(/:\/\/([^:]+):"([^"]+)"@/, '://$1:$2@');
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    try {
        await client.connect();
        console.log('Connected. Starting seed...');

        // 1. Create Default User
        const userRes = await client.query(`
      INSERT INTO users (name, email) 
      VALUES ($1, $2)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, ['Demo User', 'demo@teslapay.com']);

        const userId = userRes.rows[0].id;
        console.log('User ID:', userId);

        // 2. Process Accounts
        for (const acc of INITIAL_DATA) {
            // Upsert Supplier
            let supplierId;
            const supplierRes = await client.query(`
        SELECT id FROM suppliers WHERE name = $1 LIMIT 1
      `, [acc.supplierName]);

            if (supplierRes.rows.length > 0) {
                supplierId = supplierRes.rows[0].id;
            } else {
                const newSup = await client.query(`
          INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [userId, acc.supplierName, acc.workspace, acc.pixKey, acc.category]);
                supplierId = newSup.rows[0].id;
            }

            // Insert Account
            await client.query(`
        INSERT INTO accounts_payable (
          user_id, supplier_id, workspace, amount, due_date, status, method, category, 
          is_fixed, is_essential, pix_key, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
                userId, supplierId, acc.workspace, acc.amount, acc.dueDate, acc.status, acc.method, acc.category,
                acc.isFixed, acc.isEssential, acc.pixKey, acc.createdAt || new Date().toISOString()
            ]);
        }

        console.log(`✅ Seeded ${INITIAL_DATA.length} accounts successfully.`);
        await client.end();
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
}

seed();
