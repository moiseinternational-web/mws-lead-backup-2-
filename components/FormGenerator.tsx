import React, { useState, useMemo, useEffect } from 'react';
import type { Client, LeadField, SavedForm, SavedFormConfig } from '../types';
import { FileCode, Clipboard, Link, Check, Eye, ShieldCheck, FileText, Palette, Database, Webhook, Save, XCircle } from 'lucide-react';
import { ApiService } from '../services/apiService';
import Modal from './Modal';
// FIX: Directly import supabaseUrl and supabaseAnonKey to avoid accessing protected properties.
import { supabaseUrl, supabaseAnonKey } from '../supabaseClient';

// Funzione di copia robusta con fallback
const copyTextToClipboard = async (text: string): Promise<boolean> => {
    // Approccio moderno: navigator.clipboard (solo in contesti sicuri)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Copia con navigator.clipboard fallita:', err);
            // Il fallback verrà tentato di seguito
        }
    }

    // Fallback per browser più vecchi o contesti non sicuri: document.execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Rendi l'elemento invisibile
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
            console.error('Copia di fallback (execCommand) non ha avuto successo.');
        }
        return successful;
    } catch (err) {
        console.error('Copia di fallback fallita con errore:', err);
        document.body.removeChild(textArea);
        return false;
    }
};

const selectClasses = "w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white";
const inputClasses = "block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white";

