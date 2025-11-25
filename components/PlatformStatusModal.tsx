import React from 'react';
import Modal from './Modal';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PlatformStatus } from './Header';

interface PlatformStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: PlatformStatus | null;
    onRefresh: () => void;
    isRefreshing: boolean;
}

const PlatformStatusModal: React.FC<PlatformStatusModalProps> = ({ isOpen, onClose, status, onRefresh, isRefreshing }) => {
    const { t } = useTranslation();

    const statusConfig = {
        Operational: {
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            textClass: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-500/20',
            text: t('platform_status.operational')
        },
        Degraded: {
            icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
            textClass: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-500/20',
            text: t('platform_status.degraded')
        },
        Outage: {
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            textClass: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-500/20',
            text: t('platform_status.outage')
        }
    };
    
    const renderContent = () => {
        if (isRefreshing || !status) {
            return (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            );
        }

        const overallStatusInfo = statusConfig[status.overallStatus];

        return (
            <div className="space-y-6">
                <div className={`p-4 rounded-lg flex items-center justify-between ${overallStatusInfo.bgColor}`}>
                    <div className="flex items-center">
                        {overallStatusInfo.icon}
                        <span className={`ml-3 font-semibold ${overallStatusInfo.textClass}`}>
                            {status.overallStatus === 'Operational' ? t('platform_status.all_ok') : t('platform_status.problems')}
                        </span>
                    </div>
                     <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        title={t('platform_status.refresh')}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
                
                <ul className="space-y-3">
                    {status.services.map(service => {
                        const serviceStatusInfo = statusConfig[service.status];
                        return (
                             <li key={service.name} className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                <span className="font-medium text-slate-800 dark:text-white">{service.name}</span>
                                <div className="flex items-center">
                                    {serviceStatusInfo.icon}
                                    <span className={`ml-2 text-sm font-semibold ${serviceStatusInfo.textClass}`}>{service.description}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <div className="text-center text-xs text-slate-500 dark:text-gray-400">
                    {t('platform_status.last_checked')}: {status.lastChecked}
                </div>
            </div>
        );
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('platform_status.title')}>
            {renderContent()}
        </Modal>
    );
};

export default PlatformStatusModal;