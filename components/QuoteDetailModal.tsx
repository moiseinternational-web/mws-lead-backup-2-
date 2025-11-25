import React from 'react';
import Modal from './Modal';
import type { Quote, QuoteItem } from '../types';
import { FileText, Calendar, User, Truck, Hash } from 'lucide-react';

interface QuoteDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: Quote | null;
}

const formatCurrency = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({ isOpen, onClose, quote }) => {
    if (!isOpen || !quote) return null;

    const renderItems = () => {
        const itemsToRender = Array.isArray(quote.items) ? quote.items : Object.values(quote.items);
        return (
            <table className="min-w-full">
                <thead className="bg-slate-100 dark:bg-slate-700">
                    <tr>
                        <th className="p-2 text-left font-semibold">Descrizione</th>
                        <th className="p-2 text-center font-semibold w-20">Q.tà</th>
                        <th className="p-2 text-right font-semibold w-28">Prezzo</th>
                        <th className="p-2 text-center font-semibold w-20">IVA %</th>
                        <th className="p-2 text-right font-semibold w-32">Totale Riga</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {itemsToRender.map((item, index) => {
                        const lineTotal = item.quantity * item.price;
                        return (
                            <tr key={index}>
                                <td className="p-2 font-medium">{item.description}</td>
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                                <td className="p-2 text-center">{item.vat}%</td>
                                <td className="p-2 text-right font-semibold">{formatCurrency(lineTotal)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Dettagli Preventivo #${quote.quote_number_display || quote.id.substring(0,6)}`} size="large">
            <div className="space-y-6 text-sm">
                {/* Header Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center">
                        <Hash size={16} className="mr-2 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Numero</p>
                            <p className="font-semibold">{quote.quote_number_display}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Data</p>
                            <p className="font-semibold">{new Date(quote.quote_date + 'T00:00:00').toLocaleDateString('it-IT')}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <User size={16} className="mr-2 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Destinatario</p>
                            <p className="font-semibold">{quote.recipient_name}</p>
                        </div>
                    </div>
                </div>

                {/* Vehicle Details */}
                {Object.keys(quote.vehicle_details).length > 0 && (
                     <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-md font-semibold mb-2 flex items-center"><Truck size={16} className="mr-2" /> Dettagli Veicolo</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                             {quote.vehicle_details['Servizio'] && (
                                <div key="servizio" className="col-span-2 md:col-span-4">
                                    <span className="text-slate-500 dark:text-gray-400">Servizio:</span> <span className="font-semibold">{quote.vehicle_details['Servizio']}</span>
                                </div>
                            )}
                            {Object.entries(quote.vehicle_details).map(([key, value]) => (
                                (key !== 'Servizio' && value) && <div key={key}><span className="text-slate-500 dark:text-gray-400">{key}:</span> <span className="font-semibold">{value}</span></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Line Items */}
                <div>
                    <h3 className="text-md font-semibold mb-2">Voci del Preventivo</h3>
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                        {renderItems()}
                    </div>
                </div>

                {/* Notes & Totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {quote.notes && (
                        <div>
                            <h3 className="text-md font-semibold mb-2">Note</h3>
                            <p className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">{quote.notes}</p>
                        </div>
                    )}
                    <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg space-y-2 text-sm md:col-start-2">
                        <div className="flex justify-between"><span>Imponibile</span> <span className="font-semibold">{formatCurrency(quote.taxable_amount)}</span></div>
                        <div className="flex justify-between"><span>IVA</span> <span className="font-semibold">{formatCurrency(quote.vat_amount)}</span></div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-300 dark:border-slate-600"><span>TOTALE</span> <span>{formatCurrency(quote.total_amount)}</span></div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="bg-slate-500 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-600">Chiudi</button>
                </div>
            </div>
        </Modal>
    );
};

export default QuoteDetailModal;