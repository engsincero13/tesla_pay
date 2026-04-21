import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!text) return <span className="text-gray-300 dark:text-gray-700 italic text-[10px]">Sem chave</span>;

    return (
        <div className="flex items-center gap-2 group/copy">
            <span className={`text-[11px] font-bold truncate max-w-[280px] transition-colors ${copied ? 'text-emerald-500' : 'text-blue-500 dark:text-blue-400'}`}>
                {text}
            </span>
            <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
                {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
        </div>
    );
};
