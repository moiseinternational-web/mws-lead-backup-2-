import React, { useState, useMemo } from 'react';
import type { Lead } from '../types';
import { useTranslation } from 'react-i18next';

interface OverviewDataItem {
    groupName: string;
    total: number;
    leadsByStatus: Record<Lead['status'], Lead[]>;
}

interface LiveOverviewChartProps {
    data: OverviewDataItem[];
}

interface TooltipData {
    x: number;
    y: number;
    status: Lead['status'];
    count: number;
    percent: string;
}

const statusOrder: Lead['status'][] = ['Nuovo', 'Contattato', 'In Lavorazione', 'Vinto', 'Perso'];
const statusColors: Record<Lead['status'], string> = {
    'Nuovo': '#64748b',
    'Contattato': '#f59e0b',
    'In Lavorazione': '#a855f7',
    'Perso': '#ef4444',
    'Vinto': '#22c55e',
};

const LiveOverviewChart: React.FC<LiveOverviewChartProps> = ({ data }) => {
    const { t } = useTranslation();
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const aggregatedData = useMemo(() => {
        const stats: Record<string, number> = {};
        let total = 0;
        
        data.forEach(group => {
            // FIX: Add explicit type for 'status' to resolve TS inference error.
            Object.entries(group.leadsByStatus).forEach(([status, leads]: [string, Lead[]]) => {
                if (!stats[status]) stats[status] = 0;
                stats[status] += leads.length;
                total += leads.length;
            });
        });

        const sortedData = statusOrder
            .map(status => ({
                status: status as Lead['status'],
                count: stats[status] || 0,
            }))
            .filter(item => item.count > 0);

        return { stats: sortedData, total };
    }, [data]);

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    if (aggregatedData.total === 0) {
        return (
             <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center h-full min-h-[400px]">
                 <p className="text-slate-500 dark:text-gray-400">{t('component_liveOverviewChart.no_data_to_display')}</p>
             </div>
        );
    }

    let cumulativePercent = 0;
    const slices = aggregatedData.stats.map(item => {
        const { status, count } = item;
        const percent = count / aggregatedData.total;
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
        cumulativePercent += percent;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = percent > 0.5 ? 1 : 0;

        const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
        ].join(' ');
        
        return { pathData, status, count, percent };
    });

    const handleMouseMove = (e: React.MouseEvent, sliceData: any) => {
        setTooltip({
            x: e.clientX,
            y: e.clientY,
            status: sliceData.status,
            count: sliceData.count,
            percent: (sliceData.percent * 100).toFixed(1)
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="relative p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">{t('component_liveOverviewChart.total_leads_summary')}</h4>
            <div className="flex justify-center items-center">
                <svg viewBox="-1 -1 2 2" width="250" height="250" style={{ transform: 'rotate(-90deg)' }}>
                    {slices.map(slice => (
                        <path
                            key={slice.status}
                            d={slice.pathData}
                            fill={statusColors[slice.status]}
                            onMouseMove={(e) => handleMouseMove(e, slice)}
                            onMouseLeave={handleMouseLeave}
                            className="cursor-pointer transition-transform duration-200 hover:scale-105"
                        />
                    ))}
                </svg>
            </div>

            <div className="mt-6 space-y-2">
                {aggregatedData.stats.map(item => (
                    <div key={item.status} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColors[item.status] }}></span>
                            <span className="text-slate-600 dark:text-gray-400">{t(`lead_status.${item.status}`)}</span>
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-white">
                            {item.count} <span className="text-xs text-slate-500">({(item.count / aggregatedData.total * 100).toFixed(1)}%)</span>
                        </div>
                    </div>
                ))}
            </div>

            {tooltip && (
                <div
                    className="fixed p-2 text-xs text-white bg-slate-800/90 dark:bg-slate-900/90 rounded-md shadow-lg pointer-events-none z-50"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(15px, -15px)',
                    }}
                >
                    <div className="font-bold whitespace-nowrap" style={{ color: statusColors[tooltip.status] }}>{t(`lead_status.${tooltip.status}`)}</div>
                    <div className="whitespace-nowrap">{tooltip.count} {tooltip.count === 1 ? t('component_liveOverviewChart.lead') : t('component_liveOverviewChart.leads')} ({tooltip.percent}%)</div>
                </div>
            )}
        </div>
    );
};

export default LiveOverviewChart;
