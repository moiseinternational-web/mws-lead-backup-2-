import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useTranslation();
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between text-sm">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
                <ChevronLeft size={16} className="mr-1" />
                {t('pagination.previous')}
            </button>
            <span className="text-gray-500 dark:text-gray-400 mx-4">
                {t('pagination.page', { currentPage, totalPages })}
            </span>
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
                {t('pagination.next')}
                <ChevronRight size={16} className="ml-1" />
            </button>
        </div>
    );
};

export default Pagination;
