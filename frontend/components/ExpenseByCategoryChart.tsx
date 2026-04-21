import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, Filter, X } from 'lucide-react';
import { parseDateLocal } from '../utils/dateUtils';
import { AccountPayable, AccountStatus } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/formatCurrency';

// Vibrant color palette for pie slices
const COLORS = [
    '#22d3ee', // cyan
    '#818cf8', // indigo
    '#f472b6', // pink
    '#fb923c', // orange
    '#a3e635', // lime
    '#facc15', // yellow
    '#34d399', // emerald
    '#f87171', // red
    '#60a5fa', // blue
    '#e879f9', // fuchsia
    '#2dd4bf', // teal
    '#fbbf24', // amber
    '#c084fc', // purple
    '#38bdf8', // sky
    '#fb7185', // rose
    '#4ade80', // green
];

interface ExpenseByCategoryChartProps {
    accounts: AccountPayable[];
    viewDate: Date;
    activeWorkspace: string;
}

interface CategoryData {
    name: string;
    value: number;
    percentage: number;
    [key: string]: string | number;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-3 shadow-xl">
                <p className="text-xs font-bold text-white mb-1">{data.name}</p>
                <p className="text-sm font-black text-cyan-400">{formatCurrency(data.value)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{data.percentage.toFixed(1)}% do total</p>
            </div>
        );
    }
    return null;
};

