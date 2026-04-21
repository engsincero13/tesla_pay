import React from 'react';
import { DateRange } from 'react-day-picker';
import { DateNavigation } from './DateNavigation';
import { StatsOverview } from './StatsOverview';
import { ExpenseByCategoryChart } from './ExpenseByCategoryChart';
import { ExpensesHistoryChart } from './ExpensesHistoryChart';
import { AccountListSection } from './AccountListSection';
import {
    WorkspaceType,
    AccountPayable,
    PlatformBalanceSnapshot,
} from '../types';

interface DashboardProps {
    viewDate: Date;
    setViewDate: (date: Date) => void;
    changeMonth: (offset: number) => void;
    onReplicateMonth: () => void;
    availableMonths: Date[];
    stats: any;
    balances: any;
    platformBalances: PlatformBalanceSnapshot;
    statusFilter: any;
    setStatusFilter: (filter: any) => void;
    onUpdateBalance: (type: 'operational' | 'reserve', value: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredAccounts: any;
    accounts: AccountPayable[];
    onSelectAccount: (account: any) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    activeWorkspace: WorkspaceType;
    setActiveWorkspace: (type: WorkspaceType) => void;
    onNewAccountClick: () => void;
    userId?: string;
    userRoles?: string[];
    onEditBalanceRequest?: (type: 'operational' | 'reserve') => void;
    onEditPlatformBalancesRequest: () => void;
    selectedPlatformDate: string;
    onSelectedPlatformDateChange: (date: string) => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    onDuplicateAccount: (account: any) => void;
}

export const Dashboard = ({
    viewDate,
    setViewDate,
    changeMonth,
    onReplicateMonth,
    availableMonths,
    stats,
    balances,
    platformBalances,
    statusFilter,
    setStatusFilter,
    onUpdateBalance,
    searchTerm,
    setSearchTerm,
    filteredAccounts,
    accounts,
    onSelectAccount,
    isDarkMode,
    setIsDarkMode,
    activeWorkspace,
    setActiveWorkspace,
    onNewAccountClick,
    userId,
    userRoles = [],
    onEditBalanceRequest,
    onEditPlatformBalancesRequest,
    selectedPlatformDate,
    onSelectedPlatformDateChange,
    dateRange,
    setDateRange,
    onDuplicateAccount,
}: DashboardProps) => {
    const isAdmin = userRoles.includes('admin');
    const isEditor = userRoles.includes('editor');
    const showFullDashboard = isAdmin;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Visao Geral</h2>
                </div>

                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
                    {showFullDashboard && (
                        <div className="flex w-full rounded-xl border border-border bg-muted p-1 sm:w-auto">
                            {['AMBOS', 'PJ', 'PF'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveWorkspace(type as WorkspaceType)}
                                    className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:flex-none ${activeWorkspace === type ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        {isAdmin && (
                            <button
                                id="top-new-account-btn"
                                onClick={onNewAccountClick}
                                className="w-full rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-bold text-white shadow-glow-blue transition-all hover:scale-105 hover:bg-primary-dark sm:w-auto"
                            >
                                Novo Lancamento
                            </button>
                        )}

                        {(isAdmin || isEditor) && (
                            <button
                                onClick={onEditPlatformBalancesRequest}
                                className="w-full rounded-xl border border-border bg-accent px-5 py-2.5 text-center text-sm font-bold text-foreground transition-all hover:bg-accent/80 sm:w-auto"
                            >
                                Saldos de Plataforma
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showFullDashboard && (
                <DateNavigation
                    viewDate={viewDate}
                    setViewDate={setViewDate}
                    changeMonth={changeMonth}
                    onReplicateMonth={onReplicateMonth}
                    availableMonths={availableMonths}
                />
            )}

            <StatsOverview
                stats={stats}
                balances={balances}
                platformBalances={platformBalances}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onUpdateBalance={onUpdateBalance}
                userId={userId}
                userRoles={userRoles}
                onEditBalanceRequest={onEditBalanceRequest}
                onEditPlatformBalancesRequest={onEditPlatformBalancesRequest}
                selectedPlatformDate={selectedPlatformDate}
                onSelectedPlatformDateChange={onSelectedPlatformDateChange}
            />

            {showFullDashboard && (
                <ExpenseByCategoryChart
                    accounts={accounts}
                    viewDate={viewDate}
                    activeWorkspace={activeWorkspace}
                />
            )}

            {showFullDashboard && (
                <ExpensesHistoryChart
                    accounts={accounts}
                    activeWorkspace={activeWorkspace}
                />
            )}

            {showFullDashboard && (
                <AccountListSection
                    viewDate={viewDate}
                    setViewDate={setViewDate}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredAccounts={filteredAccounts}
                    onSelectAccount={onSelectAccount}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    onDuplicateAccount={onDuplicateAccount}
                />
            )}
        </div>
    );
};
