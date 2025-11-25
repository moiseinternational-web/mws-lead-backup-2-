import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { ApiService } from '../services/apiService';
import type { Client, Lead, Quote, QuoteItem } from '../types';
import { Plus, Trash2, Save, Loader2, X, ChevronDown } from 'lucide-react';

interface QuoteCreatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    lead: Lead;
    quoteToEdit: Quote | null;
    onSave: (quote: Quote) => void;
}

// A new type for managing form state with strings
interface QuoteItemForState {
    id: string;
    description: string;
    quantity: string;
    price: string;
    vat: string;
}

const getServiceFromLead = (lead: Lead): string => {
    const data = lead.data || {};
    
    // User requested to prioritize 'tipo_di_tagliando_'
    if (data['tipo_di_tagliando_']) {
        return data['tipo_di_tagliando_'];
    }

    const searchKeys = [
        'tipo di tagliando', 'tipo_di_tagliando', 'tipo_tagliando',
        'servizio richiesto', 'servizio_richiesto',
        'servizio', 'service'
    ];
    for (const key of searchKeys) {
        // Find a case-insensitive match in lead.data keys, trimming spaces for robustness
        const matchingKey = Object.keys(data).find(dataKey => dataKey.toLowerCase().replace(/_/g, ' ').trim() === key);
        if (matchingKey && data[matchingKey]) {
            return data[matchingKey];
        }
    }
    return lead.service || ''; // Fallback to the lead's main service property
};

