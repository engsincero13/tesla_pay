const PLATFORM_BALANCE_FIELDS = [
    {
        platformKey: 'mercado_pago',
        platformLabel: 'Mercado Pago',
        fieldKey: 'saldo_disponivel',
        fieldLabel: 'Saldo disponivel',
        balanceCategory: 'available',
        displayOrder: 1,
    },
    {
        platformKey: 'mercado_pago',
        platformLabel: 'Mercado Pago',
        fieldKey: 'dinheiro_a_liberar',
        fieldLabel: 'Dinheiro a liberar',
        balanceCategory: 'receivable',
        displayOrder: 2,
    },
    {
        platformKey: 'inter',
        platformLabel: 'Inter',
        fieldKey: 'conta_corrente',
        fieldLabel: 'Conta corrente',
        balanceCategory: 'available',
        displayOrder: 3,
    },
    {
        platformKey: 'inter',
        platformLabel: 'Inter',
        fieldKey: 'investido',
        fieldLabel: 'Investido',
        balanceCategory: 'available',
        displayOrder: 4,
    },
    {
        platformKey: 'pagarme',
        platformLabel: 'Pagar.me',
        fieldKey: 'saldo_atual',
        fieldLabel: 'Saldo disponivel',
        balanceCategory: 'available',
        displayOrder: 5,
    },
    {
        platformKey: 'pagarme',
        platformLabel: 'Pagar.me',
        fieldKey: 'a_receber',
        fieldLabel: 'A receber',
        balanceCategory: 'receivable',
        displayOrder: 6,
    },
    {
        platformKey: 'pagarme_pos',
        platformLabel: 'Pagar.me Pos',
        fieldKey: 'saldo_atual',
        fieldLabel: 'Saldo disponivel',
        balanceCategory: 'available',
        displayOrder: 7,
    },
    {
        platformKey: 'pagarme_pos',
        platformLabel: 'Pagar.me Pos',
        fieldKey: 'a_receber',
        fieldLabel: 'A receber',
        balanceCategory: 'receivable',
        displayOrder: 8,
    },
    {
        platformKey: 'hotmart',
        platformLabel: 'Hotmart',
        fieldKey: 'saldo_total',
        fieldLabel: 'Saldo disponivel',
        balanceCategory: 'available',
        displayOrder: 9,
    },
    {
        platformKey: 'hotmart',
        platformLabel: 'Hotmart',
        fieldKey: 'a_receber',
        fieldLabel: 'A receber',
        balanceCategory: 'receivable',
        displayOrder: 10,
    },
    {
        platformKey: 'tmb',
        platformLabel: 'TMB',
        fieldKey: 'saldo_total',
        fieldLabel: 'Saldo disponivel',
        balanceCategory: 'available',
        displayOrder: 11,
    },
    {
        platformKey: 'tmb',
        platformLabel: 'TMB',
        fieldKey: 'a_receber',
        fieldLabel: 'A receber',
        balanceCategory: 'receivable',
        displayOrder: 12,
    },
    {
        platformKey: 'youshopp',
        platformLabel: 'Youshopp',
        fieldKey: 'saldo_total',
        fieldLabel: 'Saldo disponivel',
        balanceCategory: 'available',
        displayOrder: 13,
    },
    {
        platformKey: 'youshopp',
        platformLabel: 'Youshopp',
        fieldKey: 'a_receber',
        fieldLabel: 'A receber',
        balanceCategory: 'receivable',
        displayOrder: 14,
    },
];

function calculatePlatformBalanceTotals(items = []) {
    const availableTotal = items.reduce(
        (sum, item) => sum + (item.balanceCategory === 'available' ? Number(item.amount) || 0 : 0),
        0,
    );
    const receivableTotal = items.reduce(
        (sum, item) => sum + (item.balanceCategory === 'receivable' ? Number(item.amount) || 0 : 0),
        0,
    );
    const grandTotal = availableTotal + receivableTotal;

    return {
        availableTotal,
        receivableTotal,
        grandTotal,
        total: grandTotal,
    };
}

function buildDefaultPlatformBalances(snapshotDate = null, lastUpdatedAt = null) {
    return {
        snapshotDate,
        lastUpdatedAt,
        ...calculatePlatformBalanceTotals([]),
        items: PLATFORM_BALANCE_FIELDS.map((field) => ({
            ...field,
            amount: 0,
        })),
    };
}

function mergePlatformBalanceItems(rows = [], snapshotDate = null, lastUpdatedAt = null) {
    const amountMap = new Map(
        rows.map((row) => [`${row.platformKey}:${row.fieldKey}`, Number(row.amount) || 0])
    );

    const items = PLATFORM_BALANCE_FIELDS.map((field) => ({
        ...field,
        amount: amountMap.get(`${field.platformKey}:${field.fieldKey}`) ?? 0,
    }));

    return {
        snapshotDate,
        lastUpdatedAt,
        ...calculatePlatformBalanceTotals(items),
        items,
    };
}

module.exports = {
    PLATFORM_BALANCE_FIELDS,
    calculatePlatformBalanceTotals,
    buildDefaultPlatformBalances,
    mergePlatformBalanceItems,
};
