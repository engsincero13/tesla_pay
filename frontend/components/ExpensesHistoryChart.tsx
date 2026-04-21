import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parseDateLocal } from '../utils/dateUtils';
import { AccountPayable, AccountStatus } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface ExpensesHistoryChartProps {
    accounts: AccountPayable[];
    activeWorkspace: string;
}

// Fixed color palette matching the sleek UI preference
const CATEGORY_COLORS = [
    '#2dd4bf', // teal (like Folha Salarial)
    '#38bdf8', // sky (Fornecedores)
    '#8b5cf6', // violet (Cartão de Crédito)
    '#fb923c', // orange (Impostos)
    '#f472b6', // pink (Benefícios)
    '#a3e635', // lime (Infra)
    '#facc15', '#f87171', '#60a5fa', '#e879f9',
    '#fbbf24', '#c084fc', '#fb7185', '#4ade80'
];

/**
 * Format number to "K" representation without decimals
 * e.g., 474500 -> 475k
 */
const formatK = (value: number) => {
    if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Sort payload by value descending
        const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
        return (
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-5 py-4 shadow-2xl z-50 min-w-[200px]">
                <p className="text-xs font-bold text-slate-400 mb-3">{label}</p>
                <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {sortedPayload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-[13px] text-slate-300 font-medium truncate max-w-[150px]">{entry.name}</span>
                            </div>
                            <span className="text-[13px] font-bold text-white">
                                R$ {formatK(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const CustomActiveDot = (props: any) => {
    const { cx, cy, stroke } = props;
    return (
        <circle cx={cx} cy={cy} r={6} fill={stroke} stroke="#1e293b" strokeWidth={3} />
    );
};

// Render dots with values only for the top 2 highest expenses per month
const CustomValueDot = (props: any) => {
    const { cx, cy, stroke, value, payload, dataKey } = props;

    // Recharts Area dot receives value as [base, top] array
    const numericValue = Array.isArray(value) ? value[1] : value;

    if (!numericValue || numericValue <= 0) return null;

    // Filter out metadata to find the top categories for this month
    const activeKeys = Object.keys(payload).filter(k => k !== 'label' && k !== 'sortKey' && k !== 'timestamp');
    const sortedKeys = activeKeys.sort((a, b) => (payload[b] || 0) - (payload[a] || 0));

    // Check if this category is in the top 2
    const isTop2 = sortedKeys.indexOf(dataKey) < 2;

    if (!isTop2) {
        return null; // Don't draw dot or text for lower values
    }

    return (
        <g>
            <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="#1e293b" strokeWidth={2} />
            <text
                x={cx}
                y={cy - 12}
                textAnchor="middle"
                fill={stroke}
                className="text-[11px] font-black"
                style={{ fontSize: '11px', fontWeight: 'bold' }}
            >
                R$ {formatK(numericValue)}
            </text>
        </g>
    );
};

export const ExpensesHistoryChart = ({ accounts, activeWorkspace }: ExpensesHistoryChartProps) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const { chartData, availableCategories, colorMap, dateRangeStr } = useMemo(() => {
        const filteredAccounts = accounts.filter(acc => {
            if (acc.status !== AccountStatus.PAID && acc.status !== AccountStatus.PENDING) return false;
            if (activeWorkspace !== 'AMBOS' && acc.workspace !== activeWorkspace) return false;

            const accDate = parseDateLocal(acc.dueDate);
            const limitDate = new Date(2025, 11, 1); // Dec 1, 2025
            if (accDate < limitDate) return false;
            return true;
        });

        const catTotals: Record<string, number> = {};
        const monthsData: { [key: string]: { label: string, sortKey: string, timestamp: number, [category: string]: any } } = {};

        let minDate = new Date(9999, 11, 1);
        let maxDate = new Date(2000, 11, 1);

        filteredAccounts.forEach(acc => {
            const cat = acc.category || 'Sem Categoria';
            const accDate = parseDateLocal(acc.dueDate);
            if (accDate > maxDate) maxDate = accDate;
            if (accDate < minDate) minDate = accDate;
            catTotals[cat] = (catTotals[cat] || 0) + acc.amount;
        });

        if (minDate > maxDate) {
            minDate = new Date(2025, 11, 1);
            maxDate = new Date(2025, 11, 1);
        }

        const sortedCategories = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);

        const catColorMap: Record<string, string> = {};
        sortedCategories.forEach((cat, index) => {
            catColorMap[cat] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        });

        let endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
        let startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

        const absoluteStart = new Date(2025, 11, 1);
        if (startMonth < absoluteStart) {
            startMonth = absoluteStart;
        }

        const limit12Months = new Date(endMonth.getFullYear(), endMonth.getMonth() - 11, 1);
        if (startMonth < limit12Months) {
            startMonth = limit12Months;
        }

        let currentMonth = new Date(startMonth);
        while (currentMonth <= endMonth) {
            const key = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
            // Format to "Jan/24" matching image
            const label = currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
                .replace('.', '')
                .replace(' de ', '/');
            monthsData[key] = { label: label.charAt(0).toUpperCase() + label.slice(1), sortKey: key, timestamp: currentMonth.getTime() };
            sortedCategories.forEach(cat => { monthsData[key][cat] = 0; });
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        filteredAccounts.forEach(acc => {
            const cat = acc.category || 'Sem Categoria';
            const accDate = parseDateLocal(acc.dueDate);
            const key = `${accDate.getFullYear()}-${String(accDate.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) monthsData[key][cat] += acc.amount;
        });

        const data = Object.values(monthsData).sort((a, b) => a.timestamp - b.timestamp);

        let rangeStr = "";
        if (data.length > 0) {
            const first = new Date(data[0].timestamp);
            const last = new Date(data[data.length - 1].timestamp);
            const formatStr = (d: Date) => {
                const s = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ');
                return s.charAt(0).toUpperCase() + s.slice(1);
            };
            rangeStr = `${formatStr(first)} – ${formatStr(last)}`;
        }

        return { chartData: data, availableCategories: sortedCategories, colorMap: catColorMap, dateRangeStr: rangeStr };
    }, [accounts, activeWorkspace]);

    // Initial select (Top 6 roughly matches image)
    React.useEffect(() => {
        if (selectedCategories.length === 0 && availableCategories.length > 0) {
            setSelectedCategories(availableCategories.slice(0, 6));
        }
    }, [availableCategories]);

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    const activeLines = availableCategories.filter(cat => selectedCategories.includes(cat));

    return (
        <div className="bg-[#0f172a] p-6 lg:p-10 rounded-[24px] border border-[#1e293b] shadow-2xl w-full">

            {/* Header / Title exactly like image */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Histórico de Despesas por Categoria</h3>
                <p className="text-[13px] text-slate-400 font-medium">
                    {dateRangeStr}
                </p>
            </div>

            {/* Horizontal Legend / Filter directly matching the image dots */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-12">
                {availableCategories.map((cat) => {
                    const isActive = selectedCategories.includes(cat);
                    const color = colorMap[cat];
                    return (
                        <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`flex items-center gap-2 transition-all hover:opacity-80 ${!isActive ? 'opacity-40 hover:opacity-100' : ''}`}
                            title={isActive ? 'Ocultar' : 'Mostrar'}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-[13px] font-semibold" style={{ color: isActive ? '#cbd5e1' : '#64748b' }}>
                                {cat}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Area Chart with Left Y-Axis */}
            <div className="w-full h-[450px]">
                {activeLines.length === 0 ? (
                    <div className="flex items-center justify-center w-full h-full text-slate-500 font-medium border border-dashed border-[#1e293b] rounded-xl">
                        Selecione pelo menos uma categoria acima
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                        >
                            <defs>
                                {activeLines.map(cat => (
                                    <linearGradient key={`grad-${cat}`} id={`color-${cat.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colorMap[cat]} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colorMap[cat]} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>

                            {/* Only horizontal lines, very subtle */}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />

                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                dy={15}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                tickFormatter={(val) => val === 0 ? '0' : formatK(val)}
                                dx={-10}
                                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
                                tickCount={6}
                            />

                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />

                            {activeLines.map(cat => (
                                <Area
                                    key={cat}
                                    type="monotone"
                                    dataKey={cat}
                                    name={cat}
                                    stroke={colorMap[cat]}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill={`url(#color-${cat.replace(/\s+/g, '-')})`}
                                    dot={<CustomValueDot />}
                                    activeDot={<CustomActiveDot />}
                                    animationDuration={1000}
                                    animationEasing="ease-in-out"
                                />
                            ))}

                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
