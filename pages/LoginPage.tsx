import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
    const { t } = useTranslation();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, signUp, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : `/client/${user.id}/dashboard`;
            navigate(dashboardPath, { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                if (password !== confirmPassword) {
                    throw new Error("Le password non coincidono.");
                }
                const { error } = await signUp(email, password);
                if (error) throw error;
                // Since email confirmation is disabled for AI Studio, this message is more direct.
                setSuccess("Registrazione completata! Ora puoi accedere.");
                setIsRegistering(false); // Switch back to login view
                setPassword('');
                setConfirmPassword('');
            } else {
                const { error } = await login(email, password);
                if (error) throw error;
                // Navigation will now be handled by the useEffect hook above.
            }
        } catch (err: any) {
            setError(err.message || (isRegistering ? 'Errore durante la registrazione.' : t('login_error_generic')));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                        <img src="https://moise-web-srl.com/wp-content/uploads/2025/07/web-app-manifest-512x512-2.png" alt="MWS Gestione Lead Logo" className="mx-auto h-28 w-28" />
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
                            {isRegistering ? 'Crea un Account' : t('login_title')}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            {isRegistering ? 'Inserisci i tuoi dati per registrarti' : t('login_subtitle')}
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-3 pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                    placeholder="Email"
                                />
                            </div>
                            <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isRegistering ? "new-password" : "current-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-3 pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                    placeholder={t('password_placeholder')}
                                />
                            </div>
                            {isRegistering && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none relative block w-full px-3 py-3 pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                        placeholder="Conferma Password"
                                    />
                                </div>
                            )}
                        </div>
                        
                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}
                        {success && <p className="text-sm text-green-500 dark:text-green-400 text-center">{success}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:ring-offset-slate-800 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (isRegistering ? 'Registrazione...' : t('login_button_loading')) : (isRegistering ? 'Registrati' : t('login_button'))}
                            </button>
                        </div>
                    </form>
                    <div className="text-center text-sm">
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setSuccess('');
                            }}
                            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                            {isRegistering ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
                        </button>
                    </div>
                </div>
            </main>
            <footer className="w-full text-center p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950">
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

export default LoginPage;