import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from './Modal';
import type { CalendarAppointment, Quote, Client, Lead } from '../types';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User, Briefcase, Info, Phone, Mail, Copy, Check, Hash, FileText, Loader2, Edit, Trash2, Save, X, ChevronDown } from 'lucide-react';
import { ApiService } from '../services/apiService';
import QuoteCreatorModal from './QuoteCreatorModal';

const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Copy with navigator.clipboard failed:', err);
        }
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error('Fallback copy failed:', err);
        document.body.removeChild(textArea);
        return false;
    }
};

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" className={className}>
        <path d="M12.04 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.45 1.28 4.92L2.01 22l5.24-1.37c1.41.81 3.02 1.29 4.79 1.29h.01c5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zM12.04 20.12c-1.55 0-3.04-.42-4.32-1.15l-.31-.18-3.21.84.86-3.13-.2-.32c-.82-1.33-1.26-2.86-1.26-4.44 0-4.49 3.64-8.13 8.13-8.13 2.21 0 4.29.86 5.82 2.39s2.39 3.61 2.39 5.82c0 4.49-3.64 8.13-8.13 8.13zm4.49-5.83c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12s-.63.79-.77.95c-.14.16-.28.18-.52.06s-1.02-.38-1.94-1.2c-.72-.63-1.2-1.41-1.34-1.65-.14-.24-.01-.37.11-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4s.12-.3-.06-.54c-.18-.24-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.47c-.16 0-.42.06-.64.3s-.83.81-.83 1.97c0 1.16.85 2.28 1 2.44.14.16 1.67 2.55 4.05 3.56.57.24 1.02.38 1.37.49.68.21 1.3.18 1.78.11.52-.08 1.43-.58 1.63-1.14.2-.55.2-1.02.14-1.14-.06-.12-.22-.18-.46-.3z"/>
    </svg>
);

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: CalendarAppointment | null;
    isAdmin: boolean;
    onSaveSuccess: () => void;
    onDelete: (appointmentId: string) => void;
}

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <h4 className="text-md font-semibold text-slate-800 dark:text-white mb-3 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h4>
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            {children}
        </div>
    </div>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row text-sm">
        <p className="w-full sm:w-1/3 text-slate-500 dark:text-gray-400">{label}</p>
        <p className="w-full sm:w-2/3 font-semibold text-slate-800 dark:text-white break-words">{value}</p>
    </div>
);

const statusColors: Record<Lead['status'], string> = {
    'Nuovo': 'bg-slate-500 dark:bg-slate-600 text-white',
    'Contattato': 'bg-yellow-400 dark:bg-yellow-500 text-slate-800 dark:text-black',
    'In Lavorazione': 'bg-purple-400 dark:bg-purple-500 text-white',
    'Perso': 'bg-red-500 text-white',
    'Vinto': 'bg-green-500 text-white',
};

