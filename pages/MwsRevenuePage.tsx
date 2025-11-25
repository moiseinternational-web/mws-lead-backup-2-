import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ApiService } from '../services/apiService';
import type { Client, MwsMonthlyRevenue } from '../types';
import { DollarSign, RefreshCw, Save, CheckCircle, AlertCircle, TrendingUp, CreditCard, ListChecks, Calculator, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { useTranslation } from 'react-i18next';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex items-center border border-slate-200 dark:border-slate-700">
        <div className="bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paymentDetails: { amount: number; isTotal: boolean }) => void;
    clientName: string;
    month: string;
    totalDue: number;
    existingPaidAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSave, clientName, month, totalDue, existingPaidAmount }) => {
    const { t } = useTranslation();
    const remainingDue = Math.max(0, totalDue - existingPaidAmount);
    const [isPaidInFull, setIsPaidInFull] = useState(remainingDue === 0);
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const newRemainingDue = Math.max(0, totalDue - existingPaidAmount);
            setIsPaidInFull(newRemainingDue === 0);
            setAmount(newRemainingDue > 0 ? newRemainingDue.toFixed(2) : '');
            setError('');
        }
    }, [isOpen, totalDue, existingPaidAmount]);

    const handleSave = () => {
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount < 0) {
            setError(t('page_mwsRevenue.payment_modal.error_invalid_amount'));
            return;
        }
        if (!isPaidInFull && paymentAmount > remainingDue) {
            setError(t('page_mwsRevenue.payment_modal.error_overpayment'));
            return;
        }

        const totalPaidAmount = (existingPaidAmount || 0) + (isPaidInFull ? remainingDue : paymentAmount);

        onSave({
            amount: totalPaidAmount,
            isTotal: isPaidInFull || totalPaidAmount >= totalDue,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('page_mwsRevenue.payment_modal.title')}>
            <div className="space-y-4">
                <p>{t('page_mwsRevenue.payment_modal.description', { clientName, month })}</p>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-gray-400">{t('page_mwsRevenue.payment_modal.total_due')}</span> <span className="font-semibold">{totalDue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-gray-400">{t('page_mwsRevenue.payment_modal.already_paid')}</span> <span className="font-semibold">{existingPaidAmount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span></div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-300 dark:border-slate-600"><span className="text-slate-800 dark:text-white">{t('page_mwsRevenue.payment_modal.remaining')}</span> <span>{remainingDue.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span></div>
                </div>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-600">
                        <input
                            type="checkbox"
                            checked={isPaidInFull}
                            onChange={(e) => setIsPaidInFull(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{t('page_mwsRevenue.payment_modal.pay_in_full')}</span>
                    </label>
                    <div>
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 dark:text-gray-300">{t('page_mwsRevenue.payment_modal.payment_amount')}</label>
                        <input
                            id="paymentAmount"
                            type="number"
                            value={isPaidInFull ? remainingDue.toFixed(2) : amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isPaidInFull}
                            placeholder="0.00"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">{t('cancel')}</button>
                    <button type="button" onClick={handleSave} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700">{t('page_mwsRevenue.payment_modal.confirm_and_save')}</button>
                </div>
            </div>
        </Modal>
    );
};

interface ClientRevenueCalculatorProps {
    client: Client;
    dateRange: { start: Date | null; end: Date | null };
    savedDataForMonth: MwsMonthlyRevenue | undefined;
    onClientUpdate: () => void;
    isReadOnly: boolean;
    onOpenPaymentModal: (totalDue: number) => void;
}

const ClientRevenueCalculator: React.FC<ClientRevenueCalculatorProps> = ({ client, dateRange, savedDataForMonth, onClientUpdate, isReadOnly, onOpenPaymentModal }) => {
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const revenueData = useMemo(() => {
        let leads = client.leads || [];
        if (dateRange.start || dateRange.end) {
            leads = leads.filter(l => {
                const leadDate = new Date(l.data._revenue_attribution_date || l.created_at);
                const isAfter = !dateRange.start || leadDate >= dateRange.start;
                const isBefore = !dateRange.end || leadDate <= dateRange.end;
                return isAfter && isBefore;
            });
        }
        
        let spends = client.adSpends || [];
        if (dateRange.start || dateRange.end) {
            spends = spends.filter(s => {
                const spendDate = new Date(s.date);
                const isAfter = !dateRange.start || spendDate >= dateRange.start;
                const isBefore = !dateRange.end || spendDate <= dateRange.end;
                return isAfter && isBefore;
            });
        }

        const wonLeads = leads.filter(l => l.status === 'Vinto');
        const clientRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        const totalAdSpend = spends.reduce((sum, s) => sum + s.amount, 0);
        const clientProfit = clientRevenue - totalAdSpend;

        const mwsFixed = client.mws_fixed_fee || 0;
        const mwsPercentage = client.mws_profit_percentage || 0;
        const mwsProfitShare = clientProfit > 0 ? (clientProfit * mwsPercentage) / 100 : 0;
        
        const mwsRevenue = mwsFixed + mwsProfitShare;

        return { clientRevenue, totalAdSpend, clientProfit, mwsFixed, mwsPercentage, mwsProfitShare, mwsRevenue };
    }, [client, dateRange]);

    const handleSave = async () => {
        if (!dateRange.start) return;
        setIsSaving(true);
        setSaveSuccess(false);

        const month = `${dateRange.start.getFullYear()}-${String(dateRange.start.getMonth() + 1).padStart(2, '0')}-01`;
        
        try {
            await ApiService.upsertMwsRevenue({
                client_id: client.id,
                month: month,
                revenue_amount: revenueData.mwsRevenue,
                paid_amount: savedDataForMonth?.paid_amount || 0,
                status: savedDataForMonth?.status || 'unpaid',
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            onClientUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const formatCurrency = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

    const hasPendingChanges = savedDataForMonth ? Math.abs(savedDataForMonth.revenue_amount - revenueData.mwsRevenue) > 0.01 : revenueData.mwsRevenue > 0;

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-800 dark:text-white truncate">{client.name}</h4>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>{t('page_mwsRevenue.client_revenue')}</span> <span>{formatCurrency(revenueData.clientRevenue)}</span></div>
                <div className="flex justify-between"><span>(-) {t('page_mwsRevenue.spend')}</span> <span>{formatCurrency(revenueData.totalAdSpend)}</span></div>
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-300 dark:border-slate-600"><span>{t('page_mwsRevenue.client_profit')}</span> <span>{formatCurrency(revenueData.clientProfit)}</span></div>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-600 space-y-2 text-sm">
                <div className="flex justify-between"><span>{t('page_mwsRevenue.mws_fixed_fee')}</span> <span>{formatCurrency(revenueData.mwsFixed)}</span></div>
                <div className="flex justify-between"><span>{t('page_mwsRevenue.mws_profit_perc')} ({revenueData.mwsPercentage}%)</span> <span>{formatCurrency(revenueData.mwsProfitShare)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t border-slate-300 dark:border-slate-600 text-primary-600 dark:text-primary-400"><span>{t('page_mwsRevenue.mws_revenue')}</span> <span>{formatCurrency(revenueData.mwsRevenue)}</span></div>
            </div>
             {!isReadOnly && (
                <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600 flex flex-col sm:flex-row justify-between items-center gap-2">
                     <button
                        onClick={handleSave}
                        disabled={isSaving || !hasPendingChanges}
                        className="w-full sm:w-auto flex items-center justify-center bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin mr-2"/> : (saveSuccess ? <CheckCircle size={16} className="mr-2"/> : <Save size={16} className="mr-2"/>)}
                        {isSaving ? t('page_mwsRevenue.saving') : (saveSuccess ? t('page_mwsRevenue.saved') : (hasPendingChanges ? t('save_changes') : t('page_mwsRevenue.saved')))}
                    </button>
                    <button
                        onClick={() => onOpenPaymentModal(savedDataForMonth?.revenue_amount || revenueData.mwsRevenue)}
                        disabled={!savedDataForMonth && revenueData.mwsRevenue === 0}
                        className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <CreditCard size={16} className="mr-2"/>
                        {t('page_mwsRevenue.manage_payment')}
                    </button>
                </div>
            )}
        </div>
    );
};

const MwsRevenuePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [mwsRevenues, setMwsRevenues] = useState<MwsMonthlyRevenue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [selectedClientId, setSelectedClientId] = useState<string>('all');
    
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState<{ client: Client; month: string; totalDue: number } | null>(null);

    const isAdmin = user?.role === 'admin';

    const isReadOnly = useMemo(() => {
        if (!isAdmin) {
            return true; // Clients are always in read-only mode
        }
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        return selectedMonth !== currentMonth; // Admin is read-only for past months
    }, [selectedMonth, isAdmin]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            let clientsData: Client[] = [];
            let revenuesData: MwsMonthlyRevenue[] = [];
            if (isAdmin) {
                clientsData = await ApiService.getClients();
                revenuesData = await ApiService.getMwsMonthlyRevenues();
            } else if (user) {
                const client = await ApiService.getClientByUserId(user.id);
                if (client) {
                    clientsData = [client];
                    revenuesData = await ApiService.getMwsMonthlyRevenues(client.id);
                }
            }
            setAllClients(clientsData);
            setMwsRevenues(revenuesData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dateRange = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        return { start, end };
    }, [selectedMonth]);
    
    const filteredClients = useMemo(() => {
        if (isAdmin) {
            if (selectedClientId === 'all') return allClients;
            return allClients.filter(c => c.id === selectedClientId);
        }
        return allClients; // for client, it's just their own data
    }, [allClients, selectedClientId, isAdmin]);

    const analytics = useMemo(() => {
        const totalRevenue = mwsRevenues
            .filter(r => r.month.startsWith(selectedMonth))
            .reduce((sum, r) => sum + r.revenue_amount, 0);

        const totalPaid = mwsRevenues
            .filter(r => r.month.startsWith(selectedMonth))
            .reduce((sum, r) => sum + r.paid_amount, 0);

        const totalUnpaid = totalRevenue - totalPaid;

        return { totalRevenue, totalPaid, totalUnpaid };
    }, [mwsRevenues, selectedMonth]);

    const historyRevenues = useMemo(() => {
        let revenues = mwsRevenues
            .filter(r => r.status !== 'unpaid')
            .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
        
        if (isAdmin && selectedClientId !== 'all') {
            revenues = revenues.filter(r => r.client_id === selectedClientId);
        }
        
        return revenues;
    }, [mwsRevenues, isAdmin, selectedClientId]);

    const formatCurrency = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

    const handleOpenPaymentModal = (client: Client, month: string, totalDue: number) => {
        const [year, monthNum] = month.split('-');
        const formattedMonth = new Date(Number(year), Number(monthNum) - 1).toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        setPaymentModalData({ client, month: formattedMonth, totalDue });
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = async ({ amount, isTotal }: { amount: number; isTotal: boolean }) => {
        if (!paymentModalData) return;
        
        const [year, monthNum] = selectedMonth.split('-');

        const payload: MwsMonthlyRevenue = {
            id: '', // Not needed for upsert
            client_id: paymentModalData.client.id,
            month: `${year}-${monthNum}-01`,
            revenue_amount: paymentModalData.totalDue,
            paid_amount: amount,
            status: isTotal ? 'paid' : (amount > 0 ? 'partially_paid' : 'unpaid'),
            created_at: '',
            updated_at: '',
        };
        await ApiService.upsertMwsRevenue(payload);
        setIsPaymentModalOpen(false);
        fetchData();
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
                <DollarSign size={28} className="mr-3 text-primary-500"/>
                {t('page_mwsRevenue.title')}
            </h2>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                <label htmlFor="month-filter" className="text-sm font-medium">{t('page_mwsRevenue.filter_by_month')}:</label>
                <input
                    id="month-filter"
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {isAdmin && (
                    <>
                        <label htmlFor="client-filter" className="text-sm font-medium">Cliente:</label>
                        <select
                            id="client-filter"
                            value={selectedClientId}
                            onChange={e => setSelectedClientId(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="all">Tutti i Clienti</option>
                            {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </>
                )}
            </div>
            
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title={t('page_mwsRevenue.total_mws_revenue_period')} value={formatCurrency(analytics.totalRevenue)} icon={<TrendingUp/>} />
                    <StatCard title="Pagato" value={formatCurrency(analytics.totalPaid)} icon={<CheckCircle/>} />
                    <StatCard title="Da Pagare" value={formatCurrency(analytics.totalUnpaid)} icon={<AlertCircle/>} />
                </div>
            )}

            {isReadOnly && isAdmin && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                    <p className="font-bold">Modalità Sola Lettura</p>
                    <p className="text-sm">Il calcolo e la modifica del fatturato sono disponibili solo per il mese corrente.</p>
                </div>
            )}
            
            <div className="mt-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <Calculator size={24} className="mr-3 text-primary-500"/>
                    {t('page_mwsRevenue.calculator_title')}
                </h3>
                {isLoading ? (
                    <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.length > 0 ? filteredClients.map(client => {
                            const savedData = mwsRevenues.find(r => r.client_id === client.id && r.month.startsWith(selectedMonth));
                            return (
                                <ClientRevenueCalculator
                                    key={client.id}
                                    client={client}
                                    dateRange={dateRange}
                                    savedDataForMonth={savedData}
                                    onClientUpdate={fetchData}
                                    isReadOnly={isReadOnly}
                                    onOpenPaymentModal={(totalDue) => handleOpenPaymentModal(client, selectedMonth, totalDue)}
                                />
                            );
                        }) : (
                            <p className="md:col-span-2 lg:col-span-3 text-center text-slate-500 dark:text-gray-400 py-8">{t('page_mwsRevenue.no_unpaid_invoices')}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <ListChecks size={24} className="mr-3 text-primary-500"/>
                    {t('page_mwsRevenue.payment_history_title')}
                </h3>
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        {historyRevenues.length > 0 ? (
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold">{t('page_mwsRevenue.payment_history.client')}</th>
                                        <th className="px-6 py-3 text-left font-semibold">{t('page_mwsRevenue.payment_history.month')}</th>
                                        <th className="px-6 py-3 text-right font-semibold">{t('page_mwsRevenue.payment_history.total_amount')}</th>
                                        <th className="px-6 py-3 text-right font-semibold">{t('page_mwsRevenue.payment_history.paid_amount')}</th>
                                        <th className="px-6 py-3 text-right font-semibold">{t('page_mwsRevenue.payment_history.remaining_amount')}</th>
                                        <th className="px-6 py-3 text-center font-semibold">{t('page_mwsRevenue.payment_history.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {historyRevenues.map(revenue => {
                                        const client = allClients.find(c => c.id === revenue.client_id);
                                        if (!client) return null;
                                        const remaining = revenue.revenue_amount - revenue.paid_amount;
                                        const monthDate = new Date(revenue.month);
                                        const monthString = monthDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
                                        
                                        return (
                                            <tr key={revenue.id}>
                                                <td className="px-6 py-4">{client.name}</td>
                                                <td className="px-6 py-4">{monthString}</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(revenue.revenue_amount)}</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(revenue.paid_amount)}</td>
                                                <td className="px-6 py-4 text-right">{formatCurrency(remaining)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${revenue.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                                        {t(`page_mwsRevenue.payment_history.${revenue.status}`)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-8 text-slate-500 dark:text-gray-400">
                                Nessuno storico pagamenti da mostrare per i filtri selezionati.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {paymentModalData && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSave={handleSavePayment}
                    clientName={paymentModalData.client.name}
                    month={paymentModalData.month}
                    totalDue={paymentModalData.totalDue}
                    existingPaidAmount={mwsRevenues.find(r => r.client_id === paymentModalData.client.id && r.month.startsWith(selectedMonth))?.paid_amount || 0}
                />
            )}
        </div>
    );
};

export default MwsRevenuePage;