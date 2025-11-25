import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Client, SavedForm } from '../types';
import { ApiService } from '../services/apiService';
import { Archive, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

interface SavedFormsModuleProps {
    clients: Client[];
    onEditForm: (form: SavedForm) => void;
}

const SavedFormsModule: React.FC<SavedFormsModuleProps> = ({ clients, onEditForm }) => {
    const { t } = useTranslation();
    const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, formIdToDelete: string | null}>({isOpen: false, formIdToDelete: null});

    const fetchForms = useCallback(async () => {
        setIsLoading(true);
        const forms = await ApiService.getForms();
        setSavedForms(forms);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const formsByClient = useMemo(() => {
        const grouped = new Map<string, SavedForm[]>();
        savedForms.forEach(form => {
            if (!grouped.has(form.client_id)) {
                grouped.set(form.client_id, []);
            }
            grouped.get(form.client_id)!.push(form);
        });
        return grouped;
    }, [savedForms]);

    const handleToggleExpand = (clientId: string) => {
        setExpandedClientId(currentId => (currentId === clientId ? null : clientId));
    };

    const handleDeleteClick = (e: React.MouseEvent, formId: string) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, formIdToDelete: formId });
    };

    const confirmDelete = () => {
        if(deleteModal.formIdToDelete) {
            ApiService.deleteForm(deleteModal.formIdToDelete);
            fetchForms();
        }
        setDeleteModal({ isOpen: false, formIdToDelete: null });
    };

    if (isLoading) {
        return <div className="text-center p-8">{t('component_savedFormsModule.loading')}</div>;
    }

    const clientsWithForms = clients.filter(c => formsByClient.has(c.id));

    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center mb-6">
                <Archive size={28} className="mr-3 text-primary-500" /> {t('component_savedFormsModule.title')}
            </h2>
            
            {clientsWithForms.length > 0 ? (
                <div className="space-y-4">
                    {clientsWithForms.map(client => {
                        const clientForms = formsByClient.get(client.id) || [];
                        const isExpanded = expandedClientId === client.id;
                        return (
                             <div key={client.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <div 
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    onClick={() => handleToggleExpand(client.id)}
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{client.name}</h3>
                                        <span className="text-sm bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400 font-medium px-2 py-0.5 rounded-full">
                                            {clientForms.length} {clientForms.length === 1 ? t('component_savedFormsModule.module') : t('component_savedFormsModule.modules')}
                                        </span>
                                    </div>
                                    <span className="p-2 text-gray-500 dark:text-gray-400">
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </span>
                                </div>
                                {isExpanded && (
                                    <div className="border-t border-slate-200 dark:border-slate-700">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm hidden md:table">
                                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                    <tr>
                                                        {['component_formGenerator.form_name_label', 'service', 'page_manageNotifications.date_sent', 'actions'].map(hKey => 
                                                            <th key={hKey} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(hKey)}</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {clientForms.map(form => (
                                                        <tr key={form.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">{form.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-gray-300">{form.service_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-gray-300">{new Date(form.created_at).toLocaleDateString('it-IT')}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                                <button onClick={(e) => { e.stopPropagation(); onEditForm(form); }} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-full" title={t('edit')}><Edit size={16} /></button>
                                                                <button onClick={(e) => handleDeleteClick(e, form.id!)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full" title={t('delete')}><Trash2 size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {/* Mobile View */}
                                            <div className="md:hidden p-2 space-y-2">
                                                {clientForms.map(form => (
                                                    <div key={form.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-semibold text-slate-900 dark:text-white">{form.name}</div>
                                                                <div className="text-xs text-slate-500 dark:text-gray-400">{form.service_name}</div>
                                                            </div>
                                                            <div className="flex items-center space-x-1 flex-shrink-0">
                                                                <button onClick={(e) => { e.stopPropagation(); onEditForm(form); }} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-full" title={t('edit')}><Edit size={16} /></button>
                                                                <button onClick={(e) => handleDeleteClick(e, form.id!)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full" title={t('delete')}><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                         <div className="text-xs text-slate-400 dark:text-gray-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                            {t('page_manageNotifications.date_sent')}: {new Date(form.created_at!).toLocaleDateString('it-IT')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-gray-500">{t('component_savedFormsModule.no_forms_saved')}</p>
                    <p className="mt-2 text-sm text-gray-400">{t('component_savedFormsModule.no_forms_saved_desc')}</p>
                </div>
            )}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({isOpen: false, formIdToDelete: null})}
                title={t('component_savedFormsModule.confirm_delete_title')}
            >
                <div className="text-slate-600 dark:text-gray-300">
                    <p>{t('component_savedFormsModule.confirm_delete_desc')}</p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button 
                            type="button"
                            onClick={() => setDeleteModal({isOpen: false, formIdToDelete: null})}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SavedFormsModule;