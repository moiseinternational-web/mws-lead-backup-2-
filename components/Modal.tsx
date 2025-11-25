

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'default' | 'large' | 'extra-large';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'default' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        default: 'max-w-md sm:max-w-lg md:max-w-2xl',
        large: 'max-w-md sm:max-w-xl md:max-w-4xl',
        'extra-large': 'max-w-md sm:max-w-3xl md:max-w-6xl lg:max-w-7xl'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-2 sm:p-4" onClick={onClose}>
            <div 
                className={`bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-300 rounded-lg shadow-xl w-full ${sizeClasses[size]} border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;