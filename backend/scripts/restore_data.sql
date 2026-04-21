
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



    -- Item 1: Dona Maria - Prestação de serviços domésticos
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Dona Maria - Prestação de serviços domésticos', 'PF', '91988763261', 'Serviços Domésticos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Dona Maria - Prestação de serviços domésticos' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        2000, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Serviços Domésticos', 
        true, 
        true, 
        '91988763261', 
        NOW()
    );
    
    -- Item 2: Consórcio - Jet sky Pedra Branca
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Consórcio - Jet sky Pedra Branca', 'PF', 'faturamento@megajet.com.br', 'Lazer & Viagens')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Consórcio - Jet sky Pedra Branca' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        3000, 
        '2026-01-06', 
        'Pago', 
        'Pix', 
        'Lazer & Viagens', 
        true, 
        false, 
        'faturamento@megajet.com.br', 
        NOW()
    );
    
    -- Item 3: Fotos Martin 8/10 - fotos nascimento filho
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Fotos Martin 8/10 - fotos nascimento filho', 'PF', 'https://www.asaas.com/i/oct0zv06x33ny33p', 'Lazer & Viagens')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Fotos Martin 8/10 - fotos nascimento filho' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        268.1, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Lazer & Viagens', 
        false, 
        false, 
        'https://www.asaas.com/i/oct0zv06x33ny33p', 
        NOW()
    );
    
    -- Item 4: Cartão Will - Cartão de crédito que minha mãe usa
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Cartão Will - Cartão de crédito que minha mãe usa', 'PF', 'Solicitar ao Mauricio', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Cartão Will - Cartão de crédito que minha mãe usa' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        250.94, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        'Solicitar ao Mauricio', 
        NOW()
    );
    
    -- Item 5: Taxa condominio - Lote Bougain Ville
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Taxa condominio - Lote Bougain Ville', 'PF', '75691.40416 01099.225904 01261.780017 7 107200', 'Moradia (Aluguel/Contas)')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Taxa condominio - Lote Bougain Ville' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        230.78, 
        '2026-01-07', 
        'Pago', 
        'Boleto', 
        'Moradia (Aluguel/Contas)', 
        true, 
        true, 
        '75691.40416 01099.225904 01261.780017 7 107200', 
        NOW()
    );
    
    -- Item 6: Cartão Havan
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Cartão Havan', 'PF', '23793.64504 45094.000150 12000.287701 1 104200', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Cartão Havan' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        19.99, 
        '2026-01-05', 
        'Pago', 
        'Boleto', 
        'Cartão de Crédito', 
        true, 
        false, 
        '23793.64504 45094.000150 12000.287701 1 104200', 
        NOW()
    );
    
    -- Item 7: Nubank - Maurício
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Nubank - Maurício', 'PF', 'mauricioferreiiira@gmail.com', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Nubank - Maurício' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        3791.89, 
        '2026-01-07', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        'mauricioferreiiira@gmail.com', 
        NOW()
    );
    
    -- Item 8: Neon - Maurício
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Neon - Maurício', 'PF', '6c27a21f-9e77-49a2-813d-660320469279', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Neon - Maurício' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        862.2, 
        '2026-01-07', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '6c27a21f-9e77-49a2-813d-660320469279', 
        NOW()
    );
    
    -- Item 9: Cartão BB - Maurício
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Cartão BB - Maurício', 'PF', 'mauricioferreiracivil@gmail.com', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Cartão BB - Maurício' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        1335.8, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        'mauricioferreiracivil@gmail.com', 
        NOW()
    );
    
    -- Item 10: Ajuda Mari
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Ajuda Mari', 'PF', '', 'Saúde & Bem-estar')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Ajuda Mari' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        740, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Saúde & Bem-estar', 
        true, 
        true, 
        '', 
        NOW()
    );
    
    -- Item 11: Visa infinity - Bradesco
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Visa infinity - Bradesco', 'PF', '48998138537', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Visa infinity - Bradesco' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        2301.97, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '48998138537', 
        NOW()
    );
    
    -- Item 12: Piscineiro
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Piscineiro', 'PF', '06990413921', 'Moradia (Aluguel/Contas)')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Piscineiro' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        220, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Moradia (Aluguel/Contas)', 
        true, 
        false, 
        '06990413921', 
        NOW()
    );
    
    -- Item 13: Seu Pedro - Jardinagem
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Seu Pedro - Jardinagem', 'PF', '48 99168 3093', 'Moradia (Aluguel/Contas)')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Seu Pedro - Jardinagem' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        200, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Moradia (Aluguel/Contas)', 
        true, 
        false, 
        '48 99168 3093', 
        NOW()
    );
    
    -- Item 14: Maurício - Mercado Pago
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Maurício - Mercado Pago', 'PF', 'Solicitar chave pix - Maurício', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Maurício - Mercado Pago' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        4684.02, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        'Solicitar chave pix - Maurício', 
        NOW()
    );
    
    -- Item 15: Maeli - Mercado pago
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Maeli - Mercado pago', 'PF', '', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Maeli - Mercado pago' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        1516.73, 
        '2026-01-15', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '', 
        NOW()
    );
    
    -- Item 16: Inter - Maeli
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Inter - Maeli', 'PF', '02561037207', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Inter - Maeli' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        3112.83, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '02561037207', 
        NOW()
    );
    
    -- Item 17: Inter - Maurício
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Inter - Maurício', 'PF', '91980987174', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Inter - Maurício' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        1717.61, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '91980987174', 
        NOW()
    );
    
    -- Item 18: Itau Personnalité
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Itau Personnalité', 'PF', '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Itau Personnalité' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        13185.11, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', 
        NOW()
    );
    
    -- Item 19: Financiamento imovel para sogra
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Financiamento imovel para sogra', 'PF', '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', 'Financiamentos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Financiamento imovel para sogra' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        3789.76, 
        '2026-01-15', 
        'Pendente', 
        'Pix', 
        'Financiamentos', 
        true, 
        true, 
        '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', 
        NOW()
    );
    
    -- Item 20: Nubank - Maeli
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Nubank - Maeli', 'PF', 'engsincero13@gmail.com', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Nubank - Maeli' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        2015.1, 
        '2026-01-15', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        'engsincero13@gmail.com', 
        NOW()
    );
    
    -- Item 21: Tiguan 2019 - Parte da folha de pagamento (Dívida fábio)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Tiguan 2019 - Parte da folha de pagamento (Dívida fábio)', 'PF', '48998138537', 'Financiamentos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Tiguan 2019 - Parte da folha de pagamento (Dívida fábio)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        3365, 
        '2026-01-18', 
        'Pendente', 
        'Pix', 
        'Financiamentos', 
        true, 
        true, 
        '48998138537', 
        NOW()
    );
    
    -- Item 22: Nai - serviços contábeis
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Nai - serviços contábeis', 'PF', '34399088000188', 'Serviços Contábeis')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Nai - serviços contábeis' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        100, 
        '2026-01-15', 
        'Pendente', 
        'Pix', 
        'Serviços Contábeis', 
        true, 
        true, 
        '34399088000188', 
        NOW()
    );
    
    -- Item 23: Conta de Agua - Palhoça
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Conta de Agua - Palhoça', 'PF', '1396700-2', 'Moradia (Aluguel/Contas)')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Conta de Agua - Palhoça' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        115, 
        '2026-01-15', 
        'Pendente', 
        'Boleto', 
        'Moradia (Aluguel/Contas)', 
        true, 
        true, 
        '1396700-2', 
        NOW()
    );
    
    -- Item 24: Itau - Azul Visa Infinity
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Itau - Azul Visa Infinity', 'PF', '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Itau - Azul Visa Infinity' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        20232.61, 
        '2026-01-15', 
        'Pendente', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '6731c2e3-a0f2-4fa8-9b79-613ca25ec72', 
        NOW()
    );
    
    -- Item 25: Lote
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Lote', 'PF', 'https://grupostatus.cvcrm.com.br/cliente/financeiro', 'Financiamentos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Lote' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        927, 
        '2026-01-17', 
        'Pendente', 
        'Pix', 
        'Financiamentos', 
        true, 
        true, 
        'https://grupostatus.cvcrm.com.br/cliente/financeiro', 
        NOW()
    );
    
    -- Item 26: Cartão caixa
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Cartão caixa', 'PF', '1049818543090021247428786400116680000000000', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Cartão caixa' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        221.01, 
        '2026-01-17', 
        'Pendente', 
        'Boleto', 
        'Cartão de Crédito', 
        true, 
        true, 
        '1049818543090021247428786400116680000000000', 
        NOW()
    );
    
    -- Item 27: Financiamento da residencia que moro atualmente
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Financiamento da residencia que moro atualmente', 'PF', '4635c66b-03c8-4fd2-8ace-3252453ce029', 'Financiamentos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Financiamento da residencia que moro atualmente' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        3958.11, 
        '2026-01-17', 
        'Pendente', 
        'Pix', 
        'Financiamentos', 
        true, 
        true, 
        '4635c66b-03c8-4fd2-8ace-3252453ce029', 
        NOW()
    );
    
    -- Item 28: Sem parar (tag de estacionamento)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Sem parar (tag de estacionamento)', 'PF', '', 'Transporte (Combustível/IPVA)')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Sem parar (tag de estacionamento)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        150, 
        '2026-01-20', 
        'Pendente', 
        'Pix', 
        'Transporte (Combustível/IPVA)', 
        true, 
        false, 
        '', 
        NOW()
    );
    
    -- Item 29: Claro - conta de internet móvel
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Claro - conta de internet móvel', 'PF', '', 'Assinaturas & Streaming')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Claro - conta de internet móvel' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        132, 
        '2026-01-20', 
        'Pendente', 
        'Boleto', 
        'Assinaturas & Streaming', 
        true, 
        true, 
        '', 
        NOW()
    );
    
    -- Item 30: Adriano - Personal trainer Maurício
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Adriano - Personal trainer Maurício', 'PF', 'projetoevolucaooficial@gmail.com', 'Cuidados Pessoais (Academia/Beleza)')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Adriano - Personal trainer Maurício' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        1200, 
        '2026-01-20', 
        'Pendente', 
        'Pix', 
        'Cuidados Pessoais (Academia/Beleza)', 
        true, 
        false, 
        'projetoevolucaooficial@gmail.com', 
        NOW()
    );
    
    -- Item 31: Jessica - Personal trainer Maeli
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Jessica - Personal trainer Maeli', 'PF', '09857884962', 'Cuidados Pessoais (Academia/Beleza)')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Jessica - Personal trainer Maeli' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        1200, 
        '2026-01-20', 
        'Pendente', 
        'Pix', 
        'Cuidados Pessoais (Academia/Beleza)', 
        true, 
        false, 
        '09857884962', 
        NOW()
    );
    
    -- Item 32: Vivo - Conta de internet móvel
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Vivo - Conta de internet móvel', 'PF', '', 'Assinaturas & Streaming')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Vivo - Conta de internet móvel' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        150, 
        '2026-01-20', 
        'Pendente', 
        'Boleto', 
        'Assinaturas & Streaming', 
        true, 
        true, 
        '', 
        NOW()
    );
    
    -- Item 33: Plano de saúde Bradesco
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Plano de saúde Bradesco', 'PF', 'pix@teslatreinamentos.com.br', 'Plano de Saúde')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Plano de saúde Bradesco' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        1745.84, 
        '2026-01-23', 
        'Pendente', 
        'Pix', 
        'Plano de Saúde', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 34: Cartão Riachuelo
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Cartão Riachuelo', 'PF', 'https://www.midway.com.br/consulta-bolet', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Cartão Riachuelo' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        156, 
        '2026-01-23', 
        'Pendente', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        false, 
        'https://www.midway.com.br/consulta-bolet', 
        NOW()
    );
    
    -- Item 35: Celesc - Maurício (conta de luz)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Celesc - Maurício (conta de luz)', 'PF', '', 'Energia')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Celesc - Maurício (conta de luz)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        588, 
        '2026-01-21', 
        'Pendente', 
        'Boleto', 
        'Energia', 
        true, 
        true, 
        '', 
        NOW()
    );
    
    -- Item 36: Solange - Prestação de serviços domésticos
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Solange - Prestação de serviços domésticos', 'PF', '91988763261', 'Serviços Domésticos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Solange - Prestação de serviços domésticos' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PF', 
        1840, 
        '2026-01-30', 
        'Pendente', 
        'Pix', 
        'Serviços Domésticos', 
        true, 
        true, 
        '91988763261', 
        NOW()
    );
    
    -- Item 37: Aluguel - Maquina de Café
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Aluguel - Maquina de Café', 'PJ', '13691.70509 00200.233708 00001.163278 3 10', 'Aluguel - Empresa')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Aluguel - Maquina de Café' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        400, 
        '2026-01-05', 
        'Pago', 
        'Boleto', 
        'Aluguel - Empresa', 
        true, 
        false, 
        '13691.70509 00200.233708 00001.163278 3 10', 
        NOW()
    );
    
    -- Item 38: Fábio Pires - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Fábio Pires - folha de pagamento', 'PJ', '91982382088', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Fábio Pires - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        15800, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        '91982382088', 
        NOW()
    );
    
    -- Item 39: João Marques - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'João Marques - folha de pagamento', 'PJ', '48.527.247/0001-97', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'João Marques - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        11000, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        '48.527.247/0001-97', 
        NOW()
    );
    
    -- Item 40: Giba - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Giba - folha de pagamento', 'PJ', 'gilberto.alves.mkt@gmail.com', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Giba - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        11000, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        'gilberto.alves.mkt@gmail.com', 
        NOW()
    );
    
    -- Item 41: Abner Duarte - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Abner Duarte - folha de pagamento', 'PJ', '62145064000138', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Abner Duarte - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        10000, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        '62145064000138', 
        NOW()
    );
    
    -- Item 42: Pablo Neves - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Pablo Neves - folha de pagamento', 'PJ', '00315840200', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Pablo Neves - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        5575, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        '00315840200', 
        NOW()
    );
    
    -- Item 43: Geovany Queiroz - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Geovany Queiroz - folha de pagamento', 'PJ', 'giovanyqueiroz1@gmail.com', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Geovany Queiroz - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        3000, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        'giovanyqueiroz1@gmail.com', 
        NOW()
    );
    
    -- Item 44: Emanuelle Duarte - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Emanuelle Duarte - folha de pagamento', 'PJ', 'emanuelleramos30@gmail.com', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Emanuelle Duarte - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        1981, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        'emanuelleramos30@gmail.com', 
        NOW()
    );
    
    -- Item 45: Gabriel Petri - folha de pagamento (ultimo pagamento)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Gabriel Petri - folha de pagamento (ultimo pagamento)', 'PJ', '130.843.629-71', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Gabriel Petri - folha de pagamento (ultimo pagamento)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        590, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        '130.843.629-71', 
        NOW()
    );
    
    -- Item 46: Adson Pires - folha de pagamento (ultimo pagamento)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Adson Pires - folha de pagamento (ultimo pagamento)', 'PJ', 'adsonyure96@gmail.com', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Adson Pires - folha de pagamento (ultimo pagamento)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        835, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        'adsonyure96@gmail.com', 
        NOW()
    );
    
    -- Item 47: Fernando Thunder - folha de pagamento
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Fernando Thunder - folha de pagamento', 'PJ', '059.040.672-83', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Fernando Thunder - folha de pagamento' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        2500, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        '059.040.672-83', 
        NOW()
    );
    
    -- Item 48: Vitor Gabriel - folha de pagamento (ultimo pagamento)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Vitor Gabriel - folha de pagamento (ultimo pagamento)', 'PJ', '07224030201', 'Equipe')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Vitor Gabriel - folha de pagamento (ultimo pagamento)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        1410, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Equipe', 
        true, 
        true, 
        '07224030201', 
        NOW()
    );
    
    -- Item 49: c6 Bank PJ - Cartão de crédito
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'c6 Bank PJ - Cartão de crédito', 'PJ', '00020101021126580014br.gov.bcb.pix0136fe', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'c6 Bank PJ - Cartão de crédito' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        1052.24, 
        '2026-01-06', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        '00020101021126580014br.gov.bcb.pix0136fe', 
        NOW()
    );
    
    -- Item 50: Vero - Provedor de internet Empresa
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Vero - Provedor de internet Empresa', 'PJ', 'http://00020101021226900014br.gov.bcb.pix', 'Gastos pessoais')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Vero - Provedor de internet Empresa' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        150, 
        '2026-01-05', 
        'Pago', 
        'Pix', 
        'Gastos pessoais', 
        true, 
        true, 
        'http://00020101021226900014br.gov.bcb.pix', 
        NOW()
    );
    
    -- Item 51: Consório - Veículo + Construção
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Consório - Veículo + Construção', 'PJ', 'pix@teslatreinamentos.com.br', 'Gastos pessoais')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Consório - Veículo + Construção' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        5545.82, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Gastos pessoais', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 52: Cafe insumos
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Cafe insumos', 'PJ', '', 'Ferramentas - Empresa')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Cafe insumos' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        0, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Ferramentas - Empresa', 
        false, 
        false, 
        '', 
        NOW()
    );
    
    -- Item 53: Internet empresa
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Internet empresa', 'PJ', 'App Minha Vero', 'Gastos pessoais')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Internet empresa' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        131, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Gastos pessoais', 
        true, 
        true, 
        'App Minha Vero', 
        NOW()
    );
    
    -- Item 54: Inter PJ - Cartão de Crédito
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Inter PJ - Cartão de Crédito', 'PJ', 'App Inter Empresas', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Inter PJ - Cartão de Crédito' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        34407.56, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        'App Inter Empresas', 
        NOW()
    );
    
    -- Item 55: Bradesco PJ - Cartão de Crédito
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Bradesco PJ - Cartão de Crédito', 'PJ', 'pix@teslatreinamentos.com.br', 'Cartão de Crédito')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Bradesco PJ - Cartão de Crédito' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        58545.8, 
        '2026-01-10', 
        'Pago', 
        'Pix', 
        'Cartão de Crédito', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 56: Taxa conta - Bradesco
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Taxa conta - Bradesco', 'PJ', 'pix@teslatreinamentos.com.br', 'Relacionamento Bancário')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Taxa conta - Bradesco' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        177.05, 
        '2026-01-15', 
        'Pendente', 
        'Pix', 
        'Relacionamento Bancário', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 57: Pronampe - Empréstimo
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Pronampe - Empréstimo', 'PJ', '565b0d35-6ade-4b34-b200-25be2d6d3352', 'Empréstimos/Financiamentos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Pronampe - Empréstimo' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        4534.04, 
        '2026-01-15', 
        'Pendente', 
        'Pix', 
        'Empréstimos/Financiamentos', 
        true, 
        true, 
        '565b0d35-6ade-4b34-b200-25be2d6d3352', 
        NOW()
    );
    
    -- Item 58: Emprestimo Bradesco 1
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Emprestimo Bradesco 1', 'PJ', 'pix@teslatreinamentos.com.br', 'Empréstimos/Financiamentos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Emprestimo Bradesco 1' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        1906.4, 
        '2026-01-21', 
        'Pendente', 
        'Pix', 
        'Empréstimos/Financiamentos', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 59: Emprestimo Bradesco 2
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Emprestimo Bradesco 2', 'PJ', 'pix@teslatreinamentos.com.br', 'Empréstimos/Financiamentos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Emprestimo Bradesco 2' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        1429.8, 
        '2026-01-21', 
        'Pendente', 
        'Pix', 
        'Empréstimos/Financiamentos', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 60: Seguro Empresa
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Seguro Empresa', 'PJ', 'pix@teslatreinamentos.com.br', 'Aluguel - Empresa')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Seguro Empresa' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        240.86, 
        '2026-01-20', 
        'Pendente', 
        'Pix', 
        'Aluguel - Empresa', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 61: Conta de luz funcionarios Celesc - Pablo e Geo
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Conta de luz funcionarios Celesc - Pablo e Geo', 'PJ', 'App celesc', 'Gastos pessoais')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Conta de luz funcionarios Celesc - Pablo e Geo' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        70, 
        '2026-01-21', 
        'Pendente', 
        'Pix', 
        'Gastos pessoais', 
        true, 
        false, 
        'App celesc', 
        NOW()
    );
    
    -- Item 62: Celesc - Empresa (conta de luz do escritorio)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Celesc - Empresa (conta de luz do escritorio)', 'PJ', 'App celesc', 'Aluguel - Empresa')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Celesc - Empresa (conta de luz do escritorio)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        409, 
        '2026-01-21', 
        'Pendente', 
        'Pix', 
        'Aluguel - Empresa', 
        true, 
        true, 
        'App celesc', 
        NOW()
    );
    
    -- Item 63: Impostos
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Impostos', 'PJ', 'Solicitar ao Maurício', 'Impostos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Impostos' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        36186.19, 
        '2026-01-25', 
        'Pendente', 
        'Pix', 
        'Impostos', 
        true, 
        true, 
        'Solicitar ao Maurício', 
        NOW()
    );
    
    -- Item 64: título de cap - banco do brasil
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'título de cap - banco do brasil', 'PJ', '565b0d35-6ade-4b34-b200-25be2d6d3352', 'Gastos pessoais')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'título de cap - banco do brasil' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        300, 
        '2026-01-30', 
        'Pendente', 
        'Pix', 
        'Gastos pessoais', 
        true, 
        false, 
        '565b0d35-6ade-4b34-b200-25be2d6d3352', 
        NOW()
    );
    
    -- Item 65: Seguro de Vida (Bradesco)
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Seguro de Vida (Bradesco)', 'PJ', 'pix@teslatreinamentos.com.br', 'Relacionamento Bancário')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Seguro de Vida (Bradesco)' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        207.94, 
        '2026-01-30', 
        'Pendente', 
        'Pix', 
        'Relacionamento Bancário', 
        true, 
        true, 
        'pix@teslatreinamentos.com.br', 
        NOW()
    );
    
    -- Item 66: Auxilio Aluguel Funcionarios - Pablo e Geovany
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Auxilio Aluguel Funcionarios - Pablo e Geovany', 'PJ', '34191.09016 90802.158775 51572.770009 4 10', 'Aluguel - Empresa')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Auxilio Aluguel Funcionarios - Pablo e Geovany' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        650, 
        '2026-01-30', 
        'Pendente', 
        'Pix', 
        'Aluguel - Empresa', 
        true, 
        true, 
        '34191.09016 90802.158775 51572.770009 4 10', 
        NOW()
    );
    
    -- Item 67: Imposto negociacao
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Imposto negociacao', 'PJ', '', 'Impostos')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Imposto negociacao' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        520, 
        '2026-01-30', 
        'Pendente', 
        'Pix', 
        'Impostos', 
        true, 
        true, 
        '', 
        NOW()
    );
    
    -- Item 68: Aluguel escritório
    
    -- Inserir Fornecedor se nao existir
    WITH s_ins AS (
        INSERT INTO suppliers (user_id, name, type, pix_key, usual_category)
        VALUES (v_user_id, 'Aluguel escritório', 'PJ', '34191.09016 90802.238775 51572.770009 9 10', 'Aluguel - Empresa')
        ON CONFLICT DO NOTHING
        RETURNING id
    )
    SELECT id INTO v_supplier_id FROM s_ins
    UNION ALL
    SELECT id FROM suppliers WHERE name = 'Aluguel escritório' AND user_id = v_user_id LIMIT 1;

    -- Inserir Conta
    INSERT INTO accounts_payable (
        user_id, supplier_id, workspace, amount, due_date, status, method, category, 
        is_fixed, is_essential, pix_key, created_at
    ) VALUES (
        v_user_id, 
        v_supplier_id, 
        'PJ', 
        2807, 
        '2026-01-30', 
        'Pendente', 
        'Pix', 
        'Aluguel - Empresa', 
        true, 
        true, 
        '34191.09016 90802.238775 51572.770009 9 10', 
        NOW()
    );
    
END $$;