interface FormGeneratorProps {
    clients: Client[];
    formToEdit?: SavedForm | null;
    onDoneEditing?: () => void;
    onFormSaved?: () => void;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ clients, formToEdit, onDoneEditing, onFormSaved }) => {
    // Recupera URL e chiave direttamente dalla configurazione centrale
    // FIX: Removed direct access to protected properties. The values are now imported.

    // Form configuration state
    const [selectedClientId, setSelectedClientId] = useState(clients.length > 0 ? clients[0].id : '');
    const [selectedServiceName, setSelectedServiceName] = useState('');
    
    // Supabase & Post-Submit Config
    const [thankYouUrl, setThankYouUrl] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');

    const [isMultiStep, setIsMultiStep] = useState(false);
    const [fieldSteps, setFieldSteps] = useState<Record<string, number>>({});
    const [fieldLayouts, setFieldLayouts] = useState<Record<string, { desktop: number; mobile: number }>>({});
    const [showFormTitle, setShowFormTitle] = useState(true);
    const [formTitle, setFormTitle] = useState('Lascia i tuoi dati');
    
    // Consent state
    const [enablePrivacyPolicy, setEnablePrivacyPolicy] = useState(false);
    const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
    const [privacyPolicyCheckedByDefault, setPrivacyPolicyCheckedByDefault] = useState(false);
    const [enableTerms, setEnableTerms] = useState(false);
    const [termsUrl, setTermsUrl] = useState('');
    const [termsCheckedByDefault, setTermsCheckedByDefault] = useState(false);
    
    // Style state
    const [primaryColor, setPrimaryColor] = useState('#3b82f6');
    const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
    const [formBackgroundColor, setFormBackgroundColor] = useState('#ffffff');
    const [textColor, setTextColor] = useState('#1e293b');
    const [labelColor, setLabelColor] = useState('#475569');
    const [submitButtonText, setSubmitButtonText] = useState('Invia Richiesta');

    const [generatedCode, setGeneratedCode] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [formName, setFormName] = useState('');
    const [saveError, setSaveError] = useState('');

    const isEditing = useMemo(() => !!formToEdit, [formToEdit]);
    const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
    
    const serviceFields = useMemo(() => {
        if (!selectedClient || !selectedServiceName) return [];
        const service = selectedClient.services.find(s => s.name === selectedServiceName);
        return service ? service.fields : [];
    }, [selectedClient, selectedServiceName]);

    const resetToDefaults = () => {
        setThankYouUrl('');
        setWebhookUrl('');
        setIsMultiStep(false);
        setShowFormTitle(true);
        setFormTitle('Lascia i tuoi dati');
        setEnablePrivacyPolicy(false);
        setPrivacyPolicyUrl('');
        setPrivacyPolicyCheckedByDefault(false);
        setEnableTerms(false);
        setTermsUrl('');
        setTermsCheckedByDefault(false);
        setPrimaryColor('#3b82f6');
        setButtonTextColor('#ffffff');
        setFormBackgroundColor('#ffffff');
        setTextColor('#1e293b');
        setLabelColor('#475569');
        setSubmitButtonText('Invia Richiesta');
    }

    useEffect(() => {
        if (formToEdit) {
            setFormName(formToEdit.name);
            setSelectedClientId(formToEdit.client_id);
            setSelectedServiceName(formToEdit.service_name);
            
            const config = formToEdit.config;
            setThankYouUrl(config.thankYouUrl);
            setWebhookUrl(config.externalWebhookUrl);
            setIsMultiStep(config.isMultiStep);
            setFieldSteps(config.fieldSteps);
            setFieldLayouts(config.fieldLayouts || {});
            setShowFormTitle(config.showFormTitle);
            setFormTitle(config.formTitle);
            setEnablePrivacyPolicy(config.enablePrivacyPolicy);
            setPrivacyPolicyUrl(config.privacyPolicyUrl);
            setPrivacyPolicyCheckedByDefault(config.privacyPolicyCheckedByDefault);
            setEnableTerms(config.enableTerms);
            setTermsUrl(config.termsUrl);
            setTermsCheckedByDefault(config.termsCheckedByDefault);
            setPrimaryColor(config.primaryColor);
            setButtonTextColor(config.buttonTextColor);
            setFormBackgroundColor(config.formBackgroundColor);
            setTextColor(config.textColor);
            setLabelColor(config.labelColor);
            setSubmitButtonText(config.submitButtonText);
        } else {
            setFormName('');
            resetToDefaults();
        }
    }, [formToEdit]);


    useEffect(() => {
        if (selectedClient && selectedClient.services.length > 0) {
            if (!selectedClient.services.some(s => s.name === selectedServiceName) || !selectedServiceName) {
                 setSelectedServiceName(selectedClient.services[0].name);
            }
        } else {
            setSelectedServiceName('');
        }
    }, [selectedClient, selectedServiceName]);
    
    useEffect(() => {
        const initialSteps = serviceFields.reduce((acc, field) => {
            acc[field.name] = 1;
            return acc;
        }, {} as Record<string, number>);
        
        const initialLayouts = serviceFields.reduce((acc, field) => {
            acc[field.name] = { mobile: 100, desktop: 100 };
            return acc;
        }, {} as Record<string, { desktop: number; mobile: number }>);
        
        if(!isEditing) {
            setFieldSteps(initialSteps);
            setFieldLayouts(initialLayouts);
            setIsMultiStep(false);
        }
    }, [serviceFields, isEditing]);


    useEffect(() => {
        if(selectedClient){
            const code = generateFormCode({
                client: selectedClient,
                serviceName: selectedServiceName,
                fields: serviceFields,
                supabaseUrl,
                supabaseAnonKey,
                thankYouUrl,
                webhookUrl,
                isMultiStep,
                fieldSteps,
                fieldLayouts,
                showFormTitle,
                formTitle,
                enablePrivacyPolicy,
                privacyPolicyUrl,
                privacyPolicyCheckedByDefault,
                enableTerms,
                termsUrl,
                termsCheckedByDefault,
                primaryColor,
                buttonTextColor,
                formBackgroundColor,
                textColor,
                labelColor,
                submitButtonText
            });
            setGeneratedCode(code);
        } else {
            setGeneratedCode('');
        }
    }, [selectedClient, selectedServiceName, serviceFields, supabaseUrl, supabaseAnonKey, thankYouUrl, webhookUrl, isMultiStep, fieldSteps, fieldLayouts, showFormTitle, formTitle, enablePrivacyPolicy, privacyPolicyUrl, privacyPolicyCheckedByDefault, enableTerms, termsUrl, termsCheckedByDefault, primaryColor, buttonTextColor, formBackgroundColor, textColor, labelColor, submitButtonText]);
    
    const handleMultiStepToggle = (checked: boolean) => {
        setIsMultiStep(checked);
    
        if (checked) {
            const totalCurrentSteps = new Set(Object.values(fieldSteps)).size;
            
            if (totalCurrentSteps === 1 && serviceFields.length > 2) {
                const newFieldSteps = { ...fieldSteps };
                serviceFields.forEach((field, index) => {
                    newFieldSteps[field.name] = Math.floor(index / 2) + 1;
                });
                setFieldSteps(newFieldSteps);
            }
        }
    };

    const handleStepChange = (fieldName: string, step: number) => {
        setFieldSteps(prev => ({ ...prev, [fieldName]: Math.max(1, step) }));
    };

    const handleLayoutChange = (fieldName: string, device: 'desktop' | 'mobile', width: number) => {
        setFieldLayouts(prev => ({
            ...prev,
            [fieldName]: {
                ...(prev[fieldName] || { mobile: 100, desktop: 100 }),
                [device]: width,
            }
        }));
    };

    const handleCopyCode = async () => {
        if (!generatedCode) return;
        const success = await copyTextToClipboard(generatedCode);
        if (success) {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        } else {
            alert("Impossibile copiare il codice. Prova a farlo manualmente.");
        }
    };

    const handleSaveForm = async () => {
        setSaveError('');
        if (!formName.trim() || !selectedClientId || !selectedServiceName) {
            setSaveError("Nome modulo, cliente e servizio sono obbligatori.");
            return;
        }

        const config: SavedFormConfig = {
            externalWebhookUrl: webhookUrl,
            thankYouUrl,
            isMultiStep,
            fieldSteps,
            fieldLayouts,
            showFormTitle,
            formTitle,
            enablePrivacyPolicy,
            privacyPolicyUrl,
            privacyPolicyCheckedByDefault,
            enableTerms,
            termsUrl,
            termsCheckedByDefault,
            primaryColor,
            buttonTextColor,
            formBackgroundColor,
            textColor,
            labelColor,
            submitButtonText,
        };

        const payload = {
            name: formName,
            client_id: selectedClientId,
            service_name: selectedServiceName,
            config,
        };

        try {
            if (isEditing && formToEdit) {
                await ApiService.updateForm(formToEdit.id, payload);
            } else {
                await ApiService.saveForm(payload);
            }
            setIsSaveModalOpen(false);
            onFormSaved?.();
            if (isEditing) {
                onDoneEditing?.();
            }
        } catch(err: any) {
            setSaveError(err.message || 'Errore durante il salvataggio.');
        }
    };
    
    return (
        <div>
             <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center mb-6">
                <FileCode size={28} className="mr-3 text-primary-500"/>
                {isEditing ? 'Modifica Modulo' : 'Generatore Form'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-6 self-start">
                    <h3 className="text-xl font-semibold border-b border-slate-200 dark:border-slate-700 pb-3">Configura Modulo</h3>
                     <div>
                        <h4 className="text-md font-semibold mb-2">1. Seleziona Cliente e Servizio</h4>
                        <div className="space-y-4">
                            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className={selectClasses}>
                                <option value="" disabled>Seleziona un cliente...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {selectedClient && (
                                <select value={selectedServiceName} onChange={e => setSelectedServiceName(e.target.value)} className={selectClasses} disabled={!selectedClient}>
                                    <option value="" disabled>Seleziona un servizio...</option>
                                    {selectedClient.services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                    
                    {selectedClient && (
                        <>
                            <div>
                                <h4 className="text-md font-semibold mb-2 flex items-center"><Database size={16} className="mr-2"/>2. Connessione e Invio Dati</h4>
                                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                     <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Client ID (automatico)</label>
                                        <input type="text" value={selectedClient?.id || ''} readOnly className={`${inputClasses} bg-slate-200 dark:bg-slate-900 cursor-not-allowed font-mono text-xs`} />
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"><Link size={14} className="mr-2"/>Pagina di Ringraziamento (Opzionale)</label>
                                        <input type="url" placeholder="https://tuosito.com/grazie" value={thankYouUrl} onChange={e => setThankYouUrl(e.target.value)} className={inputClasses}/>
                                    </div>
                                </div>
                            </div>
                            
                             <div>
                                <h4 className="text-md font-semibold mb-2 flex items-center"><Webhook size={16} className="mr-2"/>3. Webhook Esterno (Opzionale)</h4>
                                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">URL Webhook</label>
                                        <input type="url" placeholder="https://your-webhook-url.com/hook" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className={inputClasses} />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">
                                        Se inserito, una copia dei dati del lead verrà inviata anche a questo indirizzo dopo essere stata salvata su Supabase.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-md font-semibold mb-2">4. Struttura del Form</h4>
                                <div className="space-y-4">
                                    <label className="flex items-center cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                        <input type="checkbox" checked={showFormTitle} onChange={e => setShowFormTitle(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                        <span className="ml-2 text-sm font-medium text-slate-700 dark:text-gray-300">Mostra titolo del modulo</span>
                                    </label>
                                    {showFormTitle && (
                                        <div className="mt-2 pl-6">
                                            <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Testo del Titolo</label>
                                            <input 
                                                type="text" 
                                                value={formTitle} 
                                                onChange={e => setFormTitle(e.target.value)}
                                                className={`${inputClasses} mt-1`}
                                            />
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <h5 className="text-sm font-semibold mb-3 text-slate-800 dark:text-gray-300">Layout Campi (Mobile / Desktop)</h5>
                                        {serviceFields.length > 0 ? (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4 max-h-60 overflow-y-auto">
                                            {serviceFields.map(field => (
                                                <div key={field.id || field.name} className="space-y-2 py-2 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                                                    <label className="text-sm font-medium" title={field.label}>{field.label}</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs w-14 text-slate-500">Mobile</span>
                                                            <input 
                                                                type="range" min="25" max="100" step="25"
                                                                value={fieldLayouts[field.name]?.mobile || 100} 
                                                                onChange={e => handleLayoutChange(field.name, 'mobile', parseInt(e.target.value, 10))}
                                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                                                            />
                                                            <span className="text-sm font-mono w-12 text-right">{fieldLayouts[field.name]?.mobile || 100}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs w-14 text-slate-500">Desktop</span>
                                                            <input 
                                                                type="range" min="25" max="100" step="25"
                                                                value={fieldLayouts[field.name]?.desktop || 100} 
                                                                onChange={e => handleLayoutChange(field.name, 'desktop', parseInt(e.target.value, 10))}
                                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                                                            />
                                                            <span className="text-sm font-mono w-12 text-right">{fieldLayouts[field.name]?.desktop || 100}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 dark:text-gray-400 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">Nessun campo da configurare. Seleziona un servizio.</p>
                                        )}
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                         <label className="flex items-center cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                            <input type="checkbox" checked={isMultiStep} onChange={e => handleMultiStepToggle(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                            <span className="ml-2 text-sm font-medium text-slate-700 dark:text-gray-300">Dividi in più step</span>
                                        </label>
                                        {isMultiStep && (
                                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 max-h-60 overflow-y-auto">
                                                {serviceFields.map(field => (
                                                    <div key={field.id || field.name} className="flex items-center justify-between gap-4">
                                                        <label className="text-sm">{field.label}</label>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            value={fieldSteps[field.name] || 1} 
                                                            onChange={e => handleStepChange(field.name, parseInt(e.target.value, 10))}
                                                            className="w-20 text-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div>
                                <h4 className="text-md font-semibold mb-2">5. Consensi</h4>
                                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="space-y-2">
                                        <label className="flex items-center cursor-pointer">
                                            <input type="checkbox" checked={enablePrivacyPolicy} onChange={e => setEnablePrivacyPolicy(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                            <span className="ml-2 text-sm font-medium text-slate-700 dark:text-gray-300 flex items-center"><ShieldCheck size={14} className="mr-1.5"/>Aggiungi consenso Privacy Policy</span>
                                        </label>
                                        {enablePrivacyPolicy && (
                                            <div className="pl-6 space-y-2">
                                                <input type="url" placeholder="URL Privacy Policy" value={privacyPolicyUrl} onChange={e => setPrivacyPolicyUrl(e.target.value)} className={inputClasses} />
                                                 <label className="flex items-center cursor-pointer text-xs">
                                                    <input type="checkbox" checked={privacyPolicyCheckedByDefault} onChange={e => setPrivacyPolicyCheckedByDefault(e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                                    <span className="ml-2 text-slate-600 dark:text-gray-400">Selezionato di default</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <label className="flex items-center cursor-pointer">
                                            <input type="checkbox" checked={enableTerms} onChange={e => setEnableTerms(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                            <span className="ml-2 text-sm font-medium text-slate-700 dark:text-gray-300 flex items-center"><FileText size={14} className="mr-1.5"/>Aggiungi Termini e Condizioni</span>
                                        </label>
                                        {enableTerms && (
                                            <div className="pl-6 space-y-2">
                                                <input type="url" placeholder="URL Termini e Condizioni" value={termsUrl} onChange={e => setTermsUrl(e.target.value)} className={inputClasses} />
                                                 <label className="flex items-center cursor-pointer text-xs">
                                                    <input type="checkbox" checked={termsCheckedByDefault} onChange={e => setTermsCheckedByDefault(e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                                    <span className="ml-2 text-slate-600 dark:text-gray-400">Selezionato di default</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                             <div>
                                <h4 className="text-md font-semibold mb-2">6. Stile e Colori</h4>
                                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                        <div className="flex flex-col items-center">
                                            <label className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Primario</label>
                                            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm cursor-pointer"/>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <label className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Testo Pulsante</label>
                                            <input type="color" value={buttonTextColor} onChange={e => setButtonTextColor(e.target.value)} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm cursor-pointer"/>
                                        </div>
                                         <div className="flex flex-col items-center">
                                            <label className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Sfondo Form</label>
                                            <input type="color" value={formBackgroundColor} onChange={e => setFormBackgroundColor(e.target.value)} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm cursor-pointer"/>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <label className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Testo Campi</label>
                                            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm cursor-pointer"/>
                                        </div>
                                         <div className="flex flex-col items-center">
                                            <label className="text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">Etichette</label>
                                            <input type="color" value={labelColor} onChange={e => setLabelColor(e.target.value)} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-600 shadow-sm cursor-pointer"/>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Testo Pulsante di Invio</label>
                                        <input type="text" value={submitButtonText} onChange={e => setSubmitButtonText(e.target.value)} className={`${inputClasses} mt-1`} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 lg:sticky lg:top-24 lg:self-start">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold flex items-center"><Eye size={18} className="mr-2"/>Anteprima e Codice</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsSaveModalOpen(true)} disabled={!selectedClient} className="flex items-center justify-center bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-primary-700 transition-colors disabled:opacity-50">
                                <Save size={16} className="mr-2"/> {isEditing ? 'Aggiorna Modulo' : 'Salva Modulo'}
                            </button>
                            {isEditing && (
                                <button onClick={onDoneEditing} className="flex items-center justify-center bg-slate-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-slate-600 transition-colors">
                                    <XCircle size={16} className="mr-2"/> Annulla
                                </button>
                            )}
                            <button onClick={handleCopyCode} disabled={!generatedCode} className="flex items-center justify-center bg-slate-200 dark:bg-slate-600 px-3 py-1.5 rounded-md text-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50">
                                {codeCopied ? <Check size={16} className="mr-2 text-green-500"/> : <Clipboard size={16} className="mr-2"/>}
                                {codeCopied ? 'Copiato!' : 'Copia Codice'}
                            </button>
                        </div>
                    </div>
                     {generatedCode ? (
                        <div className="h-[600px] border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-inner">
                             <iframe 
                                title="Form Preview"
                                srcDoc={generatedCode}
                                className="w-full h-full border-0"
                             />
                        </div>
                    ) : (
                        <div className="text-center h-[600px] flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-gray-400 p-4">
                            <p className="font-semibold">L'anteprima del modulo apparirà qui.</p>
                            <p className="text-sm mt-2">Seleziona un cliente per iniziare.</p>
                        </div>
                    )}
                </div>
            </div>
             <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title={isEditing ? 'Aggiorna Nome Modulo' : 'Salva Modulo'}>
                <div>
                    <label htmlFor="formName" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Nome Modulo</label>
                    <input 
                        id="formName"
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        className={`${inputClasses} mt-1`}
                        placeholder="Es. Form Campagna Estiva"
                    />
                    {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                         <button 
                            type="button"
                            onClick={() => setIsSaveModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-500"
                        >
                            Annulla
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveForm}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700"
                        >
                           {isEditing ? 'Conferma e Aggiorna' : 'Conferma e Salva'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FormGenerator;

interface GenerateFormCodeOptions {
    client: Client;
    serviceName: string;
    fields: LeadField[];
    supabaseUrl: string;
    supabaseAnonKey: string;
    thankYouUrl: string;
    webhookUrl: string;
    isMultiStep: boolean;
    fieldSteps: Record<string, number>;
    fieldLayouts: Record<string, { desktop: number; mobile: number }>;
    showFormTitle: boolean;
    formTitle: string;
    enablePrivacyPolicy: boolean;
    privacyPolicyUrl: string;
    privacyPolicyCheckedByDefault: boolean;
    enableTerms: boolean;
    termsUrl: string;
    termsCheckedByDefault: boolean;
    primaryColor: string;
    buttonTextColor: string;
    formBackgroundColor: string;
    textColor: string;
    labelColor: string;
    submitButtonText: string;
}

function generateFieldHtml(field: LeadField) {
    const isRequired = !!field.required;
    const requiredAttr = isRequired ? 'required' : '';
    const placeholder = `placeholder="Inserisci ${field.label.toLowerCase()}"`;
    const fieldId = `field-${field.name}`;
    const fieldContainerClass = `form-group field-width-${field.name}`;

    const labelHtml = `<label for="${fieldId}">${field.label}${isRequired ? ' <span class="required-asterisk">*</span>' : ''}</label>`;

    let fieldHtml = '';

    switch (field.type) {
        case 'textarea':
            fieldHtml = `<textarea id="${fieldId}" name="${field.name}" ${placeholder} ${requiredAttr}></textarea>`;
            break;
        
        case 'select':
            const selectOptions = field.options?.map(opt => `<option value="${opt.trim()}">${opt.trim()}</option>`).join('') || '';
            fieldHtml = `<select id="${fieldId}" name="${field.name}" ${requiredAttr}>
                <option value="" disabled selected>Seleziona un'opzione</option>
                ${selectOptions}
            </select>`;
            break;

        case 'radio':
            const radioOptions = field.options?.map((opt, index) => `
                <div class="radio-option">
                    <input type="radio" id="${fieldId}-${index}" name="${field.name}" value="${opt.trim()}" ${index === 0 && isRequired ? requiredAttr : ''}>
                    <label for="${fieldId}-${index}">${opt.trim()}</label>
                </div>
            `).join('') || '';
            return `<div class="${fieldContainerClass}"><div class="radio-group-inner">
                <label>${field.label}${isRequired ? ' <span class="required-asterisk">*</span>' : ''}</label>
                <div class="radio-options-wrapper">${radioOptions}</div>
            </div></div>`;

        case 'checkbox':
            return `<div class="${fieldContainerClass}"><div class="checkbox-group-inner">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="${fieldId}" name="${field.name}" value="true" ${requiredAttr}>
                    <label for="${fieldId}">${field.label}${isRequired ? ' <span class="required-asterisk">*</span>' : ''}</label>
                </div>
            </div></div>`;
        
        case 'file':
             fieldHtml = `<input type="file" id="${fieldId}" name="${field.name}" ${requiredAttr}>`;
             break;

        default: // text, email, tel, date, number, password, url
            fieldHtml = `<input type="${field.type || 'text'}" id="${fieldId}" name="${field.name}" ${placeholder} ${requiredAttr}>`;
            break;
    }
    
    return `<div class="${fieldContainerClass}">${labelHtml}${fieldHtml}</div>`;
}

function generateFormCode({ 
    client, serviceName, fields, supabaseUrl, supabaseAnonKey, thankYouUrl, webhookUrl, isMultiStep, fieldSteps, fieldLayouts,
    showFormTitle, formTitle,
    enablePrivacyPolicy, privacyPolicyUrl, privacyPolicyCheckedByDefault,
    enableTerms, termsUrl, termsCheckedByDefault,
    primaryColor, buttonTextColor, formBackgroundColor, textColor, labelColor, submitButtonText
}: GenerateFormCodeOptions): string {
    const uniqueFormId = `lf-wrapper-${Date.now()}`;
    
    const fieldsByStep = fields.reduce((acc, field) => {
        const step = isMultiStep ? (fieldSteps[field.name] || 1) : 1;
        if (!acc[step]) acc[step] = [];
        acc[step].push(field);
        return acc;
    }, {} as Record<number, LeadField[]>);

    const sortedSteps = Object.keys(fieldsByStep).map(Number).sort((a, b) => a - b);
    const totalSteps = sortedSteps.length;

    const generateConsentsHtml = () => {
        let html = '';
        if (enablePrivacyPolicy) {
            const link = privacyPolicyUrl ? `<a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>` : 'Privacy Policy';
            html += `
            <div class="form-group consent-group field-width-privacy_policy_consent">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="privacy_policy_consent" name="privacy_policy_consent" value="true" required ${privacyPolicyCheckedByDefault ? 'checked' : ''}>
                    <label for="privacy_policy_consent">Ho letto e accetto la ${link}.<span class="required-asterisk">*</span></label>
                </div>
            </div>`;
        }
        if (enableTerms) {
            const link = termsUrl ? `<a href="${termsUrl}" target="_blank" rel="noopener noreferrer">Termini e Condizioni</a>` : 'Termini e Condizioni';
            html += `
            <div class="form-group consent-group field-width-terms_consent">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="terms_consent" name="terms_consent" value="true" required ${termsCheckedByDefault ? 'checked' : ''}>
                    <label for="terms_consent">Ho letto e accetto i ${link}.<span class="required-asterisk">*</span></label>
                </div>
            </div>`;
        }
        return html;
    };
    
    const generateStepsHtml = () => {
        if (!isMultiStep || totalSteps <= 1) return '';
        return sortedSteps.map((stepNum, index) => `
  <!-- STEP ${index + 1} -->
  <div class="form-step${index === 0 ? ' active' : ''}" data-step="${index + 1}">
    ${totalSteps > 1 ? `<h3 class="step-title">Passaggio ${index + 1} di ${totalSteps}</h3>` : ''}
    <div class="form-grid">
        ${fieldsByStep[stepNum].map(field => generateFieldHtml(field)).join('')}
    </div>
    ${(index === totalSteps - 1) ? `<div class="consents-container">${generateConsentsHtml()}</div>` : ''}
    <div class="buttons">
      ${index > 0 ? '<button type="button" class="btn-secondary prev">Indietro</button>' : '<span></span>'}
      ${index < totalSteps - 1 ? '<button type="button" class="btn-primary next">Avanti</button>' : `<button type="submit" class="btn-primary">${submitButtonText || 'Invia Richiesta'}</button>`}
    </div>
  </div>`).join('');
    };
    
    const generateProgressBarHtml = () => {
        if (!isMultiStep || totalSteps <= 1) return '';
        return `
    <div class="progress-container">
        <div class="progress-bar" id="progressBar"></div>
        ${sortedSteps.map((stepNum, index) => `
        <div class="progress-step active" data-step-indicator="${index + 1}">${index + 1}</div>
        `).join('')}
    </div>`;
    };

    const formContentHtml = isMultiStep && totalSteps > 1 ? generateStepsHtml() : `
    <div class="form-grid">${fields.map(field => generateFieldHtml(field)).join('')}</div>
    <div class="consents-container">${generateConsentsHtml()}</div>
    <div class="buttons">
      <span></span>
      <button type="submit" class="btn-primary">${submitButtonText || 'Invia Richiesta'}</button>
    </div>
    `;
    
    const titleHtml = showFormTitle ? `<h2>${formTitle || ''}</h2>` : '';

    const generateWidthStyles = () => {
        let css = '';
        fields.forEach(field => {
            const layout = fieldLayouts[field.name] || { mobile: 100, desktop: 100 };
            css += `
    #${uniqueFormId} .field-width-${field.name} { width: ${layout.mobile}%; }`;
        });
    
        if (enablePrivacyPolicy) css += `\n#${uniqueFormId} .field-width-privacy_policy_consent { width: 100%; }`;
        if (enableTerms) css += `\n#${uniqueFormId} .field-width-terms_consent { width: 100%; }`;
        
        css += `
    @media (min-width: 768px) {`;
        fields.forEach(field => {
            const layout = fieldLayouts[field.name] || { mobile: 100, desktop: 100 };
            css += `
      #${uniqueFormId} .field-width-${field.name} { width: ${layout.desktop}%; }`;
        });
        css += `
    }`;
        return css;
    }

    return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${formTitle || `Richiedi informazioni - ${serviceName}`}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Aggressive Reset within the unique wrapper */
    #${uniqueFormId}, #${uniqueFormId} * {
      all: revert;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    #${uniqueFormId} {
      --primary-color: ${primaryColor || '#3b82f6'};
      --button-text-color: ${buttonTextColor || '#ffffff'};
      --text-color: ${textColor || '#1e293b'};
      --label-color: ${labelColor || '#475569'};
      --form-bg: ${formBackgroundColor || '#ffffff'};

      --border-color: #cbd5e1;
      --border-color-light: #e2e8f0;
      --error-color: #ef4444;
      --success-color: #22c55e;
      --input-bg: #f8fafc;
      width: 100%;
      max-width: 700px;
      margin: 1rem auto;
    }
    
    #${uniqueFormId} form { 
      padding: 1.5rem;
      border: 1px solid var(--border-color-light);
      border-radius: 1rem;
      background: var(--form-bg);
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      overflow: hidden;
    }
    @media (min-width: 640px) { #${uniqueFormId} form { padding: 2.5rem; } }
    
    #${uniqueFormId} h2 { 
      margin: 0 0 2rem 0;
      padding: 0;
      color: var(--text-color);
      text-align: center;
      font-size: 1.75rem;
      font-weight: 700;
    }
    
    #${uniqueFormId} .form-grid {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -0.75rem; /* Gutter compensation */
    }
    
    #${uniqueFormId} .form-group { 
      display: flex; 
      flex-direction: column; 
      padding: 0 0.75rem; /* Gutter */
      margin-bottom: 1.25rem; /* Vertical spacing */
    }
    
    #${uniqueFormId} .form-group.radio-group,
    #${uniqueFormId} .form-group.checkbox-group {
      padding: 0;
    }
    
    #${uniqueFormId} .radio-group-inner,
    #${uniqueFormId} .checkbox-group-inner {
        padding: 0 0.75rem;
    }
    
    #${uniqueFormId} label { 
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--label-color);
      font-size: 0.875rem;
    }
    
    #${uniqueFormId} .required-asterisk { color: var(--error-color); }
    
    #${uniqueFormId} input, #${uniqueFormId} select, #${uniqueFormId} textarea { 
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      font-size: 1rem;
      background-color: var(--input-bg);
      transition: border-color 0.2s, box-shadow 0.2s;
      color: var(--text-color);
    }
    #${uniqueFormId} textarea { min-height: 100px; }
    
    #${uniqueFormId} input::placeholder { color: #94a3b8; }
    
    #${uniqueFormId} input:focus, #${uniqueFormId} select:focus, #${uniqueFormId} textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 25%, transparent);
    }

    #${uniqueFormId} .radio-group-inner > label, #${uniqueFormId} .checkbox-group-inner > label { margin-bottom: 0.5rem; }
    #${uniqueFormId} .radio-options-wrapper { display: flex; flex-direction: column; gap: 0.75rem; }
    #${uniqueFormId} .radio-option, #${uniqueFormId} .checkbox-wrapper { display: flex; align-items: center; background-color: var(--input-bg); padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border-color); }
    #${uniqueFormId} .radio-option input, #${uniqueFormId} .checkbox-wrapper input { width: auto; margin-right: 0.75rem; }
    #${uniqueFormId} .radio-option label, #${uniqueFormId} .checkbox-wrapper label { margin-bottom: 0; font-weight: 400; font-size: 1rem; }
    #${uniqueFormId} input[type="radio"], #${uniqueFormId} input[type="checkbox"] { box-shadow: none; width: 1em; height: 1em; accent-color: var(--primary-color); }
    #${uniqueFormId} input[type="file"] { background-color: transparent; border: none; padding: 0; }
    #${uniqueFormId} select { -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
    
    /* Consent Styles */
    #${uniqueFormId} .consents-container { margin-top: 1.5rem; border-top: 1px solid var(--border-color-light); padding-top: 1.5rem; display: flex; flex-wrap: wrap; margin: 1.5rem -0.75rem 0; }
    #${uniqueFormId} .consent-group { margin-bottom: 0; }
    #${uniqueFormId} .consent-group .checkbox-wrapper { padding: 0.5rem 0.75rem; }
    #${uniqueFormId} .consent-group label { font-size: 0.8rem; font-weight: normal; color: var(--label-color); }
    #${uniqueFormId} .consent-group a { color: var(--primary-color); text-decoration: underline; font-weight: 500; }
    #${uniqueFormId} .consent-group a:hover { filter: brightness(0.9); }
    
    #${uniqueFormId} button { 
      cursor: pointer;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 1rem;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      -webkit-appearance: none;
    }
    
    #${uniqueFormId} .btn-primary { background-color: var(--primary-color); color: var(--button-text-color); }
    #${uniqueFormId} .btn-primary:hover { filter: brightness(0.9); }
    #${uniqueFormId} .btn-secondary { background-color: var(--border-color-light); color: var(--label-color); }
    #${uniqueFormId} .btn-secondary:hover { background-color: var(--border-color); }
    #${uniqueFormId} button:disabled { opacity: 0.6; cursor: not-allowed; }
    
    #${uniqueFormId} .success-message { color: var(--success-color); font-weight: bold; text-align: center; }
    #${uniqueFormId} .error-message { color: var(--error-color); font-weight: bold; }
    #${uniqueFormId} #feedback { margin-top: 1.5rem; text-align: center; min-height: 1.5rem; font-size: 0.875rem; }
    
    #${uniqueFormId} .form-step { display:none; }
    #${uniqueFormId} .form-step.active { display:block; animation: fadeIn 0.4s ease-in-out; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    /* Step Title */
    #${uniqueFormId} .step-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        color: var(--text-color);
        text-align: center;
    }
    
    /* Responsive Buttons */
    #${uniqueFormId} .buttons { 
      display: flex;
      flex-direction: column-reverse; /* Stack on mobile, primary button on top */
      gap: 0.75rem; 
      margin-top: 2rem; 
      border-top: 1px solid var(--border-color-light); 
      padding-top: 1.5rem; 
    }
    #${uniqueFormId} .buttons button {
      width: 100%;
    }
    #${uniqueFormId} .buttons span {
      display: none; /* Hide spacer on mobile */
    }
    @media (min-width: 640px) { 
      #${uniqueFormId} .buttons {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      #${uniqueFormId} .buttons button {
        width: auto;
      }
      #${uniqueFormId} .buttons span {
        display: block; /* Show spacer on desktop */
      }
    }
    
    /* Progress Bar */
    #${uniqueFormId} .progress-container { position: relative; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    #${uniqueFormId} .progress-container::before { content: ''; position: absolute; top: 50%; transform: translateY(-50%); height: 4px; width: 100%; background-color: var(--border-color-light); z-index: 1; }
    #${uniqueFormId} .progress-bar { position: absolute; top: 50%; transform: translateY(-50%); height: 4px; width: 0%; background-color: var(--primary-color); z-index: 2; transition: width 0.4s ease; }
    #${uniqueFormId} .progress-step { width: 30px; height: 30px; background-color: white; border: 3px solid var(--border-color-light); border-radius: 50%; z-index: 3; display: flex; justify-content: center; align-items: center; font-weight: bold; color: var(--label-color); transition: all 0.4s ease; }
    #${uniqueFormId} .progress-step.active { border-color: var(--primary-color); background-color: var(--primary-color); color: white; }
    
    ${generateWidthStyles()}
  </style>
</head>
<body>
<div id="${uniqueFormId}">
  <form id="leadForm" novalidate>
    ${titleHtml}
    ${generateProgressBarHtml()}
    ${formContentHtml}
    <div id="feedback"></div>
  </form>
</div>
<script type="module">
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

  const SUPABASE_URL = '${supabaseUrl}';
  const SUPABASE_ANON_KEY = '${supabaseAnonKey}';
  const CLIENT_ID = '${client.id}';
  const SERVICE_NAME = '${serviceName}';
  const THANK_YOU_PAGE_URL = '${thankYouUrl}';
  const WEBHOOK_URL = '${webhookUrl}';

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const formWrapper = document.getElementById('${uniqueFormId}');
  const form = formWrapper.querySelector('#leadForm');
  const feedback = formWrapper.querySelector('#feedback');
  const steps = formWrapper.querySelectorAll(".form-step");
  const submitButton = form.querySelector('button[type="submit"]');
  let currentStep = 1;

  function updateProgressBar() {
    const progressSteps = formWrapper.querySelectorAll('.progress-step');
    const progressBar = formWrapper.querySelector('#progressBar');
    if (!progressSteps.length || !progressBar) return;

    progressSteps.forEach((stepEl, index) => {
      if (index < currentStep) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    });

    const activeSteps = formWrapper.querySelectorAll('.progress-step.active');
    const width = (activeSteps.length - 1) / (progressSteps.length - 1) * 100;
    progressBar.style.width = \`\${width}%\`;
  }

  function showStep(stepIndex) {
    if (steps.length === 0) return;
    const stepToShow = form.querySelector(\`.form-step[data-step="\${stepIndex}"]\`);
    if(stepToShow) {
        steps.forEach(step => step.classList.remove("active"));
        stepToShow.classList.add("active");
        currentStep = stepIndex;
        updateProgressBar();
    }
  }

  function validateStep(stepIndex) {
      const currentStepElement = form.querySelector(\`.form-step[data-step="\${stepIndex}"]\`);
      const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;
      inputs.forEach(input => {
          if (input.type === 'radio' || input.type === 'checkbox') {
              if (input.required) {
                  const name = input.name;
                  if (!form.querySelector(\`input[name="\${name}"]:checked\`)) {
                      isValid = false;
                  }
              }
          } else if (!input.value.trim()) {
              isValid = false;
              input.style.borderColor = 'var(--error-color)';
          } else {
              input.style.borderColor = 'var(--border-color)';
          }
      });
      if (!isValid) feedback.textContent = 'Per favore, compila tutti i campi obbligatori.';
      else feedback.textContent = '';
      return isValid;
  }
  
  function validateAll() {
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;
      inputs.forEach(input => {
          if (input.type === 'checkbox') {
               if (input.required && !input.checked) {
                    isValid = false;
                    const wrapper = input.closest('.checkbox-wrapper, .consent-group');
                    if (wrapper) wrapper.style.borderColor = 'var(--error-color)';
               } else {
                    const wrapper = input.closest('.checkbox-wrapper, .consent-group');
                    if (wrapper) wrapper.style.borderColor = 'var(--border-color)';
               }
          } else if (!input.value.trim()) {
              isValid = false;
              input.style.borderColor = 'var(--error-color)';
          } else {
              input.style.borderColor = 'var(--border-color)';
          }
      });
      if (!isValid) feedback.textContent = 'Per favore, compila tutti i campi obbligatori.';
      else feedback.textContent = '';
      return isValid;
  }

  form.addEventListener("click", e => {
    if (e.target.matches(".next")) {
      if (validateStep(currentStep) && currentStep < steps.length) {
        showStep(currentStep + 1);
      }
    } else if (e.target.matches(".prev")) {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (steps.length > 0) { // Multi-step validation
        if (!validateStep(currentStep)) return;
    } else { // Single-step validation
        if (!validateAll()) return;
    }

    feedback.textContent = '';
    feedback.className = '';
    if(submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Invio...';
    }
    
    const formData = new FormData(form);
    const dataJson = {};
    const consentKeys = ['privacy_policy_consent', 'terms_consent'];
    formData.forEach((value, key) => { 
        if (!consentKeys.includes(key)) {
            dataJson[key] = value; 
        }
    });

    try {
      // Fetch IP address
      let ip_address = 'N/A';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ip_address = ipData.ip;
        }
      } catch (ipError) {
        console.error('Could not fetch IP address:', ipError);
      }
      
      // Add extra data to the 'data' JSON object
      dataJson.ip_address = ip_address;
      dataJson.user_agent = navigator.userAgent;
      
      // Capture exact submission time
      const submissionTime = new Date().toISOString();

      const { error } = await supabase.from('leads').insert([{
        client_id: CLIENT_ID,
        data: dataJson,
        service: SERVICE_NAME,
        status: 'Nuovo',
        created_at: submissionTime
      }]);

      if (error) {
        throw new Error(error.message);
      }

      if (WEBHOOK_URL) {
        try {
          await fetch(WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...dataJson, client_id: CLIENT_ID, service: SERVICE_NAME, created_at: submissionTime })
          });
        } catch (webhookError) {
            // We log the error but don't stop the user flow, as the lead is already saved.
            console.error('Webhook request failed:', webhookError);
        }
      }
      
      if (THANK_YOU_PAGE_URL) {
          window.location.href = THANK_YOU_PAGE_URL;
      } else {
          formWrapper.innerHTML = \`<div class="success-message" style="text-align: center; padding: 2rem;"><h2>✅ Grazie!</h2><p>I tuoi dati sono stati inviati con successo.</p></div>\`;
      }

    } catch (err) {
      console.error(err);
      feedback.textContent = '❌ Errore durante l’invio. Riprova.';
      feedback.className = 'error-message';
      if(submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = '${submitButtonText || 'Invia Richiesta'}';
      }
    }
  });
  
  if (steps.length > 0) showStep(1);
</script>
</body>
</html>`;
}
