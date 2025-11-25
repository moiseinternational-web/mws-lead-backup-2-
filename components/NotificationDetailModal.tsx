import React from 'react';
import Modal from './Modal';
import type { Notification } from '../types';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NotificationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: Notification | null;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ isOpen, onClose, notification }) => {
    const { t, i18n } = useTranslation();
    if (!isOpen || !notification) return null;

    const formattedDate = new Date(notification.created_at).toLocaleString(i18n.language, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={notification.title || t('component_notificationDetailModal.title')}>
            <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={16} className="mr-2" />
                    <span>{formattedDate}</span>
                </div>
                <div className="text-slate-700 dark:text-gray-300 whitespace-pre-wrap">
                    {notification.message}
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                    onClick={onClose}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors"
                >
                    {t('close')}
                </button>
            </div>
        </Modal>
    );
};

export default NotificationDetailModal;
