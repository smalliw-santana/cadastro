import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, LucideIcon } from 'lucide-react';
import { Spinner } from './Spinner.tsx';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isProcessing?: boolean;
    icon?: LucideIcon;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    isProcessing = false,
    icon: Icon = AlertTriangle,
    variant = 'danger'
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const getIconColor = () => {
        switch (variant) {
            case 'danger': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            case 'warning': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
            case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            default: return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
        }
    };

    const getButtonColor = () => {
         switch (variant) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-500/30 text-white';
            case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30 text-white';
            case 'info': return 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 text-white';
            default: return 'bg-red-600 hover:bg-red-700 shadow-red-500/30 text-white';
        }
    }

    const { text, bg } = (() => {
        switch (variant) {
            case 'danger': return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
            case 'warning': return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
            case 'info': return { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
            default: return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
        }
    })();

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s] print:hidden">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${bg}`}>
                        <Icon className={`w-8 h-8 ${text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
                    <p className="text-slate-500 mb-6">{message}</p>
                    
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-600 rounded-xl transition-colors font-medium disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`px-5 py-2.5 rounded-xl transition-colors font-medium shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${getButtonColor()}`}
                        >
                            {isProcessing ? <Spinner size="sm" variant="white" /> : <Icon className="w-4 h-4" />}
                            {isProcessing ? "Processando..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
