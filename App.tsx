import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ApiHandlerPage from './pages/ApiHandlerPage';
// FIX: Changed to named import for AnalyticsPage as the module has no default export.
import AnalyticsPage from './pages/AnalyticsPage';
import Layout from './components/Layout';
import AccountSettingsPage from './pages/AccountSettingsPage';
import TermsPage from './pages/TermsPage';
import ChatPage from './pages/ChatPage';
import MwsRevenuePage from './pages/MwsRevenuePage';
import SendNotificationPage from './pages/SendNotificationPage';
import NotificationsPage from './pages/NotificationsPage';
import ManageNotificationsPage from './pages/ManageNotificationsPage';
import { useTranslation } from 'react-i18next';
import CalendarPage from './pages/CalendarPage';
import QuotesPage from './pages/QuotesPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement; role: 'admin' | 'client' }> = ({ children, role }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== role) {
        const defaultPath = user.role === 'admin' ? '/admin/dashboard' : `/client/${user.id}/dashboard`;
        return <Navigate to={defaultPath} replace />;
    }

    return children;
};

const AppLayout: React.FC<{ role: 'admin' | 'client' }> = ({ role }) => (
    <ProtectedRoute role={role}>
        <Layout>
            <Outlet />
        </Layout>
    </ProtectedRoute>
);

const AppRoutes: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="w-screen h-screen flex items-center justify-center">Caricamento / Loading...</div>;
    }

    // This component handles redirection for the root path '/'.
    const RootRedirector: React.FC = () => {
        if (user) {
            const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : `/client/${user.id}/dashboard`;
            return <Navigate to={dashboardPath} replace />;
        }
        return <Navigate to="/login" replace />;
    };
    
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/api/lead/:clientId" element={<ApiHandlerPage />} />
            
            <Route path="/admin" element={<AppLayout role="admin" />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="quotes" element={<QuotesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="revenue" element={<MwsRevenuePage />} />
                <Route path="settings" element={<AccountSettingsPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="send-notification" element={<SendNotificationPage />} />
                <Route path="manage-notifications" element={<ManageNotificationsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route path="/client/:userId" element={<AppLayout role="client" />}>
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="quotes" element={<QuotesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="revenue" element={<MwsRevenuePage />} />
                <Route path="settings" element={<AccountSettingsPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
            
            {/* Redirect from root path. This has lower precedence than specific routes. */}
            <Route path="/" element={<RootRedirector />} />
            
            {/* For any other un-matched path (404), redirect to the root. The root will then handle redirection to dashboard or login. */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const AppCore: React.FC = () => {
    const { i18n } = useTranslation();
    useEffect(() => {
        document.documentElement.lang = i18n.language;
        localStorage.setItem('language', i18n.language);
    }, [i18n.language]);

    return <AppRoutes />;
}

function App() {
    return (
        <Suspense fallback={<div className="w-screen h-screen flex items-center justify-center">Caricamento / Loading...</div>}>
            <ThemeProvider>
                <AuthProvider>
                    <HashRouter>
                        <AppCore />
                    </HashRouter>
                </AuthProvider>
            </ThemeProvider>
        </Suspense>
    );
}

export default App;