

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, User as UserIcon, ChevronDown, Settings, FileText, MessageSquare, Sun, Moon, Bell, Send, Languages, Users, MapPin, Loader2, Server } from 'lucide-react';
import { ApiService } from '../services/apiService';
import type { Notification } from '../types';
import NotificationPanel from './NotificationPanel';
import NotificationDetailModal from './NotificationDetailModal';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import Modal from './Modal';
import PlatformStatusModal from './PlatformStatusModal';

interface OnlineUser {
  id: string;
  username: string;
  ip: string;
  online_at: string;
}

interface ServiceStatus {
    name: string;
    status: 'Operational' | 'Degraded' | 'Outage';
    description: string;
}

export interface PlatformStatus {
    overallStatus: 'Operational' | 'Degraded' | 'Outage';
    lastChecked: string;
    services: ServiceStatus[];
}

const LiveUsersModal: React.FC<{ isOpen: boolean; onClose: () => void; users: OnlineUser[]; t: any }> = ({ isOpen, onClose, users, t }) => {
    const [locations, setLocations] = useState<Record<string, any>>({});
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (isOpen && users.length > 0) {
            const fetchLocations = async () => {
                setIsFetching(true);
                setLocations({}); // Reset on open
                const locationPromises = users.map(user => 
                    fetch(`https://ipinfo.io/${user.ip}/json`).then(res => res.json()).then(data => ({ id: user.id, data }))
                );
                try {
                    const results = await Promise.all(locationPromises);
                    const newLocations = results.reduce((acc, result) => {
                        acc[result.id] = result.data;
                        return acc;
                    }, {} as Record<string, any>);
                    setLocations(newLocations);
                } catch (error) {
                    console.error("Error fetching user locations:", error);
                } finally {
                    setIsFetching(false);
                }
            };
            fetchLocations();
        }
    }, [isOpen, users]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('component_header.online_users_modal_title', { count: users.length })}>
            {isFetching && (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    <span className="ml-4 text-slate-500 dark:text-gray-400">{t('component_header.fetching_locations')}</span>
                </div>
            )}
            {!isFetching && users.length > 0 && (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                    {users.map(user => {
                        const locationData = locations[user.id];
                        let locationString = t('component_header.location_unavailable');
                        if (locationData) {
                            if (locationData.error) {
                                locationString = t('component_header.location_private');
                            } else {
                                locationString = [locationData.city, locationData.region, locationData.country].filter(Boolean).join(', ');
                            }
                        }
                        return (
                            <li key={user.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mr-3">
                                        <UserIcon size={18} className="text-slate-500 dark:text-gray-400" />
                                    </div>
                                    <span className="font-semibold text-slate-800 dark:text-white">{user.username}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500 dark:text-gray-400 text-right">
                                    <MapPin size={14} className="mr-2 flex-shrink-0"/>
                                    <span>{locationString}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            {!isFetching && users.length === 0 && (
                <p className="text-center text-slate-500 dark:text-gray-400 py-8">{t('component_header.no_other_users')}</p>
            )}
        </Modal>
    );
};


const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    
    // State for user dropdown
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // State for notifications
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // State for notification detail modal
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    // State for online user count
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [isLiveUsersModalOpen, setIsLiveUsersModalOpen] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const checkPlatformStatus = useCallback(async (): Promise<PlatformStatus> => {
        // Simulate API calls to check services
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
        const services: ServiceStatus[] = [
            { name: t('platform_status.services.auth'), status: 'Operational', description: t('platform_status.operational') },
            { name: t('platform_status.services.db'), status: 'Operational', description: t('platform_status.operational') },
            { name: t('platform_status.services.api'), status: 'Operational', description: t('platform_status.operational') },
            { name: t('platform_status.services.gemini'), status: 'Operational', description: t('platform_status.operational') },
            { name: t('platform_status.services.realtime'), status: 'Operational', description: t('platform_status.operational') },
        ];
    
        const overallStatus = services.every(s => s.status === 'Operational') ? 'Operational' :
                              services.some(s => s.status === 'Outage') ? 'Outage' : 'Degraded';
    
        return {
            overallStatus,
            services,
            lastChecked: new Date().toLocaleString(i18n.language)
        };
    }, [t, i18n.language]);
    
    const handleOpenStatusModal = useCallback(async () => {
        setIsStatusModalOpen(true);
        setIsCheckingStatus(true);
        const status = await checkPlatformStatus();
        setPlatformStatus(status);
        setIsCheckingStatus(false);
    }, [checkPlatformStatus]);
    
    const handleRefreshStatus = useCallback(async () => {
        setIsCheckingStatus(true);
        const status = await checkPlatformStatus();
        setPlatformStatus(status);
        setIsCheckingStatus(false);
    }, [checkPlatformStatus]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await ApiService.getNotificationsForUser(user.id, 50);
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

     // Effect for real-time user presence
    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel('online-users-mws', {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });
        channelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const presenceState = channel.presenceState();
                const presences: OnlineUser[] = Object.keys(presenceState).map(key => {
                    // FIX: userPresence has a dynamic shape based on what's tracked.
                    // Casting to `any` to access custom properties `username`, `ip`, and `online_at`.
                    const userPresence = presenceState[key][0] as any; // Assuming one presence per user
                    return {
                        id: key,
                        username: userPresence.username,
                        ip: userPresence.ip,
                        online_at: userPresence.online_at,
                    };
                }).filter(p => p.id !== user.id); // Exclude self
                setOnlineUsers(presences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    let userIp = 'unknown';
                    try {
                        const response = await fetch('https://api.ipify.org?format=json');
                        if (response.ok) {
                            const data = await response.json();
                            userIp = data.ip;
                        }
                    } catch(e) {
                        console.error("Could not fetch user IP", e);
                    }
                    await channel.track({ 
                        online_at: new Date().toISOString(), 
                        username: user.username,
                        ip: userIp 
                    });
                }
            });

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [user]);
    
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setIsMenuOpen(false);
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        setIsMenuOpen(false);
    }

    const handleMarkAsRead = useCallback(async (notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification || notification.read) return;

        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        try {
            await ApiService.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Revert state on error
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: false } : n));
        }
    }, [notifications]);

    const handleMarkAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            if (user) {
                await ApiService.markAllNotificationsAsRead(user.id);
            }
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            // Revert state on error
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsNotificationModalOpen(true);
        setIsPanelOpen(false);
        handleMarkAsRead(notification.id);
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const basePath = user?.role === 'admin' ? '/admin' : `/client/${user?.id}`;

    const languageOptions: { [key: string]: string } = {
        it: t('lang_name', {lng: 'it'}),
        en: t('lang_name', {lng: 'en'}),
        ro: t('lang_name', {lng: 'ro'})
    };

    return (
        <>
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="https://moise-web-srl.com/wp-content/uploads/2025/07/web-app-manifest-512x512-2.png" alt="MWS Gestione Lead Logo" className="h-14 w-14" />
                        <div className="ml-3">
                            <h1 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">{t('header_title')}</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('header_version')}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {user?.role === 'admin' && (
                            <>
                                <button
                                    onClick={handleOpenStatusModal}
                                    className="hidden sm:flex items-center space-x-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    title={t('platform_status.title')}
                                >
                                    <Server size={16} className={
                                        !platformStatus || platformStatus.overallStatus === 'Operational' ? 'text-green-500' :
                                        platformStatus.overallStatus === 'Degraded' ? 'text-yellow-500' :
                                        'text-red-500'
                                    } />
                                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{t('platform_status.title_short')}</span>
                                </button>
                                <button
                                    onClick={() => setIsLiveUsersModalOpen(true)}
                                    className="hidden sm:flex items-center space-x-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    title={t('online_users_tooltip', { count: onlineUsers.length })}
                                >
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{onlineUsers.length}</span>
                                    <Users size={16} className="text-slate-500 dark:text-gray-400" />
                                </button>
                            </>
                        )}

                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsPanelOpen(!isPanelOpen)}
                                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                aria-label={t('component_notificationPanel.title')}
                            >
                                <Bell className="h-6 w-6 text-gray-500 dark:text-gray-400"/>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {isPanelOpen && (
                                <NotificationPanel
                                    notifications={notifications}
                                    isLoading={isLoading}
                                    onNotificationClick={handleNotificationClick}
                                    onMarkAllAsRead={handleMarkAllAsRead}
                                    onClose={() => setIsPanelOpen(false)}
                                    basePath={basePath}
                                />
                            )}
                        </div>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.username}</span>
                                <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                                    <div className="py-1">
                                        <Link to={`${basePath}/settings`} onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <Settings size={16} className="mr-3" />
                                            {t('menu_account_settings')}
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <>
                                                <Link to="/admin/send-notification" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                    <Send size={16} className="mr-3" />
                                                    {t('menu_send_notifications')}
                                                </Link>
                                                <Link to="/admin/manage-notifications" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                    <Bell size={16} className="mr-3" />
                                                    {t('menu_manage_sent')}
                                                </Link>
                                            </>
                                        )}
                                        <Link to={`${basePath}/terms`} onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <FileText size={16} className="mr-3" />
                                            {t('menu_terms')}
                                        </Link>
                                        <Link to={`${basePath}/chat`} onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <MessageSquare size={16} className="mr-3" />
                                            {t('menu_chat')}
                                        </Link>
                                        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                        <button onClick={toggleTheme} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            {theme === 'dark' ? <Sun size={16} className="mr-3" /> : <Moon size={16} className="mr-3" />}
                                            {theme === 'dark' ? t('menu_light_mode') : t('menu_dark_mode')}
                                        </button>
                                        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase flex items-center">
                                            <Languages size={14} className="mr-2" /> {t('language')}
                                        </div>
                                        {Object.keys(languageOptions).map(langCode => (
                                            <button 
                                                key={langCode}
                                                onClick={() => handleLanguageChange(langCode)} 
                                                className={`w-full text-left flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${i18n.language === langCode ? 'font-bold text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-gray-300'}`}
                                            >
                                            {languageOptions[langCode]}
                                            </button>
                                        ))}
                                        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <LogOut size={16} className="mr-3" />
                                            {t('menu_logout')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <NotificationDetailModal
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                notification={selectedNotification}
            />
            <LiveUsersModal isOpen={isLiveUsersModalOpen} onClose={() => setIsLiveUsersModalOpen(false)} users={onlineUsers} t={t} />
            <PlatformStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                status={platformStatus}
                onRefresh={handleRefreshStatus}
                isRefreshing={isCheckingStatus}
            />
        </>
    );
};

export default Header;