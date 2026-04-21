import React, { useState, useEffect } from 'react';
import { X, Building2, Wallet } from 'lucide-react';
import { AccountPayable } from '../types';
import { API_BASE } from '../utils/api';

interface NewAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    newAccount: Partial<AccountPayable>;
    setNewAccount: (account: Partial<AccountPayable>) => void;
    onSave: () => void;
    aiLoading: boolean;
    smartPrompt: string;
    setSmartPrompt: (prompt: string) => void;
    onSmartParse: () => void;
    userId?: string;
    initialTab?: TabType;
}

type TabType = 'entry' | 'balance';

interface Category {
    id: string;
    name: string;
    type: 'PF' | 'PJ' | 'GERAL';
}

export const NewAccountModal = ({
    isOpen,
    onClose,
    newAccount,
    setNewAccount,
    onSave,
    userId,
    initialTab = 'entry'
}: NewAccountModalProps) => {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [operationalDelta, setOperationalDelta] = useState<number | ''>('');
    const [reserveDelta, setReserveDelta] = useState<number | ''>('');
    const [balanceMode, setBalanceMode] = useState<'operational' | 'reserve'>('operational');

    useEffect(() => {
        if (isOpen && userId) {
            fetch(`${API_BASE}/api/categories`, {
                headers: { 'x-user-id': userId }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setCategories(data);
                    }
                })
                .catch(err => console.error("Failed to fetch categories", err));
        }
    }, [isOpen, userId]);


    // Helper to format number to BRL currency
    const formatCurrency = (value: number | ''): string => {
        if (value === '') return '';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Helper to parse input string back to number
    const parseCurrencyInput = (inputValue: string): number | '' => {
        const digits = inputValue.replace(/\D/g, ''); // Strip non-digits
        if (!digits) return '';
        const numberValue = parseInt(digits, 10) / 100;
        return numberValue;
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: number | '') => void) => {
        const newVal = parseCurrencyInput(e.target.value);
        setter(newVal);
    };

    const handleBalanceSave = async () => {
        try {
            // Unified REPLACE logic (PATCH) for both modes
            const body = balanceMode === 'operational'
                ? { operational: Number(operationalDelta) }
                : { reserve: Number(reserveDelta) };

            await fetch(`${API_BASE}/api/balances`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId || ''
                },
                body: JSON.stringify(body)
            });
            window.location.reload();
        } catch (err) {
            alert("Erro ao atualizar saldo.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-[#1C1C1E] w-full max-w-xl rounded-[48px] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">

                {/* Header with Tabs */}
                <header className="flex flex-col gap-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('entry')}
                                className={`text-2xl font-black tracking-tighter transition-colors ${activeTab === 'entry' ? 'text-black dark:text-white' : 'text-gray-400'}`}
                            >
                                Novo Lançamento
                            </button>
                            <button
                                onClick={() => setActiveTab('balance')}
                                className={`text-2xl font-black tracking-tighter transition-colors ${activeTab === 'balance' ? 'text-black dark:text-white' : 'text-gray-400'}`}
                            >
                                Mudança de Caixa
                            </button>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-all"><X size={24} /></button>
                    </div>
                </header>

                {activeTab === 'entry' ? (
                    <div className="space-y-6">
                        {/* Name Input */}
                        <input
                            type="text"
                            placeholder="Nome do Lançamento"
                            value={newAccount.supplierName || ''}
                            onChange={(e) => setNewAccount({ ...newAccount, supplierName: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl font-bold dark:text-white"
                        />

                        {/* Category Dropdown */}
                        <select
                            value={newAccount.category || ''}
                            onChange={(e) => setNewAccount({ ...newAccount, category: e.target.value, ...(e.target.value !== 'Cartão de Crédito' ? { cardClosingDay: undefined } : {}) })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl font-bold dark:text-white appearance-none"
                        >
                            <option value="">Selecione uma categoria</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Card Closing Day - only for Cartão de Crédito */}
                        {newAccount.category === 'Cartão de Crédito' && (
                            <input
                                type="number"
                                min={1}
                                max={31}
                                placeholder="Dia do fechamento da fatura (1-31)"
                                value={newAccount.cardClosingDay || ''}
                                onChange={(e) => setNewAccount({ ...newAccount, cardClosingDay: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl font-bold dark:text-white"
                            />
                        )}

                        {/* Amount and Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Valor"
                                value={formatCurrency(newAccount.amount || '')}
                                onChange={(e) => {
                                    const val = parseCurrencyInput(e.target.value);
                                    setNewAccount({ ...newAccount, amount: val === '' ? 0 : val });
                                }}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl font-bold dark:text-white"
                            />
                            <input
                                type="date"
                                value={newAccount.dueDate}
                                onChange={(e) => setNewAccount({ ...newAccount, dueDate: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl font-bold dark:text-white"
                            />
                        </div>

                        {/* Pix Key Input Added */}
                        <input
                            type="text"
                            placeholder="Chave Pix / Link de Pagamento"
                            value={newAccount.pixKey || ''}
                            onChange={(e) => setNewAccount({ ...newAccount, pixKey: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl font-bold dark:text-white"
                        />

                        {/* Workspace Toggle */}
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                            <button onClick={() => setNewAccount({ ...newAccount, workspace: 'PF' })} className={`flex-1 py-3 text-xs font-black rounded-lg ${newAccount.workspace === 'PF' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}>PF</button>
                            <button onClick={() => setNewAccount({ ...newAccount, workspace: 'PJ' })} className={`flex-1 py-3 text-xs font-black rounded-lg ${newAccount.workspace === 'PJ' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}>PJ</button>
                        </div>

                        <button onClick={onSave} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-black text-lg">Salvar Lançamento</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Selector for update type */}
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                            <button
                                onClick={() => { setBalanceMode('operational'); setOperationalDelta(''); setReserveDelta(''); }}
                                className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${balanceMode === 'operational' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}
                            >
                                CAIXA OPERACIONAL PJ
                            </button>
                            <button
                                onClick={() => { setBalanceMode('reserve'); setOperationalDelta(''); setReserveDelta(''); }}
                                className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${balanceMode === 'reserve' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-400'}`}
                            >
                                CAIXA INTOCÁVEL PJ
                            </button>
                        </div>

                        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/20 text-center">
                            <p className="text-sm font-medium text-blue-600">
                                O valor inserido irá <strong>substituir</strong> o saldo atual do {balanceMode === 'operational' ? 'Caixa Operacional' : 'Caixa Intocável'}.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="block font-bold text-gray-500 text-sm uppercase tracking-wide">
                                {balanceMode === 'operational' ? 'Novo Valor Operacional' : 'Novo Valor Intocável'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                                    {balanceMode === 'operational' ? <Building2 size={20} /> : <Wallet size={20} />}
                                </div>
                                <input
                                    type="text"
                                    placeholder="R$ 0,00"
                                    value={balanceMode === 'operational' ? formatCurrency(operationalDelta) : formatCurrency(reserveDelta)}
                                    onChange={(e) => {
                                        if (balanceMode === 'operational') handleCurrencyChange(e, setOperationalDelta);
                                        else handleCurrencyChange(e, setReserveDelta);
                                    }}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl font-bold dark:text-white text-lg"
                                />
                            </div>
                        </div>

                        <button onClick={handleBalanceSave} className="w-full py-5 rounded-3xl font-black text-lg text-white bg-black dark:bg-white dark:text-black transition-colors">
                            Atualizar Saldo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
