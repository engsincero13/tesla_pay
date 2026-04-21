import React, { useMemo, useState } from 'react';
import { Calculator, TrendingUp, Wallet } from 'lucide-react';
import { calculateAllCollaboratorRemunerations } from '../data/remuneration';
import { formatCurrency } from '../utils/formatCurrency';

const DEFAULT_REVENUE = 400000;

export const RemunerationPage = () => {
    const [revenueInput, setRevenueInput] = useState(String(DEFAULT_REVENUE));

    const revenue = useMemo(() => {
        const normalized = revenueInput.replace(/\./g, '').replace(',', '.').trim();
        const parsed = Number(normalized);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }, [revenueInput]);

    const remunerations = useMemo(() => calculateAllCollaboratorRemunerations(revenue), [revenue]);
    const totalPayroll = useMemo(() => remunerations.reduce((sum, item) => sum + item.amount, 0), [remunerations]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
                <div className="bg-[radial-gradient(circle_at_top_left,_rgba(30,136,229,0.18),_transparent_40%),linear-gradient(135deg,rgba(30,136,229,0.06),transparent_55%)] p-6 md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                <Calculator size={14} />
                                Remuneracao
                            </span>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Calculadora da equipe com base na planilha de junho</h2>
                                <p className="text-sm text-muted-foreground md:text-base">
                                    Informe o faturamento mensal e a pagina calcula a remuneracao de cada colaborador com a logica extraida da aba de junho, inclusive para valores acima de R$ 400 mil.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Faturamento mensal</p>
                                <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{formatCurrency(revenue)}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Folha estimada</p>
                                <p className="mt-2 text-2xl font-black tracking-tight text-primary">{formatCurrency(totalPayroll)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 max-w-xl rounded-2xl border border-border bg-background/90 p-4">
                        <label htmlFor="monthly-revenue" className="mb-2 block text-sm font-bold text-foreground">
                            Valor do faturamento mensal
                        </label>
                        <input
                            id="monthly-revenue"
                            type="number"
                            min="0"
                            step="1000"
                            value={revenueInput}
                            onChange={(event) => setRevenueInput(event.target.value)}
                            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Ex.: 400000"
                        />
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            Para faturamentos acima de R$ 400 mil, a tela prolonga a ultima regra conhecida de cada colaborador. Quando o valor informado fica abaixo da primeira faixa da planilha, a calculadora usa o piso conhecido daquela pessoa.
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {remunerations.map((item) => (
                    <article key={item.name} className="rounded-[24px] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">Colaborador</p>
                                <h3 className="mt-1 text-2xl font-black tracking-tight text-foreground">{item.name}</h3>
                            </div>
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <Wallet size={22} />
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Remuneracao estimada</p>
                            <p className="mt-2 text-3xl font-black tracking-tight text-primary">{formatCurrency(item.amount)}</p>
                        </div>

                        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <TrendingUp size={16} className="text-primary" />
                                Regra aplicada
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.label}</p>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Faixa inicial conhecida: {formatCurrency(item.minimumReference)}
                            </p>
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
};