export const ExpenseByCategoryChart = ({ accounts, viewDate, activeWorkspace }: ExpenseByCategoryChartProps) => {
    const [localWorkspaceFilter, setLocalWorkspaceFilter] = useState<'AMBOS' | 'PF' | 'PJ'>('AMBOS');
    const [excludedCategories, setExcludedCategories] = useState<Set<string>>(new Set());
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);

    // Compute the effective workspace: use parent workspace if not AMBOS, otherwise use local filter
    const effectiveWorkspace = activeWorkspace !== 'AMBOS' ? activeWorkspace : localWorkspaceFilter;

    // Filter accounts by month and workspace, then aggregate by category
    const { chartData, totalValue, allCategories } = useMemo(() => {
        const monthAccounts = accounts.filter(acc => {
            const accDate = parseDateLocal(acc.dueDate);
            const isCorrectMonth = accDate.getMonth() === viewDate.getMonth() &&
                accDate.getFullYear() === viewDate.getFullYear();
            const workspaceMatch = effectiveWorkspace === 'AMBOS' || acc.workspace === effectiveWorkspace;
            return isCorrectMonth && workspaceMatch;
        });

        // Aggregate by category
        const categoryMap = new Map<string, number>();
        monthAccounts.forEach(acc => {
            const cat = acc.category || 'Sem Categoria';
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + acc.amount);
        });

        const allCats = Array.from(categoryMap.keys()).sort();

        const total = Array.from(categoryMap.values()).reduce((sum, v) => sum + v, 0);

        const data: CategoryData[] = Array.from(categoryMap.entries())
            .filter(([name]) => !excludedCategories.has(name))
            .map(([name, value]) => ({
                name,
                value,
                percentage: total > 0 ? (value / total) * 100 : 0,
            }))
            .sort((a, b) => b.value - a.value);

        return { chartData: data, totalValue: total, allCategories: allCats };
    }, [accounts, viewDate, effectiveWorkspace, excludedCategories]);

    const filteredTotal = chartData.reduce((sum, d) => sum + d.value, 0);

    const toggleCategory = (cat: string) => {
        setExcludedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) {
                next.delete(cat);
            } else {
                next.add(cat);
            }
            return next;
        });
        setActiveIndex(undefined);
    };

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(undefined);
    };

    return (
        <div className="bg-card p-4 lg:p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <PieChartIcon size={20} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">Despesas por Categoria</h3>
                        <p className="text-xs text-muted-foreground">
                            {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                            {effectiveWorkspace !== 'AMBOS' && <span className="ml-1 text-cyan-400">• {effectiveWorkspace}</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Category Filter Toggle */}
                    <button
                        onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                        className={`p-2.5 rounded-xl border transition-all ${showCategoryFilter
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:border-gray-400'
                            }`}
                        title="Filtrar categorias"
                    >
                        <Filter size={16} />
                    </button>

                    {/* Workspace Filter Pills */}
                    {activeWorkspace === 'AMBOS' && (
                        <div className="flex p-1 bg-muted border border-border rounded-xl">
                            {(['AMBOS', 'PJ', 'PF'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => { setLocalWorkspaceFilter(type); setActiveIndex(undefined); }}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${localWorkspaceFilter === type
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Category Filter Chips */}
            {showCategoryFilter && allCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-3 bg-muted/30 rounded-xl border border-border animate-in slide-in-from-top-2 duration-200">
                    {allCategories.map(cat => {
                        const isExcluded = excludedCategories.has(cat);
                        const colorIndex = allCategories.indexOf(cat) % COLORS.length;
                        return (
                            <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${isExcluded
                                    ? 'bg-muted/50 text-muted-foreground line-through opacity-50 hover:opacity-75'
                                    : 'text-white hover:scale-105'
                                    }`}
                                style={!isExcluded ? { backgroundColor: COLORS[colorIndex] + '30', color: COLORS[colorIndex], borderWidth: 1, borderColor: COLORS[colorIndex] + '40' } : {}}
                            >
                                {!isExcluded && (
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[colorIndex] }} />
                                )}
                                {cat}
                                {isExcluded && <X size={10} />}
                            </button>
                        );
                    })}
                    {excludedCategories.size > 0 && (
                        <button
                            onClick={() => { setExcludedCategories(new Set()); setActiveIndex(undefined); }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/10 transition-all border border-cyan-500/30"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            )}

            {/* Chart + Legend Layout */}
            {chartData.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Pie Chart */}
                    <div className="w-full lg:w-1/2 flex justify-center" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    onMouseLeave={onPieLeave}
                                    animationBegin={0}
                                    animationDuration={800}
                                    animationEasing="ease-out"
                                    paddingAngle={2}
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => {
                                        const originalIndex = allCategories.indexOf(entry.name);
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[originalIndex % COLORS.length]}
                                                opacity={activeIndex !== undefined && activeIndex !== index ? 0.35 : 1}
                                                style={{ transition: 'opacity 0.3s ease', cursor: 'pointer' }}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="w-full lg:w-1/2 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {chartData.map((entry, index) => {
                            const originalIndex = allCategories.indexOf(entry.name);
                            const color = COLORS[originalIndex % COLORS.length];
                            const isActive = activeIndex === index;
                            return (
                                <div
                                    key={entry.name}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-default ${isActive ? 'bg-muted/50 scale-[1.02]' : 'hover:bg-muted/30'
                                        }`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(undefined)}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                                        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                                    />
                                    <span className="flex-1 text-xs font-bold text-foreground truncate">{entry.name}</span>
                                    <span className="text-xs font-black text-foreground tabular-nums">{formatCompactCurrency(entry.value)}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground w-12 text-right tabular-nums">
                                        {entry.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            );
                        })}

                        {/* Total Row */}
                        <div className="flex items-center gap-3 p-2.5 rounded-xl border-t border-border mt-2 pt-3">
                            <span className="w-3 h-3" />
                            <span className="flex-1 text-xs font-black text-muted-foreground uppercase tracking-wider">Total</span>
                            <span className="text-sm font-black text-foreground tabular-nums">{formatCompactCurrency(filteredTotal)}</span>
                            <span className="text-[10px] font-bold text-muted-foreground w-12 text-right">100%</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-16 text-center text-muted-foreground animate-in fade-in">
                    <PieChartIcon size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Nenhuma despesa encontrada neste período</p>
                </div>
            )}
        </div>
    );
};
