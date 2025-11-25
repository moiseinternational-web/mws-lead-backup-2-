import React, { ReactNode } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { List, Users, BarChart3, DollarSign, FileCode, Activity, Calendar, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const params = useParams();

    const isAdmin = user?.role === 'admin';
    const userId = user?.id || params.userId;

    const baseClasses = "flex-shrink-0 flex items-center px-3 py-3.5 text-sm font-medium transition-colors border-b-2 border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 focus:outline-none";
    const activeClasses = "font-semibold border-primary-500 text-primary-600 dark:text-primary-400";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Header />
            <div className="flex-grow p-2 sm:p-4 md:p-6 lg:p-8">
                 <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto whitespace-nowrap">
                    {isAdmin ? (
                        <>
                            <NavLink 
                                to="/admin/dashboard" 
                                className={({isActive}) => `${baseClasses} ${isActive && (location.search === "" || location.search.includes("view=leads")) ? activeClasses : ''}`}
                            >
                                <List size={16} className="mr-2"/>
                                {t('nav_lead_management')}
                            </NavLink>
                            <NavLink 
                                to="/admin/calendar" 
                                className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}
                            >
                                <Calendar size={16} className="mr-2"/>
                                {t('nav_calendar')}
                            </NavLink>
                            <NavLink 
                                to="/admin/quotes" 
                                className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}
                            >
                                <FileText size={16} className="mr-2"/>
                                {t('nav_quotes')}
                            </NavLink>
                            <NavLink 
                                to="/admin/dashboard?view=live" 
                                className={({isActive}) => `${baseClasses} ${isActive && location.search.includes("view=live") ? activeClasses : ''}`}
                            >
                                <Activity size={16} className="mr-2"/>
                                {t('nav_live_overview')}
                            </NavLink>
                            <NavLink 
                                to="/admin/dashboard?view=clients" 
                                className={({isActive}) => `${baseClasses} ${isActive && location.search.includes("view=clients") ? activeClasses : ''}`}
                            >
                                <Users size={16} className="mr-2"/>
                                {t('nav_client_management')}
                            </NavLink>
                            <NavLink 
                                to="/admin/dashboard?view=forms" 
                                className={({isActive}) => `${baseClasses} ${isActive && location.search.includes("view=forms") ? activeClasses : ''}`}
                            >
                                <FileCode size={16} className="mr-2"/>
                                {t('nav_form_generator')}
                            </NavLink>
                             <NavLink 
                                to="/admin/dashboard?view=spese" 
                                className={({isActive}) => `${baseClasses} ${isActive && location.search.includes("view=spese") ? activeClasses : ''}`}
                            >
                                <DollarSign size={16} className="mr-2"/>
                                {t('nav_expense_management')}
                            </NavLink>
                            <NavLink 
                                to="/admin/analytics" 
                                className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}
                            >
                                <BarChart3 size={16} className="mr-2"/>
                                {t('nav_analysis')}
                            </NavLink>
                            <NavLink 
                                to="/admin/revenue" 
                                className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}
                            >
                                <DollarSign size={16} className="mr-2"/>
                                {t('nav_mws_revenue')}
                            </NavLink>
                        </>
                    ) : (
                        <>
                             <NavLink to={`/client/${userId}/dashboard`} className={({isActive}) => `${baseClasses} ${isActive && !location.search.includes("view=live") && !location.search.includes("view=spese") ? activeClasses : ''}`} end>
                                <List size={16} className="mr-2" /> {t('nav_my_leads')}
                            </NavLink>
                             <NavLink 
                                to={`/client/${userId}/calendar`} 
                                className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}
                            >
                                <Calendar size={16} className="mr-2"/>
                                {t('nav_calendar')}
                            </NavLink>
                            <NavLink 
                                to={`/client/${userId}/quotes`} 
                                className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}
                            >
                                <FileText size={16} className="mr-2"/>
                                {t('nav_quotes')}
                            </NavLink>
                            <NavLink 
                                to={`/client/${userId}/dashboard?view=live`} 
                                className={({isActive}) => `${baseClasses} ${isActive && location.search.includes("view=live") ? activeClasses : ''}`}
                            >
                                <Activity size={16} className="mr-2"/>
                                {t('nav_live_overview')}
                            </NavLink>
                             <NavLink to={`/client/${userId}/dashboard?view=spese`} className={({isActive}) => `${baseClasses} ${isActive && location.search.includes("view=spese") ? activeClasses : ''}`}>
                                <DollarSign size={16} className="mr-2" /> {t('nav_ad_expenses')}
                            </NavLink>
                            <NavLink to={`/client/${userId}/analytics`} end className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}>
                                <BarChart3 size={16} className="mr-2" /> {t('nav_data_analysis')}
                            </NavLink>
                            <NavLink 
                                to={`/client/${userId}/revenue`} 
                                className={({isActive}) => `${baseClasses} ${isActive ? activeClasses : ''}`}
                            >
                                <DollarSign size={16} className="mr-2"/>
                                {t('nav_mws_revenue')}
                            </NavLink>
                        </>
                    )}
                </div>
                <main>
                    {children}
                </main>
            </div>
             <footer className="w-full text-center p-4 mt-auto border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
                <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-1">
                    <a href="https://moise-web-srl.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
                        {t('footer_developed_by')}
                    </a>
                    <span className="hidden sm:inline">|</span>
                    <span>{t('footer_hq')}</span>
                    <span className="hidden sm:inline">|</span>
                    <span>P.IVA: RO50469659</span>
                </div>
            </footer>
        </div>
    );
};

export default Layout;