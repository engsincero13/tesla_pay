import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonText?: string;
}

export const SuccessModal = ({ isOpen, onClose, title, message, buttonText = "OK" }: SuccessModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle2 size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-500/30 mt-2"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};
