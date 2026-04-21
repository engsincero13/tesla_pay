import React, { useEffect, useState } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import { API_BASE } from '../utils/api';
import { formatCompactCurrency } from '../utils/formatCurrency';

interface HistoryPoint {
    value: number;
    date: string;
}

interface ReserveHistoryChartProps {
    currentBalance: number;
    userId?: string;
}

export const ReserveHistoryChart = ({ currentBalance, userId }: ReserveHistoryChartProps) => {
    const [data, setData] = useState<HistoryPoint[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`${API_BASE}/api/balances/history`, {
                    headers: { 'x-user-id': userId }
                });
                if (res.ok) {
                    const history = await res.json();

                    let formatted = history.map((h: any) => ({
                        value: Number(h.value),
                        date: h.date, // Keep as is initially
                    }));

                    // Logic to ensure line chart has a start point at 0
                    if (formatted.length === 0) {
                        // No history, create line from 0 to current
                        const now = new Date();
                        const start = new Date(now);
                        start.setDate(start.getDate() - 1); // Start yesterday at 0

                        formatted = [
                            { value: 0, date: start.toISOString() },
                            { value: currentBalance, date: now.toISOString() }
                        ];
                    } else if (formatted.length === 1) {
                        // One point, add 0 point before it
                        const firstDate = new Date(formatted[0].date);
                        const start = new Date(firstDate);
                        start.setDate(start.getDate() - 1);
                        formatted.unshift({ value: 0, date: start.toISOString() });
                    } else {
                        // Multiple points, nice to have start at 0 if the first value isn't 0?
                        // User asked "line from 0,0 to first point". 
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
    }, [userId, currentBalance]);

    if (data.length === 0) return null;

    return (
        <div className="h-[250px] w-full mt-4 pr-2 select-none">
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
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0, fill: '#fff' }}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
