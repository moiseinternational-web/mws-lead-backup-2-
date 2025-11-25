import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ApiService } from '../services/apiService';
import type { Client, Lead, LeadField } from '../types';
import { Trash2, ChevronDown, RefreshCw, Plus, Search, Settings, Activity } from 'lucide-react';
import DateRangeFilter from '../components/DateRangeFilter';
import Modal from '../components/Modal';
import LeadForm from '../components/LeadForm';
import LeadDetailModal from '../components/LeadDetailModal';
import Pagination from '../components/Pagination';
import LiveOverview from '../components/LiveOverview';

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

// --- Client Live Overview ---
const ClientLiveOverview: React.FC<{ client: Client }> = ({ client }) => {
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [selectedService, setSelectedService] = useState<string>('all');

    const filteredLeads = useMemo(() => {
        let leads = client.leads.filter(l => l.data?._is_historical !== 'true');

        if (selectedService !== 'all') {
            leads = leads.filter(l => l.service === selectedService);
        }

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
    }, [client.leads, selectedService, dateRange]);

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
                            <label htmlFor="service-filter-live" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Filtra per Servizio</label>
                            <select
                                id="service-filter-live"
                                value={selectedService}
                                onChange={e => setSelectedService(e.target.value)}
                                className="mt-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                            >
                                <option value="all">Tutti i Servizi</option>
                                {client.services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Filtra per Periodo</label>
                            <div className="mt-1">
                                <DateRangeFilter onDateChange={(range) => setDateRange(range as { start: Date | null; end: Date | null })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <LiveOverview
                leads={filteredLeads}
                clients={[client]}
                groupBy={'service'}
            />
        </div>
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
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
    </div>
);

const ColumnManager: React.FC<{
    columns: LeadField[];
    stickyColumns: Set<string>;
    onToggleSticky: (columnName: string) => void;
    isOpen: boolean;
    onClose: () => void;
}> = ({ columns, stickyColumns, onToggleSticky, isOpen, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef, onClose]);

    if (!isOpen) return null;

    return (
        <div ref={menuRef} className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50 p-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Blocca Colonne a Sinistra</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {columns.map(col => (
                    <label key={col.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={stickyColumns.has(col.name)}
                            onChange={() => onToggleSticky(col.name)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-gray-300">{col.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};


const ClientDashboard: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const activeView = searchParams.get('view') || 'leads';
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
    const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
    
    const [selectedService, setSelectedService] = useState<string>(() => {
        if (!userId) return 'all';
        return localStorage.getItem(`clientDashboard_service_${userId}`) || 'all';
    });

    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<{lead: Lead, historicalLeads: Lead[]} | null>(null);
    const [isLeadDetailModalOpen, setIsLeadDetailModalOpen] = useState(false);
    const [leadsPerPage, setLeadsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [stickyColumns, setStickyColumns] = useState<Set<string>>(new Set());
    const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);

    const [revenueDateModalState, setRevenueDateModalState] = useState<{
        isOpen: boolean;
        leadId: string | null;
        leadCreationDate: string | null;
        updates: Partial<Lead> | null;
    }>({ isOpen: false, leadId: null, leadCreationDate: null, updates: null });

    const fetchClientData = useCallback(async () => {
        if (!userId) return;
        if (!isRefreshing) setIsLoading(true);
        const data = await ApiService.getClientByUserId(userId);
        setClient(data);
        if (!isRefreshing) setIsLoading(false);
    }, [userId, isRefreshing]);

    useEffect(() => {
        fetchClientData();
    }, [fetchClientData]);

    // Salva il servizio selezionato nel localStorage
    useEffect(() => {
        if (userId) {
            localStorage.setItem(`clientDashboard_service_${userId}`, selectedService);
        }
    }, [selectedService, userId]);

    // Salva le colonne bloccate nel localStorage
    useEffect(() => {
        if (userId && selectedService !== 'all') {
            const storageKey = `clientDashboard_stickyColumns_${userId}_${selectedService}`;
            localStorage.setItem(storageKey, JSON.stringify(Array.from(stickyColumns)));
        }
    }, [stickyColumns, userId, selectedService]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchClientData();
        setIsRefreshing(false);
    }, [fetchClientData]);

    const filteredLeads = useMemo(() => {
        let leads = client?.leads || [];

        leads = leads.filter(lead => lead.data?._is_historical !== 'true');

        if (searchQuery.trim() !== '') {
            const normalizedQuery = searchQuery.toLowerCase().replace(/\s/g, '');
            leads = leads.filter(lead => 
                Object.values(lead.data).some(val => {
                    if (val === null || val === undefined) return false;
                    return String(val).toLowerCase().replace(/\s/g, '').includes(normalizedQuery);
                })
            );
        }

        if (dateRange.start) {
            leads = leads.filter(lead => new Date(lead.created_at) >= dateRange.start!);
        }
        if (dateRange.end) {
            leads = leads.filter(lead => new Date(lead.created_at) <= dateRange.end!);
        }
        
        if (statusFilter !== 'all') {
            leads = leads.filter(lead => lead.status === statusFilter);
        }
        
        if (selectedService !== 'all') {
            leads = leads.filter(lead => lead.service === selectedService);
        }

        return [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [client?.leads, searchQuery, dateRange, statusFilter, selectedService]);

    const dynamicColumns = useMemo<LeadField[]>(() => {
        if (!client) return [];
        if (selectedService === 'all') {
            return [
                { id: 'default-nome', name: 'nome', label: 'Nome', type: 'text' },
                { id: 'default-email', name: 'email', label: 'Email', type: 'email' },
                { id: 'default-telefono', name: 'telefono', label: 'Telefono', type: 'tel' },
            ];
        }
        const service = client.services.find(s => s.name === selectedService);
        return service ? service.fields : [];
    }, [client, selectedService]);

    const orderedColumns = useMemo(() => {
        if (!dynamicColumns) return [];
        const sticky = dynamicColumns.filter(col => stickyColumns.has(col.name));
        const nonSticky = dynamicColumns.filter(col => !stickyColumns.has(col.name));
        return [...sticky, ...nonSticky];
    }, [dynamicColumns, stickyColumns]);

    useEffect(() => {
        // Carica le colonne bloccate dal localStorage o imposta i valori predefiniti
        if (userId && selectedService !== 'all' && dynamicColumns.length > 0) {
            const storageKey = `clientDashboard_stickyColumns_${userId}_${selectedService}`;
            const savedColumnsJson = localStorage.getItem(storageKey);

            if (savedColumnsJson) {
                try {
                    const savedColumns = JSON.parse(savedColumnsJson);
                    const validSavedColumns = savedColumns.filter((colName: string) => 
                        dynamicColumns.some(field => field.name === colName)
                    );
                    setStickyColumns(new Set(validSavedColumns));
                } catch (e) {
                    console.error("Failed to parse sticky columns from localStorage", e);
                    setStickyColumns(new Set([dynamicColumns[0].name])); // Fallback
                }
            } else {
                // Imposta un default se non c'è nulla di salvato
                setStickyColumns(new Set([dynamicColumns[0].name]));
            }
        } else {
            setStickyColumns(new Set());
        }
        setIsColumnManagerOpen(false);
    }, [dynamicColumns, userId, selectedService]);

    const handleToggleSticky = (columnName: string) => {
        setStickyColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(columnName)) {
                newSet.delete(columnName);
            } else {
                newSet.add(columnName);
            }
            return newSet;
        });
    };

    const leftStickyOffsets = useMemo(() => {
        const offsets: Record<string, number> = {};
        let currentOffset = 0;
        const columnWidth = 160; // Assumed width for sticky columns
        
        const stickyCols = orderedColumns.filter(col => stickyColumns.has(col.name));

        stickyCols.forEach(col => {
            offsets[col.name] = currentOffset;
            currentOffset += columnWidth;
        });
        return offsets;
    }, [orderedColumns, stickyColumns]);
    
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * leadsPerPage;
        const end = start + leadsPerPage;
        return filteredLeads.slice(start, end);
    }, [filteredLeads, currentPage, leadsPerPage]);

    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dateRange, leadsPerPage, statusFilter, selectedService]);
    
    const completeLeadUpdate = async (
        leadId: string, 
        updates: Partial<Lead>,
        attributionChoice: 'creation' | 'current'
    ) => {
        if (!client) return;
        try {
            const lead = client.leads.find(l => l.id === leadId);
            if (!lead) throw new Error("Lead non trovato.");
    
            let finalUpdates: Partial<Lead> = { ...updates };

            if (attributionChoice === 'current') {
                finalUpdates.data = {
                    ...lead.data,
                    _revenue_attribution_date: new Date().toISOString()
                };
            } else {
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
            
            await ApiService.updateLead(client.id, leadId, finalUpdates);
            await fetchClientData();

        } catch (error) {
            console.error("Fallimento nell'aggiornare il lead:", error);
            alert('Si è verificato un errore durante il salvataggio.');
            await fetchClientData();
        } finally {
            setRevenueDateModalState({ isOpen: false, leadId: null, leadCreationDate: null, updates: null });
        }
    };

    const handleLeadUpdate = async (leadId: string, updates: Partial<Lead>) => {
        if (!client) return;

        const lead = client.leads.find(l => l.id === leadId);
        if (!lead) return;
    
        const isBecomingVinto = updates.status === 'Vinto' && lead.status !== 'Vinto';
    
        if (isBecomingVinto) {
            if (!lead.value || lead.value <= 0) {
                alert("Per impostare lo stato su 'Vinto', è necessario prima inserire un valore economico positivo.");
                fetchClientData();
                return;
            }
            setRevenueDateModalState({
                isOpen: true,
                leadId: leadId,
                updates: updates,
                leadCreationDate: lead.created_at,
            });
            return;
        }
    
        try {
            setClient(prevClient => {
                if (!prevClient) return null;
                return {
                    ...prevClient,
                    leads: prevClient.leads.map(l => l.id === leadId ? { ...l, ...updates } : l)
                }
            });
            await ApiService.updateLead(client.id, leadId, updates);
        } catch (error) {
            console.error("Fallimento nell'aggiornare il lead:", error);
            fetchClientData();
        }
    };
    
    const handleDeleteLead = async (leadId: string) => {
        if (!client) return;
        if (window.confirm("Sei sicuro di voler eliminare questo lead?")) {
            await ApiService.deleteLead(client.id, leadId);
            fetchClientData();
        }
    };
    
    const handleViewLeadDetails = (lead: Lead) => {
        if (!client) return;

        const currentLeadData = lead.data;
        const normalizedPhone = normalizePhoneNumber(currentLeadData.telefono);

        const historicalLeads = client.leads.filter(otherLead => {
            if (otherLead.id === lead.id) return false;

            const otherLeadData = otherLead.data;
            const otherNormalizedPhone = normalizePhoneNumber(otherLeadData.telefono);
            
            const nameMatch = (otherLeadData.nome || '').trim().toLowerCase() === (currentLeadData.nome || '').trim().toLowerCase();
            const surnameMatch = (otherLeadData.cognome || '').trim().toLowerCase() === (currentLeadData.cognome || '').trim().toLowerCase();
            const phoneMatch = normalizedPhone && otherNormalizedPhone === normalizedPhone;

            return phoneMatch && nameMatch && surnameMatch;
        });
        
        setSelectedLead({ lead, historicalLeads });
        setIsLeadDetailModalOpen(true);
    };

    const handleAddNote = async (leadId: string, noteContent: string) => {
        if (!client) return;
        try {
            const updatedLead = await ApiService.addNoteToLead(client.id, leadId, noteContent);
            
            setClient(prevClient => {
                if (!prevClient) return null;
                return {
                    ...prevClient,
                    leads: prevClient.leads.map(l => l.id === leadId ? updatedLead : l)
                }
            });

            setSelectedLead(prev => prev ? { ...prev, lead: updatedLead } : null);

        } catch (error) {
            console.error("Failed to add note:", error);
        }
    };

    const handleUpdateNote = async (clientId: string, leadId: string, noteId: string, content: string) => {
        if (!client) return;
        try {
            await ApiService.updateNote(noteId, content);
            
            const updateClientState = (prev: Client | null): Client | null => {
                if (!prev) return null;
                return {
                    ...prev,
                    leads: prev.leads.map(l => {
                        if (l.id !== leadId) return l;
                        return {
                            ...l,
                            notes: l.notes?.map(n => n.id === noteId ? { ...n, content } : n)
                        };
                    })
                };
            };
            
            setClient(updateClientState);
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
            fetchClientData();
        }
    };
    
    const handleDeleteNote = async (clientId: string, leadId: string, noteId: string) => {
        if (!client) return;
        try {
            await ApiService.deleteNote(noteId);
            
            const updateClientState = (prev: Client | null): Client | null => {
                if (!prev) return null;
                return {
                    ...prev,
                    leads: prev.leads.map(l => {
                        if (l.id !== leadId) return l;
                        return {
                            ...l,
                            notes: l.notes?.filter(n => n.id !== noteId)
                        };
                    })
                };
            };
    
            setClient(updateClientState);
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
            fetchClientData();
        }
    };

    const handleHistoricalLeadAdded = (newLead: Lead) => {
        fetchClientData(); // Refetch all data to keep it simple and consistent
        setSelectedLead(prev => {
            if (!prev) return null;
            const newHistoricalLeads = [newLead, ...prev.historicalLeads].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return { ...prev, historicalLeads: newHistoricalLeads };
        });
    };

    const handleHistoricalLeadUpdated = (updatedLead: Lead) => {
        fetchClientData();
        setSelectedLead(prev => {
            if (!prev) return null;
            const newHistoricalLeads = prev.historicalLeads.map(l => l.id === updatedLead.id ? updatedLead : l).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            return { ...prev, historicalLeads: newHistoricalLeads };
        });
    };

    const handleHistoricalLeadDeleted = (deletedLeadId: string) => {
        fetchClientData();
        setSelectedLead(prev => {
            if (!prev) return null;
            const newHistoricalLeads = prev.historicalLeads.filter(l => l.id !== deletedLeadId);
            return { ...prev, historicalLeads: newHistoricalLeads };
        });
    };
    
    const handleLeadDataUpdate = (updatedLead: Lead) => {
        setClient(prevClient => {
            if (!prevClient) return null;
            return {
                ...prevClient,
                leads: prevClient.leads.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l)
            };
        });
        setSelectedLead(prev => {
            if (prev && prev.lead.id === updatedLead.id) {
                return { ...prev, lead: updatedLead };
            }
            return prev;
        });
    };

    const totalAdSpend = useMemo(() => {
        return client?.adSpends?.reduce((sum, spend) => sum + spend.amount, 0) || 0;
    }, [client?.adSpends]);

    if (isLoading) {
        return <div className="text-center p-8">Caricamento...</div>;
    }

    if (!client) {
        return <div className="text-center p-8 text-red-400">Cliente non trovato.</div>;
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

    const renderContent = () => {
        if (activeView === 'live') {
            return <ClientLiveOverview client={client} />;
        }
        if (activeView === 'spese') {
            return (
                 <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Spese Pubblicitarie</h3>
                         <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                            title="Aggiorna"
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 hidden md:table-header-group">
                                <tr>
                                    {['Data', 'Servizio', 'Piattaforma', 'Importo (€)'].map(h => (
                                    <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800 md:divide-y-0">
                                {client.adSpends?.map(spend => {
                                    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('it-IT', { timeZone: 'UTC' });
                                    const displayDate = formatDate(spend.date);
                                    return (
                                        <tr key={spend.id} className="block md:table-row mb-4 md:mb-0 border-b md:border-none">
                                            <td data-label="Data" className="block md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right md:text-left border-b md:border-b-0 before:content-[attr(data-label)] before:font-bold before:text-slate-600 dark:before:text-slate-300 before:float-left md:before:content-none">{displayDate}</td>
                                            <td data-label="Servizio" className="block md:table-cell px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium text-right md:text-left border-b md:border-b-0 before:content-[attr(data-label)] before:font-bold before:text-slate-600 dark:before:text-slate-300 before:float-left md:before:content-none">{spend.service}</td>
                                            <td data-label="Piattaforma" className="block md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right md:text-left border-b md:border-b-0 before:content-[attr(data-label)] before:font-bold before:text-slate-600 dark:before:text-slate-300 before:float-left md:before:content-none">{spend.platform}</td>
                                            <td data-label="Importo (€)" className="block md:table-cell px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-bold text-right md:text-left border-b md:border-b-0 before:content-[attr(data-label)] before:font-bold before:text-slate-600 dark:before:text-slate-300 before:float-left md:before:content-none">{spend.amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                             {client.adSpends && client.adSpends.length > 0 && (
                                <tfoot className="hidden md:table-footer-group">
                                    <tr className="bg-slate-100 dark:bg-slate-950 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                                        <td colSpan={3} className="px-6 py-3 text-right text-sm text-slate-800 dark:text-white uppercase">Totale Speso</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{totalAdSpend.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                    {client.adSpends && client.adSpends.length > 0 && (
                        <div className="md:hidden p-4 bg-slate-100 dark:bg-slate-950 font-bold border-t-2 border-slate-300 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-sm text-slate-800 dark:text-white uppercase">Totale Speso</span>
                            <span className="text-sm text-green-600 dark:text-green-400">{totalAdSpend.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                    )}
                     {(!client.adSpends || client.adSpends.length === 0) && (
                        <div className="text-center py-12"><p className="text-gray-500">Nessuna spesa pubblicitaria registrata.</p></div>
                    )}
                </div>
            )
        }
        
        // Default view: Leads
        return (
             <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-4">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">I Miei Lead</h3>
                            <span className="bg-primary-600 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
                                {filteredLeads.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center">
                             <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                title="Aggiorna"
                            >
                                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                            </button>
                            <button onClick={() => setIsLeadModalOpen(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors">
                                <Plus size={16} className="mr-2"/>
                                Aggiungi Lead
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
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
                         <div className="w-full md:w-auto">
                            <label htmlFor="service-filter" className="sr-only">Filtra per servizio</label>
                            <select
                                id="service-filter"
                                value={selectedService}
                                onChange={e => setSelectedService(e.target.value)}
                                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                            >
                                <option value="all">Tutti i Servizi</option>
                                {client.services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsColumnManagerOpen(prev => !prev)}
                                disabled={selectedService === 'all'}
                                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Settings size={16} />
                                <span>Colonne</span>
                            </button>
                             <ColumnManager
                                isOpen={isColumnManagerOpen}
                                onClose={() => setIsColumnManagerOpen(false)}
                                columns={dynamicColumns}
                                stickyColumns={stickyColumns}
                                onToggleSticky={handleToggleSticky}
                            />
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
                <div className="overflow-x-auto overscroll-behavior-x-contain">
                    <table className="min-w-full hidden md:table relative border-separate" style={{borderSpacing: 0}}>
                         <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                {orderedColumns.map(h => {
                                    const isSticky = stickyColumns.has(h.name);
                                    let thClasses = `px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700`;
                                    const styles: React.CSSProperties = { minWidth: '160px' };

                                    if (isSticky) {
                                        thClasses += ` sticky bg-slate-50 dark:bg-slate-800 z-20`;
                                        styles.left = `${leftStickyOffsets[h.name]}px`;
                                    }

                                    return (
                                        <th key={h.id} scope="col" className={thClasses} style={styles}>
                                            {h.label}
                                        </th>
                                    );
                                })}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700" style={{minWidth: '120px'}}>Data</th>
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
                            {paginatedLeads.map((lead) => {
                                const rowBg = lead.status === 'Nuovo' ? 'bg-primary-50 dark:bg-slate-800/60' : 'bg-white dark:bg-slate-900';
                                const stickyBg = lead.status === 'Nuovo' ? 'bg-primary-50 dark:bg-slate-800/60' : 'bg-white dark:bg-slate-900';
                                return (
                                <tr 
                                    key={lead.id} 
                                    className={`hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors`}
                                    onClick={() => handleViewLeadDetails(lead)}
                                >
                                     {orderedColumns.map(col => {
                                        const isSticky = stickyColumns.has(col.name);
                                        let tdClasses = `px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-gray-300 border-b border-slate-200 dark:border-slate-700`;
                                        const styles: React.CSSProperties = {};
                                        const currentBg = isSticky ? stickyBg : rowBg;
                                        
                                        if (isSticky) {
                                            tdClasses += ` sticky z-10`;
                                            styles.left = `${leftStickyOffsets[col.name]}px`;
                                        }

                                        return (
                                            <td key={col.id} className={`${tdClasses} ${currentBg}`} style={styles}>
                                                 {(col.name === 'nome' && selectedService === 'all') ? (
                                                    <>
                                                        <div className="font-semibold text-slate-900 dark:text-white">{lead.data[col.name] || 'N/D'}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{lead.service || 'N/D'}</div>
                                                    </>
                                                ) : (
                                                    <span className={col.name === 'nome' ? 'font-semibold text-slate-900 dark:text-white' : ''}>{lead.data[col.name] || '-'}</span>
                                                )}
                                            </td>
                                        );
                                    })}

                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-b border-slate-200 dark:border-slate-700 ${rowBg}`}>{new Date(lead.created_at).toLocaleDateString('it-IT')}</td>
                                    <td className={`sticky z-10 px-0 py-0 border-b border-slate-200 dark:border-slate-700 ${stickyBg}`} style={{ right: '0px' }}>
                                        <div className="flex items-center">
                                            <div className="px-6 py-4" style={{width: '160px'}}>
                                                <StatusSelect 
                                                    status={lead.status} 
                                                    onChange={(newStatus) => handleLeadUpdate(lead.id, { status: newStatus })}
                                                />
                                            </div>
                                            <div className="px-6 py-4" style={{width: '128px'}}>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                                    <input 
                                                        type="number"
                                                        key={`${lead.id}-${lead.value}`}
                                                        defaultValue={lead.value || ''}
                                                        onBlur={(e) => handleLeadUpdate(lead.id, { value: parseFloat(e.target.value) || 0 })}
                                                        onClick={e => e.stopPropagation()}
                                                        className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full pl-7 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="px-6 py-4 text-right" style={{width: '96px'}}>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }} className="text-gray-400 hover:text-red-500 p-2 rounded-full"><Trash2 size={16}/></button>
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
                        {paginatedLeads.map((lead) => (
                            <div key={lead.id} onClick={() => handleViewLeadDetails(lead)} className={`p-4 rounded-lg shadow border ${lead.status === 'Nuovo' ? 'border-l-4 border-primary-500' : ''} bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 space-y-3`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{lead.data.nome || 'N/D'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{lead.service || 'N/D'}</div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                </div>
                                <div className="text-sm text-slate-600 dark:text-gray-300 space-y-1 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                    {dynamicColumns.filter(c => c.name !== 'nome').slice(0, 2).map(col => (
                                        lead.data[col.name] && <div key={col.id} className="flex text-xs"><span className="w-1/3 text-gray-500">{col.label}:</span><span className="w-2/3 font-medium">{lead.data[col.name]}</span></div>
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    Data: {new Date(lead.created_at).toLocaleDateString('it-IT')}
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                     <StatusSelect 
                                        status={lead.status} 
                                        onChange={(newStatus) => handleLeadUpdate(lead.id, { status: newStatus })}
                                    />
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                        <input 
                                            type="number"
                                            defaultValue={lead.value || ''}
                                            onBlur={(e) => handleLeadUpdate(lead.id, { value: parseFloat(e.target.value) || 0 })}
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
    };

    return (
        <div>
            {renderContent()}

            <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} title="Aggiungi Nuovo Lead">
                <LeadForm clients={[]} client={client} onSuccess={() => {
                    setIsLeadModalOpen(false);
                    fetchClientData();
                }} />
            </Modal>
            
            <LeadDetailModal
                isOpen={isLeadDetailModalOpen}
                onClose={() => setIsLeadDetailModalOpen(false)}
                lead={selectedLead?.lead || null}
                client={client}
                historicalLeads={selectedLead?.historicalLeads}
                onAddNote={(clientId, leadId, note) => handleAddNote(leadId, note)}
                onUpdateNote={(clientId, leadId, noteId, content) => handleUpdateNote(client?.id || '', leadId, noteId, content)}
                onDeleteNote={(clientId, leadId, noteId) => handleDeleteNote(client?.id || '', leadId, noteId)}
                onHistoricalLeadAdded={handleHistoricalLeadAdded}
                onHistoricalLeadUpdated={handleHistoricalLeadUpdated}
                onHistoricalLeadDeleted={handleHistoricalLeadDeleted}
                onLeadUpdate={handleLeadDataUpdate}
            />

            <RevenueDateModal
                state={revenueDateModalState}
                onClose={() => {
                    setRevenueDateModalState({ isOpen: false, leadId: null, leadCreationDate: null, updates: null });
                    fetchClientData();
                }}
                onSubmit={(choice) => {
                    if (revenueDateModalState.leadId && revenueDateModalState.updates) {
                        completeLeadUpdate(revenueDateModalState.leadId, revenueDateModalState.updates, choice);
                    }
                }}
            />
        </div>
    );
};
export default ClientDashboard;