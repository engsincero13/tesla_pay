import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    subtitle: React.ReactNode;
    icon: React.ElementType;
    colorClass: string;
    onClick?: () => void;
    active?: boolean;
    valueClassName?: string;
    className?: string;
    subtitleClassName?: string;
    variant?: 'default' | 'floating';
}

// Map background colors to text colors explicitly for Tailwind
const getIconColorClass = (bgClass: string): string => {
    const colorMap: Record<string, string> = {
        'bg-orange-500': 'text-orange-500',
        'bg-red-500': 'text-red-500',
        'bg-yellow-500': 'text-yellow-500',
        'bg-green-500': 'text-green-500',
        'bg-blue-500': 'text-blue-500',
        'bg-primary': 'text-primary',
    };
    return colorMap[bgClass] || 'text-gray-500';
};

export const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, onClick, active, className = '', valueClassName = '', subtitleClassName = 'mt-2', variant = 'default' }: StatCardProps) => (
    <div
        onClick={onClick}
        className={`bg-card p-5 rounded-xl flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden border ${active ? 'border-primary ring-1 ring-primary/20 shadow-glow-blue' : 'border-border hover:border-gray-400 dark:hover:border-gray-600'} ${className}`}
    >
        <div className="flex flex-col gap-1 z-10 relative">
            <div className="flex items-start justify-between">
                <p className="text-sm font-bold text-muted-foreground">{title}</p>
                {/* Icon - either colored or floating */}
                {variant === 'floating' ? (
                    <div className="absolute top-0 right-0 opacity-20 transform translate-x-2 -translate-y-2">
                        <Icon size={48} className="text-foreground" />
                    </div>
                ) : (
                    <Icon size={24} className={getIconColorClass(colorClass)} />
                )}
            </div>

            <h3 className={`font-black tracking-tighter transition-colors mt-2 ${active ? 'text-primary' : 'text-card-foreground'} ${valueClassName || 'text-[28px]'}`}>{value}</h3>

            <div className={`text-xs text-muted-foreground font-medium opacity-80 ${subtitleClassName}`}>{subtitle}</div>
        </div>
    </div>
);