const StatusSelect: React.FC<{ status: Lead['status'], onChange: (newStatus: Lead['status']) => void }> = ({ status, onChange }) => (
    <div className="relative">
        <select
            value={status}
            onChange={(e) => onChange(e.target.value as Lead['status'])}
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

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ isOpen, onClose, appointment, isAdmin, onSaveSuccess, onDelete }) => {
    const { t, i18n } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    
    // Appointment Form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('1');
    const [notes, setNotes] = useState('');
    const [partsCost, setPartsCost] = useState('');
    
    // Lead state
    const [leadStatus, setLeadStatus] = useState<Lead['status']>();
    const [leadValue, setLeadValue] = useState('');
    const [winningQuoteId, setWinningQuoteId] = useState<string>('');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [copied, setCopied] = useState<string | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

    const [revenueDateModalState, setRevenueDateModalState] = useState<{
        isOpen: boolean;
        leadId: string | null;
        leadCreationDate: string | null;
        updates: Partial<Lead> | null;
    }>({ isOpen: false, leadId: null, leadCreationDate: null, updates: null });

    const fetchQuotesForLead = useCallback(async (leadId: string) => {
        setIsLoadingQuotes(true);
        try {
            const data = await ApiService.getQuotesForLead(leadId);
            setQuotes(data);
        } catch (err) {
            console.error("Failed to fetch quotes", err);
            setQuotes([]);
        } finally {
            setIsLoadingQuotes(false);
        }
    }, []);

    const resetFormState = useCallback(() => {
        if (appointment) {
            setTitle(appointment.title || (appointment.leads?.data?.nome || ''));
            setDate(appointment.appointment_date);
            setTime(appointment.appointment_time);
            setDuration(String(appointment.duration_hours));
            setNotes(appointment.notes || '');
            setPartsCost(appointment.parts_cost != null ? String(appointment.parts_cost).replace('.', ',') : '');
            if(appointment.leads) {
                setLeadStatus(appointment.leads.status);
            }
        }
    }, [appointment]);

    useEffect(() => {
        if (isOpen && appointment) {
            setIsEditing(false);
            resetFormState();
            setError('');
            if (appointment.leads) {
                fetchQuotesForLead(appointment.leads.id);
            } else {
                setQuotes([]);
            }
            if (!appointment.leads) {
                setLeadValue('0');
            }
        }
    }, [isOpen, appointment, resetFormState, fetchQuotesForLead]);
    
    useEffect(() => {
        if (isOpen && appointment) {
            if (quotes.length > 0) {
                const acceptedQuote = quotes.find(q => q.status === 'accepted');
                if (acceptedQuote) {
                    setWinningQuoteId(acceptedQuote.id);
                } else if (quotes.length === 1) {
                    setWinningQuoteId(quotes[0].id);
                } else {
                    setWinningQuoteId('');
                }
            } else {
                 setWinningQuoteId('');
            }
        }
    }, [quotes, isOpen, appointment]);

    // This effect handles the calculation when a quote is selected or partsCost changes.
    useEffect(() => {
        const selectedQuote = quotes.find(q => q.id === winningQuoteId);
        if (selectedQuote) {
            const currentPartsCost = parseFloat(String(partsCost).replace(',', '.')) || 0;
            const newLeadValue = selectedQuote.total_amount - currentPartsCost;
            setLeadValue(newLeadValue.toFixed(2).replace('.', ','));
        }
    }, [winningQuoteId, partsCost, quotes]);

    // This effect handles reverting to the original value when a quote is deselected or the appointment changes.
    useEffect(() => {
        if (!winningQuoteId && appointment?.leads) {
            const originalLeadValue = appointment.leads.value || 0;
            setLeadValue(originalLeadValue.toFixed(2).replace('.', ','));
        }
    }, [winningQuoteId, appointment?.leads]);


    if (!isOpen || !appointment) return null;

    const isGeneralAppointment = !appointment.leads;
    const lead = appointment.leads;
    const client = appointment.clients;
    const leadPhone = lead?.data?.telefono;
    const leadEmail = lead?.data?.mail || lead?.data?.email;

    const completeLeadUpdate = async (attributionChoice: 'creation' | 'current') => {
        const { leadId, updates } = revenueDateModalState;
        if (!lead || !lead.client_id || !leadId || !updates) return;
    
        try {
            // --- Start of Quote Status Transaction ---
            if (updates.status === 'Vinto') {
                // Find the quote to accept and any currently accepted quote.
                const quoteToAccept = quotes.find(q => q.id === winningQuoteId);
                const currentlyAcceptedQuote = quotes.find(q => q.status === 'accepted');
    
                // If there's a different quote that is already accepted, revert it.
                if (currentlyAcceptedQuote && currentlyAcceptedQuote.id !== winningQuoteId) {
                    await ApiService.updateQuoteStatus(currentlyAcceptedQuote.id, 'sent');
                }
                
                // Accept the newly selected quote if it's not already accepted.
                if (quoteToAccept && quoteToAccept.status !== 'accepted') {
                    await ApiService.updateQuoteStatus(quoteToAccept.id, 'accepted');
                }
            }
            // --- End of Quote Status Transaction ---

            // --- Start of Lead Update ---
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
    
            await ApiService.updateLead(lead.client_id, leadId, finalUpdates);
            // --- End of Lead Update ---
            
            onSaveSuccess();
    
        } catch (error: any) {
            console.error("Fallimento nell'aggiornare il lead e/o il preventivo:", error.message);
            alert(`Fallimento nell'aggiornare il lead e/o il preventivo:\n\n${error.message}`);
            onSaveSuccess(); // refresh to show original state
        } finally {
            setRevenueDateModalState({ isOpen: false, leadId: null, leadCreationDate: null, updates: null });
        }
    };
    
    const handleLeadUpdate = async (updates: Partial<Lead>) => {
        if (!lead || !lead.client_id) return;

        const isBecomingVinto = updates.status === 'Vinto' && lead.status !== 'Vinto';
        const wasVinto = lead.status === 'Vinto';
        const isNoLongerVinto = wasVinto && updates.status !== 'Vinto';
        
        if (isNoLongerVinto) {
            const acceptedQuote = quotes.find(q => q.status === 'accepted');
            if (acceptedQuote) {
                try {
                    await ApiService.updateQuoteStatus(acceptedQuote.id, 'sent');
                    setWinningQuoteId('');
                } catch (e) {
                    console.error("Failed to revert quote status when losing a lead", e);
                }
            }
        }

        if (isBecomingVinto) {
            const currentValue = updates.value !== undefined ? updates.value : parseFloat(leadValue.replace(',', '.')) || 0;
            if (currentValue <= 0) {
                alert("Per impostare lo stato su 'Vinto', è necessario prima inserire un valore economico positivo.");
                setLeadStatus(lead.status);
                onSaveSuccess();
                return;
            }
            setRevenueDateModalState({
                isOpen: true,
                leadId: lead.id,
                updates: updates,
                leadCreationDate: lead.created_at,
            });
            return;
        }

        try {
            await ApiService.updateLead(lead.client_id, lead.id, updates);
            onSaveSuccess();
        } catch (error) {
            console.error("Fallimento nell'aggiornare il lead:", error);
            onSaveSuccess();
        }
    };

    const handleCopy = async (text: string, type: string) => {
        if (!text) return;
        const success = await copyTextToClipboard(text);
        if (success) {
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const handleEditClick = () => setIsEditing(true);

    const handleCancelClick = () => {
        setIsEditing(false);
        resetFormState();
        setError('');
    };

    const handleSave = async () => {
        setError('');
        if (!title.trim() || !date || !time) {
            setError("Titolo, data e ora sono obbligatori.");
            return;
        }
    
        const isBecomingVinto = lead && leadStatus && leadStatus === 'Vinto' && lead.status !== 'Vinto';
        const newLeadValue = parseFloat(String(leadValue).replace(',', '.')) || 0;
    
        if (isBecomingVinto) {
            if (newLeadValue <= 0) {
                setError("Per impostare lo stato su 'Vinto', il valore del lead deve essere positivo.");
                return;
            }
            setRevenueDateModalState({
                isOpen: true,
                leadId: lead.id,
                leadCreationDate: lead.created_at,
                updates: {
                    status: leadStatus,
                    value: newLeadValue
                }
            });
            // The modal will now handle saving everything upon confirmation.
            return;
        }
    
        setIsSaving(true);
        try {
            const updatePromises: Promise<any>[] = [];
            
            // 1. Update Appointment
            const appointmentPayload = {
                title, appointment_date: date, appointment_time: time,
                duration_hours: Number(duration), notes,
                parts_cost: parseFloat(String(partsCost).replace(',', '.')) || 0,
                lead_id: appointment.lead_id, client_id: appointment.client_id, user_id: appointment.user_id,
            };
            updatePromises.push(ApiService.updateAppointment(appointment.id, appointmentPayload));
    
            // 2. Update Lead if applicable
            if (lead && lead.client_id && leadStatus) {
                const statusChanged = leadStatus !== lead.status;
                const valueChanged = newLeadValue !== (lead.value || 0);
    
                if (statusChanged || valueChanged) {
                    const leadUpdates: Partial<Lead> = {};
                    if (statusChanged) leadUpdates.status = leadStatus;
                    if (valueChanged) leadUpdates.value = newLeadValue;
    
                    if (lead.status === 'Vinto' && leadStatus !== 'Vinto') {
                        const acceptedQuote = quotes.find(q => q.status === 'accepted');
                        if (acceptedQuote) {
                            updatePromises.push(ApiService.updateQuoteStatus(acceptedQuote.id, 'sent'));
                        }
                    }
                    
                    updatePromises.push(ApiService.updateLead(lead.client_id, lead.id, leadUpdates));
                }
            }
    
            await Promise.all(updatePromises);
            onSaveSuccess();
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || t('generic_error'));
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (/^[\d.,]*$/.test(value)) {
            setter(value);
        }
    };

    const normalizeForWhatsApp = (phone: string | undefined): string => {
        if (!phone) return '';
        let normalized = phone.replace(/[\s-()]/g, '');
        if (normalized.startsWith('+')) normalized = normalized.substring(1);
        else if (normalized.startsWith('00')) normalized = normalized.substring(2);
        
        if (normalized.length >= 9 && normalized.length <= 11 && !normalized.startsWith('39')) {
            normalized = `39${normalized}`;
        }
        return normalized;
    };
    
    const whatsappUrl = leadPhone ? `https://wa.me/${normalizeForWhatsApp(leadPhone)}` : '#';

    const handleEditQuote = (quote: Quote) => {
        setQuoteToEdit(quote);
        setIsQuoteModalOpen(true);
    };

    const handleQuoteSaved = (savedQuote: Quote) => {
        setIsQuoteModalOpen(false);
        if (appointment?.leads) {
            ApiService.getQuotesForLead(appointment.leads.id).then(setQuotes);
        }
    };

    const clientForQuoteModal: Client | null = (appointment && lead) ? {
        id: appointment.client_id || '',
        name: client?.name || '',
        user_id: '',
        services: [],
        leads: [],
    } : null;

    const formatCurrency = (value: number | undefined | null) => {
        if (value === undefined || value === null) return '€ 0,00';
        return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
    };

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
                    <p className="text-slate-600 dark:text-gray-300">In quale mese vuoi conteggiare il valore di questo lead vinto?</p>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-600">
                            <input type="radio" name="revenueDate" value="creation" checked={choice === 'creation'} onChange={() => setChoice('creation')} className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"/>
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Mese di creazione del lead <span className="font-bold">({creationMonth})</span></span>
                        </label>
                        <label className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-600">
                            <input type="radio" name="revenueDate" value="current" checked={choice === 'current'} onChange={() => setChoice('current')} className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"/>
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Mese corrente <span className="font-bold">({currentMonth})</span></span>
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500">Annulla</button>
                        <button type="button" onClick={() => onSubmit(choice)} className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700">Conferma</button>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={t('appointment_detail_modal.title')} size="extra-large">
                <div className="space-y-6">
                    {!isGeneralAppointment && lead && (
                        <DetailSection title={t('appointment_detail_modal.lead_info')} icon={<User size={18} className="text-primary-500" />}>
                            <DetailRow label={t('appointment_detail_modal.lead_name')} value={lead.data?.nome || t('na')} />
                            {isAdmin && <DetailRow label={t('appointment_detail_modal.client_name')} value={client?.name || t('na')} />}
                            <DetailRow label={t('service')} value={lead.service || t('na')} />
                            <DetailRow label="Targa" value={lead.data?.targa || t('na')} />
                            {leadPhone && (
                                <div className="flex flex-col sm:flex-row text-sm">
                                    <p className="w-full sm:w-1/3 text-slate-500 dark:text-gray-400">Telefono</p>
                                    <div className="w-full sm:w-2/3 font-semibold flex items-center gap-2">
                                    <span>{leadPhone}</span>
                                        <button onClick={() => handleCopy(leadPhone, 'phone')} title="Copia" className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">{copied === 'phone' ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}</button>
                                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-1 rounded-full text-green-500 hover:bg-green-500/10"><WhatsAppIcon className="w-4 h-4" /></a>
                                    </div>
                                </div>
                            )}
                            {leadEmail && (
                                <div className="flex flex-col sm:flex-row text-sm">
                                    <p className="w-full sm:w-1/3 text-slate-500 dark:text-gray-400">Email</p>
                                    <div className="w-full sm:w-2/3 font-semibold flex items-center gap-2">
                                    <span className="truncate">{leadEmail}</span>
                                        <button onClick={() => handleCopy(leadEmail, 'email')} title="Copia" className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">{copied === 'email' ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}</button>
                                        <a href={`mailto:${leadEmail}`} title="Invia Email" className="p-1 rounded-full text-blue-500 hover:bg-blue-500/10"><Mail size={14}/></a>
                                    </div>
                                </div>
                            )}
                        </DetailSection>
                    )}

                    <DetailSection title={t('appointment_detail_modal.appointment_info')} icon={<Calendar size={18} className="text-primary-500" />}>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Titolo</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Data</label>
                                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Ora</label>
                                        <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Durata (ore)</label>
                                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="0.5" step="0.5" className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Costo Pezzi (€)</label>
                                    <input type="text" inputMode="decimal" value={partsCost} onChange={handleNumericChange(setPartsCost)} placeholder="0,00" className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Note</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                                </div>
                            </div>
                        ) : (
                            <>
                                {isGeneralAppointment && <DetailRow label="Titolo" value={appointment.title || t('na')} />}
                                <DetailRow label={t('appointment_detail_modal.date')} value={new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                                <DetailRow label={t('appointment_detail_modal.time')} value={appointment.appointment_time} />
                                <DetailRow label={t('appointment_detail_modal.duration')} value={t('appointment_detail_modal.duration_hours', { count: appointment.duration_hours })} />
                                
                                <div className="grid grid-cols-1 pt-3 border-t border-slate-200 dark:border-slate-600">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">Costo Pezzi di Ricambio</p>
                                        <p className="font-semibold text-slate-800 dark:text-white">{formatCurrency(appointment.parts_cost)}</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{t('appointment_detail_modal.notes')}</p>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white whitespace-pre-wrap">{appointment.notes || t('appointment_detail_modal.no_notes')}</p>
                                </div>
                            </>
                        )}
                    </DetailSection>
                    
                    {!isGeneralAppointment && lead && (
                        <DetailSection title="Chiusura Lead" icon={<Briefcase size={18} className="text-primary-500" />}>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Stato Lead</label>
                                            {leadStatus && <StatusSelect status={leadStatus} onChange={setLeadStatus} />}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Preventivo Vincente</label>
                                            <select
                                                value={winningQuoteId}
                                                onChange={e => setWinningQuoteId(e.target.value)}
                                                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                                                disabled={quotes.length === 0}
                                            >
                                                <option value="">Nessun preventivo</option>
                                                {quotes.map(q => (
                                                    <option key={q.id} value={q.id}>
                                                        #{q.quote_number_display || q.id.substring(0,6)} - {formatCurrency(q.total_amount)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Valore Lead (€)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={leadValue}
                                            onChange={handleNumericChange(setLeadValue)}
                                            className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <DetailRow label="Stato Lead" value={<span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColors[lead.status]}`}>{t(`lead_status.${lead.status}`)}</span>} />
                                    <DetailRow label="Valore Lead" value={formatCurrency(lead.value)} />
                                </>
                            )}
                        </DetailSection>
                    )}


                    {!isGeneralAppointment && lead && (
                         <DetailSection title={t('appointment_detail_modal.associated_quotes')} icon={<FileText size={18} className="text-primary-500" />}>
                            {isLoadingQuotes ? (
                                <div className="flex justify-center items-center p-4">
                                    <Loader2 className="animate-spin text-primary-500" />
                                </div>
                            ) : quotes.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {quotes.map(quote => (
                                        <div key={quote.id} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700/50 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-white">Preventivo #{quote.quote_number_display || quote.id.substring(0,6)}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(quote.quote_date).toLocaleDateString('it-IT')}</p>
                                                </div>
                                                <div className="flex items-center space-x-1 flex-shrink-0">
                                                    <button onClick={() => handleEditQuote(quote)} className="p-1.5 text-gray-400 hover:text-primary-500 rounded-full" aria-label="Modifica"><Edit size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full capitalize bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300`}>{quote.status}</span>
                                                <p className="text-sm text-green-600 dark:text-green-400 font-bold">{quote.total_amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">Nessun preventivo associato a questo lead.</p>
                            )}
                        </DetailSection>
                    )}


                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        {isEditing ? (
                            <div className="flex justify-end items-center w-full gap-2">
                                <button onClick={handleCancelClick} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white px-3 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center text-sm">{t('cancel')}</button>
                                <button onClick={handleSave} disabled={isSaving} className="bg-primary-600 text-white px-3 py-2 rounded-lg shadow hover:bg-primary-700 disabled:opacity-50 flex items-center text-sm">
                                    {isSaving ? <><Loader2 size={16} className="animate-spin mr-2"/> {t('saving')}</> : <><Save size={16} className="mr-2"/> {t('save')}</>}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => onDelete(appointment.id)} className="bg-red-600 text-white px-3 py-2 rounded-lg shadow hover:bg-red-700 transition-colors flex items-center text-sm"><Trash2 size={16} className="mr-2" />{t('delete')}</button>
                                    <button onClick={handleEditClick} className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow hover:bg-yellow-600 transition-colors flex items-center text-sm"><Edit size={16} className="mr-2" />{t('edit')}</button>
                                </div>
                                <button onClick={onClose} className="bg-slate-500 dark:bg-slate-600 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors">{t('close')}</button>
                            </>
                        )}
                    </div>
                </div>
            </Modal>
            
            <RevenueDateModal
                state={revenueDateModalState}
                onClose={async () => {
                    setRevenueDateModalState({ isOpen: false, leadId: null, leadCreationDate: null, updates: null });
                    onSaveSuccess();
                }}
                onSubmit={(choice) => {
                    completeLeadUpdate(choice);
                }}
            />

            {clientForQuoteModal && lead && (
                <QuoteCreatorModal
                    isOpen={isQuoteModalOpen}
                    onClose={() => setIsQuoteModalOpen(false)}
                    client={clientForQuoteModal}
                    lead={lead}
                    quoteToEdit={quoteToEdit}
                    onSave={handleQuoteSaved}
                />
            )}
        </>
    );
};

export default AppointmentDetailModal;