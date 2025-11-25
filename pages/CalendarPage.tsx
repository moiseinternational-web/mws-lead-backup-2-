import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ApiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment, CalendarAppointment, Client } from '../types';
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import AppointmentFormModal from '../components/AppointmentFormModal';

type CalendarView = 'month' | 'week' | 'day';

const CalendarPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');

    const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
    const [appointmentToEdit, setAppointmentToEdit] = useState<CalendarAppointment | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const isAdmin = user?.role === 'admin';

    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('all');

    const fetchData = useCallback(async () => {
        setError('');
        try {
            const data = await ApiService.getAppointmentsForCalendar();
            setAppointments(data);
        } catch (err: any) {
            setError(err.message || t('generic_error'));
        }
    }, [t]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    }, [fetchData]);
    
    useEffect(() => {
        setIsLoading(true);
        fetchData().finally(() => setIsLoading(false));
    }, [fetchData]);

    useEffect(() => {
        if (isAdmin) {
            ApiService.getClients().then(setClients).catch(console.error);
        }
    }, [isAdmin]);

    const filteredAppointments = useMemo(() => {
        if (isAdmin) {
            if (selectedClientId === 'all') {
                return appointments; // Admin vede tutto
            }
            return appointments.filter(app => app.client_id === selectedClientId);
        }
        // Per la vista cliente
        if (!user) return [];
        return appointments.filter(app => {
            // Un appuntamento appartiene a un cliente se:
            // 1. L'appuntamento è collegato al suo record cliente
            // 2. L'appuntamento è uno "generale" creato da lui stesso
            const clientUserId = app.clients?.user_id;
            return clientUserId === user.id || (app.client_id === null && app.user_id === user.id);
        });
    }, [appointments, isAdmin, selectedClientId, user]);

    const handleOpenCreateForm = () => {
        setAppointmentToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
        if (window.confirm("Sei sicuro di voler eliminare questo appuntamento?")) {
            try {
                await ApiService.deleteAppointment(appointmentId);
                await fetchData(); // Refresh data
                setIsDetailModalOpen(false); // Close detail modal
            } catch (err) {
                console.error(err);
                alert("Errore durante l'eliminazione dell'appuntamento.");
            }
        }
    };

    const handleSaveAppointment = async (data: Omit<Appointment, 'id' | 'created_at'>, id?: string) => {
        if (id) { // Editing
            await ApiService.updateAppointment(id, data);
        } else { // Creating a new general appointment
            if (!user) return;
            await ApiService.addGeneralAppointment({ ...data, user_id: user.id });
        }
        await fetchData(); // Refresh data
    };
    
    // Navigation handlers
    const goToNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        if (view === 'week') newDate.setDate(newDate.getDate() + 7);
        if (view === 'day') newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const goToPrev = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        if (view === 'week') newDate.setDate(newDate.getDate() - 7);
        if (view === 'day') newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };
    
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleViewDetails = (appointment: CalendarAppointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    const Header = () => {
        let title = '';
        if (view === 'month') {
            title = currentDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
        } else if (view === 'week') {
            const startOfWeek = new Date(currentDate);
            const dayIndex = startOfWeek.getDay(); // Sunday - 0, Monday - 1, ...
            startOfWeek.setDate(startOfWeek.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1)); // Adjust to Monday
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            title = `${startOfWeek.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}`;
        } else { // day
            title = currentDate.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                 <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('page_calendar.title')}</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                    {isAdmin && (
                        <select
                            value={selectedClientId}
                            onChange={e => setSelectedClientId(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full sm:w-auto order-first sm:order-none"
                        >
                            <option value="all">Tutti i Clienti</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                     <button onClick={handleOpenCreateForm} className="flex items-center bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-primary-700 transition-colors">
                        <Plus size={16} className="mr-2"/>
                        Crea Appuntamento
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={goToPrev} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft size={20}/></button>
                        <button onClick={goToToday} className="px-3 py-1.5 text-sm font-semibold bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">{t('page_calendar.today')}</button>
                        <button onClick={goToNext} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight size={20}/></button>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white w-full sm:w-auto text-center capitalize">{title}</h3>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            {(['month', 'week', 'day'] as CalendarView[]).map(v => (
                                <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === v ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                    {t(`page_calendar.${v}`)}
                                </button>
                            ))}
                        </div>
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
            </div>
        );
    };
    
    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDay.getDate();
        let startingDay = firstDay.getDay() - 1; // 0=Mon, 1=Tue..
        if (startingDay < 0) startingDay = 6; // Sunday
        
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const blanks = Array.from({ length: startingDay }, () => null);
        const totalCells = [...blanks, ...days];

        const appointmentsByDate = filteredAppointments.reduce((acc, app) => {
            const date = app.appointment_date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(app);
            return acc;
        }, {} as Record<string, CalendarAppointment[]>);
        
        const weekDays = i18n.language === 'ro' ? ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'] : (i18n.language === 'en' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'M', 'G', 'V', 'S', 'D']);

        return (
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border-t border-l border-slate-200 dark:border-slate-700">
                {weekDays.map((d,i) => (
                    <div key={`${d}-${i}`} className="py-2 text-center text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-gray-400 border-b border-r border-slate-200 dark:border-slate-700">{d}</div>
                ))}
                {totalCells.map((day, index) => {
                    if (!day) return <div key={`blank-${index}`} className="bg-slate-50 dark:bg-slate-800/50 border-r border-b border-slate-200 dark:border-slate-700"></div>;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayAppointments = appointmentsByDate[dateStr] || [];
                    const isToday = new Date(year, month, day).toDateString() === new Date().toDateString();

                    return (
                        <div key={day} className="min-h-[120px] p-1.5 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700">
                            <div className={`text-sm font-semibold ${isToday ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-slate-700 dark:text-gray-300'}`}>{day}</div>
                            <div className="mt-1 space-y-1">
                                {dayAppointments.map(app => (
                                    <button key={app.id} onClick={() => handleViewDetails(app)} className="w-full text-left text-xs p-1 rounded bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-500/30 truncate">
                                        <span className="font-bold">{app.appointment_time}</span> {app.leads?.data?.nome || app.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        const dayIndex = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1)); // Set to Monday
        startOfWeek.setHours(0,0,0,0);

        const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            return day;
        });
        
        const appointmentsByDate = filteredAppointments.reduce((acc, app) => {
            const date = app.appointment_date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(app);
            return acc;
        }, {} as Record<string, CalendarAppointment[]>);
        
        const weekDayLabels = weekDays.map(day => day.toLocaleDateString(i18n.language, { weekday: 'long' }));

        return (
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border-t border-l border-slate-200 dark:border-slate-700">
                {weekDayLabels.map((d,i) => (
                    <div key={`${d}-${i}`} className="py-2 text-center text-sm font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-gray-400 border-b border-r border-slate-200 dark:border-slate-700 capitalize">{d}</div>
                ))}
                {weekDays.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayAppointments = (appointmentsByDate[dateStr] || []).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div key={dateStr} className={`min-h-[300px] bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 flex flex-col`}>
                            <div className={`p-2 text-center border-b border-slate-200 dark:border-slate-700 ${isToday ? 'bg-primary-50 dark:bg-primary-500/10' : ''}`}>
                                <div className={`text-2xl font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-slate-800 dark:text-white'}`}>
                                    {day.getDate()}
                                </div>
                            </div>
                            <div className="p-1.5 space-y-1.5 overflow-y-auto flex-grow">
                                {dayAppointments.length > 0 ? dayAppointments.map(app => (
                                    <button key={app.id} onClick={() => handleViewDetails(app)} className="w-full text-left p-2 rounded bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-500/30 transition-colors">
                                        <p className="font-bold text-sm">{app.appointment_time}</p>
                                        <p className="text-xs truncate" title={app.leads?.data?.nome || app.title || t('na')}>{app.leads?.data?.nome || app.title || t('na')}</p>
                                        {isAdmin && app.clients?.name && <p className="text-xs text-slate-500 truncate" title={app.clients?.name}>{app.clients?.name}</p>}
                                    </button>
                                )) : (
                                    <div/>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
         const dateStr = currentDate.toISOString().split('T')[0];
         const dayAppointments = filteredAppointments
                        .filter(app => app.appointment_date === dateStr)
                        .sort((a,b) => a.appointment_time.localeCompare(b.appointment_time));
        
        return (
             <div className="space-y-3">
                {dayAppointments.length > 0 ? (
                    dayAppointments.map(app => (
                         <div key={app.id} onClick={() => handleViewDetails(app)} className="flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:shadow-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all cursor-pointer border border-slate-200 dark:border-slate-700">
                            <div className="w-16 text-center">
                                <p className="font-bold text-primary-600 dark:text-primary-400 text-lg">{app.appointment_time}</p>
                            </div>
                            <div className="h-10 w-px bg-slate-300 dark:bg-slate-600 mx-4"></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">{app.leads?.data?.nome || app.title || t('na')}</p>
                                {user?.role === 'admin' && app.clients?.name && <p className="text-xs text-slate-500 dark:text-gray-400">{app.clients?.name}</p>}
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-gray-500 ml-2 flex-shrink-0"/>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500 dark:text-gray-400 text-center py-8">{t('page_calendar.no_appointments')}</p>
                )}
            </div>
        );
    };

    const renderView = () => {
        switch (view) {
            case 'month': return renderMonthView();
            case 'week': return renderWeekView();
            case 'day': return renderDayView();
            default: return null;
        }
    };

    return (
        <>
            <div className="space-y-6">
                <Header />
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">
                            <AlertTriangle className="mx-auto w-10 h-10 mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : (
                       <div className={view === 'day' ? 'p-4 sm:p-6' : ''}>
                         {renderView()}
                       </div>
                    )}
                </div>
            </div>

            <AppointmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                appointment={selectedAppointment}
                isAdmin={user?.role === 'admin'}
                onSaveSuccess={fetchData}
                onDelete={handleDeleteAppointment}
            />
            <AppointmentFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveAppointment}
                appointmentToEdit={appointmentToEdit}
            />
        </>
    );
};

export default CalendarPage;
