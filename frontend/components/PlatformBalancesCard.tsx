import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Landmark } from 'lucide-react';
import { PlatformBalanceItem, PlatformBalanceSnapshot } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface PlatformBalancesCardProps {
    balances: PlatformBalanceSnapshot;
    selectedDate: string;
    onSelectedDateChange: (date: string) => void;
}

export const PlatformBalancesCard = ({
    balances,
    selectedDate,
    onSelectedDateChange,
}: PlatformBalancesCardProps) => {
    const [detailsVisibility, setDetailsVisibility] = useState<'hidden' | 'visible'>('hidden');

    const balanceCategoryStyles = {
        available: {
            label: 'text-emerald-700 dark:text-emerald-300',
            value: 'text-emerald-700 dark:text-emerald-300',
        },
        receivable: {
            label: 'text-amber-700 dark:text-amber-300',
            value: 'text-amber-700 dark:text-amber-300',
        },
        total: {
            label: 'text-sky-700 dark:text-sky-300',
            value: 'text-sky-700 dark:text-sky-300',
        },
    } as const;

    const formatDateTime = (value?: string | null) => {
        if (!value) return 'Sem atualizacao registrada';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    const groupedRows = balances.items.reduce<Array<{
        platformKey: string;
        platformLabel: string;
        items: PlatformBalanceItem[];
    }>>((groups, item) => {
        const currentGroup = groups[groups.length - 1];

        if (!currentGroup || currentGroup.platformKey !== item.platformKey) {
            groups.push({
                platformKey: item.platformKey,
                platformLabel: item.platformLabel,
                items: [item],
            });
            return groups;
        }

        currentGroup.items.push(item);
        return groups;
    }, []);

    return (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Landmark size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Saldos de Plataforma
                            </p>
                            <h3 className="mt-1 text-3xl font-black tracking-tight text-card-foreground">
                                {formatCurrency(balances.grandTotal)}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Total consolidado do dia acompanha o Caixa Operacional.
                            </p>
                            <p className="mt-2 text-xs font-medium text-muted-foreground">
                                Ultima atualizacao: {formatDateTime(balances.lastUpdatedAt)}
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-xs">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            Filtro por dia
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(event) => onSelectedDateChange(event.target.value)}
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-card-foreground outline-none transition-colors focus:border-primary"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-1 py-1">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            Exibicao da tabela
                        </p>
                        <p className="mt-1 text-sm font-semibold text-card-foreground">
                            {detailsVisibility === 'visible' ? 'Detalhes visiveis' : 'Detalhes ocultos'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setDetailsVisibility((current) => (current === 'visible' ? 'hidden' : 'visible'))}
                        aria-label={detailsVisibility === 'visible' ? 'Esconder detalhes da tabela' : 'Mostrar detalhes da tabela'}
                        aria-expanded={detailsVisibility === 'visible'}
                        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-card-foreground"
                    >
                        {detailsVisibility === 'visible' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>

                {detailsVisibility === 'visible' && (
                    <div className="overflow-x-auto rounded-2xl border border-border">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50 text-left text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Plataforma</th>
                                    <th className="px-4 py-3">Dado</th>
                                    <th className="px-4 py-3 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedRows.map((group) => (
                                    <React.Fragment key={group.platformKey}>
                                        {group.items.map((item, index) => (
                                            <tr key={`${item.platformKey}:${item.fieldKey}`} className="border-t border-border/80">
                                                <td className="px-4 py-3 font-bold text-card-foreground">
                                                    {index === 0 ? group.platformLabel : ''}
                                                </td>
                                                <td className={`px-4 py-3 font-medium ${balanceCategoryStyles[item.balanceCategory].label}`}>
                                                    {item.fieldLabel}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-mono font-bold ${balanceCategoryStyles[item.balanceCategory].value}`}>
                                                    {formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="overflow-x-auto rounded-2xl border border-border">
                    <table className="min-w-full text-sm">
                        <tbody>
                            <tr className="bg-emerald-500/5">
                                <td className={`px-4 py-3 font-black uppercase tracking-[0.18em] ${balanceCategoryStyles.available.label}`}>
                                    Total disponivel
                                </td>
                                <td className={`px-4 py-3 text-right font-mono font-black ${balanceCategoryStyles.available.value}`}>
                                    {formatCurrency(balances.availableTotal)}
                                </td>
                            </tr>
                            <tr className="border-t border-border bg-amber-500/5">
                                <td className={`px-4 py-3 font-black uppercase tracking-[0.18em] ${balanceCategoryStyles.receivable.label}`}>
                                    Total a receber
                                </td>
                                <td className={`px-4 py-3 text-right font-mono font-black ${balanceCategoryStyles.receivable.value}`}>
                                    {formatCurrency(balances.receivableTotal)}
                                </td>
                            </tr>
                            <tr className="border-t border-border bg-sky-500/5">
                                <td className={`px-4 py-3 font-black uppercase tracking-[0.18em] ${balanceCategoryStyles.total.label}`}>
                                    Total geral
                                </td>
                                <td className={`px-4 py-3 text-right font-mono font-black ${balanceCategoryStyles.total.value}`}>
                                    {formatCurrency(balances.grandTotal)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
