import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ApiService } from '../services/apiService';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// This is a mock function to simulate getting POST body in a client-side environment.
// In a real serverless function, you'd get this from the request object.
const getPostBody = () => {
    try {
        const rawBody = (window as any)._postBody;
        if (rawBody) {
            return JSON.parse(rawBody);
        }
    } catch (e) {
        console.error("Could not parse POST body:", e);
    }
    return null;
}


const ApiHandlerPage: React.FC = () => {
    const { t } = useTranslation();
    const { clientId } = useParams<{ clientId: string }>();
    const location = useLocation();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const processLead = async () => {
            if (!clientId) {
                setStatus('error');
                setMessage(t('page_apiHandler.error_client_id_missing'));
                return;
            }

            // In a real webhook handler, you'd check the request method.
            // Here we simulate checking for a POST body first, then fallback to GET.
            const postBody = getPostBody();
            let leadData: Record<string, string> = {};
            let service: string | undefined = undefined;

            if (postBody) {
                // Handle POST request
                const { service: postService, ...restData } = postBody;
                service = postService;
                leadData = restData;

            } else {
                 // Fallback to GET request for backward compatibility/testing
                const searchParams = new URLSearchParams(location.search);
                searchParams.forEach((value, key) => {
                    if (key === 'service') {
                        service = value;
                    } else {
                        leadData[key] = value;
                    }
                });
            }

            if (Object.keys(leadData).length === 0) {
                setStatus('error');
                setMessage(t('page_apiHandler.error_no_lead_data'));
                return;
            }

            try {
                await ApiService.addLead({ clientId, leadData, service });
                setStatus('success');
                setMessage(t('page_apiHandler.success_message'));
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || t('page_apiHandler.error_saving'));
            }
        };

        processLead();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId, location.search, t]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Loader className="w-12 h-12 text-primary-500 dark:text-primary-400 animate-spin" />
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-4">{t('page_apiHandler.processing')}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{t('page_apiHandler.saving_lead')}</p>
                    </>
                );
            case 'success':
                return (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4">{t('page_apiHandler.success')}</h1>
                        <p className="text-gray-700 dark:text-gray-300">{message}</p>
                    </>
                );
            case 'error':
                return (
                     <>
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4">{t('page_apiHandler.error')}</h1>
                        <p className="text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-500/20 p-3 rounded-md border border-red-200 dark:border-red-500/30">{message}</p>
                    </>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="text-center p-8 bg-white dark:bg-slate-800 shadow-2xl rounded-xl max-w-lg w-full flex flex-col items-center border border-slate-200 dark:border-slate-700">
               {renderContent()}
                <p className="text-xs text-gray-500 mt-8">{t('page_apiHandler.endpoint_notice')}</p>
            </div>
        </div>
    );
};

export default ApiHandlerPage;
