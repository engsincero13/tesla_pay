import React from 'react';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick: () => void;
    isDarkMode: boolean;
}

export const NavItem = ({ icon: Icon, label, active = false, onClick, isDarkMode }: NavItemProps) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 text-sm font-bold rounded-2xl transition-all ${active ? (isDarkMode ? 'bg-[#F5F5F7] text-black shadow-lg' : 'bg-black text-white shadow-lg') : 'text-gray-400 hover:text-black dark:hover:text-white'}`}><Icon size={20} /> {label}</button>
);
