"use client";

import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
    const handleBackToHub = () => {
        signOut({ callbackUrl: 'https://hub.teslatreinamentos.com' });
    };

    return (
        <div className="min-h-screen bg-[#060B14] flex flex-col items-center justify-center px-4">
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)] mb-8">
                <Image src="/logo-tesla-svg.svg" alt="Tesla Logo" width={80} height={80} />
            </div>

            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <ShieldAlert size={48} className="text-red-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-white mb-3">
                    Acesso Não Autorizado
                </h1>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    Você não possui permissões para acessar o <span className="text-cyan-400 font-semibold">Tesla Pay</span>.
                    Entre em contato com o administrador para solicitar acesso.
                </p>

                <button
                    onClick={handleBackToHub}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                    <ArrowLeft size={20} />
                    Voltar para o Hub
                </button>
            </div>

            <p className="text-slate-600 text-sm mt-12">
                Tesla Treinamentos © {new Date().getFullYear()}
            </p>
        </div>
    );
}
