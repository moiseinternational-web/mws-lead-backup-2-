
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';
import { Settings, User, Mail, Phone, Lock, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50">
            {icon}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);


const AccountSettingsPage: React.FC = () => {
    const { user, updateUserContext, logout } = useAuth();

    const [profileData, setProfileData] = useState({ username: '', email: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username,
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);
    
    useEffect(() => {
        if (profileSuccess) {
            const timer = setTimeout(() => setProfileSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [profileSuccess]);
    
    useEffect(() => {
        if (passwordSuccess) {
            const timer = setTimeout(() => setPasswordSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [passwordSuccess]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setIsProfileLoading(true);
        if (!user) return;

        try {
            const updatedUser = await ApiService.updateUser(user.id, {
                username: profileData.username,
                phone: profileData.phone
                // Email cannot be updated here directly for security reasons
            });
            updateUserContext(updatedUser);
            setProfileSuccess('Profilo aggiornato con successo!');
        } catch (err: any) {
            setProfileError(err.message || 'Errore durante l\'aggiornamento.');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Le nuove password non coincidono.');
            return;
        }
        if (!passwordData.newPassword) {
            setPasswordError('La nuova password non può essere vuota.');
            return;
        }
        setIsPasswordLoading(true);
        if (!user) return;

        try {
            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
            if (error) throw error;

            setPasswordSuccess('Password modificata con successo!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPasswordError(err.message || 'Errore durante la modifica della password.');
        } finally {
            setIsPasswordLoading(false);
        }
    };
    
    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleteError('');
        if (!user || deleteConfirm !== user.username) {
            setDeleteError('Il nome utente inserito non è corretto.');
            return;
        }

        setIsDeleteLoading(true);
        try {
            // This needs to be an RPC call for security
            const { error } = await supabase.rpc('delete_user_by_id_and_data', { user_id_to_delete: user.id });
            if (error) throw error;
            
            alert('Account eliminato con successo.');
            logout();
        } catch (err: any) {
            setDeleteError(err.message || 'Impossibile eliminare l\'account.');
            setIsDeleteLoading(false);
        }
    };
    
    const inputClasses = "appearance-none relative block w-full px-3 py-3 pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm";
    const iconClasses = "h-5 w-5 text-gray-400";
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-3">
                <Settings className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Impostazioni Account</h2>
            </div>
            
            <Card title="Informazioni Profilo" icon={<User className="text-primary-500 dark:text-primary-400" />}>
                 <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className={iconClasses} /></div>
                        <input type="text" name="username" value={profileData.username} onChange={handleProfileChange} required placeholder="Username" className={inputClasses}/>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className={iconClasses} /></div>
                        <input type="email" name="email" value={profileData.email} readOnly disabled placeholder="Email" className={`${inputClasses} cursor-not-allowed bg-slate-200 dark:bg-slate-800`}/>
                        <p className="text-xs text-slate-500 mt-1 pl-2">L'email non può essere modificata. È usata per il login.</p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className={iconClasses} /></div>
                        <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="Numero di telefono" className={inputClasses}/>
                    </div>
                    
                    {profileError && <p className="text-sm text-red-500 dark:text-red-400">{profileError}</p>}
                    {profileSuccess && <p className="text-sm text-green-600 dark:text-green-400 flex items-center"><CheckCircle size={16} className="mr-2"/>{profileSuccess}</p>}
                    
                    <div className="text-right pt-2">
                        <button type="submit" disabled={isProfileLoading} className="bg-primary-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold text-sm">
                            {isProfileLoading ? 'Salvataggio...' : 'Salva Profilo'}
                        </button>
                    </div>
                </form>
            </Card>

            <Card title="Cambia Password" icon={<Lock className="text-primary-500 dark:text-primary-400" />}>
                 <form onSubmit={handlePasswordSubmit} className="space-y-4">
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className={iconClasses} /></div>
                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="Nuova Password" className={inputClasses}/>
                    </div>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className={iconClasses} /></div>
                        <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="Conferma Nuova Password" className={inputClasses}/>
                    </div>

                    {passwordError && <p className="text-sm text-red-500 dark:text-red-400">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-green-600 dark:text-green-400 flex items-center"><CheckCircle size={16} className="mr-2"/>{passwordSuccess}</p>}

                     <div className="text-right pt-2">
                        <button type="submit" disabled={isPasswordLoading} className="bg-primary-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50 font-semibold text-sm">
                            {isPasswordLoading ? 'Modifica...' : 'Cambia Password'}
                        </button>
                    </div>
                </form>
            </Card>

            {user?.role === 'client' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-6 rounded-xl shadow-xl">
                    <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 flex items-center"><AlertTriangle className="mr-2"/> Area Pericolosa</h3>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-400">L'eliminazione del tuo account è un'azione irreversibile. Tutti i tuoi dati, inclusi i lead, verranno cancellati in modo permanente.</p>
                    <form onSubmit={handleDeleteAccount} className="mt-4 space-y-4">
                        <div>
                             <label htmlFor="deleteConfirm" className="block text-sm font-medium text-red-800 dark:text-red-300">
                                Per confermare, digita il tuo username: <span className="font-bold">{user.username}</span>
                            </label>
                            <input
                                id="deleteConfirm"
                                type="text"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-500/50 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        {deleteError && <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
                        <div>
                            <button type="submit" disabled={isDeleteLoading || deleteConfirm !== user.username} className="w-full flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Trash2 className="mr-2" size={16}/>
                                {isDeleteLoading ? 'Eliminazione in corso...' : 'Elimina il mio account definitivamente'}
                            </button>
                        </div>
                    </form>
                 </div>
            )}
        </div>
    );
};

export default AccountSettingsPage;