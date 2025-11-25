import React from 'react';
import type { Notification } from '../types';
import { BellOff, CheckCheck, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NotificationPanelProps {
    notifications: Notification[];
    isLoading: boolean;
    onNotificationClick: (notification: Notification) => void;
    onMarkAllAsRead: () => void;
    onClose: () => void;
    basePath: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
    notifications,
    isLoading,
    onNotificationClick,
    onMarkAllAsRead,
    onClose,
    basePath
}) => {
    const { t, i18n } = useTranslation();

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return t('component_notificationPanel.time_now');
        if (minutes < 60) return t('component_notificationPanel.time_minutes_ago', { count: minutes });
        if (hours < 24) return t('component_notificationPanel.time_hours_ago', { count: hours });
        if (days < 7) return t('component_notificationPanel.time_days_ago', { count: days });
        return date.toLocaleDateString(i18n.language);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const MAX_NOTIFICATIONS_IN_PANEL = 5;
    const notificationsToShow = notifications.slice(0, MAX_NOTIFICATIONS_IN_PANEL);
    const hasMoreNotifications = notifications.length > MAX_NOTIFICATIONS_IN_PANEL;

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50 flex flex-col max-h-[80vh]">
            <div className="flex-shrink-0 flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">{t('component_notificationPanel.title')}</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                        aria-label={t('component_notificationPanel.mark_all_as_read')}
                    >
                        <CheckCheck size={14} className="mr-1" />
                        {t('component_notificationPanel.mark_all_as_read')}
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-10">
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                    </div>
                ) : notificationsToShow.length === 0 ? (
                    <div className="text-center p-10 text-slate-500 dark:text-gray-400">
                        <BellOff className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-sm">{t('component_notificationPanel.no_notifications')}</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                        {notificationsToShow.map(notification => (
                            <li
                                key={notification.id}
                                onClick={() => onNotificationClick(notification)}
                                className={`transition-colors cursor-pointer ${!notification.read ? 'bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="p-3 flex items-start space-x-3">
                                    {!notification.read && (
                                        <div 
                                            className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"
                                            aria-label={t('lead_status.Nuovo')}
                                        ></div>
                                    )}
                                    <div className={`flex-1 ${notification.read ? 'pl-[22px]' : ''}`}>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                {notification.title || t('component_notificationPanel.title')}
                                            </p>
                                            <span className="text-xs text-slate-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                {formatRelativeTime(notification.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {hasMoreNotifications && (
                 <div className="flex-shrink-0 p-2 text-center border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <Link to={`${basePath}/notifications`} onClick={onClose} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center">
                        {t('component_notificationPanel.view_all')}
                        <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
