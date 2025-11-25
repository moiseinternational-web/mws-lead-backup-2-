import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import { ApiService } from '../services/apiService';
import type { Client, Lead, User, LeadField, AdSpend, AdSpendPlatform, Service, SavedForm } from '../types';
import { Plus, Clipboard, Trash2, Edit, ChevronDown, ChevronUp, Mail, Phone, Upload, RefreshCw, UserCog, Lock, User as UserIcon, Tag, Search, Ban, UserCheck, DollarSign, Activity } from 'lucide-react';
import DateRangeFilter from '../components/DateRangeFilter';
import LeadForm from '../components/LeadForm';
import LeadDetailModal from '../components/LeadDetailModal';
import Pagination from '../components/Pagination';
import FormGenerator from '../components/FormGenerator';
import LiveOverview from '../components/LiveOverview';
import { useAuth } from '../contexts/AuthContext';
import SavedFormsModule from '../components/SavedFormsModule';

// Funzione di copia robusta con fallback
const copyTextToClipboard = async (text: string): Promise<boolean> => {
    // Approccio moderno: navigator.clipboard (solo in contesti sicuri)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Copia con navigator.clipboard fallita:', err);
            // Il fallback verrà tentato di seguito
        }
    }

    // Fallback per browser più vecchi o contesti non sicuri: document.execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Rendi l'elemento invisibile
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
            console.error('Copia di fallback (execCommand) non ha avuto successo.');
        }
        return successful;
    } catch (err) {
        console.error('Copia di fallback fallita con errore:', err);
        document.body.removeChild(textArea);
        return false;
    }
};


const statusColors: Record<Lead['status'], string> = {
    'Nuovo': 'bg-slate-500 dark:bg-slate-600 text-white',
    'Contattato': 'bg-yellow-400 dark:bg-yellow-500 text-slate-800 dark:text-black',
    'In Lavorazione': 'bg-purple-400 dark:bg-purple-500 text-white',
    'Perso': 'bg-red-500 text-white',
    'Vinto': 'bg-green-500 text-white',
};

const normalizePhoneNumber = (phone: string | undefined): string => {
    if (!phone) return '';
    let normalized = phone.replace(/[\s-()]/g, '');
    if (normalized.startsWith('+39')) {
        normalized = normalized.substring(3);
    } else if (normalized.startsWith('0039')) {
        normalized = normalized.substring(4);
    }
    return normalized;
};


// --- Live View Manager ---
const LiveViewManager: React.FC<{ clients: Client[] }> = ({ clients }) => {
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [groupBy, setGroupBy] = useState<'client' | 'service'>('client');
    const [filterClientId, setFilterClientId] = useState<string>('all');

    const filteredLeads = useMemo(() => {
        let leads: Lead[] = [];

        const clientsToFilter = filterClientId !== 'all'
            ? clients.filter(c => c.id === filterClientId)
            : clients;

        clientsToFilter.forEach(client => {
            leads.push(...client.leads.filter(l => l.data?._is_historical !== 'true'));
        });

        const filterStart = dateRange.start;
        const filterEnd = dateRange.end;
        
        if (filterStart || filterEnd) {
             leads = leads.filter(l => {
                const leadDate = new Date(l.created_at);
                const isAfterStart = filterStart ? leadDate >= filterStart : true;
                const isBeforeEnd = filterEnd ? leadDate <= filterEnd : true;
                return isAfterStart && isBeforeEnd;
             });
        }
        
        return leads;
    }, [clients, filterClientId, dateRange]);

    return (
        <div>
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-6">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                        <Activity size={20} className="mr-3 text-primary-500"/>
                        Panoramica Live
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="client-filter-live" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Filtra per Cliente</label>
                            <select
                                id="client-filter-live"
                                value={filterClientId}
                                onChange={e => setFilterClientId(e.target.value)}
                                className="mt-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                            >
                                <option value="all">Tutti i Clienti</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Raggruppa per</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setGroupBy('client')}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-l-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors ${groupBy === 'client' ? 'bg-primary-50 dark:bg-slate-700 text-primary-600 dark:text-white border-primary-300 dark:border-primary-500 z-10' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-gray-300 dark:border-slate-600'}`}
                                >
                                    Cliente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGroupBy('service')}
                                    className={`relative -ml-px inline-flex items-center px-4 py-2 border text-sm font-medium rounded-r-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors ${groupBy === 'service' ? 'bg-primary-50 dark:bg-slate-700 text-primary-600 dark:text-white border-primary-300 dark:border-primary-500 z-10' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-gray-300 dark:border-slate-600'}`}
                                >
                                    Servizio
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Filtra per Periodo</label>
                        <div className="mt-1">
                            <DateRangeFilter onDateChange={(range) => setDateRange(range as { start: Date | null; end: Date | null })} />
                        </div>
                    </div>
                </div>
            </div>
            
            <LiveOverview
                leads={filteredLeads}
                clients={clients}
                groupBy={groupBy}
            />
        </div>
    );
};


