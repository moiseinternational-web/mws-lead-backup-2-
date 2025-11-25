
import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, BarChart3, Users, List } from 'lucide-react';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const params = useParams();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const baseLinkClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-primary-700 hover:text-white transition-colors duration-200";
    const activeLinkClasses = "bg-primary-700 text-white font-semibold";

    const adminLinks = [
        { path: '/admin/dashboard', icon: <Users size={20} />, label: 'Gestione Lead' },
        { path: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analisi Dati' },
    ];

    const clientLinks = [
        { path: `/client/${params.userId}/dashboard`, icon: <List size={20} />, label: 'I Miei Lead' },
        { path: `/client/${params.userId}/analytics`, icon: <BarChart3 size={20} />, label: 'Analisi Dati' },
    ];
    
    const links = user?.role === 'admin' ? adminLinks : clientLinks;

    return (
        <div className="w-64 bg-primary-900 text-white flex flex-col min-h-screen">
            <div className="h-16 flex items-center justify-center px-4 border-b border-primary-800">
                <LayoutDashboard className="text-white h-8 w-8 mr-3" />
                <h1 className="text-xl font-bold text-white whitespace-nowrap">Gestione Lead</h1>
            </div>

            <nav className="flex-1 mt-6 space-y-2">
                {links.map(link => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end
                        className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        <span className="mr-3">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-primary-800">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold">{user?.username}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                 <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-100 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-900 focus:ring-red-500"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
