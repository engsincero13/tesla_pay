'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useSession, signIn, signOut } from "next-auth/react";
import {
  WorkspaceType,
  AccountStatus,
  AccountPayable,
  PaymentMethod,
  PlatformBalanceItem,
  PlatformBalanceSnapshot
} from './types';
import { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { parseDateLocal } from './utils/dateUtils'
import {
  CATEGORIES_PF,
  ViewType,
  StatusFilterType
} from './data/constants';
import { API_BASE } from './utils/api';
// import { Sidebar } from './components/Sidebar'; // Removed
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CategoriesPage } from './components/CategoriesPage';
import { RemunerationPage } from './components/RemunerationPage';
import { ProfileModal } from './components/ProfileModal';
import { AccountDetailsPanel } from './components/AccountDetailsPanel';
import { NewAccountModal } from './components/NewAccountModal';
import { EditBalanceModal } from './components/EditBalanceModal';
import { PlatformBalancesModal } from './components/PlatformBalancesModal';
import {
  createEmptyPlatformBalanceSnapshot,
  getTodayPlatformDate,
  mergePlatformBalanceSnapshot
} from './data/platformBalances';

// --- Main App ---

export default function App() {
  // Auth State
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);

  // App State
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(WorkspaceType.BOTH);
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [balances, setBalances] = useState({
    operational: 0,
    reserve: 0,
    lastUpdatedAt: null as string | null,
    sourceDate: null as string | null,
  });
  const [platformBalances, setPlatformBalances] = useState<PlatformBalanceSnapshot>(createEmptyPlatformBalanceSnapshot());
  const [selectedPlatformDate, setSelectedPlatformDate] = useState(getTodayPlatformDate());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'entry' | 'balance'>('entry');
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [smartPrompt, setSmartPrompt] = useState('');

  // Balance Edit
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);
  const [balanceEditType, setBalanceEditType] = useState<'operational' | 'reserve'>('operational');
  const [isPlatformBalancesOpen, setIsPlatformBalancesOpen] = useState(false);

  // Replication State

  // Replication State
  const [showReplicateToast, setShowReplicateToast] = useState(false);
  const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
  const [replicateTargetMonth, setReplicateTargetMonth] = useState('');

  // Delete State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const [viewDate, setViewDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const isAdmin = session?.user?.roles?.includes('admin') ?? false;

  const [newAccount, setNewAccount] = useState<Partial<AccountPayable>>({
    workspace: 'PF', status: AccountStatus.PENDING, method: PaymentMethod.PIX, amount: 0, category: CATEGORIES_PF[0], dueDate: new Date().toISOString().split('T')[0], pixKey: ''
  });

  // --- Auth & Init Effects ---
  useEffect(() => {
    // Check for token refresh error
    if ((session as any)?.error === "RefreshAccessTokenError") {
      console.error("Refresh token expired or invalid. Signing out...");
      signOut({ callbackUrl: "/" });
      return;
    }

    if (status === 'unauthenticated') {
      signIn('keycloak');
    }
  }, [status, session]);

  useEffect(() => {
    const syncUser = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          // Sync user with backend to get local ID
          const res = await fetch(`${API_BASE}/api/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name
            })
          });

          console.log("Sync Response Status:", res.status);
          if (res.ok) {
            const data = await res.json();
            console.log("Sync Response Data:", data);
            if (data.success) {
              setUser(data.user);
            } else {
              console.error("Sync failed: Backend returned unsuccessful", data);
            }
          } else {
            console.error("Failed to sync user: Network response not ok");
          }
        } catch (err) {
          console.error("Sync error exception:", err);
        }
      } else {
        console.log("Skipping sync: Missing session or email");
      }
    };
    syncUser();
  }, [status, session]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('tesla-pay-theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
    }
  }, [user?.id, selectedPlatformDate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tesla-pay-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tesla-pay-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!isAdmin && activeView === 'remuneration') {
      setActiveView('dashboard');
    }
  }, [activeView, isAdmin]);

  // FAB visibility: show when top button scrolls out of view (desktop), always on mobile
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 1024;
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      if (checkMobile()) {
        setShowFab(true);
        return;
      }

      const topBtn = document.getElementById('top-new-account-btn');
      if (!topBtn) {
        setShowFab(false);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => setShowFab(!entry.isIntersecting),
        { threshold: 0 }
      );
      observer.observe(topBtn);
    };

    // Small delay to let DOM paint
    const timer = setTimeout(setup, 300);

    const handleResize = () => {
      if (observer) { observer.disconnect(); observer = null; }
      setup();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [activeView]);

  // --- Handlers ---

  const handleLogout = () => {
    setUser(null);
    setAccounts([]);
    localStorage.removeItem('tesla_user');
    signOut();
  };

  const handleForcePasswordSuccess = () => {
    // setIsForcePasswordOpen(false); // Removed
    const updatedUser = { ...user, forceChangePassword: false };
    setUser(updatedUser);
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': user?.id
  });

  const handleUpdateBalance = async (type: 'operational' | 'reserve', newValue: number) => {
    // If called directly with a value, save it
    // But we want to open the modal first.
    // Dashboard calls this?
    // Let's change Dashboard to request edit, then App opens modal, then save calls API.
    const body = type === 'operational' ? { operational: newValue } : { reserve: newValue };
    try {
      const res = await fetch(`${API_BASE}/api/balances`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          ...body,
          effectiveDate: selectedPlatformDate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBalances({
          operational: Number(data.operational) || 0,
          reserve: Number(data.reserve) || 0,
          lastUpdatedAt: data.lastUpdatedAt || null,
          sourceDate: data.sourceDate || selectedPlatformDate,
        });
        setIsEditBalanceOpen(false);
      } else {
        alert("Erro ao atualizar saldo.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  };

  const openBalanceEdit = (type: 'operational' | 'reserve') => {
    setBalanceEditType(type);
    setIsEditBalanceOpen(true);
  };

  const handleSavePlatformBalances = async (
    items: Pick<PlatformBalanceItem, 'platformKey' | 'fieldKey' | 'amount'>[],
  ) => {
    try {
      const res = await fetch(`${API_BASE}/api/platform-balances`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          items,
          date: selectedPlatformDate
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save platform balances');
      }

      const data = await res.json();
      setPlatformBalances(mergePlatformBalanceSnapshot(data.items, data.snapshotDate, data.lastUpdatedAt || null));
      setBalances(prev => ({
        operational: Number(data.operational) || 0,
        reserve: Number(data.reserve) || prev.reserve,
        lastUpdatedAt: data.lastUpdatedAt || prev.lastUpdatedAt || null,
        sourceDate: data.snapshotDate || prev.sourceDate || null,
      }));
      setIsPlatformBalancesOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar saldos das plataformas.");
    }
  };

  const fetchAccounts = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/accounts/all`, { headers: { 'x-user-id': user.id } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAccounts(data);
      }
      const balRes = await fetch(`${API_BASE}/api/balances?date=${selectedPlatformDate}`, { headers: { 'x-user-id': user.id } });
      if (balRes.ok) {
        const balData = await balRes.json();
        if (balData.operational !== undefined) {
          setBalances({
            operational: Number(balData.operational) || 0,
            reserve: Number(balData.reserve) || 0,
            lastUpdatedAt: balData.lastUpdatedAt || null,
            sourceDate: balData.sourceDate || null,
          });
        }
      }

      const platformRes = await fetch(`${API_BASE}/api/platform-balances?date=${selectedPlatformDate}`, { headers: { 'x-user-id': user.id } });
      if (platformRes.ok) {
        const platformData = await platformRes.json();
        setPlatformBalances(mergePlatformBalanceSnapshot(platformData.items, platformData.snapshotDate, platformData.lastUpdatedAt || null));
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };


  const changeMonth = (offset: number) => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      // Ensure date range is cleared/ignored when navigating months?
      // User asked for "filter removed on refresh", but didn't specify interaction here.
      // Usually navigation should probably not be blocked by filter, or filter overrides.
      // For now, let's NOT update dateRange here, so if filtering is active, it stays active?
      // OR, if we want "month view" to work, maybe we should clear dateRange if user navigates?
      // Let's leave dateRange independent. If dateRange is set, it overrides viewDate in filtering.
      return d;
    });
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    accounts.forEach(acc => {
      const d = parseDateLocal(acc.dueDate);
      months.add(`${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`);
    });
    const sorted = Array.from(months).sort();
    return sorted.map(str => {
      const [year, month] = str.split('-').map(Number);
      return new Date(year, month, 1);
    });
  }, [accounts]);

  const handleReplicateClick = () => {
    setIsReplicateModalOpen(true);
  };

  const executeReplication = async () => {
    const sourceDate = new Date(viewDate);
    const targetDate = new Date(sourceDate.getFullYear(), sourceDate.getMonth() + 1, 1);
    const targetMonthName = targetDate.toLocaleDateString('pt-BR', { month: 'long' });
    setReplicateTargetMonth(targetMonthName);

    try {
      const res = await fetch(`${API_BASE}/api/replicate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sourceMonth: sourceDate.getMonth(),
          sourceYear: sourceDate.getFullYear()
        })
      });
      const result = await res.json();
      if (result.success) {
        setShowReplicateToast(true);
        setTimeout(() => setShowReplicateToast(false), 3000);
        await fetchAccounts();
        setViewDate(targetDate);
        setIsReplicateModalOpen(false);
      } else {
        alert(result.message || "Erro ao replicar.");
      }
    } catch (err) {
      console.error("Replication error:", err);
      alert("Falha ao comunicar com o servidor.");
    }
  };

  const getTodayDateStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const filteredAccounts = useMemo(() => {
    const todayStr = getTodayDateStr();
    return accounts.filter(acc => {
      const workspaceMatch = activeWorkspace === WorkspaceType.BOTH || acc.workspace === activeWorkspace;
      const searchMatch = (acc.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (acc.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (statusFilter === 'overdue') {
        const accDateStr = acc.dueDate.split('T')[0];
        const isOverdue = accDateStr < todayStr && acc.status !== AccountStatus.PAID;
        return workspaceMatch && searchMatch && isOverdue;
      }
      if (statusFilter === 'today') {
        const accDateStr = acc.dueDate.split('T')[0];
        const isToday = accDateStr === todayStr && acc.status !== AccountStatus.PAID;
        return workspaceMatch && searchMatch && isToday;
      }
      const accDate = parseDateLocal(acc.dueDate);

      // Date Range Filter
      let inDateRange = false;
      if (dateRange?.from && dateRange?.to) {
        // Adjust to to end of day for inclusion
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        inDateRange = isWithinInterval(accDate, { start: dateRange.from, end: endOfDay });
      } else if (dateRange?.from) {
        inDateRange = accDate >= dateRange.from;
      } else {
        // Fallback if no range (shouldn't happen with default)
        inDateRange = accDate.getMonth() === viewDate.getMonth() &&
          accDate.getFullYear() === viewDate.getFullYear();
      }

      /* const inCurrentMonth = accDate.getUTCMonth() === viewDate.getUTCMonth() &&
        accDate.getUTCFullYear() === viewDate.getUTCFullYear(); */

      let statusMatch = true;
      if (statusFilter === 'pending') statusMatch = acc.status !== AccountStatus.PAID;
      else if (statusFilter === 'paid') statusMatch = acc.status === AccountStatus.PAID;
      return workspaceMatch && searchMatch && inDateRange && statusMatch;
    }).sort((a, b) => {
      const dateA = a.dueDate.split('T')[0];
      const dateB = b.dueDate.split('T')[0];
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.supplierName || '').localeCompare(b.supplierName || '');
    });
  }, [accounts, activeWorkspace, searchTerm, viewDate, statusFilter, dateRange]);

  const stats = useMemo(() => {
    const todayStr = getTodayDateStr();
    const monthAccs = accounts.filter(acc => {
      const accDate = parseDateLocal(acc.dueDate);
      const isCorrectMonth = accDate.getMonth() === viewDate.getMonth() && accDate.getFullYear() === viewDate.getFullYear();
      const workspaceMatch = activeWorkspace === WorkspaceType.BOTH || acc.workspace === activeWorkspace;
      return isCorrectMonth && workspaceMatch;
    });
    const dueTodayTotal = accounts.filter(acc => {
      return (activeWorkspace === WorkspaceType.BOTH || acc.workspace === activeWorkspace) && acc.dueDate.split('T')[0] === todayStr && acc.status !== AccountStatus.PAID;
    }).reduce((sum, a) => sum + a.amount, 0);

    const overdue = accounts.filter(acc => {
      const accDateStr = acc.dueDate.split('T')[0];
      return (activeWorkspace === WorkspaceType.BOTH || acc.workspace === activeWorkspace) &&
        accDateStr < todayStr && acc.status !== AccountStatus.PAID;
    }).reduce((sum, a) => sum + a.amount, 0);

    const pending = monthAccs.filter(a => a.status !== AccountStatus.PAID).reduce((sum, a) => sum + a.amount, 0);
    const totalMonth = monthAccs.reduce((sum, a) => sum + a.amount, 0);
    const paidMonth = monthAccs.filter(a => a.status === AccountStatus.PAID).reduce((sum, a) => sum + a.amount, 0);
    return { monthTotal: totalMonth, overdue, paidTotal: paidMonth, pendingTotal: pending, dueTodayTotal };
  }, [accounts, viewDate, activeWorkspace]);

  const handleUpdateAccount = async (id: string, updates: Partial<AccountPayable>) => {
    try {
      const res = await fetch(`${API_BASE}/api/accounts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchAccounts();
      } else {
        alert('Falha ao atualizar lançamento.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    setDeleteConfirmationId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmationId) return;
    try {
      const res = await fetch(`${API_BASE}/api/accounts/${deleteConfirmationId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        await fetchAccounts();
        setSelectedAccount(null);
        setDeleteConfirmationId(null);
      } else {
        alert('Falha ao excluir.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const handleSmartParse = async () => {
    if (!smartPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/parse`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt: smartPrompt })
      });
      if (res.ok) {
        const parsed = await res.json();
        setNewAccount({ ...newAccount, ...parsed });
        setSmartPrompt('');
      } else {
        alert("Falha no processamento inteligente.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão com IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.supplierName || !newAccount.amount) { alert("Preencha fornecedor e valor."); return; }
    try {
      const res = await fetch(`${API_BASE}/api/accounts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newAccount)
      });
      if (res.ok) {
        await fetchAccounts();
        setIsModalOpen(false);
        resetForm();
      } else {
        alert('Erro ao salvar no servidor');
      }
    } catch (e) {
      alert('Erro de conexão');
    }
  };

  const resetForm = () => {
    setNewAccount({ workspace: 'PF', status: AccountStatus.PENDING, method: PaymentMethod.PIX, amount: 0, category: CATEGORIES_PF[0], dueDate: new Date().toISOString().split('T')[0], pixKey: '' });
  };

  // --- RENDER ---

  if ((session as any)?.error === "RefreshAccessTokenError") {
    return <div className="flex h-screen items-center justify-center bg-bg-dark text-white">Sessão expirada. Redirecionando...</div>;
  }

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-bg-dark text-white">Carregando sessão...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex h-screen items-center justify-center bg-bg-dark text-white">Redirecionando para login...</div>;
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center bg-bg-dark text-white">Sincronizando usuário...</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300`}>
      {showReplicateToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-[24px] shadow-2xl font-black animate-in slide-in-from-top-full flex items-center gap-3">
          <CheckCircle2 size={24} />
          <span>{`Replicado para ${replicateTargetMonth} com sucesso!`}</span>
        </div>
      )}

      {/* Header Navigation */}
      <Header
        userName={user?.name || 'Usuário'}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onRefresh={fetchAccounts}
        userRoles={session?.user?.roles}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 pt-[10px] pb-12 transition-all duration-300">

        {activeView === 'dashboard' && (
          <Dashboard
            viewDate={viewDate}
            setViewDate={setViewDate}
            changeMonth={changeMonth}
            onReplicateMonth={handleReplicateClick}
            availableMonths={availableMonths}
            stats={stats}
            balances={balances}
            platformBalances={platformBalances}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onUpdateBalance={handleUpdateBalance}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredAccounts={filteredAccounts}
            accounts={accounts}
            onSelectAccount={setSelectedAccount}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            activeWorkspace={activeWorkspace}
            userId={user?.id}
            setActiveWorkspace={setActiveWorkspace}
            onNewAccountClick={() => { resetForm(); setModalInitialTab('entry'); setIsModalOpen(true); }}
            userRoles={session?.user?.roles}
            onEditBalanceRequest={openBalanceEdit}
            onEditPlatformBalancesRequest={() => setIsPlatformBalancesOpen(true)}
            selectedPlatformDate={selectedPlatformDate}
            onSelectedPlatformDateChange={setSelectedPlatformDate}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onDuplicateAccount={(account) => {
              setNewAccount({
                ...account,
                id: undefined,
                status: AccountStatus.PENDING,
                dueDate: new Date().toISOString().split('T')[0],
              });
              setModalInitialTab('entry');
              setIsModalOpen(true);
            }}
          />
        )}

        {activeView === 'categories' && (
          <CategoriesPage />
        )}

        {activeView === 'remuneration' && isAdmin && (
          <RemunerationPage />
        )}

      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={user?.id}
      />

      <AccountDetailsPanel
        selectedAccount={selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onUpdate={handleUpdateAccount}
        onDelete={handleDeleteAccount}
        userId={user?.id}
      />

      <NewAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        onSave={handleAddAccount}
        aiLoading={aiLoading}
        smartPrompt={smartPrompt}
        setSmartPrompt={setSmartPrompt}
        onSmartParse={handleSmartParse}
        userId={user?.id}
        initialTab={modalInitialTab}
      />

      <ConfirmationModal
        isOpen={isReplicateModalOpen}
        onClose={() => setIsReplicateModalOpen(false)}
        onConfirm={executeReplication}
        title="Replicar Lançamentos"
        message={`Deseja replicar todos os lançamentos de ${viewDate.toLocaleDateString('pt-BR', { month: 'long' })} para o próximo mês?`}
        confirmText="Sim, Replicar"
      />

      <EditBalanceModal
        isOpen={isEditBalanceOpen}
        onClose={() => setIsEditBalanceOpen(false)}
        balances={balances}
        initialType={balanceEditType}
        onSave={handleUpdateBalance}
      />

      <PlatformBalancesModal
        isOpen={isPlatformBalancesOpen}
        onClose={() => setIsPlatformBalancesOpen(false)}
        balances={platformBalances}
        selectedDate={selectedPlatformDate}
        onSelectedDateChange={setSelectedPlatformDate}
        onSave={handleSavePlatformBalances}
      />

      <ConfirmationModal
        isOpen={!!deleteConfirmationId}
        onClose={() => setDeleteConfirmationId(null)}
        onConfirm={confirmDelete}
        title="Excluir Lançamento"
        message="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
      />

      {/* Floating Action Button */}
      {activeView === 'dashboard' && isAdmin && (
        <button
          onClick={() => { resetForm(); setModalInitialTab('entry'); setIsModalOpen(true); }}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary-dark text-white shadow-[0_4px_20px_rgba(30,136,229,0.4)] hover:shadow-[0_6px_30px_rgba(30,136,229,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${showFab ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
            }`}
          title="Novo Lançamento"
          aria-label="Novo Lançamento"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
