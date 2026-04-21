import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Repeat } from 'lucide-react';

interface DateNavigationProps {
    viewDate: Date;
    setViewDate: React.Dispatch<React.SetStateAction<Date>>;
    changeMonth: (offset: number) => void;
    onReplicateMonth: () => void;
    availableMonths: Date[];
}

export const DateNavigation = ({ viewDate, setViewDate, changeMonth, onReplicateMonth, availableMonths }: DateNavigationProps) => {
    const formattedShortDate = viewDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase() + ' / ' + viewDate.getFullYear();

    // Calculate next month name for the button
    const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    const nextMonthName = nextMonthDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    return (
        <div className="bg-card p-4 rounded-3xl border border-border apple-shadow transition-colors mb-8">

            {/* --- MOBILE LAYOUT (lg:hidden) --- */}
            <div className="flex flex-col gap-4 lg:hidden">
                {/* Top: Date Info */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Período Ativo</span>
                    <div className="flex items-center gap-3">
                        <CalendarIcon size={18} className="text-primary" />
                        <h4 className="text-xl font-black text-foreground">{formattedShortDate}</h4>
                    </div>
                </div>

                {/* Bottom: Controls Row [<] [Replicar] [>] */}
                <div className="flex items-center justify-between gap-2">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-3 bg-muted rounded-xl text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={onReplicateMonth}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-sm whitespace-nowrap"
                    >
                        <Repeat size={14} />
                        Replicar {nextMonthName}
                    </button>

                    <button
                        onClick={() => changeMonth(1)}
                        className="p-3 bg-muted rounded-xl text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* --- DESKTOP LAYOUT (hidden lg:flex) --- */}
            <div className="hidden lg:flex items-center justify-between">

                {/* Left: Nav Controls */}
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-1">
                        {availableMonths.map(date => {
                            const label = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
                            const isActive = date.getMonth() === viewDate.getMonth() && date.getFullYear() === viewDate.getFullYear();

                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => setViewDate(date)}
                                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Center: Date Info */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Período Ativo</span>
                    <div className="flex items-center gap-3">
                        <CalendarIcon size={18} className="text-primary" />
                        <h4 className="text-xl font-black text-foreground">{formattedShortDate}</h4>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onReplicateMonth}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                    >
                        <Repeat size={14} />
                        Replicar para {nextMonthName}
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
