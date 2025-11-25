import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';
import type { User } from '../types';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const SendNotificationPage: React.FC = () => {
    const { t } = useTranslation();
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingUsers, setIsFetchingUsers] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsFetchingUsers(true);
            try {
                const allUsers = await ApiService.getUsers();
                setUsers(allUsers.filter(u => u.status === 'active')); // Only show active users
            } catch (err) {
                setError(t('generic_error'));
            } finally {
                setIsFetchingUsers(false);
            }
        };
        fetchUsers();
    }, [t]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleUserSelection = (userId: string) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleSelectAllClients = () => {
        const allClientIds = users.filter(u => u.role === 'client').map(u => u.id);
        const currentClientIds = new Set(Array.from(selectedUserIds).filter(id => users.find(u => u.id === id)?.role === 'client'));
        
        if (currentClientIds.size === allClientIds.length) {
            // Deselect all clients
            setSelectedUserIds(prev => {
                const newSet = new Set(prev);
                allClientIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        } else {
            // Select all clients
            setSelectedUserIds(prev => new Set([...prev, ...allClientIds]));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (selectedUserIds.size === 0) {
            setError(t('page_sendNotification.error_no_recipient'));
            return;
        }
        if (!title.trim()) {
            setError(t('page_sendNotification.error_no_title'));
            return;
        }
        if (!message.trim()) {
            setError(t('page_sendNotification.error_no_message'));
            return;
        }

        setIsLoading(true);
        try {
            await ApiService.sendCustomNotification(Array.from(selectedUserIds), title, message);
            setSuccess(t('page_sendNotification.success_message', { count: selectedUserIds.size }));
            setTitle('');
            setMessage('');
            setSelectedUserIds(new Set());
        } catch (err: any) {
            setError(err.message || t('generic_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const clients = users.filter(u => u.role === 'client');
    
    const allClientsSelected = clients.length > 0 && clients.every(c => selectedUserIds.has(c.id));

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <Send className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('page_sendNotification.title')}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-lg font-semibold text-slate-800 dark:text-white mb-3">{t('page_sendNotification.recipients_label')}</label>
                    {isFetchingUsers ? (
                         <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                            <span className="ml-2 text-slate-500">{t('page_sendNotification.loading_users')}</span>
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto">
                            <div className="space-y-3">
                                {adminUser && (
                                    <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.has(adminUser.id)}
                                            onChange={() => handleUserSelection(adminUser.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{t('page_sendNotification.me_admin')}</span>
                                    </label>
                                )}
                                {clients.length > 0 && (
                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={allClientsSelected}
                                                onChange={handleSelectAllClients}
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-slate-800 dark:text-gray-200">{t('page_sendNotification.all_clients')}</span>
                                        </label>
                                        <div className="pl-6 mt-2 space-y-2 border-l border-slate-300 dark:border-slate-600">
                                            {clients.map(clientUser => (
                                                <label key={clientUser.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUserIds.has(clientUser.id)}
                                                        onChange={() => handleUserSelection(clientUser.id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{clientUser.username}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                     <div>
                        <label htmlFor="title" className="block text-lg font-semibold text-slate-800 dark:text-white mb-2">
                            {t('page_sendNotification.title_label')}
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('page_sendNotification.title_placeholder')}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-lg font-semibold text-slate-800 dark:text-white mb-2">
                            {t('page_sendNotification.message_label')}
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('page_sendNotification.message_placeholder')}
                            rows={5}
                            className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            required
                        />
                    </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                     <button
                        type="submit"
                        disabled={isLoading || isFetchingUsers}
                        className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 text-sm font-semibold rounded-lg shadow hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                {t('page_sendNotification.sending')}
                            </>
                        ) : (
                            <>
                                <Send size={16} className="mr-2" />
                                {t('page_sendNotification.send_button')}
                            </>
                        )}
                    </button>
                </div>
                
                {error && (
                    <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-500/20 rounded-lg border border-red-200 dark:border-red-500/30">
                        <AlertCircle size={18} className="mr-2" />
                        {error}
                    </div>
                )}
                {success && (
                     <div className="flex items-center p-3 text-sm text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-500/20 rounded-lg border border-green-200 dark:border-green-500/30">
                        <CheckCircle size={18} className="mr-2" />
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
};

export default SendNotificationPage;
