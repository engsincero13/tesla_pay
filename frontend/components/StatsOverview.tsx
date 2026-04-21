import React from 'react';
import { Zap, AlertCircle, Clock, CheckCircle2, Wallet, Building2, LayoutDashboard } from 'lucide-react';
import { StatCard } from './ui/StatCard';
import { BalanceHistoryChart } from './BalanceHistoryChart';
import { PlatformBalancesCard } from './PlatformBalancesCard';
import { formatCompactCurrency } from '../utils/formatCurrency';
import { StatusFilterType } from '../data/constants';
import { PlatformBalanceSnapshot } from '../types';

interface StatsOverviewProps {
    stats: {
        dueTodayTotal: number;
        overdue: number;
        pendingTotal: number;
        paidTotal: number;
        monthTotal: number;
    };
    balances: {
        operational: number;
        reserve: number;
        lastUpdatedAt?: string | null;
        sourceDate?: string | null;
    };
    platformBalances: PlatformBalanceSnapshot;
    statusFilter: StatusFilterType;
    setStatusFilter: (filter: StatusFilterType) => void;
    onUpdateBalance: (type: 'operational' | 'reserve', value: number) => void;
    userId?: string;
    userRoles?: string[];
    onEditBalanceRequest?: (type: 'operational' | 'reserve') => void;
    onEditPlatformBalancesRequest?: () => void;
    selectedPlatformDate: string;
    onSelectedPlatformDateChange: (date: string) => void;
}

