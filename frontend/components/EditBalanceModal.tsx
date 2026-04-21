import React, { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

interface EditBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    balances: { operational: number; reserve: number };
    initialType?: 'operational' | 'reserve';
    onSave: (type: 'operational' | 'reserve', newValue: number) => void;
}

export const EditBalanceModal = ({
    isOpen,
    onClose,
    balances,
    onSave,
}: EditBalanceModalProps) => {
    const [rawValue, setRawValue] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        setRawValue(Math.round((balances.reserve || 0) * 100));
    }, [balances.reserve, isOpen]);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const digits = event.target.value.replace(/\D/g, '');
        setRawValue(Number(digits));
    };

    const formatDisplay = (cents: number) => (
        (cents / 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSave('reserve', rawValue / 100);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 dark:bg-[#1C1C1E]">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold dark:text-white">Editar Caixa Intocavel</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            O Caixa Operacional agora acompanha automaticamente a soma dos saldos de plataforma do dia.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="mb-2 block text-xs font-semibold uppercase text-gray-400">Novo saldo</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500 dark:text-gray-400">R$</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formatDisplay(rawValue)}
                                onChange={handleAmountChange}
                                className="w-full rounded-xl bg-gray-100 py-3 pl-12 pr-4 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#2C2C2E] dark:text-white"
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white transition-all hover:bg-blue-700"
                    >
                        <Save size={20} />
                        Salvar
                    </button>
                </form>
            </div>
        </div>
    );
};
