import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ApiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import type { Client, QuoteWithDetails, Lead, Quote } from '../types';
import { FileText, Loader2, Search, Edit, Trash2, Eye, ChevronDown, RefreshCw, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DateRangeFilter from '../components/DateRangeFilter';
import QuoteDetailModal from '../components/QuoteDetailModal';
import QuoteCreatorModal from '../components/QuoteCreatorModal';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useSearchParams } from 'react-router-dom';

const quoteStatusColors: Record<Quote['status'], string> = {
    'draft': 'bg-slate-400 dark:bg-slate-500 text-white',
    'sent': 'bg-blue-500 dark:bg-blue-600 text-white',
    'accepted': 'bg-green-500 dark:bg-green-600 text-white',
    'rejected': 'bg-red-500 dark:bg-red-600 text-white',
};

const QuotesPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [quotes, setQuotes] = useState<QuoteWithDetails[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    
    // State is initialized from URL search params
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>(() => {
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        return {
            start: start ? new Date(start) : null,
            end: end ? new Date(end) : null,
        };
    });
    const [selectedClientId, setSelectedClientId] = useState(searchParams.get('client') || 'all');
    const [statusFilter, setStatusFilter] = useState<Quote['status'] | 'all'>(
        (searchParams.get('status') as Quote['status'] | 'all') || 'all'
    );
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
    const [quotesPerPage, setQuotesPerPage] = useState(parseInt(searchParams.get('perPage') || '25', 10));

    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
    const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
    const [clientForModal, setClientForModal] = useState<Client | null>(null);
    const [leadForModal, setLeadForModal] = useState<Lead | null>(null);

    const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean, quoteId: string | null }>({ isOpen: false, quoteId: null });
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [sendingQuoteId, setSendingQuoteId] = useState<string | null>(null);

    const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(new Set());
    const [isSendingMultiple, setIsSendingMultiple] = useState(false);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    
    const isAdmin = user?.role === 'admin';

    // Effect to sync state changes to URL search params
    useEffect(() => {
        const params: Record<string, string> = {};
        if (searchQuery) params.q = searchQuery;
        if (dateRange.start) params.start = dateRange.start.toISOString().split('T')[0];
        if (dateRange.end) params.end = dateRange.end.toISOString().split('T')[0];
        if (selectedClientId !== 'all') params.client = selectedClientId;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (currentPage > 1) params.page = String(currentPage);
        if (quotesPerPage !== 25) params.perPage = String(quotesPerPage);

        setSearchParams(params, { replace: true });
    }, [searchQuery, dateRange, selectedClientId, statusFilter, currentPage, quotesPerPage, setSearchParams]);

    const fetchData = useCallback(async () => {
        setError('');
        try {
            const [quotesData, clientsData] = await Promise.all([
                ApiService.getAllQuotes(),
                isAdmin ? ApiService.getClients() : (user ? Promise.resolve([await ApiService.getClientByUserId(user.id)]) : Promise.resolve([]))
            ]);
            setQuotes(quotesData as QuoteWithDetails[]);
            setClients(clientsData.filter(Boolean) as Client[]);
        } catch (err: any) {
            let message = t('generic_error');
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            setError(message);
        }
    }, [isAdmin, user, t]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    }, [fetchData]);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            await fetchData();
            setIsLoading(false);
        }
        loadInitialData();
    }, [fetchData]);
    
    const filteredQuotes = useMemo(() => {
        let filtered = quotes;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(q => q.status === statusFilter);
        }

        if (!isAdmin && user) {
            const clientForUser = clients.find(c => c.user_id === user.id);
            if (clientForUser) {
                filtered = filtered.filter(q => q.client_id === clientForUser.id);
            } else {
                 return [];
            }
        } else if (isAdmin && selectedClientId !== 'all') {
            filtered = filtered.filter(q => q.client_id === selectedClientId);
        }
        
        if (searchQuery.trim()) {
            const normalizedQuery = searchQuery.toLowerCase().replace(/\s/g, '');
            filtered = filtered.filter(q => {
                const leadData = q.leads?.data;
                const name = (leadData?.nome || '').toLowerCase().replace(/\s/g, '');
                const surname = (leadData?.cognome || '').toLowerCase().replace(/\s/g, '');
                const plate = (leadData?.targa || '').toLowerCase().replace(/\s/g, '');
                const phone = (leadData?.telefono || '').toLowerCase().replace(/\s/g, '');
                const quoteNumber = (q.quote_number_display || '').toLowerCase().replace(/\s/g, '');
                const clientName = (q.clients?.name || '').toLowerCase().replace(/\s/g, '');
    
                return (
                    quoteNumber.includes(normalizedQuery) ||
                    clientName.includes(normalizedQuery) ||
                    name.includes(normalizedQuery) ||
                    surname.includes(normalizedQuery) ||
                    plate.includes(normalizedQuery) ||
                    phone.includes(normalizedQuery)
                );
            });
        }

        if (dateRange.start) {
            filtered = filtered.filter(q => new Date(q.quote_date) >= dateRange.start!);
        }
        if (dateRange.end) {
            filtered = filtered.filter(q => new Date(q.quote_date) <= dateRange.end!);
        }

        return filtered;
    }, [quotes, clients, isAdmin, user, selectedClientId, searchQuery, dateRange, statusFilter]);

    const paginatedQuotes = useMemo(() => {
        const startIndex = (currentPage - 1) * quotesPerPage;
        return filteredQuotes.slice(startIndex, startIndex + quotesPerPage);
    }, [filteredQuotes, currentPage, quotesPerPage]);

    const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            const allVisibleIds = paginatedQuotes.map(q => q.id);
            const selectedCount = allVisibleIds.filter(id => selectedQuoteIds.has(id)).length;

            if (allVisibleIds.length > 0 && selectedCount === allVisibleIds.length) {
                headerCheckboxRef.current.checked = true;
                headerCheckboxRef.current.indeterminate = false;
            } else if (selectedCount > 0) {
                headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = true;
            } else {
                headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = false;
            }
        }
    }, [selectedQuoteIds, paginatedQuotes]);


    const handleStatusUpdate = async (quoteId: string, newStatus: Quote['status']) => {
        try {
            // The RPC function now handles the logic of un-accepting other quotes.
            await ApiService.updateQuoteStatus(quoteId, newStatus);
            fetchData(); // Reload data to show the updated state for all relevant quotes.
        } catch (e: any) {
            let userFriendlyError = `Fallimento nell'aggiornare lo stato del preventivo.`;
            if (e instanceof Error) {
                 userFriendlyError = `Fallimento nell'aggiornare lo stato del preventivo:\n\n${e.message}`;
                if (e.message && e.message.includes('schema "net" does not exist')) {
                    userFriendlyError = "Errore di configurazione del database: L'estensione 'pg_net' non è abilitata. Questa estensione è necessaria per inviare i webhook. Abilitala dalla dashboard di Supabase in 'Database' -> 'Extensions' e riprova.";
                }
            } else if (typeof e === 'string') {
                userFriendlyError = `Fallimento nell'aggiornare lo stato del preventivo:\n\n${e}`;
            }
            console.error("Failed to update quote status:", e);
            alert(userFriendlyError);
            fetchData(); // Reload on error to revert UI.
        }
    };

    const handleSendQuote = async (quoteId: string) => {
        setSendingQuoteId(quoteId);
        try {
            await ApiService.sendQuoteByWebhook(quoteId);
            fetchData();
        } catch (err: any) {
            let message = "Errore durante l'invio del preventivo via email.";
            if (err instanceof Error) {
                message += `: ${err.message}`;
            } else {
                message += `: ${String(err)}`;
            }
            alert(message);
        } finally {
            setSendingQuoteId(null);
        }
    };
    
    const handleSendMultiple = async () => {
        if (selectedQuoteIds.size === 0) return;
        if (!window.confirm(`Sei sicuro di voler inviare ${selectedQuoteIds.size} preventivi?`)) return;
    
        setIsSendingMultiple(true);
        const quoteIdsToSend = Array.from(selectedQuoteIds);
        const results = await Promise.allSettled(
            quoteIdsToSend.map(id => ApiService.sendQuoteByWebhook(id))
        );
    
        const successfulSends = results.filter(r => r.status === 'fulfilled').length;
        const failedSends = results.filter(r => r.status === 'rejected').length;
    
        let alertMessage = `${successfulSends} preventivi inviati con successo.`;
        if (failedSends > 0) {
            alertMessage += `\n${failedSends} invii non riusciti. Controlla la console per i dettagli.`;
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Invio fallito per preventivo ID ${quoteIdsToSend[index]}:`, result.reason);
                }
            });
        }
        alert(alertMessage);
    
        setIsSendingMultiple(false);
        setSelectedQuoteIds(new Set());
        fetchData(); // Refresh data
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allVisibleIds = new Set(paginatedQuotes.map(q => q.id));
            setSelectedQuoteIds(allVisibleIds);
        } else {
            setSelectedQuoteIds(new Set());
        }
    };
    
    const handleSelectQuote = (quoteId: string) => {
        setSelectedQuoteIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(quoteId)) {
                newSet.delete(quoteId);
            } else {
                newSet.add(quoteId);
            }
            return newSet;
        });
    };

    const handleViewDetails = (quote: Quote) => {
        setSelectedQuote(quote);
        setIsDetailModalOpen(true);
    };

    const handleEditQuote = async (quote: QuoteWithDetails) => {
        const client = clients.find(c => c.id === quote.client_id);
        if (!client) {
            setError("Cliente non trovato per questo preventivo.");
            return;
        }

        const lead = await ApiService.getLeadById(quote.lead_id);
        if (!lead) {
            setError("Lead non trovato per questo preventivo.");
            return;
        }

        setClientForModal(client);
        setLeadForModal(lead);
        setQuoteToEdit(quote);
        setIsCreatorModalOpen(true);
    };

    const handleDeleteQuote = (quoteId: string) => {
        setDeleteModalState({ isOpen: true, quoteId });
    };

    const confirmDeleteQuote = async () => {
        if (!deleteModalState.quoteId) return;
        try {
            await ApiService.deleteQuote(deleteModalState.quoteId);
            fetchData();
        } catch (err: any) {
            let message = t('generic_error');
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            setError(message);
        } finally {
            setDeleteModalState({ isOpen: false, quoteId: null });
            setDeleteConfirmationText('');
        }
    };
    
    const formatCurrency = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

    const QuoteStatusSelect: React.FC<{ quote: QuoteWithDetails }> = ({ quote }) => (
        <div className="relative">
            <select
                value={quote.status}
                onChange={(e) => handleStatusUpdate(quote.id, e.target.value as Quote['status'])}
                onClick={e => e.stopPropagation()}
                className={`appearance-none w-full text-center text-xs font-bold py-1.5 px-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400 ${quoteStatusColors[quote.status]}`}
            >
                {Object.keys(quoteStatusColors).map(status => (
                    <option key={status} value={status}>{t(`quote_status.${status}`)}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
        </div>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('page_quotes.title')}</h2>
                                <span className="bg-primary-600 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
                                    {filteredQuotes.length}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Aggiorna"
                        >
                            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder={t('page_quotes.search_placeholder')}
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full sm:w-64"
                            />
                        </div>
                        {isAdmin && (
                            <div className="w-full md:w-auto flex-grow md:flex-grow-0 relative">
                                <select 
                                    id="client-filter"
                                    value={selectedClientId}
                                    onChange={e => { setSelectedClientId(e.target.value); setCurrentPage(1); }}
                                    className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                                >
                                    <option value="all">{t('page_adminDashboard.client_filter_all')}</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                        <DateRangeFilter onDateChange={(range) => { setDateRange(range as { start: Date | null; end: Date | null }); setCurrentPage(1); }} />
                        {selectedQuoteIds.size > 0 && (
                            <button
                                onClick={handleSendMultiple}
                                disabled={isSendingMultiple}
                                className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isSendingMultiple ? (
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                ) : (
                                    <Send size={16} className="mr-2" />
                                )}
                                Invia Selezionati ({selectedQuoteIds.size})
                            </button>
                        )}
                    </div>
                     <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-gray-400 mr-2">Filtra per stato:</span>
                        {(['all', ...Object.keys(quoteStatusColors)] as (Quote['status'] | 'all')[]).map(status => (
                            <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                                className={`px-3 py-1 text-sm rounded-full transition-colors font-semibold ${
                                    statusFilter === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-300'
                                }`}
                            >
                                {status === 'all' ? t('all') : t(`quote_status.${status}`)}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    {filteredQuotes.length > 0 ? (
                        <>
                            <table className="min-w-full text-sm hidden md:table">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th scope="col" className="p-4">
                                            <input
                                                type="checkbox"
                                                ref={headerCheckboxRef}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500"
                                            />
                                        </th>
                                        {['quote_number', 'client', 'lead', 'date', 'total', 'status', 'actions'].map(h => {
                                            if (!isAdmin && h === 'client') return null;
                                            return <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(`page_quotes.${h}`)}</th>
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {paginatedQuotes.map(quote => (
                                        <tr key={quote.id} className={`transition-colors ${selectedQuoteIds.has(quote.id) ? 'bg-primary-50 dark:bg-slate-700/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuoteIds.has(quote.id)}
                                                    onChange={() => handleSelectQuote(quote.id)}
                                                    onClick={e => e.stopPropagation()}
                                                    className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{quote.quote_number_display || quote.id.substring(0,8)}</td>
                                            {isAdmin && <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{quote.clients?.name}</td>}
                                            <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{quote.leads?.data?.nome}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{new Date(quote.quote_date + 'T00:00:00').toLocaleDateString('it-IT')}</td>
                                            <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">{formatCurrency(quote.total_amount)}</td>
                                            <td className="px-6 py-4 w-40">
                                                <QuoteStatusSelect quote={quote} />
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => handleViewDetails(quote)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 rounded-full" title="Vedi Dettagli"><Eye size={16} /></button>
                                                <button onClick={() => handleEditQuote(quote)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 rounded-full" title={t('edit')}><Edit size={16} /></button>
                                                <button 
                                                    onClick={() => handleSendQuote(quote.id)} 
                                                    disabled={sendingQuoteId === quote.id}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-500 rounded-full disabled:opacity-50 disabled:cursor-wait" 
                                                    title="Invia per mail">
                                                    {sendingQuoteId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                </button>
                                                <button onClick={() => handleDeleteQuote(quote.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full" title={t('delete')}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile View */}
                            <div className="md:hidden p-2 space-y-2">
                                {paginatedQuotes.map(quote => (
                                    <div key={quote.id} className={`p-4 rounded-lg border ${selectedQuoteIds.has(quote.id) ? 'ring-2 ring-primary-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800/50`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuoteIds.has(quote.id)}
                                                    onChange={() => handleSelectQuote(quote.id)}
                                                    className="h-4 w-4 rounded bg-white dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500 mt-1 flex-shrink-0"
                                                />
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">#{quote.quote_number_display || quote.id.substring(0,8)}</div>
                                                    <div className="text-xs text-slate-500 dark:text-gray-400">{new Date(quote.quote_date + 'T00:00:00').toLocaleDateString('it-IT')}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 flex-shrink-0">
                                                <button onClick={() => handleViewDetails(quote)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 rounded-full" title="Vedi Dettagli"><Eye size={16} /></button>
                                                <button onClick={() => handleEditQuote(quote)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 rounded-full" title={t('edit')}><Edit size={16} /></button>
                                                <button 
                                                    onClick={() => handleSendQuote(quote.id)}
                                                    disabled={sendingQuoteId === quote.id}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-500 rounded-full disabled:opacity-50 disabled:cursor-wait" 
                                                    title="Invia per mail">
                                                    {sendingQuoteId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                </button>
                                                <button onClick={() => handleDeleteQuote(quote.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full" title={t('delete')}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-gray-300 space-y-1 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                            {isAdmin && <div className="flex text-xs"><span className="w-1/3 text-gray-500">Cliente:</span><span className="w-2/3 font-medium">{quote.clients?.name}</span></div>}
                                            <div className="flex text-xs"><span className="w-1/3 text-gray-500">Lead:</span><span className="w-2/3 font-medium">{quote.leads?.data?.nome}</span></div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <div className="w-32">
                                                <QuoteStatusSelect quote={quote} />
                                            </div>
                                            <div className="font-bold text-green-600 dark:text-green-400">{formatCurrency(quote.total_amount)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center py-12 text-slate-500">{t('page_quotes.no_quotes_found')}</p>
                    )}
                </div>
                 {filteredQuotes.length > 0 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{t('pagination.show')}</span>
                            <select 
                                value={quotesPerPage} 
                                onChange={(e) => { setQuotesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 text-sm focus:outline-none"
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-gray-500 dark:text-gray-400">{t('pagination.results')}</span>
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                 )}
            </div>

            <QuoteDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                quote={selectedQuote}
            />
            {clientForModal && leadForModal && (
                <QuoteCreatorModal
                    isOpen={isCreatorModalOpen}
                    onClose={() => setIsCreatorModalOpen(false)}
                    client={clientForModal}
                    lead={leadForModal}
                    quoteToEdit={quoteToEdit}
                    onSave={() => {
                        setIsCreatorModalOpen(false);
                        fetchData();
                    }}
                />
            )}
             <Modal
                isOpen={deleteModalState.isOpen}
                onClose={() => {
                    setDeleteModalState({ isOpen: false, quoteId: null });
                    setDeleteConfirmationText('');
                }}
                title="Conferma Eliminazione Definitiva"
            >
                <div>
                    <p className="text-slate-600 dark:text-gray-300 mb-4">
                        Sei assolutamente sicuro di voler eliminare questo preventivo? Questa azione è irreversibile e cancellerà permanentemente il preventivo.
                    </p>
                    <p className="text-slate-600 dark:text-gray-300 mb-4">
                        Per confermare, digita "<strong className="text-red-500">ELIMINA</strong>" nel campo sottostante.
                    </p>
                    <input
                        type="text"
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        value={deleteConfirmationText}
                    />
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setDeleteModalState({ isOpen: false, quoteId: null });
                                setDeleteConfirmationText('');
                            }}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500"
                        >
                            Annulla
                        </button>
                        <button
                            type="button"
                            onClick={confirmDeleteQuote}
                            disabled={deleteConfirmationText !== 'ELIMINA'}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Elimina Definitivamente
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default QuotesPage;