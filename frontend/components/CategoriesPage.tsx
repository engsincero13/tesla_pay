import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../utils/api';

interface Category {
    id: string;
    name: string;
    type: 'PF' | 'PJ' | 'GERAL';
}

export const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ name: '', type: 'GERAL' });
    useEffect(() => {
        const storedUser = localStorage.getItem('tesla_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserId(parsed?.id ?? null);
        }
    }, []);

    const fetchCategories = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE}/api/categories`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingCategory ? `${API_BASE}/api/categories/${editingCategory.id}` : `${API_BASE}/api/categories`;
            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId ?? ''
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchCategories();
                handleCloseModal();
            } else {
                alert("Erro ao salvar categoria");
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão");
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            const res = await fetch(`${API_BASE}/api/categories/${categoryToDelete}`, {
                method: 'DELETE',
                headers: { 'x-user-id': userId ?? '' }
            });

            if (res.ok) {
                await fetchCategories();
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
            } else {
                alert("Erro ao excluir categoria");
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão");
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, type: category.type });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', type: 'GERAL' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', type: 'GERAL' });
    };

    const categoriesPF = categories.filter(c => c.type === 'PF');
    const categoriesPJ = categories.filter(c => c.type === 'PJ');

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Categorias Cadastradas</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    <Plus size={20} />
                    Nova Categoria
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="group flex items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(cat)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-blue-500">
                                <Pencil size={18} />
                            </button>
                            <button onClick={() => { setCategoryToDelete(cat.id); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && <p className="text-gray-400 italic col-span-full text-center py-10">Nenhuma categoria cadastrada.</p>}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black dark:text-white">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Nome da Categoria</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none font-bold dark:text-white"
                                    placeholder="Ex: Marketing"
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Hidden Type Field (Defaults to 'GERAL') */}
                            <input type="hidden" value={formData.type} />

                            <button type="submit" className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-transform">
                                Salvar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white mb-2">Excluir Categoria?</h3>
                        <p className="text-gray-500 mb-8 text-sm">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
