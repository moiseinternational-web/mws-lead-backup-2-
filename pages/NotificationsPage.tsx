import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';
import type { Notification } from '../types';
import { Bell, Loader2, CheckCheck, BellOff } from 'lucide-react';
import NotificationDetailModal from '../components/NotificationDetailModal';
import { useTranslation } from 'react-i18next';

const NotificationsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAllNotifications = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Fetch ALL notifications, no limit
            const data = await ApiService.getNotificationsForUser(user.id);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch all notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAllNotifications();
    }, [fetchAllNotifications]);

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsModalOpen(true);
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
    };
    
    const handleMarkAsRead = async (notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        try {
            await ApiService.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Revert on error if needed
            fetchAllNotifications(); 
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;
        
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            if (user) {
                await ApiService.markAllNotificationsAsRead(user.id);
            }
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            fetchAllNotifications(); // Revert on error
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center space-x-3">
                        <Bell className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('page_notifications.title')}</h2>
                    </div>
                    {unreadCount > 0 && (
                         <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center justify-center bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-sm font-semibold"
                        >
                            <CheckCheck size={16} className="mr-2" />
                            {t('page_notifications.mark_all_as_read')}
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 dark:text-gray-400">
                        <BellOff className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg">{t('page_notifications.no_notifications')}</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {notifications.map(notification => (
                            <li
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 rounded-lg border transition-colors cursor-pointer flex items-start space-x-4 ${
                                    !notification.read 
                                    ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20 hover:bg-primary-100 dark:hover:bg-primary-500/20' 
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {!notification.read && (
                                    <div 
                                        className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"
                                        aria-label={t('lead_status.Nuovo')}
                                    ></div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                                        <p className="text-md font-semibold text-slate-800 dark:text-white truncate">
                                            {notification.title || t('component_notificationPanel.title')}
                                        </p>
                                        <span className="text-xs text-slate-500 dark:text-gray-400 flex-shrink-0">
                                            {new Date(notification.created_at).toLocaleString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                                        {notification.message}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <NotificationDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                notification={selectedNotification}
            />
        </>
    );
};

export default NotificationsPage;
