import React from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TermsPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('page_terms.title')}</h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-gray-300">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{t('page_terms.acceptance_title')}</h4>
                <p>
                    {t('page_terms.acceptance_p')}
                </p>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{t('page_terms.description_title')}</h4>
                <p>
                    {t('page_terms.description_p')}
                </p>
                 <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{t('page_terms.account_title')}</h4>
                <p>
                    {t('page_terms.account_p')}
                </p>
                 <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{t('page_terms.liability_title')}</h4>
                <p>
                   {t('page_terms.liability_p')}
                </p>
            </div>
        </div>
    );
};

export default TermsPage;
