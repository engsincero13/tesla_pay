const express = require('express');
const cors = require('cors');
const pg = require('pg');
const { Pool } = pg;
const bcrypt = require('bcryptjs');

// Force pg to return DATE columns as plain strings ("YYYY-MM-DD") instead of JS Date objects.
// This prevents timezone shifting when the frontend parses dates.
pg.types.setTypeParser(1082, (val) => val);
const crypto = require('crypto');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
    PLATFORM_BALANCE_FIELDS,
    calculatePlatformBalanceTotals,
    buildDefaultPlatformBalances,
    mergePlatformBalanceItems,
} = require('./platformBalanceConfig');
require('dotenv').config();

const app = express();
const router = express.Router();
const PORT = 3001;
const DEFAULT_PASS = "4CSLTq5YGs";

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes(':"')) {
    connectionString = connectionString.replace(/:"([^"]+)"@/, ':$1@');
}

const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Global error handler for the pool
pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client', err);
    // Don't exit process, pool handles replacement
});

// --- UTILS ---
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateRecoveryCode = () => {
    // 6 chars alphanumeric
    return crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
};

const normalizePlatformBalancePayload = (items = []) => {
    const amountMap = new Map(
        items.map((item) => [
            `${item.platformKey}:${item.fieldKey}`,
            Number(item.amount) || 0,
        ])
    );

    return PLATFORM_BALANCE_FIELDS.map((field) => ({
        ...field,
        amount: amountMap.get(`${field.platformKey}:${field.fieldKey}`) ?? 0,
    }));
};

const normalizeDateInput = (inputDate) => {
    if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
        return inputDate;
    }

    return new Date().toISOString().split('T')[0];
};

const getFinancialEffectiveDate = (row) => row?.effective_date || row?.changed_at || null;

const getFinancialHistoryForDate = async (clientOrPool, effectiveDate) => {
    const result = await clientOrPool.query(`
        SELECT *
        FROM financial_history
        WHERE COALESCE(effective_date, DATE(changed_at)) = $1::date
        ORDER BY changed_at DESC
        LIMIT 1
    `, [effectiveDate]);

    return result.rows[0] || null;
};

const getLatestFinancialHistoryUntilDate = async (clientOrPool, effectiveDate) => {
    const result = await clientOrPool.query(`
        SELECT *
        FROM financial_history
        WHERE COALESCE(effective_date, DATE(changed_at)) <= $1::date
        ORDER BY COALESCE(effective_date, DATE(changed_at)) DESC, changed_at DESC
        LIMIT 1
    `, [effectiveDate]);

    return result.rows[0] || null;
};

const getLatestPlatformSnapshotUntilDate = async (clientOrPool, effectiveDate) => {
    const result = await clientOrPool.query(`
        SELECT id, snapshot_date, total_amount, updated_at, created_at
        FROM platform_balance_snapshots
        WHERE snapshot_date <= $1::date
        ORDER BY snapshot_date DESC, updated_at DESC, created_at DESC
        LIMIT 1
    `, [effectiveDate]);

    return result.rows[0] || null;
};

const upsertFinancialHistoryForDate = async (clientOrPool, effectiveDate, values, changeType) => {
    const existingRow = await getFinancialHistoryForDate(clientOrPool, effectiveDate);

    if (existingRow) {
        const updatedRow = await clientOrPool.query(`
            UPDATE financial_history
            SET operational_balance = $1,
                reserve_balance = $2,
                effective_date = $3::date,
                changed_at = CURRENT_TIMESTAMP,
                change_type = $4
            WHERE id = $5
            RETURNING *
        `, [
            values.operational,
            values.reserve,
            effectiveDate,
            changeType,
            existingRow.id,
        ]);

        return updatedRow.rows[0];
    }

    const insertedRow = await clientOrPool.query(`
        INSERT INTO financial_history (
            balance_id,
            operational_balance,
            reserve_balance,
            effective_date,
            changed_at,
            change_type
        )
        VALUES (NULL, $1, $2, $3::date, CURRENT_TIMESTAMP, $4)
        RETURNING *
    `, [
        values.operational,
        values.reserve,
        effectiveDate,
        changeType,
    ]);

    return insertedRow.rows[0];
};

