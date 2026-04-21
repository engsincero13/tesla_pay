import React from 'react';
import { ViewType } from '../data/constants';
import { LogOut, UserCircle, Sun, Moon, RefreshCcw } from 'lucide-react';
import PillNav from './PillNav';

interface HeaderProps {
    userName: string;
    onLogout: () => void;
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
    onProfileClick: () => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onRefresh: () => void;
    userRoles?: string[];
}

export const Header = ({ userName, onLogout, activeView, setActiveView, onProfileClick, isDarkMode, onToggleTheme, onRefresh, userRoles = [] }: HeaderProps) => {
    const isAdmin = userRoles.includes('admin');
    const isEditor = userRoles.includes('editor');

    const canSeeNav = isAdmin;

    return (

        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/95 border-b border-border h-[72px] flex items-center justify-between px-4 md:px-8 shadow-sm transition-colors duration-300">

            {/* Left: Logo + User */}
            <div className="flex items-center gap-4">
                <img src="/logo-tesla-svg.svg" alt="Tesla Pay" className="h-10 w-auto" />
                <div className="hidden md:block w-px h-8 bg-border" />
                <span className="hidden md:block text-sm font-medium text-muted-foreground">Olá, {userName}</span>
            </div>

            {/* Center: Navigation (PillNav) - Adjusted for new layout */}
            {canSeeNav && (
                <div className="absolute left-1/2 -translate-x-1/2">
                    <PillNav
                        logo=""
                        items={[
                            { label: 'Dashboard', href: 'dashboard' },
                            { label: 'Categorias', href: 'categories' },
                            { label: 'Remuneracao', href: 'remuneration' }
                        ]}
                        activeHref={activeView}
                        onItemClick={(item) => setActiveView(item.href as ViewType)}
                        className="w-auto"
                        // Dynamic colors based on theme
                        baseColor="transparent"
                        pillColor={isDarkMode ? "#FFFFFF" : "#1E88E5"}
                        pillTextColor={isDarkMode ? "#151A21" : "#FFFFFF"}
                        hoveredPillTextColor={isDarkMode ? "#151A21" : "#FFFFFF"}
                        initialLoadAnimation={false}
                        mobileMenuBg={isDarkMode ? "#151A21" : "#FFFFFF"}
                    />
                </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleTheme}
                    className="flex items-center justify-center size-10 bg-accent/50 hover:bg-accent border border-border rounded-xl transition-all active:scale-95 text-muted-foreground hover:text-foreground"
                    title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={onRefresh}
                    className="flex items-center justify-center size-10 bg-accent/50 hover:bg-accent border border-border rounded-xl transition-all active:scale-95 text-muted-foreground hover:text-foreground"
                    title="Atualizar Dados"
                >
                    <RefreshCcw size={20} />
                </button>
                <button
                    onClick={onProfileClick}
                    className="flex items-center justify-center size-10 bg-accent/50 hover:bg-accent border border-border rounded-xl transition-all active:scale-95 text-muted-foreground hover:text-foreground"
                    title="Perfil"
                >
                    <UserCircle size={20} />
                </button>
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center size-10 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-xl transition-all active:scale-95 text-destructive"
                    title="Sair"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
