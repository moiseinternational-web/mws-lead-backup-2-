import React, { useMemo, useState } from 'react';
import type { Client, Lead } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LiveOverviewChart from './LiveOverviewChart';
import { useTranslation } from 'react-i18next';

const statusColors: Record<Lead['status'], string> = {
    'Nuovo': 'bg-slate-500 dark:bg-slate-600 text-white',
    'Contattato': 'bg-yellow-400 dark:bg-yellow-500 text-slate-800 dark:text-black',
    'In Lavorazione': 'bg-purple-400 dark:bg-purple-500 text-white',
    'Perso': 'bg-red-500 text-white',
    'Vinto': 'bg-green-500 text-white',
};
const statusOrder: Lead['status'][] = ['Nuovo', 'Contattato', 'In Lavorazione', 'Vinto', 'Perso'];


const LiveOverview: React.FC<{
    leads: Lead[];
    clients: Client[];
    groupBy: 'client' | 'service';
}> = ({ leads, clients, groupBy }) => {
    const { t } = useTranslation();
    const [expandedStatuses, setExpandedStatuses] = useState<Record<string, Lead['status'] | null>>({});

    const overviewData = useMemo(() => {
        const dataMap = new Map<string, { groupName: string; total: number; leadsByStatus: Record<Lead['status'], Lead[]> }>();

        leads.forEach(lead => {
            const groupId = groupBy === 'client' ? lead.client_id! : (lead.service || t('na'));
            
            if (!dataMap.has(groupId)) {
                let groupName = t('na');
                if (groupBy === 'client') {
                    groupName = clients.find(c => c.id === groupId)?.name || t('na');
                } else {
                    groupName = groupId;
                }
                dataMap.set(groupId, {
                    groupName,
                    total: 0,
                    leadsByStatus: { 'Nuovo': [], 'Contattato': [], 'In Lavorazione': [], 'Perso': [], 'Vinto': [] }
                });
            }
            const groupData = dataMap.get(groupId)!;
            groupData.total += 1;
            groupData.leadsByStatus[lead.status].push(lead);
        });

        for (const groupData of dataMap.values()) {
            for (const status of statusOrder) {
                groupData.leadsByStatus[status].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            }
        }

        return Array.from(dataMap.values()).sort((a, b) => b.total - a.total);

    }, [leads, clients, groupBy, t]);

    const toggleStatusExpansion = (groupName: string, status: Lead['status']) => {
        setExpandedStatuses(prev => ({
            ...prev,
            [groupName]: prev[groupName] === status ? null : status
        }));
    };

    if (leads.length === 0) {
         return (
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('component_liveOverview.no_leads_found')}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Lead Details */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {overviewData.map(item => (
                        <div key={item.groupName} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-white truncate" title={item.groupName}>{item.groupName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {t('component_liveOverview.total_leads')} <span className="font-semibold text-slate-700 dark:text-gray-300">{item.total}</span>
                            </p>
                            
                            <div className="space-y-2">
                                {statusOrder.map(status => {
                                    const leadsInStatus = item.leadsByStatus[status];
                                    const count = leadsInStatus.length;
                                    if (count === 0) return null;

                                    const isExpanded = expandedStatuses[item.groupName] === status;
                                    const translatedStatus = t(`lead_status.${status}`);

                                    return (
                                        <div key={status} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                            <button 
                                                onClick={() => toggleStatusExpansion(item.groupName, status)}
                                                className="w-full flex justify-between items-center py-2 text-left"
                                                aria-expanded={isExpanded}
                                                aria-controls={`leads-for-${item.groupName}-${status}`}
                                            >
                                                <div className="flex items-center">
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusColors[status]}`}>{translatedStatus}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-sm text-slate-700 dark:text-gray-300 mr-2">{count}</span>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </button>
                                            {isExpanded && (
                                                <div id={`leads-for-${item.groupName}-${status}`} className="pb-2 pl-2 space-y-2 max-h-60 overflow-y-auto">
                                                    {leadsInStatus.map(lead => (
                                                        <div key={lead.id} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
                                                            <p className="font-medium text-slate-800 dark:text-gray-200">{lead.data.nome || t('na')}</p>
                                                            <p className="text-slate-500 dark:text-gray-400">{new Date(lead.created_at).toLocaleDateString('it-IT')}</p>
                                                            {groupBy === 'client' && <p className="text-slate-500 dark:text-gray-400">{lead.service || t('na')}</p>}
                                                            {groupBy === 'service' && <p className="text-slate-500 dark:text-gray-400">{clients.find(c => c.id === lead.client_id)?.name || ''}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Right Column: Chart */}
            <div className="lg:sticky lg:top-24">
                 <LiveOverviewChart data={overviewData} />
            </div>
        </div>
    );
};

export default LiveOverview;
