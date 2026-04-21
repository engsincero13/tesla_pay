import React from 'react';
import { Search, FilterX, CopyPlus } from 'lucide-react';
import { parseDateLocal } from '../utils/dateUtils';
import { AccountPayable, AccountStatus } from '../types';
import { Badge } from './ui/Badge';
import { CopyButton } from './ui/CopyButton';
import { formatCurrency } from '../utils/formatCurrency';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from "react-day-picker"

interface AccountListSectionProps {
    viewDate: Date;
    setViewDate: (date: Date) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredAccounts: AccountPayable[];
    onSelectAccount: (account: AccountPayable) => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    onDuplicateAccount: (account: AccountPayable) => void;
}

export const AccountListSection = ({
    viewDate,
    setViewDate,
    searchTerm,
    setSearchTerm,
    filteredAccounts,
    onSelectAccount,
    dateRange,
    setDateRange,
    onDuplicateAccount
}: AccountListSectionProps) => {

    // Function to handle filter execution (already handled by state update in parent for now, 
    // but we need to satisfy the prop if we want a manual trigger)
    // The DateRangePicker triggers setDateRange which triggers App.tsx effect/render
    const handleFilter = () => {
        // No-op or specific logic if we want "Apply" button behavior only
        // Implementation in App.tsx reacts to dateRange changes immediately or we can defer it.
        // For now, DateRangePicker's "Filtrar" calls onFilter. 
        // We might want to just let the user pick dates and click filter.
        // Actually the picker updates internal state? 
        // Let's check DateRangePicker implementation.
        // It calls setDate prop.
    };
    return (
        <div className="bg-card p-4 lg:p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="font-bold text-lg text-foreground">Agenda: {viewDate.toLocaleString('pt-BR', { month: 'long' })}</h3>
                <div className="flex flex-wrap items-center gap-3">
                    <DateRangePicker
                        date={dateRange}
                        setDate={setDateRange}
                        onFilter={() => { }}
                    />
                    <div className="relative flex-1 min-w-[160px] sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input type="text" placeholder="Filtrar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background rounded-xl text-xs border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:w-48 transition-all outline-none" />
                    </div>
                </div>
            </div>

            {filteredAccounts.length > 0 ? (
                <div className="overflow-x-auto -mx-4 px-4 lg:-mx-8 lg:px-8 pb-4">
                    <table className="w-full text-left min-w-[800px] lg:min-w-0">
                        <thead>
                            <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border">
                                <th className="px-4 lg:px-8 py-5">Dia</th>
                                <th className="px-4 lg:px-8 py-5">Fornecedor</th>
                                <th className="px-4 lg:px-8 py-5 text-primary w-[300px]">Pix/Link</th>
                                <th className="px-4 lg:px-8 py-5">Fonte</th>
                                <th className="px-4 lg:px-8 py-5 w-[150px]">Categoria</th>
                                <th className="px-4 lg:px-8 py-5">Valor</th>
                                <th className="px-4 lg:px-8 py-5">Status</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAccounts.map((acc) => (
                                <tr key={acc.id} onClick={() => onSelectAccount(acc)} className="hover:bg-muted/50 cursor-pointer group transition-colors">
                                    <td className="px-4 lg:px-8 py-6 font-bold text-xs text-muted-foreground">{parseDateLocal(acc.dueDate).getDate()}</td>
                                    <td className="px-4 lg:px-8 py-6 font-bold text-sm text-foreground group-hover:text-primary transition-colors">{acc.supplierName}</td>
                                    <td className="px-4 lg:px-8 py-6"><CopyButton text={acc.pixKey || ''} /></td>
                                    <td className="px-4 lg:px-8 py-6"><span className="text-xs font-bold text-foreground">{acc.workspace}</span></td>
                                    <td className="px-4 lg:px-8 py-6"><span className="text-[10px] font-black uppercase text-muted-foreground">{acc.category}</span>{acc.category === 'Cartão de Crédito' && acc.cardClosingDay && (<span className="block text-[9px] font-bold text-cyan-400 mt-0.5">Fecha dia {acc.cardClosingDay}</span>)}</td>
                                    <td className="px-4 lg:px-8 py-6 font-black text-lg text-foreground tracking-tight">{formatCurrency(acc.amount)}</td>
                                    <td className="px-4 lg:px-8 py-6"><Badge status={acc.status} /></td>
                                    <td className="px-4 lg:px-8 py-6 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDuplicateAccount(acc);
                                            }}
                                            className="p-2 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                                            title="Duplicar Lançamento"
                                        >
                                            <CopyPlus size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 lg:px-8 py-6 border-t border-border bg-muted/20">
                        <div className="flex justify-end items-center gap-4">
                            <span className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Total:</span>
                            <span className="font-black text-2xl text-foreground">
                                {formatCurrency(filteredAccounts.reduce((sum, acc) => sum + acc.amount, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center text-muted-foreground animate-in fade-in">
                    <FilterX size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Nenhum lançamento encontrado neste período</p>
                    {viewDate.getMonth() === 1 && (
                        <button onClick={() => setViewDate(new Date(2026, 0, 1))} className="mt-4 text-primary font-bold text-xs hover:underline">Ir para Janeiro para replicar dados</button>
                    )}
                </div>
            )}
        </div>
    );
};
