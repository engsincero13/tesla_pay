import React, { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { API_BASE } from '../utils/api';

interface UserData {
    id: string;
    name: string;
    email: string;
    recovery_code?: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const ProfileModal = ({ isOpen, onClose, userId }: ProfileModalProps) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);





    useEffect(() => {
        if (isOpen && userId) {
            fetchUser();
        }
    }, [isOpen, userId]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/me`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setName(data.name);
                setEmail(data.email);
            }
        } catch (err) {
            console.error("Failed to fetch profile");
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify({ userId, name, email })
            });
            if (res.ok) {
                alert('Perfil atualizado!');
            } else {
                alert('Erro ao atualizar.');
            }
        } catch (err) {
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <User className="text-blue-500" /> Meu Perfil
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Seu Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#2C2C2E] rounded-xl px-4 py-3 dark:text-white border border-gray-200 dark:border-transparent focus:border-blue-500 outline-none transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Seu Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-[#2C2C2E] rounded-xl px-4 py-3 dark:text-white border border-gray-200 dark:border-transparent focus:border-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-all"
                        >
                            <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>

                    {/* Password Modal Removed - Managed by Keycloak */}
                </div>
            </div>
        </div>
    );
};
