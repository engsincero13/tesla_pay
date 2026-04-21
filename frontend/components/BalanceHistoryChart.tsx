import React, { useEffect, useState } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import { API_BASE } from '../utils/api';
import { formatCompactCurrency } from '../utils/formatCurrency';

interface HistoryPoint {
    value: number;
    date: string;
}

interface BalanceHistoryChartProps {
    currentBalance: number;
    userId?: string;
    type: 'operational' | 'reserve';
    height?: number;
    color?: string;
    className?: string; // Add className prop
}

export const BalanceHistoryChart = ({ currentBalance, userId, type, height = 250, color = "#60a5fa", className = "mt-4" }: BalanceHistoryChartProps) => {
    const [data, setData] = useState<HistoryPoint[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;
            try {
                // Fetch with type parameter
                const res = await fetch(`${API_BASE}/api/balances/history?type=${type}`, {
                    headers: { 'x-user-id': userId }
                });
                if (res.ok) {
                    const history = await res.json();

                    let formatted = history.map((h: any) => ({
                        value: Number(h.value),
                        date: h.date,
                    }));

                    // Logic to ensure line chart has a start point at 0
                    if (formatted.length === 0) {
                        const now = new Date();
                        const start = new Date(now);
                        start.setDate(start.getDate() - 1);
                        formatted = [
                            { value: 0, date: start.toISOString() },
                            { value: currentBalance, date: now.toISOString() }
                        ];
                    } else if (formatted.length === 1) {
                        const firstDate = new Date(formatted[0].date);
                        const start = new Date(firstDate);
                        start.setDate(start.getDate() - 1);
                        formatted.unshift({ value: 0, date: start.toISOString() });
                    } else {
                        const firstDate = new Date(formatted[0].date);
                        const start = new Date(firstDate);
                        start.setDate(start.getDate() - 1);
                        formatted.unshift({ value: 0, date: start.toISOString() });
                    }

                    setData(formatted);
                }
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        fetchHistory();
    }, [userId, currentBalance, type]);

    if (data.length === 0) return null;

    return (
        <div className={`w-full pr-2 select-none ${className}`} style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                            try {
                                const d = new Date(str);
                                return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                            } catch (e) { return ''; }
                        }}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={true}
                        axisLine={true}
                        minTickGap={30}
                        dy={10}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={true}
                        axisLine={true}
                        tickFormatter={(val) => formatCompactCurrency(val)}
                        width={45}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#f8fafc',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        formatter={(value: number) => [formatCompactCurrency(value), '']}
                        labelFormatter={(label) => {
                            try {
                                return new Date(label).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            } catch (e) { return ''; }
                        }}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: color, strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0, fill: '#fff' }}
                        isAnimationActive={true}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
