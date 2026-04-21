import React, { useState, useEffect } from 'react';
import { X, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { parseDateLocal } from '../utils/dateUtils';
import { AccountPayable, AccountStatus } from '../types';
import { Badge } from './ui/Badge';
import { CopyButton } from './ui/CopyButton';
import { DetailItem } from './ui/DetailItem';
import { formatCurrency } from '../utils/formatCurrency';
import { API_BASE } from '../utils/api';

interface AccountDetailsPanelProps {
    selectedAccount: AccountPayable | null;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<AccountPayable>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    userId?: string;
}

interface Category {
    id: string;
    name: string;
    type: 'PF' | 'PJ' | 'GERAL';
}

export const AccountDetailsPanel = ({ selectedAccount, onClose, onUpdate, onDelete, userId }: AccountDetailsPanelProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<AccountPayable>>({});
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (selectedAccount) {
            setFormData(selectedAccount);
            setIsEditing(false);
        }
    }, [selectedAccount]);



    useEffect(() => {
        if (isEditing && userId) {
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
    }, [isEditing, userId]);

    if (!selectedAccount) return null;

    const handleSave = async () => {
        await onUpdate(selectedAccount.id, formData);
        setIsEditing(false);
        onClose();
    };

    const formatCurrencyValue = (value: number | ''): string => {
        if (value === '' || value === undefined || value === null) return '';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const parseCurrencyInput = (inputValue: string): number | '' => {
        const digits = inputValue.replace(/\D/g, '');
        if (!digits) return '';
        return parseInt(digits, 10) / 100;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = parseCurrencyInput(e.target.value);
        setFormData({ ...formData, amount: newVal === '' ? 0 : newVal });
    };

    const handleMarkAsPaid = async () => {
        await onUpdate(selectedAccount.id, { status: AccountStatus.PAID });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-card h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-border">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-foreground tracking-tighter">
                        {isEditing ? 'Editar Lançamento' : 'Detalhes'}
                    </h3>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2 bg-border rounded-full text-foreground hover:scale-110 transition-transform">
                                <Pencil size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><X size={24} /></button>
                    </div>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Header Info */}
                    {!isEditing ? (
                        <div className="flex items-center gap-5">
                            <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center font-black text-2xl shadow-lg ${selectedAccount.workspace === 'PJ' ? 'bg-amber-100/10 text-amber-500' : 'bg-indigo-100/10 text-indigo-500'}`}>
                                {(selectedAccount.supplierName || '?').charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-foreground leading-tight mb-1">{selectedAccount.supplierName}</h4>
                                <div className="flex items-center gap-2">
                                    <Badge status={selectedAccount.status} />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-border px-2 py-0.5 rounded-md">{selectedAccount.workspace}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-muted-foreground uppercase">Fornecedor</label>
                            <input
                                type="text"
                                value={formData.supplierName || ''}
                                onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none"
                            />
                        </div>
                    )}

                    {/* Content */}
                    {!isEditing ? (
                        <>
                            {selectedAccount.pixKey && (
                                <div className="p-5 bg-background rounded-3xl border border-border shadow-sm">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Chave Pix</p>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-sm font-bold truncate text-foreground font-mono">{selectedAccount.pixKey}</span>
                                        <CopyButton text={selectedAccount.pixKey} />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Valor" value={formatCurrency(selectedAccount.amount)} />
                                <DetailItem label="Vencimento" value={parseDateLocal(selectedAccount.dueDate).toLocaleDateString('pt-BR')} />
                                <DetailItem label="Categoria" value={selectedAccount.category} />
                                <DetailItem label="Método" value={selectedAccount.method} />
                                {selectedAccount.category === 'Cartão de Crédito' && selectedAccount.cardClosingDay && (
                                    <DetailItem label="Fechamento Fatura" value={`Dia ${selectedAccount.cardClosingDay}`} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-muted-foreground uppercase">Valor</label>
                                <input
                                    type="text"
                                    value={formatCurrencyValue(formData.amount !== undefined ? formData.amount : '')}
                                    onChange={handleAmountChange}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-muted-foreground uppercase">Vencimento</label>
                                <input
                                    type="date"
                                    value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-muted-foreground uppercase">Chave Pix</label>
                                <input
                                    type="text"
                                    value={formData.pixKey || ''}
                                    onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-muted-foreground uppercase">Tipo de Conta</label>
                                <select
                                    value={formData.workspace || 'PF'}
                                    onChange={e => setFormData({ ...formData, workspace: e.target.value as 'PF' | 'PJ' })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none appearance-none"
                                >
                                    <option value="PF">Pessoa Física (PF)</option>
                                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-muted-foreground uppercase">Categoria</label>
                                <select
                                    value={formData.category || ''}
                                    onChange={e => setFormData({ ...formData, category: e.target.value, ...(e.target.value !== 'Cartão de Crédito' ? { cardClosingDay: undefined } : {}) })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none appearance-none"
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formData.category === 'Cartão de Crédito' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-muted-foreground uppercase">Dia Fechamento Fatura</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={31}
                                        placeholder="Dia (1-31)"
                                        value={formData.cardClosingDay || ''}
                                        onChange={e => setFormData({ ...formData, cardClosingDay: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-muted-foreground uppercase">Status</label>
                                <select
                                    value={formData.status || AccountStatus.PENDING}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as AccountStatus })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl font-bold text-foreground focus:border-primary outline-none appearance-none"
                                >
                                    <option value={AccountStatus.PENDING}>Pendente</option>
                                    <option value={AccountStatus.PAID}>Pago</option>
                                    <option value={AccountStatus.OVERDUE}>Atrasado</option>
                                    <option value={AccountStatus.SCHEDULED}>Programado</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-8 border-t border-border flex flex-col gap-3">
                    {isEditing ? (
                        <button onClick={handleSave} className="w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-glow-blue hover:scale-[1.02] active:scale-[0.98] transition-all">
                            Salvar Alterações
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleMarkAsPaid}
                                disabled={selectedAccount.status === AccountStatus.PAID}
                                className={`w-full py-5 rounded-2xl font-bold shadow-2xl transition-all ${selectedAccount.status === AccountStatus.PAID ? 'bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20' : 'bg-primary hover:bg-primary-dark text-white hover:scale-[1.02] active:scale-[0.98] shadow-glow-blue'}`}
                            >
                                {selectedAccount.status === AccountStatus.PAID ? (
                                    <span className="flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Liquidado</span>
                                ) : 'Marcar como Pago'}
                            </button>
                            <button onClick={() => onDelete(selectedAccount.id)} className="w-full py-3 text-rose-500 font-bold text-sm hover:text-rose-400">
                                Excluir Lançamento
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