export const StatsOverview = ({
    stats,
    balances,
    platformBalances,
    statusFilter,
    setStatusFilter,
    onUpdateBalance,
    userId,
    userRoles = [],
    onEditBalanceRequest,
    onEditPlatformBalancesRequest,
    selectedPlatformDate,
    onSelectedPlatformDateChange,
}: StatsOverviewProps) => {
    const isAdmin = userRoles.includes('admin');
    const isEditor = userRoles.includes('editor');
    const canEditBalance = isAdmin || isEditor;
    const showFullStats = isAdmin;

    // Helper handler
    const handleCardClick = (type: 'operational' | 'reserve') => {
        if (!canEditBalance) {
            return;
        }

        if (type === 'operational' && onEditPlatformBalancesRequest) {
            onEditPlatformBalancesRequest();
            return;
        }

        if (onEditBalanceRequest) {
            onEditBalanceRequest(type);
        }
    };

    const formatDateTime = (value?: string | null) => {
        if (!value) return 'Sem atualizacao registrada';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    return (
        <div className="flex flex-col gap-6 mb-12">
            {/* Top Row - Cash Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Caixa Operacional PJ"
                    variant="floating"
                    onClick={() => handleCardClick('operational')}
                    className={`border-[#18304B]/95 shadow-[0_0_15px_rgba(24,48,75,0.2)] bg-gradient-to-br from-transparent to-[#18304B]/95 dark:to-[#18304B]/95 ${canEditBalance ? 'cursor-pointer hover:ring-2 hover:ring-blue-500/50' : ''}`}
                    value={formatCompactCurrency(balances.operational)}
                    valueClassName="text-4xl md:text-5xl mt-6"
                    subtitleClassName="mt-1"
                    subtitle={(() => {
                        const getOperationalStatus = (val: number) => {
                            if (val < 250000) return { color: 'from-red-500 to-red-500/80', label: 'Alerta Máximo', bg: 'bg-red-500', text: 'text-red-500' };
                            if (val < 400000) return { color: 'from-yellow-500 to-yellow-500/80', label: 'Atenção', bg: 'bg-yellow-500', text: 'text-yellow-500' };
                            if (val < 600000) return { color: 'from-green-500 to-green-500/80', label: 'Saudável', bg: 'bg-green-500', text: 'text-green-500' };
                            return { color: 'from-blue-500 to-blue-600', label: 'Forte', bg: 'bg-blue-500', text: 'text-blue-500' };
                        };

                        const status = getOperationalStatus(balances.operational);
                        // Scale 0 to 800k for progress bar visual
                        const percentage = Math.min(100, Math.max(5, (balances.operational / 800000) * 100));

                        return (
                            <div className="w-full mt-2">
                                <div className="flex justify-between text-[15px] font-bold mb-1.5 uppercase tracking-wider">
                                    <span className={status.text}>{status.label}</span>
                                    <span className="text-muted-foreground normal-case tracking-normal text-xs">
                                        Ultima atualizacao: {formatDateTime(balances.lastUpdatedAt)}
                                    </span>
                                </div>
                                <div className="relative h-5 w-full bg-muted border border-border rounded-full overflow-visible">
                                    {/* Markers */}
                                    <div className="absolute top-0 bottom-0 w-px bg-border z-10" style={{ left: '31.25%' }} title="250k" />
                                    <div className="absolute top-0 bottom-0 w-px bg-border z-10" style={{ left: '50%' }} title="400k" />
                                    <div className="absolute top-0 bottom-0 w-px bg-border z-10" style={{ left: '75%' }} title="600k" />

                                    <div
                                        className={`h-full bg-gradient-to-r ${status.color} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${percentage}%`, boxShadow: '0 0 12px rgba(34,211,238,0.6), 0 0 24px rgba(34,211,238,0.3)' }}
                                    />
                                    {/* Rocket emoji at end of progress */}
                                    <span className="absolute top-1/2 -translate-y-1/2 text-xl z-20 transition-all duration-1000" style={{ left: `${percentage}%`, transform: `translate(-50%, -50%)` }}>🚀</span>
                                </div>
                                <div className="flex justify-between text-[15px] text-muted-foreground mt-1.5 font-mono">
                                    <div className="w-[31.25%] text-right pr-0.5 border-r border-border">250k</div>
                                    <div className="w-[18.75%] text-right pr-0.5 border-r border-border">400k</div>
                                    <div className="w-[25%] text-right pr-0.5 border-r border-border">600k</div>
                                    <div className="flex-1"></div>
                                </div>
                                <BalanceHistoryChart
                                    currentBalance={balances.operational}
                                    userId={userId}
                                    type="operational"
                                    color="#22d3ee" // Cyan
                                    height={200}
                                    className="mt-2"
                                />
                            </div>
                        );
                    })()}
                    icon={Building2}
                    colorClass={(() => {
                        const val = balances.operational;
                        if (val < 250000) return "bg-red-500";
                        if (val < 400000) return "bg-yellow-500";
                        if (val < 600000) return "bg-green-500";
                        return "bg-primary";
                    })()}
                />
                <StatCard
                    title="Caixa Intocável PJ"
                    variant="floating"
                    onClick={() => handleCardClick('reserve')}
                    className={`border-[#18304B]/95 shadow-[0_0_15px_rgba(24,48,75,0.2)] bg-gradient-to-br from-transparent to-[#18304B]/95 dark:to-[#18304B]/95 ${canEditBalance ? 'cursor-pointer hover:ring-2 hover:ring-blue-500/50' : ''}`}
                    value={formatCompactCurrency(balances.reserve)}
                    valueClassName="text-4xl md:text-5xl mt-6"
                    subtitleClassName="mt-1"
                    subtitle={
                        <div className="w-full mt-2">
                            <div className="flex justify-between gap-3 text-[15px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                                <span>Meta: 300k</span>
                                <span>{Math.min(100, Math.round((balances.reserve / 300000) * 100))}%</span>
                            </div>
                            <div className="mb-2 text-xs font-medium text-muted-foreground">
                                Ultima atualizacao: {formatDateTime(balances.lastUpdatedAt)}
                            </div>
                            <div className="relative h-5 w-full bg-muted border border-border rounded-full overflow-visible">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, (balances.reserve / 300000) * 100)}%`, boxShadow: '0 0 12px rgba(30,136,229,0.6), 0 0 24px rgba(30,136,229,0.3)' }}
                                />
                                {/* Rocket emoji at end of progress */}
                                <span className="absolute top-1/2 -translate-y-1/2 text-xl z-20 transition-all duration-1000" style={{ left: `${Math.min(100, (balances.reserve / 300000) * 100)}%`, transform: `translate(-50%, -50%)` }}>🚀</span>
                            </div>
                            <BalanceHistoryChart
                                currentBalance={balances.reserve}
                                userId={userId}
                                type="reserve"
                                color="#60a5fa" // Blue for Reserve
                                height={200}
                                className="mt-8"
                            />
                        </div>
                    }
                    icon={Wallet}
                    colorClass="bg-primary"
                />
            </div>

            <PlatformBalancesCard
                balances={platformBalances}
                selectedDate={selectedPlatformDate}
                onSelectedDateChange={onSelectedPlatformDateChange}
            />



            {/* Bottom Row - Monthly Stats */}
            {
                showFullStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                        <StatCard
                            title="Vence Hoje"
                            value={formatCompactCurrency(stats.dueTodayTotal)}
                            subtitle="Urgente"
                            icon={Zap}
                            colorClass="bg-orange-500"
                            onClick={() => setStatusFilter('today')}
                            active={statusFilter === 'today'}
                        />
                        <StatCard
                            title="Atrasado"
                            value={formatCompactCurrency(stats.overdue)}
                            subtitle="Pendências"
                            icon={AlertCircle}
                            colorClass="bg-red-500"
                            onClick={() => setStatusFilter('overdue')}
                            active={statusFilter === 'overdue'}
                        />
                        <StatCard
                            title="Pendente Mês"
                            value={formatCompactCurrency(stats.pendingTotal)}
                            subtitle="Em Aberto"
                            icon={Clock}
                            colorClass="bg-yellow-500"
                            onClick={() => setStatusFilter('pending')}
                            active={statusFilter === 'pending'}
                        />
                        <StatCard
                            title="Pago Mês"
                            value={formatCompactCurrency(stats.paidTotal)}
                            subtitle="Liquidado"
                            icon={CheckCircle2}
                            colorClass="bg-green-500"
                            onClick={() => setStatusFilter('paid')}
                            active={statusFilter === 'paid'}
                        />
                        <StatCard
                            title="Total Mês"
                            value={formatCompactCurrency(stats.monthTotal)}
                            subtitle="Previsão Total"
                            icon={LayoutDashboard}
                            colorClass="bg-blue-500"
                            onClick={() => setStatusFilter('all')}
                            active={statusFilter === 'all'}
                        />
                    </div>
                )
            }
        </div>
    );
};

