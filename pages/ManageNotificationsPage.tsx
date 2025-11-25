import React, { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/apiService';
import type { Notification } from '../types';
import { Bell, Edit, Trash2, Loader2, BellOff } from 'lucide-react';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';

// Edit Notification Form component inside the page
const EditNotificationForm: React.FC<{
    notification: Notification;
    onSuccess: () => void;
    onCancel: () => void;
}> = ({ notification, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState(notification.title || '');
    const [message, setMessage] = useState(notification.message);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !message.trim()) {
            setError(t('page_manageNotifications.edit_form.empty_error'));
            return;
        }

        if (!window.confirm(t('page_manageNotifications.edit_form.confirm_resend'))) {
            return;
        }

        setIsLoading(true);
        try {
            await ApiService.updateSentNotification(notification, title, message);
            onSuccess();
        } catch (err: any) {
            setError(err.message || t('page_manageNotifications.edit_form.error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700 dark:text-gray-300">{t('page_manageNotifications.edit_form.title_label')}</label>
                <input id="edit-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
            </div>
            <div>
                <label htmlFor="edit-message" className="block text-sm font-medium text-slate-700 dark:text-gray-300">{t('page_manageNotifications.edit_form.message_label')}</label>
                <textarea id="edit-message" value={message} onChange={e => setMessage(e.target.value)} rows={5} required className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={onCancel} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">{t('cancel')}</button>
                <button type="submit" disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 disabled:opacity-50">
                    {isLoading ? t('page_manageNotifications.edit_form.saving') : t('page_manageNotifications.edit_form.save_and_resend')}
                </button>
            </div>
        </form>
    );
};


const ManageNotificationsPage: React.FC = () => {
    const { t } = useTranslation();
    const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSentNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ApiService.getSentNotifications();
            setSentNotifications(data);
        } catch (error) {
            console.error("Failed to fetch sent notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSentNotifications();
    }, [fetchSentNotifications]);

    const handleEdit = (notification: Notification) => {
        setEditingNotification(notification);
        setIsModalOpen(true);
    };

    const handleDelete = async (notification: Notification) => {
        if (window.confirm(t('page_manageNotifications.confirm_delete'))) {
            try {
                await ApiService.deleteSentNotification(notification);
                setSentNotifications(prev => prev.filter(n => n.id !== notification.id));
            } catch (error) {
                console.error("Failed to delete notification:", error);
                alert(t('page_manageNotifications.delete_error'));
            }
        }
    };
    
    const handleModalSuccess = () => {
        setIsModalOpen(false);
        setEditingNotification(null);
        fetchSentNotifications(); // Refresh data
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-6xl mx-auto">
                <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <Bell className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('page_manageNotifications.title')}</h2>
                </div>
                
                {sentNotifications.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 dark:text-gray-400">
                        <BellOff className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg">{t('page_manageNotifications.no_notifications_sent')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('page_sendNotification.title_label')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('page_manageNotifications.message_preview')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('page_manageNotifications.date_sent')}</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                {sentNotifications.map(notification => (
                                    <tr key={notification.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{notification.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400 max-w-sm truncate">{notification.message}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">{new Date(notification.created_at).toLocaleString('it-IT')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(notification)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(notification)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('page_manageNotifications.modal_edit_title')}>
                {editingNotification && (
                    <EditNotificationForm
                        notification={editingNotification}
                        onSuccess={handleModalSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>
        </>
    );
};

export default ManageNotificationsPage;
