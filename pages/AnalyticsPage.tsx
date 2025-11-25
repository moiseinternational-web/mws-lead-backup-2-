import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';
import type { Client, Lead, AdSpend } from '../types';
import { DollarSign, Trophy, Percent, FilterX, BarChart3, RefreshCw, MinusCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DateRangeFilter from '../components/DateRangeFilter';

const statusOrder: Lead['status'][] = ['Nuovo', 'Contattato', 'In Lavorazione', 'Vinto', 'Perso'];

const statusColors: Record<Lead['status'], string> = {
    'Nuovo': 'bg-slate-500',
    'Contattato': 'bg-yellow-400',
    'In Lavorazione': 'bg-purple-400',
    'Perso': 'bg-red-500',
    'Vinto': 'bg-green-500',
};

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

const AdSpendChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
    const { t } = useTranslation();
    // FIX: Add explicit type for `sum` accumulator to resolve type inference issue with `reduce`.
    const totalSpend = useMemo(() => Object.values(data).reduce((sum: number, amount) => sum + Number(amount), 0), [data]);

    if (totalSpend === 0) {
        return <p className="text-sm text-slate-500 dark:text-gray-400">{t('page_analytics.no_spend_in_period')}</p>;
    }

    // FIX: Coerce values to numbers for sorting to fix type errors. The original error message was likely a symptom of this.
    const sortedData = Object.entries(data).sort((a, b) => Number(b[1]) - Number(a[1]));

    return (
        <div className="space-y-2">
            {sortedData.map(([platform, amount]) => (
                <div key={platform}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-gray-300">{platform}</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{Number(amount).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div
                            className="bg-primary-500 h-2.5 rounded-full"
                            // FIX: Coerce amount to a number to prevent arithmetic type errors.
                            style={{ width: `${(Number(amount) / totalSpend) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const LeadStatusChart: React.FC<{ data: Record<Lead['status'], number> }> = ({ data }) => {
    const { t } = useTranslation();
    const totalLeads = useMemo(() => Object.values(data).reduce((sum: number, count: number) => sum + count, 0), [data]);

    if (totalLeads === 0) {
        return <p className="text-sm text-slate-500 dark:text-gray-400">{t('page_analytics.no_leads_in_period')}</p>;
    }

    return (
        <div className="space-y-3">
            {statusOrder.map(status => {
                const count = data[status] || 0;
                if (count === 0) return null;
                const percentage = (count / totalLeads) * 100;
                return (
                    <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700 dark:text-gray-300">{t(`lead_status.${status}`)}</span>
                            <span className="font-semibold text-slate-800 dark:text-white">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div
                                className={`${statusColors[status]} h-2.5 rounded-full`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [filteredSpends, setFilteredSpends] = useState<AdSpend[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter states
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
    const [selectedClientId, setSelectedClientId] = useState<string>('all');
    const [selectedService, setSelectedService] = useState<string>('all');
    
    const isAdmin = user?.role === 'admin';

    const fetchData = useCallback(async () => {
        if (!isRefreshing) setIsLoading(true);
        try {
            let clientsData: Client[] = [];
            if (isAdmin) {
                clientsData = await ApiService.getClients();
            } else if (user) {
                const client = await ApiService.getClientByUserId(user.id);
                if (client) clientsData = [client];
            }
            setAllClients(clientsData);
        } catch (e) {
            console.error(e);
        } finally {
            if (!isRefreshing) setIsLoading(false);
        }
    }, [isAdmin, user, isRefreshing]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let leads: Lead[] = [];
        let spends: AdSpend[] = [];

        const clientsToFilter = selectedClientId === 'all' 
            ? allClients 
            : allClients.filter(c => c.id === selectedClientId);

        clientsToFilter.forEach(c => {
            leads.push(...(c.leads || []));
            spends.push(...(c.adSpends || []));
        });

        if (selectedService !== 'all') {
            leads = leads.filter(l => l.service === selectedService);
            spends = spends.filter(s => s.service === selectedService);
        }

        if (dateRange.start || dateRange.end) {
            leads = leads.filter(l => {
                const leadDate = new Date(l.data._revenue_attribution_date || l.created_at);
                const isAfter = !dateRange.start || leadDate >= dateRange.start;
                const isBefore = !dateRange.end || leadDate <= dateRange.end;
                return isAfter && isBefore;
            });
            spends = spends.filter(s => {
                const spendDate = new Date(s.date + 'T00:00:00');
                const isAfter = !dateRange.start || spendDate >= dateRange.start;
                const isBefore = !dateRange.end || spendDate <= dateRange.end;
                return isAfter && isBefore;
            });
        }
        
        setFilteredLeads(leads);
        setFilteredSpends(spends);
    }, [allClients, selectedClientId, selectedService, dateRange]);

    const analyticsData = useMemo(() => {
        const wonLeads = filteredLeads.filter(l => l.status === 'Vinto');
        const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        const totalAdSpend = filteredSpends.reduce((sum, s) => sum + s.amount, 0);
        const netRevenue = totalRevenue - totalAdSpend;
        const totalLeadsCount = filteredLeads.length;
        const conversionRate = totalLeadsCount > 0 ? (wonLeads.length / totalLeadsCount) * 100 : 0;
        
        const adSpendByPlatform = filteredSpends.reduce((acc: Record<string, number>, spend) => {
            acc[spend.platform] = (acc[spend.platform] || 0) + spend.amount;
            return acc;
        }, {});
        
        const leadsByStatus = filteredLeads.reduce((acc: Record<Lead['status'], number>, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, { 'Nuovo': 0, 'Contattato': 0, 'In Lavorazione': 0, 'Perso': 0, 'Vinto': 0 });

        return {
            totalRevenue,
            totalAdSpend,
            netRevenue,
            wonLeadsCount: wonLeads.length,
            conversionRate,
            adSpendByPlatform,
            leadsByStatus,
            wonLeadsDetails: wonLeads
        };
    }, [filteredLeads, filteredSpends]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchData().finally(() => setIsRefreshing(false));
    }, [fetchData]);

    const resetFilters = () => {
        setDateRange({ start: null, end: null });
        setSelectedClientId('all');
        setSelectedService('all');
    };

    const availableServices = useMemo(() => {
        const clientsToScan = selectedClientId === 'all' ? allClients : allClients.filter(c => c.id === selectedClientId);
        const services = new Set<string>();
        clientsToScan.forEach(c => c.services.forEach(s => services.add(s.name)));
        return Array.from(services);
    }, [allClients, selectedClientId]);

    const formatCurrency = (value: number) => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <BarChart3 className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('page_analytics.title')}</h2>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                    title={t('page_analytics.refresh_tooltip')}
                >
                    <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isAdmin && (
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{t('page_analytics.client_label')}</label>
                            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="mt-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full">
                                <option value="all">{t('page_analytics.all_clients')}</option>
                                {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{t('page_analytics.service_label')}</label>
                        <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="mt-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 w-full">
                            <option value="all">{t('page_analytics.all_services')}</option>
                            {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Periodo</label>
                        <DateRangeFilter onDateChange={(range) => setDateRange(range as { start: Date | null; end: Date | null })} />
                    </div>
                </div>
                 <div className="flex justify-end">
                    <button onClick={resetFilters} className="flex items-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-gray-200">
                        <FilterX size={14} className="mr-1"/>
                        {t('page_analytics.reset_filters')}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center p-8">{t('page_analytics.loading')}</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <StatCard title={t('page_analytics.total_revenue')} value={formatCurrency(analyticsData.totalRevenue)} icon={<DollarSign/>} />
                        <StatCard title={t('page_analytics.ad_spend')} value={formatCurrency(analyticsData.totalAdSpend)} icon={<TrendingUp/>} />
                        <StatCard title={t('page_analytics.net_revenue')} value={formatCurrency(analyticsData.netRevenue)} icon={<MinusCircle/>} />
                        <StatCard title={t('page_analytics.won_leads')} value={String(analyticsData.wonLeadsCount)} icon={<Trophy/>} />
                        <StatCard title={t('page_analytics.conversion_rate')} value={`${analyticsData.conversionRate.toFixed(2)}%`} icon={<Percent/>} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('page_analytics.ad_spend_distribution')}</h3>
                            <AdSpendChart data={analyticsData.adSpendByPlatform} />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('page_analytics.lead_status_summary')}</h3>
                            <LeadStatusChart data={analyticsData.leadsByStatus} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('page_analytics.won_lead_details')}</h3>
                        </div>
                         <div className="overflow-x-auto">
                            {analyticsData.wonLeadsDetails.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('page_analytics.client_name')}</th>}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Lead</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('service')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valore</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {analyticsData.wonLeadsDetails.map(lead => (
                                            <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                {isAdmin && <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">{allClients.find(c=>c.id === lead.client_id)?.name}</td>}
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-gray-300">{lead.data.nome}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-gray-300">{lead.service}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600 dark:text-green-400">{formatCurrency(lead.value || 0)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-gray-400">{new Date(lead.data._revenue_attribution_date || lead.created_at).toLocaleDateString('it-IT')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center py-8 text-slate-500">{t('page_analytics.no_won_leads_found')}</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;