const QuoteCreatorModal: React.FC<QuoteCreatorModalProps> = ({ isOpen, onClose, client, lead, quoteToEdit, onSave }) => {
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState<Record<string, string>>({});
    const [service, setService] = useState('');
    const [items, setItems] = useState<QuoteItemForState[]>([]);
    const [notes, setNotes] = useState('');
    const [manualQuoteNumber, setManualQuoteNumber] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const descriptionSuggestions = [
        "Manodopera", 
        "Olio Motore", 
        "Filtro Olio", 
        "Filtro Aria", 
        "Filtro Carburante", 
        "Filtro Abitacolo", 
        "Azzeramento Service", 
        "Olio Cambio", 
        "Filtro cambio", 
        "Olio differenziale"
    ];

    const isEditing = !!quoteToEdit;

    useEffect(() => {
        if (isOpen) {
            setError('');
            const isFacchetti = client.name.toLowerCase().includes('facche');

            if (isEditing && quoteToEdit) {
                // Load data for editing
                setQuoteDate(quoteToEdit.quote_date);
                setDueDate(quoteToEdit.due_date || '');
                setRecipientName(quoteToEdit.recipient_name);
                setVehicleDetails(quoteToEdit.vehicle_details || {});
                const serviceFromQuote = isFacchetti ? (quoteToEdit.vehicle_details?.['Servizio'] || '') : getServiceFromLead(lead);
                setService(serviceFromQuote);
                
                const fullQuoteNumber = quoteToEdit.quote_number_display || '';
                if (isFacchetti && serviceFromQuote && fullQuoteNumber.endsWith(serviceFromQuote)) {
                    setManualQuoteNumber(fullQuoteNumber.replace(serviceFromQuote, '').trim());
                } else {
                    setManualQuoteNumber(fullQuoteNumber);
                }

                const itemsToProcess = quoteToEdit.items;
                let itemsArray: QuoteItemForState[] = [];
                if (Array.isArray(itemsToProcess)) {
                    // Handle old array format for backwards compatibility
                    itemsArray = itemsToProcess.map(item => ({
                        id: crypto.randomUUID(),
                        description: item.description,
                        quantity: String(item.quantity).replace('.', ','),
                        price: String(item.price).replace('.', ','),
                        vat: String(item.vat).replace('.', ','),
                    }));
                } else if (typeof itemsToProcess === 'object' && itemsToProcess !== null) {
                    // Handle new object format
                    itemsArray = Object.values(itemsToProcess).map((item: QuoteItem) => ({
                        id: crypto.randomUUID(),
                        description: item.description,
                        quantity: String(item.quantity).replace('.', ','),
                        price: String(item.price).replace('.', ','),
                        vat: String(item.vat).replace('.', ','),
                    }));
                }
                setItems(itemsArray);
                
                setNotes(quoteToEdit.notes || '');

            } else {
                // Set defaults for new quote
                setQuoteDate(new Date().toISOString().split('T')[0]);
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                setDueDate(nextWeek.toISOString().split('T')[0]);
                setRecipientName(lead.data.nome || '');
                setVehicleDetails({
                    'Marca': lead.data.marca || '',
                    'modello': lead.data.modello || '',
                    'Targa': lead.data.targa || '',
                    'Telaio': lead.data.telaio || '',
                    'KM': lead.data.chilometraggio || lead.data.km || '',
                });
                setService(getServiceFromLead(lead));
                setManualQuoteNumber('');
                setItems([{ id: crypto.randomUUID(), description: '', quantity: '1', price: '0', vat: '22' }]);
                setNotes('');
            }
        }
    }, [isOpen, quoteToEdit, isEditing, lead, client]);

    const { taxableAmount, vatAmount, totalAmount } = useMemo(() => {
        let taxable = 0;
        let vat = 0;
        items.forEach(item => {
            const quantity = parseFloat(item.quantity.replace(',', '.')) || 0;
            const price = parseFloat(item.price.replace(',', '.')) || 0;
            const vatPerc = parseFloat(item.vat.replace(',', '.')) || 0;
            const itemSubtotal = quantity * price;
            taxable += itemSubtotal;
            vat += itemSubtotal * ((vatPerc) / 100);
        });
        return {
            taxableAmount: taxable,
            vatAmount: vat,
            totalAmount: taxable + vat
        };
    }, [items]);
    
    const handleItemChange = (index: number, field: keyof Omit<QuoteItemForState, 'id'>, value: string) => {
        const updatedItems = [...items];
        const currentItem = updatedItems[index];
        
        if (field === 'description') {
            (currentItem as any)[field] = value;
        } else {
            const sanitizedValue = value.replace('.', ',');
            if ((sanitizedValue.match(/,/g) || []).length > 1 || !/^[0-9]*?,?[0-9]*$/.test(sanitizedValue)) {
                return;
            }
            (currentItem as any)[field] = sanitizedValue;
        }
        
        setItems(updatedItems);
    };

    const handleAddItem = () => {
        setItems([...items, { id: crypto.randomUUID(), description: '', quantity: '1', price: '0', vat: '22' }]);
    };

    const handleRemoveItem = (id: string) => {
        const updatedItems = items.filter((item) => item.id !== id);
        setItems(updatedItems);
    };
    
    const handleVehicleDetailChange = (key: string, value: string) => {
        setVehicleDetails(prev => ({...prev, [key]: value}));
    };

    const handleServiceSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fieldName = e.target.value;
        if (fieldName) { // If a field is selected
            setService(lead.data[fieldName] || '');
        }
    };

    const handleSubmit = async () => {
        setError('');
        if (items.some(item => !item.description.trim())) {
            setError("La descrizione di ogni riga è obbligatoria.");
            return;
        }
        setIsLoading(true);
        
        try {
            const isFacchetti = client.name.toLowerCase().includes('facche');
            const finalVehicleDetails = { ...vehicleDetails };
            
            let finalQuoteNumber = manualQuoteNumber;
            if (isFacchetti && service) {
                finalVehicleDetails['Servizio'] = service;
                finalQuoteNumber = `${manualQuoteNumber} ${service}`.trim();
            }
            
            const itemsForApi: Record<string, QuoteItem> = items.reduce((acc, item) => {
                if (item.description) {
                    acc[item.description] = {
                        description: item.description,
                        quantity: parseFloat(item.quantity.replace(',', '.')) || 0,
                        price: parseFloat(item.price.replace(',', '.')) || 0,
                        vat: parseFloat(item.vat.replace(',', '.')) || 0,
                    };
                }
                return acc;
            }, {} as Record<string, QuoteItem>);

            const quotePayload = {
                client_id: client.id,
                lead_id: lead.id,
                quote_date: quoteDate,
                due_date: dueDate,
                recipient_name: recipientName,
                vehicle_details: finalVehicleDetails,
                notes,
                quote_number_display: finalQuoteNumber,
                taxable_amount: taxableAmount,
                vat_amount: vatAmount,
                total_amount: totalAmount,
                payment_type: "Nessun Pagamento Predefinito", // Hardcoded for now
                items: itemsForApi,
            };
            
            let savedQuote: Quote;
            if(isEditing && quoteToEdit) {
                savedQuote = await ApiService.updateQuote(quoteToEdit.id, quotePayload as Partial<Omit<Quote, 'id' | 'created_at'>>);
            } else {
                savedQuote = await ApiService.saveQuote(quotePayload as Omit<Quote, 'id' | 'created_at' | 'status'>);
            }
            onSave(savedQuote);
        } catch (err: any) {
            setError(err.message || "Si è verificato un errore durante il salvataggio.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Modifica Preventivo" : "Crea Nuovo Preventivo"} size="large">
            <datalist id="description-suggestions">
                {descriptionSuggestions.map(suggestion => (
                    <option key={suggestion} value={suggestion} />
                ))}
            </datalist>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">N. Preventivo</label>
                        {client.name.toLowerCase().includes('facche') ? (
                            <div className="mt-1 flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={manualQuoteNumber} 
                                    onChange={e => setManualQuoteNumber(e.target.value.toUpperCase().substring(0, 8))} 
                                    maxLength={8}
                                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm" 
                                    placeholder="Es. 862"
                                />
                                <span className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm text-slate-600 dark:text-gray-300 whitespace-nowrap truncate flex-1" title={service}>
                                    {service}
                                </span>
                            </div>
                        ) : (
                            <input 
                                type="text" 
                                value={manualQuoteNumber} 
                                onChange={e => setManualQuoteNumber(e.target.value.toUpperCase().substring(0, 8))}
                                maxLength={8}
                                className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm" 
                                placeholder="Es. 862"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Data Preventivo</label>
                        <input type="date" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} required className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Data Scadenza</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                    </div>
                    <div className="md:col-span-3">
                         <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Destinatario</label>
                         <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} required className="mt-1 w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                    </div>
                </div>

                {/* Service and Vehicle Details */}
                {client.name.toLowerCase().includes('facche') && (
                    <div className="mb-4">
                        <label htmlFor="quote-service" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Servizio</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                id="quote-service"
                                type="text" 
                                value={service} 
                                onChange={e => setService(e.target.value)} 
                                className="flex-grow w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                                placeholder="Es. Tagliando motore completo"
                            />
                            <div className="relative flex-shrink-0">
                                <select 
                                    onChange={handleServiceSourceChange} 
                                    className="appearance-none p-2 pl-3 pr-8 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600"
                                    aria-label="Popola servizio da un campo del lead"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Popola da...</option>
                                    {Object.keys(lead.data)
                                        .filter(key => !['_is_historical', 'ip_address', 'user_agent'].includes(key))
                                        .map(key => (
                                            <option key={key} value={key}>{key}</option>
                                        ))
                                    }
                                </select>
                                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {Object.entries(vehicleDetails).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">{key}</label>
                            <input type="text" value={value} onChange={e => handleVehicleDetailChange(key, e.target.value)} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                        </div>
                    ))}
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="p-2 text-left font-semibold">Descrizione</th>
                                <th className="p-2 text-left font-semibold w-24">Q.tà</th>
                                <th className="p-2 text-left font-semibold w-32">Prezzo (€)</th>
                                <th className="p-2 text-left font-semibold w-24">IVA (%)</th>
                                <th className="p-2 text-right font-semibold w-32">Totale (€)</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const lineTotal = (parseFloat(item.quantity.replace(',','.')) || 0) * (parseFloat(item.price.replace(',','.')) || 0);
                                return (
                                <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                                    <td className="p-1"><input type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full p-1 bg-transparent border-slate-300 dark:border-slate-600 rounded-md" placeholder="Descrizione" list="description-suggestions"/></td>
                                    <td className="p-1"><input type="text" inputMode="decimal" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-full p-1 bg-transparent border-slate-300 dark:border-slate-600 rounded-md text-right"/></td>
                                    <td className="p-1"><input type="text" inputMode="decimal" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} className="w-full p-1 bg-transparent border-slate-300 dark:border-slate-600 rounded-md text-right"/></td>
                                    <td className="p-1"><input type="text" inputMode="decimal" value={item.vat} onChange={e => handleItemChange(index, 'vat', e.target.value)} className="w-full p-1 bg-transparent border-slate-300 dark:border-slate-600 rounded-md text-right"/></td>
                                    <td className="p-1 text-right font-semibold">{formatCurrency(lineTotal)}</td>
                                    <td className="p-1 text-center">
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleAddItem} className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500">
                    <Plus size={16} className="mr-1"/> Aggiungi Riga
                </button>
                
                {/* Notes and Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Note Documento</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span>Imponibile</span> <span className="font-semibold">{formatCurrency(taxableAmount)} €</span></div>
                        <div className="flex justify-between"><span>IVA</span> <span className="font-semibold">{formatCurrency(vatAmount)} €</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-300 dark:border-slate-600"><span>TOTALE</span> <span>{formatCurrency(totalAmount)} €</span></div>
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Annulla</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 disabled:opacity-50 flex items-center">
                        {isLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={16} className="mr-2"/>}
                        {isLoading ? "Salvataggio..." : "Salva Preventivo"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default QuoteCreatorModal;