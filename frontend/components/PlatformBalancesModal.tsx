import React, { useEffect, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import { PlatformBalanceItem, PlatformBalanceSnapshot } from '../types';
import { calculatePlatformBalanceTotals, PLATFORM_BALANCE_FIELDS } from '../data/platformBalances';
import { formatCurrency } from '../utils/formatCurrency';

interface PlatformBalancesModalProps {
    isOpen: boolean;
    onClose: () => void;
    balances: PlatformBalanceSnapshot;
    selectedDate: string;
    onSelectedDateChange: (date: string) => void;
    onSave: (items: Pick<PlatformBalanceItem, 'platformKey' | 'fieldKey' | 'amount'>[]) => Promise<void>;
}

const getItemKey = (platformKey: string, fieldKey: string) => `${platformKey}:${fieldKey}`;

const parseCurrencyInput = (inputValue: string) => {
    const isNegative = inputValue.includes('-');
    const digits = inputValue.replace(/\D/g, '');

    if (!digits) {
        return 0;
    }

    const parsedValue = parseInt(digits, 10) / 100;
    return isNegative ? -parsedValue : parsedValue;
};

export const PlatformBalancesModal = ({
    isOpen,
    onClose,
    balances,
    selectedDate,
    onSelectedDateChange,
    onSave,
}: PlatformBalancesModalProps) => {
    const [values, setValues] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const balanceCategoryStyles = {
        available: {
            label: 'text-emerald-700 dark:text-emerald-300',
            value: 'text-emerald-700 dark:text-emerald-300',
            panel: 'border-emerald-500/20 bg-emerald-500/5',
            inputFocus: 'focus:border-emerald-500',
        },
        receivable: {
            label: 'text-amber-700 dark:text-amber-300',
            value: 'text-amber-700 dark:text-amber-300',
            panel: 'border-amber-500/20 bg-amber-500/5',
            inputFocus: 'focus:border-amber-500',
        },
        total: {
            label: 'text-sky-700 dark:text-sky-300',
            value: 'text-sky-700 dark:text-sky-300',
            panel: 'border-sky-500/20 bg-sky-500/5',
        },
    } as const;

    useEffect(() => {
        if (!isOpen) return;

        const nextValues = balances.items.reduce<Record<string, number>>((acc, item) => {
            acc[getItemKey(item.platformKey, item.fieldKey)] = item.amount;
            return acc;
        }, {});

        setValues(nextValues);
    }, [balances, isOpen]);

    const totals = useMemo(
        () => calculatePlatformBalanceTotals(
            PLATFORM_BALANCE_FIELDS.map((field) => ({
                balanceCategory: field.balanceCategory,
                amount: values[getItemKey(field.platformKey, field.fieldKey)] ?? 0,
            })),
        ),
        [values],
    );

    const groupedFields = useMemo(
        () => PLATFORM_BALANCE_FIELDS.reduce<Array<{
            platformKey: string;
            platformLabel: string;
            fields: typeof PLATFORM_BALANCE_FIELDS;
        }>>((groups, field) => {
            const currentGroup = groups[groups.length - 1];

            if (!currentGroup || currentGroup.platformKey !== field.platformKey) {
                groups.push({
                    platformKey: field.platformKey,
                    platformLabel: field.platformLabel,
                    fields: [field],
                });
                return groups;
            }

            currentGroup.fields.push(field);
            return groups;
        }, []),
        [],
    );

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            await onSave(
                PLATFORM_BALANCE_FIELDS.map((field) => ({
                    platformKey: field.platformKey,
                    fieldKey: field.fieldKey,
                    amount: values[getItemKey(field.platformKey, field.fieldKey)] ?? 0,
                })),
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl overflow-hidden rounded-[36px] bg-white shadow-2xl dark:bg-[#1C1C1E]">
                <div className="flex items-start justify-between border-b border-border px-6 py-5 md:px-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Edicao de saldos
                        </p>
                        <h3 className="mt-1 text-2xl font-black tracking-tight text-card-foreground">
                            Saldos de Plataforma
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Preencha os valores por plataforma. Os totais disponivel, a receber e geral sao atualizados automaticamente.
                        </p>
                        <div className="mt-4 max-w-xs">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                Data do snapshot
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(event) => onSelectedDateChange(event.target.value)}
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-card-foreground outline-none transition-colors focus:border-primary"
                            />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-2xl border border-border p-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="max-h-[65vh] overflow-y-auto px-6 py-6 md:px-8">
                        <div className="overflow-x-auto rounded-3xl border border-border">
                            <table className="min-w-full">
                                <thead className="bg-muted/50 text-left text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Plataforma</th>
                                        <th className="px-4 py-3">Dado</th>
                                        <th className="px-4 py-3 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedFields.map((group) => (
                                        <React.Fragment key={group.platformKey}>
                                            {group.fields.map((field, index) => {
                                                const itemKey = getItemKey(field.platformKey, field.fieldKey);

                                                return (
                                                    <tr key={itemKey} className="border-t border-border/80">
                                                        <td className="px-4 py-3 align-top font-bold text-card-foreground">
                                                            {index === 0 ? group.platformLabel : ''}
                                                        </td>
                                                        <td className={`px-4 py-3 align-top font-medium ${balanceCategoryStyles[field.balanceCategory].label}`}>
                                                            {field.fieldLabel}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                value={formatCurrency(values[itemKey] ?? 0)}
                                                                onChange={(e) => {
                                                                    const nextValue = parseCurrencyInput(e.target.value);
                                                                    setValues((prev) => ({
                                                                        ...prev,
                                                                        [itemKey]: nextValue,
                                                                    }));
                                                                }}
                                                                className={`w-full rounded-2xl border border-border bg-background px-4 py-3 text-right font-mono font-bold outline-none transition-colors ${balanceCategoryStyles[field.balanceCategory].value} ${balanceCategoryStyles[field.balanceCategory].inputFocus}`}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-border px-6 py-5 md:px-8">
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className={`rounded-2xl border px-4 py-3 ${balanceCategoryStyles.available.panel}`}>
                                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${balanceCategoryStyles.available.label}`}>
                                    Total disponivel
                                </p>
                                <p className={`mt-1 text-2xl font-black tracking-tight ${balanceCategoryStyles.available.value}`}>
                                    {formatCurrency(totals.availableTotal)}
                                </p>
                            </div>
                            <div className={`rounded-2xl border px-4 py-3 ${balanceCategoryStyles.receivable.panel}`}>
                                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${balanceCategoryStyles.receivable.label}`}>
                                    Total a receber
                                </p>
                                <p className={`mt-1 text-2xl font-black tracking-tight ${balanceCategoryStyles.receivable.value}`}>
                                    {formatCurrency(totals.receivableTotal)}
                                </p>
                            </div>
                            <div className={`rounded-2xl border px-4 py-3 ${balanceCategoryStyles.total.panel}`}>
                                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${balanceCategoryStyles.total.label}`}>
                                    Total geral
                                </p>
                                <p className={`mt-1 text-2xl font-black tracking-tight ${balanceCategoryStyles.total.value}`}>
                                    {formatCurrency(totals.grandTotal)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-2xl border border-border px-5 py-3 font-bold text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={18} />
                                {isSaving ? 'Salvando...' : 'Salvar saldos'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
