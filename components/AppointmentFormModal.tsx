import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { Appointment, CalendarAppointment } from '../types';

interface AppointmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Appointment, 'id' | 'created_at'>, id?: string) => Promise<void>;
    appointmentToEdit?: CalendarAppointment | null;
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ isOpen, onClose, onSave, appointmentToEdit }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('1');
    const [notes, setNotes] = useState('');
    const [partsCost, setPartsCost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!appointmentToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && appointmentToEdit) {
                setTitle(appointmentToEdit.title || (appointmentToEdit.leads?.data?.nome || ''));
                setDate(appointmentToEdit.appointment_date);
                setTime(appointmentToEdit.appointment_time);
                setDuration(String(appointmentToEdit.duration_hours));
                setNotes(appointmentToEdit.notes || '');
                setPartsCost(appointmentToEdit.parts_cost != null ? String(appointmentToEdit.parts_cost).replace('.', ',') : '');
            } else {
                // Reset form for creation
                setTitle('');
                setDate(new Date().toISOString().split('T')[0]);
                setTime('');
                setDuration('1');
                setNotes('');
                setPartsCost('');
            }
        }
    }, [isOpen, isEditing, appointmentToEdit]);

    const handleClose = () => {
        setError('');
        setIsLoading(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !date || !time) {
            setError("Titolo, data e ora sono obbligatori.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                title,
                appointment_date: date,
                appointment_time: time,
                duration_hours: Number(duration),
                notes,
                parts_cost: parseFloat(String(partsCost).replace(',', '.')) || 0,
                // Preserve lead/client association if it exists
                lead_id: appointmentToEdit?.lead_id,
                client_id: appointmentToEdit?.client_id,
                user_id: appointmentToEdit?.user_id
            };
            await onSave(payload, isEditing ? appointmentToEdit.id : undefined);
            handleClose();
        } catch (err: any) {
            setError(err.message || t('generic_error'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // Allow only digits, dots, and commas. This is more permissive to avoid blocking user input.
        if (/^[\d.,]*$/.test(value)) {
            setter(value);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Modifica Appuntamento" : "Crea Nuovo Appuntamento"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="app-title" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Titolo Appuntamento</label>
                    <input type="text" id="app-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="app-date" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Data</label>
                        <input type="date" id="app-date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="app-time" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Ora</label>
                        <input type="time" id="app-time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="app-duration" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Durata (ore)</label>
                    <input type="number" id="app-duration" value={duration} onChange={e => setDuration(e.target.value)} min="0.5" step="0.5" className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                </div>
                
                <div>
                    <label htmlFor="app-parts-cost" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Costo Pezzi di Ricambio (€)</label>
                    <input 
                        type="text"
                        inputMode="decimal"
                        id="app-parts-cost" 
                        value={partsCost} 
                        onChange={handleNumericChange(setPartsCost)}
                        placeholder="0,00"
                        className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="app-notes" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Note</label>
                    <textarea id="app-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Dettagli aggiuntivi..." className="mt-1 w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm"/>
                </div>
                
                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={handleClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">{t('cancel')}</button>
                    <button type="submit" disabled={isLoading} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 disabled:opacity-50 flex items-center">
                        {isLoading ? <><Loader2 size={16} className="animate-spin mr-2"/> {t('saving')}</> : (isEditing ? t('save_changes') : t('save'))}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentFormModal;
