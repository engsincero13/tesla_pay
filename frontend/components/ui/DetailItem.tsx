import React from 'react';

interface DetailItemProps {
    label: string;
    value: string;
}

export const DetailItem = ({ label, value }: DetailItemProps) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-700/50"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p><p className="text-sm font-bold dark:text-white">{value}</p></div>
);