// --- Ad Spend Form ---
interface AdSpendFormProps {
    client: Client;
    editingSpend: AdSpend | null;
    onSuccess: () => void;
}
const AdSpendForm: React.FC<AdSpendFormProps> = ({ client, editingSpend, onSuccess }) => {
    const [service, setService] = useState('');
    const [platform, setPlatform] = useState<AdSpendPlatform>('Meta');
    const [amount, setAmount] = useState<number | ''>('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Date state
    const [periodType, setPeriodType] = useState<'day' | 'week' | 'month'>('day');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState('');
    const [month, setMonth] = useState(''); // YYYY-MM

    const isEditing = !!editingSpend;
    const availableServices = useMemo(() => client.services.map(s => s.name), [client]);

    useEffect(() => {
        if (isEditing && editingSpend) {
            setService(editingSpend.service);
            setPlatform(editingSpend.platform);
            setAmount(editingSpend.amount);
            setDate(editingSpend.date);
            setPeriodType('day'); // Editing always defaults to day view for simplicity
        } else {
            if (availableServices.length > 0) {
                setService(availableServices[0]);
            }
            // Reset form for adding new spend
            setPeriodType('day');
            setDate(new Date().toISOString().split('T')[0]);
            setStartDate('');
            const today = new Date();
            setMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
            setAmount('');
            setError('');
        }
    }, [editingSpend, isEditing, availableServices]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!service || amount === '') {
            setError('Servizio e importo sono obbligatori.');
            return;
        }

        setIsLoading(true);
        try {
            let finalDate = '';
            if (periodType === 'day') {
                if (!date) throw new Error('La data è obbligatoria.');
                finalDate = date;
            } else if (periodType === 'week') {
                if (!startDate) throw new Error('La data di inizio settimana è obbligatoria.');
                finalDate = startDate;
            } else { // month
                if (!month) throw new Error('Il mese è obbligatorio.');
                finalDate = `${month}-01`;
            }

            if (isEditing && editingSpend) {
                const updates: Partial<Omit<AdSpend, 'id'>> = {
                    service,
                    platform,
                    amount: Number(amount),
                    date: finalDate,
                };
                await ApiService.updateAdSpend(client.id, editingSpend.id, updates);
            } else {
                const spendPayload: Omit<AdSpend, 'id' | 'client_id' | 'created_at'> = {
                    service,
                    platform,
                    amount: Number(amount),
                    date: finalDate,
                };
                await ApiService.addAdSpend(client.id, spendPayload);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white";
    const periodButtonBase = "relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors";
    const periodButtonActive = "bg-primary-50 dark:bg-slate-700 text-primary-600 dark:text-white border-primary-300 dark:border-primary-500 z-10";
    const periodButtonInactive = "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-gray-300 dark:border-slate-600";


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="service" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Servizio</label>
                    <select id="service" value={service} onChange={e => setService(e.target.value)} required className={inputClasses}>
                         <option value="" disabled>Seleziona un servizio</option>
                         {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="platform" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Piattaforma</label>
                    <select id="platform" value={platform} onChange={e => setPlatform(e.target.value as AdSpendPlatform)} required className={inputClasses}>
                        <option value="Meta">Meta</option>
                        <option value="Google">Google</option>
                        <option value="TikTok">TikTok</option>
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Importo (€)</label>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} required className={inputClasses} placeholder="Es. 500" step="0.01"/>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Tipo di Periodo</label>
                <div className="mt-2 flex rounded-md shadow-sm">
                    <button type="button" onClick={() => setPeriodType('day')} className={`${periodButtonBase} rounded-l-md ${periodType === 'day' ? periodButtonActive : periodButtonInactive}`}>Giorno</button>
                    <button type="button" onClick={() => setPeriodType('week')} className={`${periodButtonBase} -ml-px ${periodType === 'week' ? periodButtonActive : periodButtonInactive}`}>Settimana</button>
                    <button type="button" onClick={() => setPeriodType('month')} className={`${periodButtonBase} -ml-px rounded-r-md ${periodType === 'month' ? periodButtonActive : periodButtonInactive}`}>Mese</button>
                </div>
            </div>
            
            {periodType === 'day' && (
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Data della Spesa</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required={periodType === 'day'} className={inputClasses} />
                </div>
            )}

            {periodType === 'week' && (
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Data Inizio Settimana</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required={periodType === 'week'} className={inputClasses} />
                </div>
            )}

            {periodType === 'month' && (
                <div>
                    <label htmlFor="month" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Seleziona Mese</label>
                    <input type="month" id="month" value={month} onChange={e => setMonth(e.target.value)} required={periodType === 'month'} className={inputClasses} />
                </div>
            )}

            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="submit" disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Salvataggio...' : (editingSpend ? 'Salva Modifiche' : 'Aggiungi Spesa')}
                </button>
            </div>
        </form>
    );
};

// --- Ad Spend Manager View ---
const AdSpendManager: React.FC<{clients: Client[], onDataUpdate: () => void}> = ({ clients, onDataUpdate }) => {
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedService, setSelectedService] = useState<string>('all');
    const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
    const [editingSpend, setEditingSpend] = useState<AdSpend | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [selectedSpendIds, setSelectedSpendIds] = useState<Set<string>>(new Set());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

    const availableServices = useMemo(() => {
        if (!selectedClient?.adSpends) return [];
        return [...new Set(selectedClient.adSpends.map(s => s.service))];
    }, [selectedClient?.adSpends]);

    const filteredSpends = useMemo(() => {
        if (!selectedClient?.adSpends) return [];
        
        let spends = selectedClient.adSpends;

        if (selectedService !== 'all') {
            spends = spends.filter(spend => spend.service === selectedService);
        }
        
        if (dateRange.start || dateRange.end) {
            spends = spends.filter(spend => {
                const spendDate = new Date(spend.date);
                // Adjust to midday to avoid timezone issues with start/end of day
                spendDate.setHours(12, 0, 0, 0);

                const filterStart = dateRange.start;
                const filterEnd = dateRange.end;
                
                const isAfterStart = !filterStart || spendDate >= filterStart;
                const isBeforeEnd = !filterEnd || spendDate <= filterEnd;

                return isAfterStart && isBeforeEnd;
            });
        }

        return spends.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedClient?.adSpends, selectedService, dateRange]);

    const totalAdSpend = useMemo(() => {
        return filteredSpends.reduce((sum, spend) => sum + spend.amount, 0);
    }, [filteredSpends]);
    
    useEffect(() => {
        const onPageSpendIds = filteredSpends.map(item => item.id);
        const selectedOnPageCount = onPageSpendIds.filter(id => selectedSpendIds.has(id)).length;

        if (headerCheckboxRef.current) {
            if (onPageSpendIds.length === 0) {
                 headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = false;
                return;
            }
            if (selectedOnPageCount === 0) {
                headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = false;
            } else if (selectedOnPageCount === filteredSpends.length) {
                headerCheckboxRef.current.checked = true;
                headerCheckboxRef.current.indeterminate = false;
            } else {
                headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = true;
            }
        }
    }, [selectedSpendIds, filteredSpends]);

    useEffect(() => {
        setSelectedSpendIds(new Set());
    }, [selectedClientId, selectedService, dateRange]);

    const handleOpenSpendModal = (spend: AdSpend | null = null) => {
        setEditingSpend(spend);
        setIsSpendModalOpen(true);
    };

    const handleDeleteSpend = async (spendId: string) => {
        if (selectedClient && window.confirm("Sei sicuro di voler eliminare questa voce di spesa?")) {
            await ApiService.deleteAdSpend(selectedClient.id, spendId);
            onDataUpdate();
        }
    };
    
    const handleSelectSpend = (spendId: string) => {
        setSelectedSpendIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(spendId)) {
                newSet.delete(spendId);
            } else {
                newSet.add(spendId);
            }
            return newSet;
        });
    };

    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const allVisibleIds = filteredSpends.map(spend => spend.id);
        if (e.target.checked) {
            setSelectedSpendIds(prev => new Set([...prev, ...allVisibleIds]));
        } else {
            setSelectedSpendIds(prev => {
                const newSet = new Set(prev);
                allVisibleIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedClient || selectedSpendIds.size === 0) return;
        if (window.confirm(`Sei sicuro di voler eliminare ${selectedSpendIds.size} voci di spesa selezionate?`)) {
            await ApiService.deleteMultipleAdSpends(selectedClient.id, Array.from(selectedSpendIds));
            setSelectedSpendIds(new Set());
            onDataUpdate();
        }
    };
    
    useEffect(() => {
        if(clients.length > 0 && !selectedClientId) {
            setSelectedClientId(clients[0].id);
        }
    }, [clients, selectedClientId]);
    
    return (
        <div>
            {selectedClient && (
                 <Modal 
                    isOpen={isSpendModalOpen} 
                    onClose={() => setIsSpendModalOpen(false)} 
                    title={editingSpend ? 'Modifica Spesa Pubblicitaria' : 'Aggiungi Spesa Pubblicitaria'}>
                     <AdSpendForm client={selectedClient} editingSpend={editingSpend} onSuccess={() => {
                        setIsSpendModalOpen(false);
                        onDataUpdate();
                     }} />
                 </Modal>
            )}
           
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                 <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                         <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gestione Spese</h3>
                            {selectedSpendIds.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{selectedSpendIds.size} selezionati</span>
                                    <button onClick={handleBulkDelete} className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded-lg shadow hover:bg-red-700 transition-colors text-sm">
                                        <Trash2 size={14} className="mr-2"/>
                                        Elimina
                                    </button>
                                </div>
                            )}
                         </div>
                         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <select
                                 id="client-filter-spese"
                                 value={selectedClientId}
                                 onChange={e => {
                                    setSelectedClientId(e.target.value);
                                    setSelectedService('all');
                                 }}
                                 className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full sm:w-auto"
                            >
                                <option value="" disabled>Seleziona un cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                             <select
                                 id="service-filter-spese"
                                 value={selectedService}
                                 onChange={e => setSelectedService(e.target.value)}
                                 disabled={!selectedClient}
                                 className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full sm:w-auto disabled:opacity-50"
                            >
                                <option value="all">Tutti i servizi</option>
                                {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={() => handleOpenSpendModal()} disabled={!selectedClient} className="flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors disabled:opacity-50">
                                <Plus size={16} className="mr-2"/>
                                Aggiungi Spesa
                            </button>
                        </div>
                     </div>
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <DateRangeFilter onDateChange={(range) => setDateRange(range as { start: Date | null; end: Date | null })} />
                    </div>
                 </div>
                 <div className="overflow-x-auto overscroll-x-contain">
                    <table className="min-w-full hidden md:table">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                             <tr>
                                <th scope="col" className="px-4 py-3 w-12">
                                    <input
                                        type="checkbox"
                                        ref={headerCheckboxRef}
                                        onChange={handleSelectAllOnPage}
                                        className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                {['Data', 'Servizio', 'Piattaforma', 'Importo (€)'].map(h => (
                                   <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Azioni</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredSpends.map(spend => {
                                const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('it-IT', { timeZone: 'UTC' });
                                const displayDate = formatDate(spend.date);
                                const isSelected = selectedSpendIds.has(spend.id);
                                return (
                                <tr key={spend.id} className={`transition-colors ${isSelected ? 'bg-primary-50 dark:bg-slate-700/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                    <td className="px-4 py-4 w-12">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleSelectSpend(spend.id)}
                                            className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{displayDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">{spend.service}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{spend.platform}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-bold">{spend.amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenSpendModal(spend)} className="text-gray-400 hover:text-primary-500 p-2 rounded-full"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteSpend(spend.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                                )}
                            )}
                        </tbody>
                        {filteredSpends.length > 0 && (
                            <tfoot className="bg-slate-100 dark:bg-slate-950 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                                <tr>
                                    <td colSpan={4} className="px-6 py-3 text-right text-sm text-slate-800 dark:text-white uppercase">Totale Speso</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{totalAdSpend.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                     {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredSpends.map(spend => {
                            const isSelected = selectedSpendIds.has(spend.id);
                            const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('it-IT', { timeZone: 'UTC' });
                            const displayDate = formatDate(spend.date);
                            return (
                                <div key={spend.id} className={`p-4 ${isSelected ? 'bg-primary-50 dark:bg-slate-700/50' : 'bg-white dark:bg-slate-900'}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-center gap-3 flex-grow min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectSpend(spend.id)}
                                                className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 dark:text-white truncate">{spend.service}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayDate}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center flex-shrink-0">
                                            <button onClick={() => handleOpenSpendModal(spend)} className="text-gray-400 hover:text-primary-500 p-1"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteSpend(spend.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{spend.platform}</span>
                                        <span className="text-sm text-green-600 dark:text-green-400 font-bold">{spend.amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 </div>
                  {filteredSpends.length > 0 && (
                    <div className="md:hidden p-4 bg-slate-100 dark:bg-slate-950 font-bold border-t-2 border-slate-300 dark:border-slate-700 flex justify-between items-center">
                         <span className="text-sm text-slate-800 dark:text-white uppercase">Totale Speso</span>
                         <span className="text-sm text-green-600 dark:text-green-400">{totalAdSpend.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                 )}
                 {filteredSpends.length === 0 && (
                    <div className="text-center py-12"><p className="text-gray-500">Nessuna spesa trovata per i filtri selezionati.</p></div>
                 )}
            </div>
        </div>
    );
}

// --- User Account Form Component ---
interface UserAccountFormProps {
    client: Client;
    onSuccess: () => void;
}
const UserAccountForm: React.FC<UserAccountFormProps> = ({ client, onSuccess }) => {
    const [user, setUser] = useState<Partial<User>>({});
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await ApiService.getUserById(client.user_id);
            if(userData) {
                setUser(userData);
            }
        };
        fetchUser();
    }, [client]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // FIX: Update type to allow 'password' property, resolving TypeScript error.
        const updates: Partial<User> & { password?: string } = {
            username: user.username,
            email: user.email,
            phone: user.phone,
        };

        if (password) {
            updates.password = password;
        }

        try {
            await ApiService.updateUser(client.user_id, updates);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputClasses = "appearance-none relative block w-full px-3 py-3 pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm";
    const iconClasses = "h-5 w-5 text-gray-400";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <UserIcon className={iconClasses} />
                    </div>
                    <input type="text" name="username" value={user.username || ''} onChange={handleChange} required placeholder="Username" className={inputClasses}/>
                </div>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Mail className={iconClasses} />
                    </div>
                    <input type="email" name="email" value={user.email || ''} onChange={handleChange} placeholder="Email" className={inputClasses}/>
                </div>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Phone className={iconClasses} />
                    </div>
                    <input type="tel" name="phone" value={user.phone || ''} onChange={handleChange} placeholder="Numero di telefono" className={inputClasses}/>
                </div>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Lock className={iconClasses} />
                    </div>
                    <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Lascia vuoto per non modificare la password" className={inputClasses}/>
                </div>
            </div>

            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="submit" disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
            </div>
        </form>
    );
};


const StatusSelect: React.FC<{ status: Lead['status'], onChange: (newStatus: Lead['status']) => void }> = ({ status, onChange }) => (
    <div className="relative">
        <select
            value={status}
            onChange={(e) => onChange(e.target.value as Lead['status'])}
            onClick={e => e.stopPropagation()}
            className={`appearance-none w-full text-center text-sm font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 ${statusColors[status]}`}
        >
            <option value="Nuovo">Nuovo</option>
            <option value="Contattato">Contattato</option>
            <option value="In Lavorazione">In Lavorazione</option>
            <option value="Perso">Perso</option>
            <option value="Vinto">Vinto</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white dark:text-white pointer-events-none" />
    </div>
);

// --- Webhook URL Item Component ---
const WebhookUrlItem: React.FC<{ clientId: string, service: string, fields: LeadField[] }> = ({ clientId, service, fields }) => {
    const [copied, setCopied] = useState(false);

    const webhookUrl = useMemo(() => {
        const baseUrl = window.location.origin + window.location.pathname;
        const queryParams = (fields || []).map(f => `${f.name}=<valore>`).join('&');
        const serviceParam = `service=${encodeURIComponent(service)}`;
        return `${baseUrl}#/api/lead/${clientId}?${queryParams}&${serviceParam}`;
    }, [clientId, service, fields]);

    const handleCopyToClipboard = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await copyTextToClipboard(webhookUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            alert("Impossibile copiare l'URL. Prova a farlo manualmente.");
        }
    };

    return (
        <div className="relative bg-slate-100 dark:bg-slate-900 p-2 rounded-md font-mono text-xs text-slate-600 dark:text-gray-300 break-all border border-slate-200 dark:border-slate-700 flex items-start">
            <Tag size={14} className="mr-2 mt-0.5 text-primary-500 dark:text-primary-400 flex-shrink-0" />
            <div className="flex-grow">
                <span className="font-bold text-slate-800 dark:text-white block mb-1">{service}</span>
                <span>{webhookUrl}</span>
            </div>
            <button onClick={handleCopyToClipboard} className="absolute top-2 right-2 p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded">
                {copied ? <span className="text-xs text-green-500">Copiato!</span> : <Clipboard size={16} />}
            </button>
        </div>
    );
};


const ClientCard: React.FC<{ 
    client: Client, 
    userStatus?: User['status'],
    onEdit: (client: Client) => void, 
    onDelete: (clientId: string) => void, 
    onEditUser: (client: Client) => void,
    onToggleStatus: () => void,
    isExpanded: boolean,
    onToggleExpand: () => void
}> = ({ client, userStatus, onEdit, onDelete, onEditUser, onToggleStatus, isExpanded, onToggleExpand }) => {
    const isSuspended = userStatus === 'suspended';
    
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-primary-500/10 dark:hover:shadow-primary-500/20 border border-slate-200 dark:border-slate-700 ${isSuspended ? 'opacity-60' : ''}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer relative" onClick={onToggleExpand}>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{client.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.leads.filter(l => l.data?._is_historical !== 'true').length} lead totali</p>
                </div>
                 <div className="flex items-center space-x-1">
                    <button onClick={(e) => {e.stopPropagation(); onToggleStatus()}} className={`p-2 rounded-full ${isSuspended ? 'text-green-500 hover:text-green-400' : 'text-yellow-600 hover:text-yellow-500'}`} title={isSuspended ? 'Riattiva Cliente' : 'Sospendi Cliente'}>
                        {isSuspended ? <UserCheck size={18} /> : <Ban size={18} />}
                    </button>
                    <button onClick={(e) => {e.stopPropagation(); onEditUser(client)}} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-full" title="Gestisci Account"><UserCog size={18} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onEdit(client)}} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-full" title="Modifica Cliente"><Edit size={18} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete(client.id)}} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full" title="Elimina Cliente"><Trash2 size={18} /></button>
                    <span className="p-2 text-gray-500 dark:text-gray-400">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                </div>
                 {isSuspended && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                        SOSPESO
                    </div>
                )}
            </div>
            {isExpanded && (
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                     <div>
                        <h4 className="font-semibold text-slate-700 dark:text-gray-300 mb-2">Webhook URLs per Servizio</h4>
                        {client.services && client.services.length > 0 ? (
                            <div className="space-y-2">
                                {client.services.map(service => (
                                    <WebhookUrlItem key={service.id} clientId={client.id} service={service.name} fields={service.fields || []} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 bg-slate-100 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-700">Nessun servizio configurato. Modifica il cliente per aggiungerne.</p>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-gray-300 mb-2">Campi per Servizio</h4>
                        {client.services && client.services.length > 0 ? (
                             client.services.map(service => (
                                <div key={service.id} className="mb-3 last:mb-0">
                                    <h5 className="font-semibold text-slate-600 dark:text-gray-400 text-sm">{service.name}</h5>
                                    {service.fields && service.fields.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 pl-2">
                                            {service.fields.map(f => <li key={f.id}>{f.label} <span className="text-gray-400 dark:text-gray-500">({f.name})</span></li>)}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 pl-2">Nessun campo per questo servizio.</p>
                                    )}
                                </div>
                            ))
                        ) : (
                             <p className="text-sm text-gray-500">Nessun campo lead configurato.</p>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
}

const AdminDashboard: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingClientForUser, setEditingClientForUser] = useState<Client | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeView = searchParams.get('view') || 'leads';
    const [filterClientId, setFilterClientId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<{lead: Lead, client: Client, historicalLeads: Lead[]} | null>(null);
    const [isLeadDetailModalOpen, setIsLeadDetailModalOpen] = useState(false);
    const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
    const [leadsPerPage, setLeadsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [editingForm, setEditingForm] = useState<SavedForm | null>(null);
    const formGeneratorRef = useRef<HTMLDivElement>(null);
    const [savedFormsModuleKey, setSavedFormsModuleKey] = useState(Date.now());
    const [revenueDateModalState, setRevenueDateModalState] = useState<{
        isOpen: boolean;
        clientId: string | null;
        leadId: string | null;
        leadCreationDate: string | null;
        updates: Partial<Lead> | null;
    }>({ isOpen: false, clientId: null, leadId: null, leadCreationDate: null, updates: null });


    const fetchData = useCallback(async () => {
        if (!isRefreshing) setIsLoading(true);
        try {
            const clientsData = await ApiService.getClients();
            const usersData = await ApiService.getUsers();
            setClients(clientsData);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            if (!isRefreshing) setIsLoading(false);
        }
    }, [isRefreshing]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    }, [fetchData]);

    const handleEditForm = (form: SavedForm) => {
        setEditingForm(form);
        navigate('/admin/dashboard?view=forms');
        setTimeout(() => {
          formGeneratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };
    
    const handleDoneEditingForm = () => {
        setEditingForm(null);
    };
    
    const handleFormSaved = () => {
        setSavedFormsModuleKey(Date.now()); 
    };
    
    const handleToggleExpand = (clientId: string) => {
        setExpandedClientId(currentId => (currentId === clientId ? null : clientId));
    };

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleOpenUserModal = (client: Client) => {
        setEditingClientForUser(client);
        setIsUserModalOpen(true);
    };
    
    const handleToggleStatus = async (userId: string, currentStatus: User['status']) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await ApiService.updateUserStatus(userId, newStatus);
            // Refresh local user data for immediate UI update
            setUsers(prevUsers => 
                prevUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u)
            );
        } catch (error) {
            console.error("Failed to update user status:", error);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        if(window.confirm("Sei sicuro di voler eliminare questo cliente? L'azione è irreversibile e rimuoverà anche l'account utente associato.")){
            await ApiService.deleteClient(clientId);
            fetchData();
        }
    }

    const completeLeadUpdate = async (
        clientId: string, 
        leadId: string, 
        updates: Partial<Lead>,
        attributionChoice: 'creation' | 'current'
    ) => {
        try {
            const client = clients.find(c => c.id === clientId);
            const lead = client?.leads.find(l => l.id === leadId);
            if (!lead) throw new Error("Lead non trovato.");
    
            let finalUpdates: Partial<Lead> = { ...updates };

            if (attributionChoice === 'current') {
                finalUpdates.data = {
                    ...lead.data,
                    _revenue_attribution_date: new Date().toISOString()
                };
            } else {
                // Se si sceglie il mese di creazione, ci assicuriamo che il campo custom non sia presente
                const { _revenue_attribution_date, ...restData } = lead.data;
                finalUpdates.data = restData;
            }
            
            if (updates.status === 'Vinto') {
                try {
                    const quotes = await ApiService.getQuotesForLead(leadId);
                    if (quotes.length === 1) {
                        const quote = quotes[0];
                        if (quote.status !== 'accepted') {
                            await ApiService.updateQuoteStatus(quote.id, 'accepted');
                        }
                    }
                } catch (quoteError) {
                    console.error("Failed to automatically accept quote:", quoteError);
                }
            }

            await ApiService.updateLead(clientId, leadId, finalUpdates);
            await fetchData();

        } catch (error) {
            console.error("Fallimento nell'aggiornare il lead:", error);
            alert('Si è verificato un errore durante il salvataggio.');
            await fetchData(); // Refresh to revert UI on failure
        } finally {
            setRevenueDateModalState({ isOpen: false, clientId: null, leadId: null, leadCreationDate: null, updates: null });
        }
    };

    const handleLeadUpdate = async (clientId: string, leadId: string, updates: Partial<Lead>) => {
        const client = clients.find(c => c.id === clientId);
        const lead = client?.leads.find(l => l.id === leadId);
        if (!client || !lead) return;
    
        const isBecomingVinto = updates.status === 'Vinto' && lead.status !== 'Vinto';
    
        if (isBecomingVinto) {
            if (!lead.value || lead.value <= 0) {
                alert("Per impostare lo stato su 'Vinto', è necessario prima inserire un valore economico positivo.");
                fetchData(); // Ricarica per resettare il select allo stato originale
                return;
            }
            // Apri il modal per la scelta della data di attribuzione
            setRevenueDateModalState({
                isOpen: true,
                clientId: clientId,
                leadId: leadId,
                updates: updates,
                leadCreationDate: lead.created_at,
            });
            return; // Interrompi l'esecuzione per attendere la scelta dell'utente
        }
    
        // Se non è un passaggio a "Vinto", aggiorna normalmente
        try {
            await ApiService.updateLead(clientId, leadId, updates);
            setClients(prevClients => 
                prevClients.map(c => 
                    c.id === clientId 
                    ? { ...c, leads: c.leads.map(l => l.id === leadId ? {...l, ...updates} : l) }
                    : c
                )
            );
        } catch (error) {
            console.error("Fallimento nell'aggiornare il lead:", error);
            fetchData();
        }
    };
    
    const handleDeleteLead = async (clientId: string, leadId: string) => {
        if (window.confirm("Sei sicuro di voler eliminare questo lead?")) {
            await ApiService.deleteLead(clientId, leadId);
            fetchData();
        }
    };
    
    const handleViewLeadDetails = (lead: Lead, client: Client) => {
        const currentLeadData = lead.data;
        const normalizedPhone = normalizePhoneNumber(currentLeadData.telefono);

        const historicalLeads = client.leads.filter(otherLead => {
            if (otherLead.id === lead.id) return false; // Esclude il lead corrente

            const otherLeadData = otherLead.data;
            const otherNormalizedPhone = normalizePhoneNumber(otherLeadData.telefono);
            
            const nameMatch = (otherLeadData.nome || '').trim().toLowerCase() === (currentLeadData.nome || '').trim().toLowerCase();
            const surnameMatch = (otherLeadData.cognome || '').trim().toLowerCase() === (currentLeadData.cognome || '').trim().toLowerCase();
            const phoneMatch = normalizedPhone && otherNormalizedPhone === normalizedPhone;

            return phoneMatch && nameMatch && surnameMatch;
        });

        setSelectedLead({ lead, client, historicalLeads });
        setIsLeadDetailModalOpen(true);
    };

    const handleAddNote = async (clientId: string, leadId: string, noteContent: string) => {
        try {
            const updatedLead = await ApiService.addNoteToLead(clientId, leadId, noteContent);
            
            setClients(prevClients => 
                prevClients.map(c => 
                    c.id === clientId 
                    ? { ...c, leads: c.leads.map(l => l.id === leadId ? updatedLead : l) }
                    : c
                )
            );
            
            setSelectedLead(prev => prev ? { ...prev, lead: updatedLead } : null);
        } catch (error) {
            console.error("Failed to add note:", error);
        }
    };

    const handleUpdateNote = async (clientId: string, leadId: string, noteId: string, content: string) => {
        try {
            await ApiService.updateNote(noteId, content);
            
            const updateState = (prev: Client[]): Client[] => {
                return prev.map(c => {
                    if (c.id !== clientId) return c;
                    return {
                        ...c,
                        leads: c.leads.map(l => {
                            if (l.id !== leadId) return l;
                            return {
                                ...l,
                                notes: l.notes?.map(n => n.id === noteId ? { ...n, content } : n)
                            };
                        })
                    };
                });
            };
            
            setClients(updateState);
            setSelectedLead(prev => {
                if (!prev || prev.lead.id !== leadId) return prev;
                const updatedLead = {
                    ...prev.lead,
                    notes: prev.lead.notes?.map(n => n.id === noteId ? { ...n, content } : n)
                };
                return { ...prev, lead: updatedLead };
            });
    
        } catch (error) {
            console.error("Failed to update note:", error);
            alert("Errore durante l'aggiornamento della nota.");
            fetchData();
        }
    };
    
    const handleDeleteNote = async (clientId: string, leadId: string, noteId: string) => {
        try {
            await ApiService.deleteNote(noteId);
            
            const updateState = (prev: Client[]): Client[] => {
                return prev.map(c => {
                    if (c.id !== clientId) return c;
                    return {
                        ...c,
                        leads: c.leads.map(l => {
                            if (l.id !== leadId) return l;
                            return {
                                ...l,
                                notes: l.notes?.filter(n => n.id !== noteId)
                            };
                        })
                    };
                });
            };
            
            setClients(updateState);
            setSelectedLead(prev => {
                if (!prev || prev.lead.id !== leadId) return prev;
                const updatedLead = {
                    ...prev.lead,
                    notes: prev.lead.notes?.filter(n => n.id !== noteId)
                };
                return { ...prev, lead: updatedLead };
            });
    
        } catch (error) {
            console.error("Failed to delete note:", error);
            alert("Errore durante l'eliminazione della nota.");
            fetchData();
        }
    };

    const handleHistoricalLeadAdded = (newLead: Lead) => {
        fetchData();
        setSelectedLead(prev => {
            if (!prev) return null;
            const newHistoricalLeads = [newLead, ...(prev.historicalLeads || [])].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return { ...prev, historicalLeads: newHistoricalLeads };
        });
    };

    const handleHistoricalLeadUpdated = (updatedLead: Lead) => {
        fetchData();
        setSelectedLead(prev => {
            if (!prev) return null;
            const newHistoricalLeads = prev.historicalLeads.map(l => l.id === updatedLead.id ? updatedLead : l).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return { ...prev, historicalLeads: newHistoricalLeads };
        });
    };

    const handleHistoricalLeadDeleted = (deletedLeadId: string) => {
        fetchData();
        setSelectedLead(prev => {
            if (!prev) return null;
            const newHistoricalLeads = prev.historicalLeads.filter(l => l.id !== deletedLeadId);
            return { ...prev, historicalLeads: newHistoricalLeads };
        });
    };

    const handleLeadDataUpdate = (updatedLead: Lead) => {
        setClients(prevClients => 
            prevClients.map(c => 
                c.id === updatedLead.client_id
                ? { ...c, leads: c.leads.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l) }
                : c
            )
        );
        setSelectedLead(prev => {
            if (prev && prev.lead.id === updatedLead.id) {
                return { ...prev, lead: updatedLead };
            }
            return prev;
        });
    };

    const filteredLeads = useMemo(() => {
        const allLeads = clients.flatMap(client => client.leads.map(lead => ({ lead, client })));
        
        let filtered = allLeads.filter(item => item.lead.data?._is_historical !== 'true');

        if (filterClientId !== 'all') {
            filtered = filtered.filter(({ client }) => client.id === filterClientId);
        }
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(({ lead }) => lead.status === statusFilter);
        }

        if (searchQuery.trim() !== '') {
            const normalizedQuery = searchQuery.toLowerCase().replace(/\s/g, '');
            filtered = filtered.filter(({ lead, client }) => {
                const clientNameMatch = client.name.toLowerCase().replace(/\s/g, '').includes(normalizedQuery);
                if (clientNameMatch) return true;

                return Object.values(lead.data).some(val => {
                    if (val === null || val === undefined) return false;
                    return String(val).toLowerCase().replace(/\s/g, '').includes(normalizedQuery);
                });
            });
        }

        if (dateRange.start) {
            filtered = filtered.filter(({lead}) => new Date(lead.created_at) >= dateRange.start!);
        }
        if (dateRange.end) {
            filtered = filtered.filter(({lead}) => new Date(lead.created_at) <= dateRange.end!);
        }
        
        return filtered.sort((a, b) => new Date(b.lead.created_at).getTime() - new Date(a.lead.created_at).getTime());
    }, [clients, filterClientId, searchQuery, dateRange, statusFilter]);
    
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * leadsPerPage;
        const end = start + leadsPerPage;
        return filteredLeads.slice(start, end);
    }, [filteredLeads, currentPage, leadsPerPage]);

    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

    const handleSelectLead = (leadId: string, isSelected: boolean) => {
        setSelectedLeadIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(leadId);
            } else {
                newSet.delete(leadId);
            }
            return newSet;
        });
    };

    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const allVisibleIds = paginatedLeads.map(({ lead }) => lead.id);
        if (e.target.checked) {
            setSelectedLeadIds(prev => new Set([...prev, ...allVisibleIds]));
        } else {
            setSelectedLeadIds(prev => {
                const newSet = new Set(prev);
                allVisibleIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    };
    
    const handleBulkDelete = async () => {
        if (selectedLeadIds.size === 0) return;
        if (window.confirm(`Sei sicuro di voler eliminare ${selectedLeadIds.size} lead selezionati?`)) {
            // FIX: Rewrote to be more type-safe and fix inference issue.
            const leadsToDelete = Array.from(selectedLeadIds)
                .map(leadId => {
                    const leadInfo = filteredLeads.find(({ lead }) => lead.id === leadId);
                    return leadInfo ? { clientId: leadInfo.client.id, leadId } : null;
                })
                .filter((item): item is { clientId: string; leadId: string } => Boolean(item));
            
            await ApiService.deleteMultipleLeads(leadsToDelete);
            
            setSelectedLeadIds(new Set());
            if (paginatedLeads.length === selectedLeadIds.size && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            fetchData();
        }
    };
    
    useEffect(() => {
        const onPageLeadsIds = paginatedLeads.map(item => item.lead.id);
        const selectedOnPageCount = onPageLeadsIds.filter(id => selectedLeadIds.has(id)).length;

        if (headerCheckboxRef.current) {
            if (onPageLeadsIds.length === 0) {
                 headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = false;
                return;
            }
            if (selectedOnPageCount === 0) {
                headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = false;
            } else if (selectedOnPageCount === paginatedLeads.length) {
                headerCheckboxRef.current.checked = true;
                headerCheckboxRef.current.indeterminate = false;
            } else {
                headerCheckboxRef.current.checked = false;
                headerCheckboxRef.current.indeterminate = true;
            }
        }
    }, [selectedLeadIds, paginatedLeads]);
    
    useEffect(() => {
        setCurrentPage(1);
        setSelectedLeadIds(new Set());
    }, [filterClientId, searchQuery, dateRange, leadsPerPage, statusFilter]);

    if (isLoading) {
        return <div className="text-center p-8">Caricamento...</div>;
    }
    
    const RevenueDateModal: React.FC<{
        state: typeof revenueDateModalState;
        onClose: () => void;
        onSubmit: (attributionChoice: 'creation' | 'current') => void;
    }> = ({ state, onClose, onSubmit }) => {
        const [choice, setChoice] = useState<'creation' | 'current'>('creation');
    
        if (!state.isOpen || !state.leadCreationDate) return null;
    
        const creationDate = new Date(state.leadCreationDate);
        const creationMonth = creationDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        const currentMonth = new Date().toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    
        return (
            <Modal isOpen={state.isOpen} onClose={onClose} title="Conferma Data Fatturato">
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-gray-300">
                        In quale mese vuoi conteggiare il valore di questo lead vinto?
                    </p>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-600">
                            <input
                                type="radio"
                                name="revenueDate"
                                value="creation"
                                checked={choice === 'creation'}
                                onChange={() => setChoice('creation')}
                                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                Mese di creazione del lead <span className="font-bold">({creationMonth})</span>
                            </span>
                        </label>
                        <label className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-600">
                            <input
                                type="radio"
                                name="revenueDate"
                                value="current"
                                checked={choice === 'current'}
                                onChange={() => setChoice('current')}
                                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                Mese corrente <span className="font-bold">({currentMonth})</span>
                            </span>
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500">
                            Annulla
                        </button>
                        <button type="button" onClick={() => onSubmit(choice)} className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700">
                            Conferma
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    const renderView = () => {
        switch (activeView) {
            case 'live':
                return <LiveViewManager clients={clients} />;
            case 'clients':
                return (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestione Clienti</h2>
                            <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center">
                                <Plus size={18} className="mr-2"/>
                                Aggiungi Cliente
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {clients.map(client => {
                                const user = users.find(u => u.id === client.user_id);
                                return (
                                    <ClientCard 
                                        key={client.id} 
                                        client={client}
                                        userStatus={user?.status}
                                        onEdit={() => handleOpenModal(client)}
                                        onEditUser={() => handleOpenUserModal(client)}
                                        onDelete={() => handleDeleteClient(client.id)}
                                        onToggleStatus={() => user && handleToggleStatus(user.id, user.status)}
                                        isExpanded={expandedClientId === client.id}
                                        onToggleExpand={() => handleToggleExpand(client.id)}
                                    />
                                );
                            })}
                        </div>
                        {clients.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-gray-500">Nessun cliente trovato.</p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-600">Aggiungi il tuo primo cliente per iniziare.</p>
                            </div>
                        )}
                    </div>
                );
            case 'spese':
                return <AdSpendManager clients={clients} onDataUpdate={fetchData} />;
            case 'forms':
                return (
                    <div className="space-y-12">
                        <div ref={formGeneratorRef}>
                            <FormGenerator
                                clients={clients}
                                formToEdit={editingForm}
                                onDoneEditing={handleDoneEditingForm}
                                onFormSaved={handleFormSaved}
                            />
                        </div>
                        <SavedFormsModule
                            key={savedFormsModuleKey}
                            clients={clients}
                            onEditForm={handleEditForm}
                        />
                    </div>
                );
            case 'leads':
            default:
                return (
                     <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row justify-between md:items-center flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tutti i Lead</h3>
                                    <span className="bg-primary-600 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
                                        {filteredLeads.length}
                                    </span>
                                    {selectedLeadIds.size > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{selectedLeadIds.size} selezionati</span>
                                            <button onClick={handleBulkDelete} className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded-lg shadow hover:bg-red-700 transition-colors text-sm">
                                                <Trash2 size={14} className="mr-2"/>
                                                Elimina
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 self-end md:self-center">
                                    <button onClick={() => setIsLeadModalOpen(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors">
                                        <Plus size={16} className="mr-2"/>
                                        Aggiungi Lead
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                        title="Aggiorna"
                                    >
                                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
                                <div className="relative w-full md:w-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    <input 
                                        type="text"
                                        placeholder="Cerca in tutti i campi..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full sm:w-64"
                                    />
                                </div>
                                <div className="w-full md:w-auto flex-grow md:flex-grow-0 relative">
                                    <div className="flex items-center gap-2">
                                        <select 
                                            id="client-filter"
                                            value={filterClientId}
                                            onChange={e => setFilterClientId(e.target.value)}
                                            className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                                        >
                                            <option value="all">Mostra tutti i clienti</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            <DateRangeFilter onDateChange={setDateRange} />
                            </div>

                        </div>

                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-gray-400 mr-2">Filtra per stato:</span>
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    statusFilter === 'all'
                                    ? 'bg-primary-600 text-white font-semibold'
                                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-300'
                                }`}
                            >
                                Tutti
                            </button>
                            {Object.entries(statusColors).map(([status, className]) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status as Lead['status'])}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        statusFilter === status
                                        ? `${className} font-semibold ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-current`
                                        : `${className} opacity-70 hover:opacity-100`
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-x-auto overscroll-x-contain">
                           <table className="min-w-full text-sm hidden md:table relative border-separate" style={{borderSpacing: 0}}>
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th scope="col" className="sticky left-0 z-20 px-4 py-3 bg-slate-50 dark:bg-slate-800 w-12 border-b border-slate-200 dark:border-slate-700">
                                            <input
                                                type="checkbox"
                                                ref={headerCheckboxRef}
                                                onChange={handleSelectAllOnPage}
                                                className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500"
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 min-w-[200px]">Nome Lead</th>
                                        {filterClientId === 'all' && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 min-w-[150px]">Cliente</th>}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 min-w-[180px]">Servizio</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 min-w-[150px]">Telefono</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 min-w-[120px]">Data</th>
                                        <th scope="col" className="sticky z-20 bg-slate-50 dark:bg-slate-800 px-0 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700" style={{ right: '0px' }}>
                                            <div className="flex items-center">
                                                <div className="px-6" style={{width: '160px'}}>Stato</div>
                                                <div className="px-6" style={{width: '128px'}}>Valore (€)</div>
                                                <div className="px-6 text-right" style={{width: '96px'}}>Azioni</div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900">
                                    {paginatedLeads.map(({ lead, client }) => {
                                        const isSelected = selectedLeadIds.has(lead.id);
                                        
                                        return (
                                            <tr key={lead.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isSelected ? 'bg-primary-50 dark:bg-slate-700' : ''}`}>
                                                <td className={`sticky left-0 z-10 px-4 py-4 w-12 border-b border-slate-200 dark:border-slate-700 ${isSelected ? 'bg-primary-50 dark:bg-slate-700' : 'bg-white dark:bg-slate-900'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                                                        onClick={e => e.stopPropagation()}
                                                        className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-primary-600 focus:ring-primary-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => handleViewLeadDetails(lead, client)}>
                                                    <div className={`font-semibold text-slate-900 dark:text-white ${lead.status === 'Nuovo' ? 'border-l-4 border-primary-500 pl-2 -ml-2' : ''}`}>{lead.data.nome || 'N/D'}</div>
                                                </td>
                                                {filterClientId === 'all' && <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 cursor-pointer" onClick={() => handleViewLeadDetails(lead, client)}>{client.name}</td>}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 cursor-pointer" onClick={() => handleViewLeadDetails(lead, client)}>{lead.service || 'N/D'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 cursor-pointer" onClick={() => handleViewLeadDetails(lead, client)}>{lead.data.telefono || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 cursor-pointer" onClick={() => handleViewLeadDetails(lead, client)}>
                                                    {new Date(lead.created_at).toLocaleDateString('it-IT')}
                                                </td>
                                                
                                                <td className={`sticky z-10 px-0 py-0 border-b border-slate-200 dark:border-slate-700 ${isSelected ? 'bg-primary-50 dark:bg-slate-700' : 'bg-white dark:bg-slate-900'}`} style={{ right: '0px' }}>
                                                    <div className="flex items-center">
                                                        <div className="px-6 py-4" style={{width: '160px'}}>
                                                            <StatusSelect
                                                                status={lead.status}
                                                                onChange={(newStatus) => handleLeadUpdate(client.id, lead.id, { status: newStatus })}
                                                            />
                                                        </div>
                                                        <div className="px-6 py-4" style={{width: '128px'}}>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                                                <input
                                                                    type="number"
                                                                    defaultValue={lead.value || ''}
                                                                    onBlur={(e) => handleLeadUpdate(client.id, lead.id, { value: parseFloat(e.target.value) || 0 })}
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full pl-7 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="px-6 py-4 whitespace-nowrap text-right" style={{width: '96px'}}>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteLead(client.id, lead.id); }} className="text-gray-400 hover:text-red-500 p-2 rounded-full"><Trash2 size={16}/></button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                             {/* Mobile Card View */}
                            <div className="md:hidden p-2 space-y-3">
                                {paginatedLeads.map(({lead, client}) => (
                                    <div key={lead.id} onClick={() => handleViewLeadDetails(lead, client)} className={`p-4 rounded-lg shadow border ${lead.status === 'Nuovo' ? 'border-l-4 border-primary-500' : ''} bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 space-y-3`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{lead.data.nome || 'N/D'}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{client.name}</div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteLead(client.id, lead.id); }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-gray-300 space-y-1 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                            {lead.service && <div className="flex text-xs"><span className="w-1/3 text-gray-500">Servizio:</span><span className="w-2/3 font-medium">{lead.service}</span></div>}
                                            {lead.data.telefono && <div className="flex text-xs"><span className="w-1/3 text-gray-500">Telefono:</span><span className="w-2/3 font-medium">{lead.data.telefono}</span></div>}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            Data: {new Date(lead.created_at).toLocaleDateString('it-IT')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                             <StatusSelect 
                                                status={lead.status} 
                                                onChange={(newStatus) => handleLeadUpdate(client.id, lead.id, { status: newStatus })}
                                            />
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                                <input 
                                                    type="number"
                                                    defaultValue={lead.value || ''}
                                                    onBlur={(e) => handleLeadUpdate(client.id, lead.id, { value: parseFloat(e.target.value) || 0 })}
                                                    onClick={e => e.stopPropagation()}
                                                    className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full pl-7 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {filteredLeads.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Nessun lead trovato per i filtri selezionati.</p>
                            </div>
                        )}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Mostra</span>
                                    <select 
                                        value={leadsPerPage} 
                                        onChange={(e) => setLeadsPerPage(Number(e.target.value))}
                                        className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 text-sm focus:outline-none"
                                    >
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <span className="text-gray-500 dark:text-gray-400">risultati</span>
                                </div>
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                    </div>
                );
        }
    };
    
    return (
        <div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Modifica Dettagli Cliente' : 'Nuovo Cliente'}>
                <ClientForm client={editingClient} onSuccess={() => {
                    setIsModalOpen(false);
                    fetchData();
                }} />
            </Modal>
             <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={`Gestisci Account: ${editingClientForUser?.name}`}>
                {editingClientForUser && <UserAccountForm client={editingClientForUser} onSuccess={() => setIsUserModalOpen(false)} />}
            </Modal>
             <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="Aggiungi Nuovo Lead">
                <LeadForm clients={clients} client={null} onSuccess={() => {
                    setIsLeadModalOpen(false);
                    fetchData();
                }} />
            </Modal>
            <LeadDetailModal
                isOpen={isLeadDetailModalOpen}
                onClose={() => setIsLeadDetailModalOpen(false)}
                lead={selectedLead?.lead || null}
                client={selectedLead?.client || null}
                historicalLeads={selectedLead?.historicalLeads}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onHistoricalLeadAdded={handleHistoricalLeadAdded}
                onHistoricalLeadUpdated={handleHistoricalLeadUpdated}
                onHistoricalLeadDeleted={handleHistoricalLeadDeleted}
                onLeadUpdate={handleLeadDataUpdate}
            />
            <RevenueDateModal
                state={revenueDateModalState}
                onClose={() => {
                    setRevenueDateModalState({ isOpen: false, clientId: null, leadId: null, leadCreationDate: null, updates: null });
                    fetchData(); // Reload to reset the select which might be stuck on "Vinto"
                }}
                onSubmit={(choice) => {
                    if (revenueDateModalState.clientId && revenueDateModalState.leadId && revenueDateModalState.updates) {
                        completeLeadUpdate(revenueDateModalState.clientId, revenueDateModalState.leadId, revenueDateModalState.updates, choice);
                    }
                }}
            />
            {renderView()}
        </div>
    );
};

export default AdminDashboard;