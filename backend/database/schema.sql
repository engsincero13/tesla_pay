-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable if using external auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Optional: if suppliers belong to specific users
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('PF', 'PJ')),
    document VARCHAR(50), -- CPF or CNPJ
    email VARCHAR(255),
    pix_key VARCHAR(255),
    pix_type VARCHAR(50),
    bank_info TEXT,
    usual_category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: accounts_payable
CREATE TABLE IF NOT EXISTS accounts_payable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    workspace VARCHAR(10) NOT NULL CHECK (workspace IN ('PF', 'PJ')),
    
    amount DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2),
    
    due_date DATE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Programado', 'Pago', 'Atrasado', 'Cancelado')),
    method VARCHAR(20) NOT NULL DEFAULT 'Pix' CHECK (method IN ('Pix', 'Boleto', 'Transferência', 'Cartão', 'Dinheiro')),
    category VARCHAR(100) NOT NULL,
    
    description TEXT,
    is_fixed BOOLEAN DEFAULT FALSE,
    is_essential BOOLEAN DEFAULT FALSE,
    
    installments INT,
    current_installment INT,
    
    tags TEXT[], -- Array of strings for tags
    attachments TEXT[], -- Array of URLs/paths
    
    pix_key VARCHAR(255), -- Snapshot of pix key at time of creation, or override
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_accounts_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_status ON accounts_payable(status);
CREATE INDEX idx_accounts_workspace ON accounts_payable(workspace);
CREATE INDEX idx_accounts_user_id ON accounts_payable(user_id);

-- Table: financial_balances
CREATE TABLE IF NOT EXISTS financial_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    operational_balance DECIMAL(15, 2) DEFAULT 0,
    reserve_balance DECIMAL(15, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint to ensure only one balance row per user (for now)
CREATE UNIQUE INDEX idx_balances_user_id ON financial_balances(user_id);

-- Table: financial_history
CREATE TABLE IF NOT EXISTS financial_history (
    id SERIAL PRIMARY KEY,
    balance_id INTEGER,
    operational_balance DECIMAL(15, 2),
    reserve_balance DECIMAL(15, 2),
    effective_date DATE,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_type VARCHAR(50)
);

-- Table: platform_balance_snapshots
CREATE TABLE IF NOT EXISTS platform_balance_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    snapshot_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platform_balance_snapshots_created_at
ON platform_balance_snapshots(created_at DESC);

-- Table: platform_balance_items
CREATE TABLE IF NOT EXISTS platform_balance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES platform_balance_snapshots(id) ON DELETE CASCADE,
    platform_key VARCHAR(50) NOT NULL,
    platform_label VARCHAR(100) NOT NULL,
    field_key VARCHAR(50) NOT NULL,
    field_label VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_platform_balance_items_snapshot_field
ON platform_balance_items(snapshot_id, platform_key, field_key);

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('PF', 'PJ')), -- Optional context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