// --- DB INITIALIZATION & MIGRATION ---
const initDB = async () => {
    try {
        // Pool connects lazily, so we just check connectivity
        // await pool.query('SELECT 1'); 
        console.log('✅ Connected to PostgreSQL (Pool)');

        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(10) CHECK (type IN ('PF', 'PJ')),
                document VARCHAR(50),
                email VARCHAR(255),
                pix_key VARCHAR(255),
                pix_type VARCHAR(50),
                bank_info TEXT,
                usual_category VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS accounts_payable (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
                workspace VARCHAR(10) NOT NULL CHECK (workspace IN ('PF', 'PJ')),
                amount DECIMAL(15, 2) NOT NULL,
                amount_paid DECIMAL(15, 2),
                due_date DATE,
                payment_date TIMESTAMP WITH TIME ZONE,
                status VARCHAR(20) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Programado', 'Pago', 'Atrasado', 'Cancelado')),
                method VARCHAR(20) NOT NULL DEFAULT 'Pix',
                category VARCHAR(100) NOT NULL,
                description TEXT,
                is_fixed BOOLEAN DEFAULT FALSE,
                is_essential BOOLEAN DEFAULT FALSE,
                installments INT,
                current_installment INT,
                tags TEXT[],
                attachments TEXT[],
                pix_key VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(10),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration: Add columns if not exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS recovery_code VARCHAR(6),
            ADD COLUMN IF NOT EXISTS force_change_password BOOLEAN DEFAULT TRUE;
        `);

        // Migration: Create financial_history table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS financial_history (
                id SERIAL PRIMARY KEY,
                balance_id INTEGER, -- Optional FK
                operational_balance DECIMAL(15, 2),
                reserve_balance DECIMAL(15, 2),
                effective_date DATE,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                change_type VARCHAR(50)
            );
        `);

        await pool.query(`
            ALTER TABLE financial_history
            ADD COLUMN IF NOT EXISTS effective_date DATE;
        `);

        await pool.query(`
            UPDATE financial_history
            SET effective_date = DATE(changed_at)
            WHERE effective_date IS NULL;
        `);

        // Migration: Add card_closing_day to accounts_payable
        await pool.query(`
            ALTER TABLE accounts_payable
            ADD COLUMN IF NOT EXISTS card_closing_day INTEGER;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS platform_balance_snapshots (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                snapshot_date DATE DEFAULT CURRENT_DATE,
                total_amount DECIMAL(15, 2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            ALTER TABLE platform_balance_snapshots
            ADD COLUMN IF NOT EXISTS snapshot_date DATE DEFAULT CURRENT_DATE;
        `);

        await pool.query(`
            UPDATE platform_balance_snapshots
            SET snapshot_date = DATE(created_at)
            WHERE snapshot_date IS NULL;
        `);

        await pool.query(`
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
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_platform_balance_snapshots_created_at
            ON platform_balance_snapshots(created_at DESC);
        `);

        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_balance_items_snapshot_field
            ON platform_balance_items(snapshot_id, platform_key, field_key);
        `);

        console.log('✅ Schema migrated (Auth columns, Financial History, Card Closing Day, Platform Balances)');

    } catch (err) {
        console.error('❌ DB Init Error', err);
    }
};
initDB();

// --- API ROUTES ---

// HEALTH CHECK
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



// AUTH SYNC (Keycloak)
router.post('/auth/sync', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        // Find user
        let userRes = await pool.query("SELECT id, name, force_change_password FROM users WHERE email = $1", [email]);

        if (userRes.rows.length === 0) {
            // Create user if not exists (Auto-provisioning)
            const recoveryCode = generateRecoveryCode();
            const hashedDefault = await hashPassword(DEFAULT_PASS);
            const newUser = await pool.query(`
                INSERT INTO users (name, email, password_hash, force_change_password, recovery_code)
                VALUES ($1, $2, $3, FALSE, $4)
                RETURNING id, name, force_change_password
            `, [name || email.split('@')[0], email, hashedDefault, recoveryCode]);
            userRes = newUser;
        }

        const user = userRes.rows[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: email
            }
        });

    } catch (err) {
        console.error("Auth Sync Error:", err);
        res.status(500).json({ success: false, message: "Sync error" });
    }
});




// --- DATA ROUTES (Protected by x-user-id) ---

router.get('/accounts/all', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const query = `
            SELECT 
                ap.id,
                CASE WHEN s.name IS NULL THEN 'Unknown' ELSE s.name END as "supplierName",
                ap.amount::float,
                ap.due_date as "dueDate",
                ap.status,
                ap.workspace,
                ap.category,
                ap.method,
                ap.pix_key as "pixKey",
                ap.payment_date as "paymentDate",
                ap.card_closing_day as "cardClosingDay"
            FROM accounts_payable ap
            LEFT JOIN suppliers s ON ap.supplier_id = s.id
            ORDER BY ap.due_date ASC
        `;
        const result = await pool.query(query); // Shared view
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/accounts', async (req, res) => {
    try {
        const { workspace, supplierName, amount, dueDate, status, method, category, pixKey, cardClosingDay } = req.body;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Find or Create Supplier
        let supplierId;
        const supRes = await pool.query("SELECT id FROM suppliers WHERE name = $1 LIMIT 1", [supplierName]);
        if (supRes.rows.length > 0) {
            supplierId = supRes.rows[0].id;
        } else {
            const newSup = await pool.query(
                "INSERT INTO suppliers (user_id, name, type, pix_key) VALUES ($1, $2, $3, $4) RETURNING id",
                [userId, supplierName, workspace, pixKey || null]
            );
            supplierId = newSup.rows[0].id;
        }

        // Convert empty strings to null for date fields
        const sanitizedDueDate = dueDate && dueDate.trim() !== '' ? dueDate : null;

        const newAcc = await pool.query(`
            INSERT INTO accounts_payable 
            (user_id, supplier_id, amount, due_date, status, workspace, category, method, pix_key, card_closing_day)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
        `, [userId, supplierId, amount, sanitizedDueDate, status, workspace, category, method, pixKey || null, cardClosingDay || null]);

        res.json({ success: true, id: newAcc.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/replicate', async (req, res) => {
    try {
        const { sourceMonth, sourceYear } = req.body;
        const userId = req.headers['x-user-id'];
        console.log(`[Replicate] User: ${userId}, Source: ${sourceMonth}/${sourceYear}, Type: ${typeof sourceMonth}`);

        const sMonth = parseInt(sourceMonth);
        const sYear = parseInt(sourceYear);

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const query = `
            INSERT INTO accounts_payable (
                user_id, supplier_id, amount, due_date, status, workspace, category, method, pix_key, card_closing_day
            )
            SELECT 
                $1, supplier_id, amount, 
                CASE 
                    WHEN due_date IS NOT NULL THEN due_date + INTERVAL '1 month'
                    ELSE NULL
                END,
                'Pendente', workspace, category, method, pix_key, card_closing_day
            FROM accounts_payable
            WHERE (
                (due_date >= make_date($3, $2, 1) AND due_date < make_date($3, $2, 1) + INTERVAL '1 month')
                OR (due_date IS NULL AND user_id = $1)
            )
        `;

        const result = await pool.query(query, [userId, sMonth + 1, sYear]);
        const successCount = result.rowCount;
        console.log(`[Replicate] Inserted ${successCount} rows.`);

        res.json({ success: true, count: successCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/balances', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const requestedDate = req.query.date ? normalizeDateInput(req.query.date) : null;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const balanceRow = requestedDate
            ? await getLatestFinancialHistoryUntilDate(pool, requestedDate)
            : (await pool.query(`
                SELECT *
                FROM financial_history
                ORDER BY COALESCE(effective_date, DATE(changed_at)) DESC, changed_at DESC
                LIMIT 1
            `)).rows[0] || null;

        if (balanceRow) {
            const sourceDate = getFinancialEffectiveDate(balanceRow);
            res.json({
                operational: parseFloat(balanceRow.operational_balance),
                reserve: parseFloat(balanceRow.reserve_balance),
                date: requestedDate || sourceDate,
                sourceDate,
                lastUpdatedAt: balanceRow.changed_at,
            });
        } else {
            let operational = 0;
            let snapshotDate = requestedDate;
            let lastUpdatedAt = null;

            if (requestedDate) {
                const latestSnapshot = await getLatestPlatformSnapshotUntilDate(pool, requestedDate);
                if (latestSnapshot) {
                    operational = Number(latestSnapshot.total_amount);
                    snapshotDate = latestSnapshot.snapshot_date;
                    lastUpdatedAt = latestSnapshot.updated_at || latestSnapshot.created_at;
                }
            }

            res.json({
                operational,
                reserve: 0,
                date: requestedDate,
                sourceDate: snapshotDate,
                lastUpdatedAt,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/balances/history', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const type = req.query.type || 'reserve'; // default to reserve

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const column = type === 'operational' ? 'operational_balance' : 'reserve_balance';

        // Retrieve last 30 days of history
        const query = `
            SELECT 
                ${column} as "value",
                COALESCE(effective_date, DATE(changed_at)) as "date"
            FROM financial_history
            WHERE COALESCE(effective_date, DATE(changed_at)) >= CURRENT_DATE - INTERVAL '45 days'
            ORDER BY COALESCE(effective_date, DATE(changed_at)) ASC, changed_at ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/platform-balances', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const requestedDate = normalizeDateInput(req.query.date);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const snapshot = await getLatestPlatformSnapshotUntilDate(pool, requestedDate);

        if (!snapshot) {
            return res.json(buildDefaultPlatformBalances(requestedDate, null));
        }

        const itemsRes = await pool.query(`
            SELECT
                platform_key as "platformKey",
                platform_label as "platformLabel",
                field_key as "fieldKey",
                field_label as "fieldLabel",
                amount::float as "amount",
                display_order as "displayOrder"
            FROM platform_balance_items
            WHERE snapshot_id = $1
            ORDER BY display_order ASC
        `, [snapshot.id]);

        res.json(
            mergePlatformBalanceItems(
                itemsRes.rows,
                snapshot.snapshot_date,
                snapshot.updated_at || snapshot.created_at,
            )
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/platform-balances', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const payloadItems = Array.isArray(req.body?.items) ? req.body.items : null;
    const effectiveDate = normalizeDateInput(req.body?.date);
    if (!payloadItems) {
        return res.status(400).json({ error: "Items are required" });
    }

    const normalizedItems = normalizePlatformBalancePayload(payloadItems);
    const { grandTotal: totalAmount } = calculatePlatformBalanceTotals(normalizedItems);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingSnapshotRes = await client.query(`
            SELECT id
            FROM platform_balance_snapshots
            WHERE snapshot_date = $1::date
            ORDER BY updated_at DESC, created_at DESC
            LIMIT 1
        `, [effectiveDate]);

        let snapshotId = existingSnapshotRes.rows[0]?.id;

        if (snapshotId) {
            await client.query(`
                UPDATE platform_balance_snapshots
                SET user_id = $1,
                    total_amount = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
            `, [userId, totalAmount, snapshotId]);

            await client.query(`
                DELETE FROM platform_balance_items
                WHERE snapshot_id = $1
            `, [snapshotId]);
        } else {
            const snapshotRes = await client.query(`
                INSERT INTO platform_balance_snapshots (
                    user_id,
                    snapshot_date,
                    total_amount,
                    updated_at
                )
                VALUES ($1, $2::date, $3, CURRENT_TIMESTAMP)
                RETURNING id
            `, [userId, effectiveDate, totalAmount]);

            snapshotId = snapshotRes.rows[0].id;
        }

        for (const item of normalizedItems) {
            await client.query(`
                INSERT INTO platform_balance_items (
                    snapshot_id,
                    platform_key,
                    platform_label,
                    field_key,
                    field_label,
                    amount,
                    display_order,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            `, [
                snapshotId,
                item.platformKey,
                item.platformLabel,
                item.fieldKey,
                item.fieldLabel,
                item.amount,
                item.displayOrder,
            ]);
        }

        const currentDayHistory = await getFinancialHistoryForDate(client, effectiveDate);
        let reserveBalance = currentDayHistory ? Number(currentDayHistory.reserve_balance) : 0;

        if (!currentDayHistory) {
            const latestUntilDate = await getLatestFinancialHistoryUntilDate(client, effectiveDate);
            if (latestUntilDate) {
                reserveBalance = Number(latestUntilDate.reserve_balance);
            }
        }

        await upsertFinancialHistoryForDate(
            client,
            effectiveDate,
            {
                operational: totalAmount,
                reserve: reserveBalance,
            },
            'PLATFORM_SET',
        );

        await client.query('COMMIT');

        res.json({
            ...mergePlatformBalanceItems(normalizedItems, effectiveDate, new Date().toISOString()),
            operational: totalAmount,
            reserve: reserveBalance,
            lastUpdatedAt: new Date().toISOString(),
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


router.post('/balances/adjust', async (req, res) => {
    try {
        const { operationalDelta, reserveDelta } = req.body;
        const userId = req.headers['x-user-id'];

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // Fetch latest history to determine current base
        const latestRes = await pool.query(`
            SELECT *
            FROM financial_history
            ORDER BY COALESCE(effective_date, DATE(changed_at)) DESC, changed_at DESC
            LIMIT 1
        `);

        let currentOp = 0;
        let currentRes = 0;

        if (latestRes.rows.length > 0) {
            currentOp = Number(latestRes.rows[0].operational_balance);
            currentRes = Number(latestRes.rows[0].reserve_balance);
        }

        const newOp = currentOp + (Number(operationalDelta) || 0);
        const newRes = currentRes + (Number(reserveDelta) || 0);

        // UPSERT: Check if we already have a record for today
        const todayCheck = await pool.query(`
            SELECT id
            FROM financial_history
            WHERE COALESCE(effective_date, DATE(changed_at)) = CURRENT_DATE
            ORDER BY changed_at DESC
            LIMIT 1
        `);

        if (todayCheck.rows.length > 0) {
            // Update existing
            await pool.query(`
                UPDATE financial_history 
                SET operational_balance = $1,
                    reserve_balance = $2,
                    effective_date = CURRENT_DATE,
                    changed_at = CURRENT_TIMESTAMP,
                    change_type = 'ADJUST' 
                WHERE id = $3
            `, [newOp, newRes, todayCheck.rows[0].id]);
        } else {
            // Insert new
            await pool.query(`
                INSERT INTO financial_history (balance_id, operational_balance, reserve_balance, effective_date, changed_at, change_type)
                VALUES (NULL, $1, $2, CURRENT_DATE, CURRENT_TIMESTAMP, 'ADJUST')
            `, [newOp, newRes]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/balances', async (req, res) => {
    try {
        const { operational, reserve } = req.body;
        const userId = req.headers['x-user-id'];
        const effectiveDate = normalizeDateInput(req.body?.effectiveDate);

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const currentDayRow = await getFinancialHistoryForDate(pool, effectiveDate);
        let baseRow = currentDayRow;

        if (!baseRow) {
            baseRow = await getLatestFinancialHistoryUntilDate(pool, effectiveDate);
        }

        const platformSnapshotRes = await pool.query(`
            SELECT total_amount
            FROM platform_balance_snapshots
            WHERE snapshot_date = $1::date
            ORDER BY updated_at DESC, created_at DESC
            LIMIT 1
        `, [effectiveDate]);

        const platformOperational = platformSnapshotRes.rows.length > 0
            ? Number(platformSnapshotRes.rows[0].total_amount)
            : 0;

        const currentRes = baseRow ? Number(baseRow.reserve_balance) : 0;
        const fallbackOp = platformSnapshotRes.rows.length > 0
            ? platformOperational
            : (baseRow ? Number(baseRow.operational_balance) : 0);
        const newOp = operational !== undefined ? operational : fallbackOp;
        const newRes = reserve !== undefined ? reserve : currentRes;

        const savedRow = await upsertFinancialHistoryForDate(
            pool,
            effectiveDate,
            {
                operational: newOp,
                reserve: newRes,
            },
            'SET',
        );

        res.json({
            success: true,
            operational: Number(savedRow.operational_balance),
            reserve: Number(savedRow.reserve_balance),
            date: effectiveDate,
            sourceDate: getFinancialEffectiveDate(savedRow),
            lastUpdatedAt: savedRow.changed_at,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name, type } = req.body;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!name || !type) return res.status(400).json({ error: "Name and Type are required" });

        const result = await pool.query(
            "INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *",
            [name, type]
        );
        res.json({ success: true, category: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await pool.query(
            "UPDATE categories SET name = $1, type = $2 WHERE id = $3",
            [name, type, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



router.put('/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { workspace, supplierName, amount, dueDate, status, method, category, pixKey, cardClosingDay } = req.body;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        let supplierId;
        if (supplierName) {
            const supRes = await pool.query("SELECT id FROM suppliers WHERE name = $1 LIMIT 1", [supplierName]);
            if (supRes.rows.length > 0) {
                supplierId = supRes.rows[0].id;
            } else {
                const newSup = await pool.query(
                    "INSERT INTO suppliers (user_id, name, type, pix_key) VALUES ($1, $2, $3, $4) RETURNING id",
                    [userId, supplierName, workspace, pixKey]
                );
                supplierId = newSup.rows[0].id;
            }
        }

        let query = 'UPDATE accounts_payable SET updated_at = CURRENT_TIMESTAMP';
        const values = [];
        let idx = 1;

        if (supplierId) { query += `, supplier_id = $${idx++}`; values.push(supplierId); }
        if (workspace) { query += `, workspace = $${idx++}`; values.push(workspace); }
        if (amount) { query += `, amount = $${idx++}`; values.push(amount); }
        if (dueDate !== undefined) {
            const sanitizedDueDate = dueDate && dueDate.trim() !== '' ? dueDate : null;
            query += `, due_date = $${idx++}`;
            values.push(sanitizedDueDate);
        }
        if (status) { query += `, status = $${idx++}`; values.push(status); }
        if (method) { query += `, method = $${idx++}`; values.push(method); }
        if (category) { query += `, category = $${idx++}`; values.push(category); }
        if (pixKey !== undefined) { query += `, pix_key = $${idx++}`; values.push(pixKey || null); }
        if (cardClosingDay !== undefined) { query += `, card_closing_day = $${idx++}`; values.push(cardClosingDay || null); }


        query += ` WHERE id = $${idx++}`;
        values.push(id);

        await pool.query(query, values);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await pool.query('DELETE FROM accounts_payable WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.post('/parse', async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(`
            Extraia os dados deste texto para um JSON estrito (sem markdown):
            "${prompt}"
            Campos necessários: supplierName, amount (number), dueDate (YYYY-MM-DD), workspace (PF/PJ), category, method, pixKey.
        `);

        const response = result.response;
        let text = response.text();

        // Clean markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(text);
        res.json(parsed);
    } catch (err) {
        console.error("AI Parse Error:", err);
        res.status(500).json({ error: "Falha ao processar com IA" });
    }
});

// --- WEBHOOK: Platform Balances (external integration) ---
router.post('/webhook/platform-balances', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.WEBHOOK_API_KEY) {
        return res.status(401).json({ error: "Invalid or missing API key" });
    }

    const { date, balances } = req.body;

    if (!balances || typeof balances !== 'object') {
        return res.status(400).json({ error: "Field 'balances' is required and must be an object" });
    }

    // Build valid platformKey:fieldKey index from config
    const validFields = new Map(
        PLATFORM_BALANCE_FIELDS.map(f => [`${f.platformKey}:${f.fieldKey}`, f])
    );

    // Convert grouped payload to items array
    const items = [];
    const invalidKeys = [];

    for (const [platformKey, fields] of Object.entries(balances)) {
        if (!fields || typeof fields !== 'object') continue;

        for (const [fieldKey, amount] of Object.entries(fields)) {
            const key = `${platformKey}:${fieldKey}`;
            const configField = validFields.get(key);

            if (!configField) {
                invalidKeys.push(key);
                continue;
            }

            items.push({
                platformKey: configField.platformKey,
                platformLabel: configField.platformLabel,
                fieldKey: configField.fieldKey,
                fieldLabel: configField.fieldLabel,
                amount: Number(amount) || 0,
                displayOrder: configField.displayOrder,
                balanceCategory: configField.balanceCategory,
            });
        }
    }

    if (items.length === 0) {
        return res.status(400).json({
            error: "No valid balance fields found",
            invalidKeys,
        });
    }

    const effectiveDate = normalizeDateInput(date);
    const normalizedItems = normalizePlatformBalancePayload(items);
    const { grandTotal: totalAmount } = calculatePlatformBalanceTotals(normalizedItems);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Upsert snapshot for the date
        const existingSnapshotRes = await client.query(`
            SELECT id
            FROM platform_balance_snapshots
            WHERE snapshot_date = $1::date
            ORDER BY updated_at DESC, created_at DESC
            LIMIT 1
        `, [effectiveDate]);

        let snapshotId = existingSnapshotRes.rows[0]?.id;

        if (snapshotId) {
            await client.query(`
                UPDATE platform_balance_snapshots
                SET total_amount = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [totalAmount, snapshotId]);

            await client.query(`
                DELETE FROM platform_balance_items
                WHERE snapshot_id = $1
            `, [snapshotId]);
        } else {
            const snapshotRes = await client.query(`
                INSERT INTO platform_balance_snapshots (
                    snapshot_date,
                    total_amount,
                    updated_at
                )
                VALUES ($1::date, $2, CURRENT_TIMESTAMP)
                RETURNING id
            `, [effectiveDate, totalAmount]);

            snapshotId = snapshotRes.rows[0].id;
        }

        // Insert all items
        for (const item of normalizedItems) {
            await client.query(`
                INSERT INTO platform_balance_items (
                    snapshot_id,
                    platform_key,
                    platform_label,
                    field_key,
                    field_label,
                    amount,
                    display_order,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            `, [
                snapshotId,
                item.platformKey,
                item.platformLabel,
                item.fieldKey,
                item.fieldLabel,
                item.amount,
                item.displayOrder,
            ]);
        }

        // Sync financial_history
        const currentDayHistory = await getFinancialHistoryForDate(client, effectiveDate);
        let reserveBalance = currentDayHistory ? Number(currentDayHistory.reserve_balance) : 0;

        if (!currentDayHistory) {
            const latestUntilDate = await getLatestFinancialHistoryUntilDate(client, effectiveDate);
            if (latestUntilDate) {
                reserveBalance = Number(latestUntilDate.reserve_balance);
            }
        }

        await upsertFinancialHistoryForDate(
            client,
            effectiveDate,
            {
                operational: totalAmount,
                reserve: reserveBalance,
            },
            'WEBHOOK_SET',
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            date: effectiveDate,
            totalAmount,
            reserveBalance,
            itemsProcessed: items.length,
            ...(invalidKeys.length > 0 ? { invalidKeys } : {}),
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Webhook platform-balances error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// MOUNT ROUTER
app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
