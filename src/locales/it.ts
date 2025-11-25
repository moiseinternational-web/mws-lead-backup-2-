export default {
    lang_name: "Italiano",
    // Common
    loading: "Caricamento...",
    name: "Nome",
    service: "Servizio",
    na: "N/D",
    copy: "Copia",
    copied: "Copiato!",
    close: "Chiudi",
    actions: "Azioni",
    all: "Tutti",
    from: "Dal",
    to: "Al",
    edit: "Modifica",
    delete: "Elimina",
    save: "Salva",
    cancel: "Annulla",
    confirm: "Conferma",
    save_changes: "Salva Modifiche",
    add: "Aggiungi",
    search: "Cerca",
    optional: "Opzionale",
    required_fields_error: "Per favore, compila tutti i campi obbligatori.",
    generic_error: "Si è verificato un errore imprevisto. Riprova.",
    
    // Login Page
    login_title: "MWS Gestione Lead",
    login_subtitle: "Accedi al tuo account per continuare",
    username_placeholder: "Username",
    password_placeholder: "Password",
    login_button: "Accedi",
    login_button_loading: "Accesso in corso...",
    login_error_credentials: "Credenziali non valide. Riprova.",
    login_error_suspended: "Questo account è stato sospeso.",
    login_error_generic: "Si è verificato un errore imprevisto. Riprova più tardi.",
    
    // Header & Layout
    header_title: "MWS Gestione Lead",
    header_version: "versione 2.0",
    menu_account_settings: "Impostazioni Account",
    menu_send_notifications: "Invia Notifiche",
    menu_manage_sent: "Gestisci Inviate",
    menu_terms: "Termini e Condizioni",
    menu_chat: "Chat",
    menu_light_mode: "Modalità Chiara",
    menu_dark_mode: "Modalità Scura",
    menu_logout: "Logout",
    footer_developed_by: "Piattaforma sviluppata da Moise Web Srl",
    footer_hq: "Sede legale: București (RO)",
    language: "Lingua",
    online_users_tooltip: "{{count}} altri utenti online",

    // Admin Dashboard Nav
    nav_lead_management: "Gestione Lead",
    nav_calendar: "Calendario",
    nav_quotes: "Preventivi",
    nav_live_overview: "Panoramica Live",
    nav_client_management: "Gestione Clienti",
    nav_form_generator: "Generatore Form",
    nav_expense_management: "Gestione Spese",
    nav_analysis: "Analisi",
    nav_mws_revenue: "Fatturato MWS",
    
    // Client Dashboard Nav
    nav_my_leads: "I Miei Lead",
    nav_ad_expenses: "Spese Pubblicitarie",
    nav_data_analysis: "Analisi Dati",
    
    // Lead Status
    lead_status: {
        Nuovo: "Nuovo",
        Contattato: "Contattato",
        "In Lavorazione": "In Lavorazione",
        Perso: "Perso",
        Vinto: "Vinto"
    },
    
    // Pages & Components

    // AdminDashboard
    page_adminDashboard: {
        leads_title: "Tutti i Lead",
        total_leads_count: "{{count}}",
        selected_count: "{{count}} selezionati",
        add_lead_button: "Aggiungi Lead",
        refresh: "Aggiorna",
        search_placeholder: "Cerca in tutti i campi...",
        client_filter_all: "Mostra tutti i clienti",
        filter_by_status: "Filtra per stato:",
        no_leads_found: "Nessun lead trovato per i filtri selezionati.",
        confirm_delete_lead: "Sei sicuro di voler eliminare questo lead?",
        confirm_delete_multiple_leads: "Sei sicuro di voler eliminare {{count}} lead selezionati?",
        clients_title: "Gestione Clienti",
        add_client_button: "Aggiungi Cliente",
        total_leads_suffix: "lead totali",
        client_suspended: "SOSPESO",
        tooltip_reactivate_client: "Riattiva Cliente",
        tooltip_suspend_client: "Sospendi Cliente",
        tooltip_manage_account: "Gestisci Account",
        tooltip_edit_client: "Modifica Cliente",
        tooltip_delete_client: "Elimina Cliente",
        webhook_urls_title: "Webhook URLs per Servizio",
        no_services_configured: "Nessun servizio configurato. Modifica il cliente per aggiungerne.",
        fields_per_service_title: "Campi per Servizio",
        no_fields_for_service: "Nessun campo per questo servizio.",
        no_lead_fields_configured: "Nessun campo lead configurato.",
        no_clients_found: "Nessun cliente trovato.",
        add_first_client_prompt: "Aggiungi il tuo primo cliente per iniziare.",
        confirm_delete_client: "Sei sicuro di voler eliminare questo cliente? L'azione è irreversibile e rimuoverà anche l'account utente associato.",
        ad_spend_title: "Gestione Spese",
        add_expense_button: "Aggiungi Spesa",
        select_client_placeholder: "Seleziona un cliente",
        all_services: "Tutti i servizi",
        confirm_delete_expense: "Sei sicuro di voler eliminare questa voce di spesa?",
        confirm_delete_multiple_expenses: "Sei sicuro di voler eliminare {{count}} voci di spesa selezionate?",
        no_expenses_found: "Nessuna spesa trovata per i filtri selezionati.",
        forms_title: "Generatore Form",
        saved_forms_title: "Moduli Salvati",
        live_overview_title: "Panoramica Live",
        filter_by_client: "Filtra per Cliente",
        group_by: "Raggruppa per",
        group_by_client: "Cliente",
        group_by_service: "Servizio",
        filter_by_period: "Filtra per Periodo",
        modal_edit_client_title: "Modifica Dettagli Cliente",
        modal_new_client_title: "Nuovo Cliente",
        modal_manage_account_title: "Gestisci Account: {{name}}",
        modal_add_lead_title: "Aggiungi Nuovo Lead",
        modal_edit_expense_title: "Modifica Spesa Pubblicitaria",
        modal_add_expense_title: "Aggiungi Spesa Pubblicitaria",
        ad_spend_form: {
            service_label: "Servizio",
            select_service: "Seleziona un servizio",
            platform_label: "Piattaforma",
            amount_label: "Importo (€)",
            amount_placeholder: "Es. 500",
            period_type_label: "Tipo di Periodo",
            day: "Giorno",
            week: "Settimana",
            month: "Mese",
            expense_date_label: "Data della Spesa",
            week_start_date_label: "Data Inizio Settimana",
            select_month_label: "Seleziona Mese",
            saving: "Salvataggio...",
            save_changes_button: "Salva Modifiche",
            add_expense_button: "Aggiungi Spesa",
            error_service_amount_required: "Servizio e importo sono obbligatori.",
            error_date_required: "La data è obbligatoria.",
            error_week_start_required: "La data di inizio settimana è obbligatoria.",
            error_month_required: "Il mese è obbligatorio.",
        },
        user_account_form: {
            username_placeholder: "Username",
            email_placeholder: "Email",
            phone_placeholder: "Numero di telefono",
            password_placeholder: "Lascia vuoto per non modificare la password",
            saving: "Salvataggio...",
        },
        tagliando_modal: {
            title: "Dettaglio Intervento",
            description: "Specifica il tipo di tagliando eseguito. Questa informazione verrà aggiunta come nota e il lead verrà archiviato.",
            confirm_and_archive: "Conferma e Archivia",
            saving: "Salvataggio...",
            types: {
                "Tagliando motore": "Tagliando motore",
                "Tagliando cambio": "Tagliando cambio",
                "Tagliando motore e cambio": "Tagliando motore e cambio",
                "Tagliando differenziale 4x4": "Tagliando differenziale 4x4",
                "Tagliando differenziale 4x4 + Cambio": "Tagliando differenziale 4x4 + Cambio",
                "Cinghia di distribuzione": "Cinghia di distribuzione",
                "Cinghia di distribuzione e Tagliando motore": "Cinghia di distribuzione e Tagliando motore"
            }
        }
    },
    
    // ClientDashboard
    page_clientDashboard: {
        greeting: "Ciao, {{name}}",
        description: "Questa è la tua dashboard per la gestione dei tuoi lead e delle tue spese.",
        my_leads_title: "I Miei Lead",
        add_lead_button: "Aggiungi Lead",
        search_placeholder: "Cerca in tutti i campi...",
        filter_by_service: "Filtra per servizio",
        all_services: "Tutti i Servizi",
        columns_button: "Colonne",
        filter_by_status: "Filtra per stato:",
        no_leads_found: "Nessun lead trovato per i filtri selezionati.",
        confirm_delete_lead: "Sei sicuro di voler eliminare questo lead?",
        column_manager_title: "Blocca Colonne a Sinistra",
        ad_spend_title: "Spese Pubblicitarie",
        total_spent: "Totale Speso",
        no_ad_spend_recorded: "Nessuna spesa pubblicitaria registrata.",
        live_overview_title: "Panoramica Live",
        filter_by_period: "Filtra per Periodo",
        tagliando_modal: {
            title: "Dettaglio Intervento",
            description: "Specifica il tipo di tagliando eseguito. Questa informazione verrà aggiunta come nota e il lead verrà archiviato.",
            confirm_and_archive: "Conferma e Archivia",
            saving: "Salvataggio...",
            types: {
                "Tagliando motore": "Tagliando motore",
                "Tagliando cambio": "Tagliando cambio",
                "Tagliando motore e cambio": "Tagliando motore e cambio",
                "Tagliando differenziale 4x4": "Tagliando differenziale 4x4",
                "Tagliando differenziale 4x4 + Cambio": "Tagliando differenziale 4x4 + Cambio",
                "Cinghia di distribuzione": "Cinghia di distribuzione",
                "Cinghia di distribuzione e Tagliando motore": "Cinghia di distribuzione e Tagliando motore"
            }
        }
    },

    // CalendarPage
    page_calendar: {
        title: "Calendario Appuntamenti",
        no_appointments: "Nessun appuntamento trovato per il periodo selezionato.",
        today: "Oggi",
        month: "Mese",
        week: "Settimana",
        day: "Giorno"
    },
    appointment_detail_modal: {
        title: "Dettaglio Appuntamento",
        lead_info: "Informazioni Lead",
        appointment_info: "Informazioni Appuntamento",
        lead_name: "Nome Lead",
        client_name: "Cliente",
        date: "Data",
        time: "Ora",
        duration: "Durata",
        duration_hours: "{{count}} ore",
        notes: "Note",
        no_notes: "Nessuna nota fornita.",
        associated_quotes: "Preventivi Associati"
    },
    
    // QuotesPage
    page_quotes: {
        title: "Gestione Preventivi",
        search_placeholder: "Cerca per N. preventivo, nome, cognome, targa, telefono...",
        no_quotes_found: "Nessun preventivo trovato per i filtri selezionati.",
        confirm_delete: "Sei sicuro di voler eliminare questo preventivo? L'azione è irreversibile.",
        quote_number: "Preventivo #",
        client: "Cliente",
        lead: "Lead",
        date: "Data",
        total: "Totale",
        status: "Stato",
        actions: "Azioni"
    },
    quote_status: {
        draft: "Bozza",
        sent: "Inviato",
        accepted: "Accettato",
        rejected: "Rifiutato"
    },

    // AnalyticsPage
    page_analytics: {
        title: "Analisi Dati",
        refresh_tooltip: "Aggiorna dati",
        loading: "Caricamento dati di analisi...",
        client_label: "Cliente",
        all_clients: "Tutti i Clienti",
        service_label: "Servizio",
        all_services: "Tutti i Servizi",
        reset_filters: "Resetta",
        total_revenue: "Fatturato Totale",
        ad_spend: "Spese Pubblicitarie",
        net_revenue: "Fatturato Netto",
        won_leads: "Lead Vinti",
        conversion_rate: "Tasso Conversione",
        detailed_overview: "Panoramica Dettagliata",
        ad_spend_distribution: "Distribuzione Spese Pubblicitarie",
        no_spend_in_period: "Nessuna spesa nel periodo selezionato.",
        lead_status_summary: "Riepilogo Stato Lead",
        no_leads_in_period: "Nessun lead nel periodo selezionato.",
        won_lead_details: "Dettaglio Lead Vinti",
        no_won_leads_found: "Nessun lead vinto trovato per i filtri selezionati.",
        client_name: "Nome Cliente"
    },
    
    // MwsRevenuePage
    page_mwsRevenue: {
        title: "Fatturato MWS",
        filter_by_month: "Filtra per Mese",
        total_mws_revenue_period: "Fatturato Totale MWS (Periodo Selezionato)",
        calculator_title: "Calcolo Fatturato e Fatture",
        no_unpaid_invoices: "Nessun cliente trovato.",
        client_revenue: "Fatturato Cliente",
        spend: "Spesa",
        client_profit: "Profitto Cliente",
        mws_fixed_fee: "Fisso MWS (€)",
        mws_profit_perc: "% su Profitto",
        mws_revenue: "Fatturato MWS",
        status: "Stato",
        total_mws_revenue: "Totale Fatturato MWS",
        saving: "Salvataggio...",
        saved: "Salvato",
        save_error: "Errore salvataggio",
        pending_changes: "Modifiche in attesa",
        payment_status: "Stato Pagamento",
        payment_actions: "Azioni Pagamento",
        manage_payment: "Gestisci",
        payment_history_title: "Storico Fatture Saldate",
        payment_history: {
            client: "Cliente",
            month: "Mese",
            total_amount: "Importo Totale",
            paid_amount: "Importo Pagato",
            remaining_amount: "Importo Rimanente",
            status: "Stato",
            paid: "Pagato",
            partially_paid: "Parziale"
        },
        payment_modal: {
            title: "Gestisci Pagamento Fattura",
            description: "Registra il pagamento per {{clientName}} per il mese di {{month}}.",
            total_due: "Totale dovuto",
            already_paid: "Già pagato",
            remaining: "Rimanente da pagare",
            pay_in_full: "Paga l'importo totale rimanente",
            payment_amount: "Importo Pagamento",
            confirm_and_save: "Conferma e Salva",
            error_invalid_amount: "Inserisci un importo valido.",
            error_overpayment: "L'importo parziale non può superare il totale rimanente."
        }
    },

    // AccountSettingsPage
    page_accountSettings: {
        title: "Impostazioni Account",
        profile_info_card_title: "Informazioni Profilo",
        save_profile_button: "Salva Profilo",
        saving: "Salvataggio...",
        profile_update_success: "Profilo aggiornato con successo!",
        change_password_card_title: "Cambia Password",
        current_password_placeholder: "Password Attuale",
        new_password_placeholder: "Nuova Password",
        confirm_new_password_placeholder: "Conferma Nuova Password",
        password_mismatch_error: "Le nuove password non coincidono.",
        password_empty_error: "La nuova password non può essere vuota.",
        change_password_button: "Cambia Password",
        changing: "Modifica...",
        password_update_success: "Password modificata con successo!",
        danger_zone_card_title: "Area Pericolosa",
        delete_account_warning: "L'eliminazione del tuo account è un'azione irreversibile. Tutti i tuoi dati, inclusi i lead, verranno cancellati in modo permanente.",
        delete_account_confirm_label: "Per confermare, digita il tuo username: {{username}}",
        delete_account_button: "Elimina il mio account definitivamente",
        deleting: "Eliminazione in corso...",
        incorrect_username_error: "Il nome utente inserito non è corretto.",
        delete_account_success: "Account eliminato con successo.",
        delete_account_error: "Impossibile eliminare l'account.",
        current_password_error: "La password attuale non è corretta."
    },
    
    // SendNotificationPage
    page_sendNotification: {
        title: "Invia Notifica",
        recipients_label: "Destinatari",
        loading_users: "Caricamento utenti...",
        me_admin: "Me Stesso (Admin)",
        all_clients: "Tutti i Clienti",
        title_label: "Titolo",
        title_placeholder: "Titolo della notifica",
        message_label: "Messaggio",
        message_placeholder: "Scrivi qui il tuo messaggio...",
        send_button: "Invia Notifica",
        sending: "Invio in corso...",
        error_no_recipient: "Seleziona almeno un destinatario.",
        error_no_title: "Il titolo non può essere vuoto.",
        error_no_message: "Il messaggio non può essere vuoto.",
        success_message: "Notifica inviata con successo a {{count}} utente(i)."
    },

    // ManageNotificationsPage
    page_manageNotifications: {
        title: "Gestione Notifiche Inviate",
        no_notifications_sent: "Non hai ancora inviato nessuna notifica personalizzata.",
        message_preview: "Messaggio (Anteprima)",
        date_sent: "Data Invio",
        confirm_delete: "Sei sicuro di voler eliminare questa notifica per tutti i destinatari? L'azione è irreversibile.",
        delete_error: "Impossibile eliminare la notifica. Riprova.",
        modal_edit_title: "Modifica Notifica",
        edit_form: {
            title_label: "Titolo",
            message_label: "Messaggio",
            empty_error: "Titolo e messaggio non possono essere vuoti.",
            confirm_resend: "Confermando, la notifica originale verrà eliminata e una nuova versione aggiornata verrà inviata a tutti i destinatari. Continuare?",
            success: "Notifica aggiornata e reinviata con successo.",
            error: "Impossibile modificare e reinviare la notifica.",
            save_and_resend: "Salva e Reinvia",
            saving: "Salvataggio..."
        }
    },
    
    // NotificationsPage
    page_notifications: {
        title: "Tutte le Notifiche",
        mark_all_as_read: "Segna tutte come lette",
        no_notifications: "Non ci sono notifiche da mostrare."
    },
    
    // TermsPage
    page_terms: {
        title: "Termini e Condizioni",
        acceptance_title: "1. Accettazione dei Termini",
        acceptance_p: "Utilizzando la Piattaforma Gestione Lead ('Servizio'), l'utente accetta di essere vincolato dai seguenti termini e condizioni ('Termini di Servizio').",
        description_title: "2. Descrizione del Servizio",
        description_p: "Il Servizio fornisce strumenti per la gestione dei lead dei clienti, inclusa l'acquisizione tramite webhook, la categorizzazione e l'analisi dei dati. Ci riserviamo il diritto di modificare o interrompere il Servizio con o senza preavviso.",
        account_title: "3. Account Utente",
        account_p: "L'utente è responsabile della salvaguardia della password utilizzata per accedere al Servizio e di qualsiasi attività o azione effettuata con la propria password. È necessario notificarci immediatamente qualsiasi violazione della sicurezza o uso non autorizzato del proprio account.",
        liability_title: "4. Limitazione di Responsabilità",
        liability_p: "In nessun caso Moise Web Lead Platform sarà responsabile per danni indiretti, incidentali, speciali, consequenziali o punitivi, inclusi, senza limitazione, perdita di profitti, dati, uso, avviamento o altre perdite immateriali."
    },

    // ApiHandlerPage
    page_apiHandler: {
        processing: "Elaborazione in corso...",
        saving_lead: "Stiamo salvando il nuovo lead.",
        success: "Successo!",
        success_message: "Lead ricevuto e salvato con successo!",
        error: "Errore",
        error_client_id_missing: "ID Cliente mancante nella richiesta.",
        error_no_lead_data: "Nessun dato del lead fornito nella richiesta.",
        error_saving: "Errore durante il salvataggio del lead.",
        endpoint_notice: "Questa pagina è un endpoint per un'integrazione automatica (es. Make.com). Puoi chiuderla."
    },
    
    // ChatPage
    page_chat: {
        title: "MWS Assistant",
        online: "Online",
        reset_tooltip: "Resetta chat",
        placeholder: "Scrivi il tuo messaggio...",
        send_aria_label: "Invia messaggio",
        confirm_reset: "Sei sicuro di voler resettare la chat? Tutta la cronologia della conversazione andrà persa.",
        init_error: "Impossibile inizializzare il chatbot. Controlla la configurazione dell'API Key.",
        send_error: "Si è verificato un errore durante la comunicazione con l'assistente. Riprova.",
        system_instruction: "Sei un assistente virtuale per la piattaforma MWS Gestione Lead. Il tuo nome è MWS Assistant. Rispondi in modo amichevole e professionale alle domande degli utenti sulla piattaforma, sulla gestione dei lead, e fornisci consigli su come utilizzare al meglio le funzionalità. Non inventare funzionalità che non esistono. Sii conciso e chiaro nelle tue risposte. L'utente attuale si chiama '{{username}}'. Parla in italiano.",
        initial_greeting: "Ciao {{username}}! Sono MWS Assistant. Come posso aiutarti oggi a gestire i tuoi lead?"
    },

    // ClientForm
    component_clientForm: {
        client_name_label: "Nome Cliente",
        username_label: "Username Cliente",
        password_label: "Password Cliente",
        mws_revenue_settings: "Impostazioni Fatturato MWS",
        fixed_fee_label: "Compenso Fisso (€)",
        profit_percentage_label: "% su Profitto",
        services_and_fields: "Servizi e Campi Specifici",
        service_name_placeholder: "Nome Servizio (es. Tagliando)",
        fields_for_service: "Campi per questo servizio:",
        field_label: "Etichetta Campo",
        field_label_placeholder: "Etichetta Campo {{index}}",
        field_type: "Tipo Campo",
        required: "Obbligatorio",
        api_name: "Nome (API)",
        options_label: "Opzioni (separate da punto e virgola ';')",
        options_placeholder: "Opzione 1; Opzione 2; Opzione con spazi",
        add_field: "Aggiungi Campo",
        add_service: "Aggiungi Nuovo Servizio",
        error_at_least_one_service: "Aggiungi almeno un servizio con un nome e almeno un campo valido.",
        saving: "Salvataggio...",
        create_client: "Crea Cliente",
        confirm_delete_service_title: "Conferma Eliminazione Servizio",
        confirm_delete_service_message: "Sei sicuro di voler eliminare il servizio '{{serviceName}}'? Anche tutti i campi associati verranno rimossi. L'azione non può essere annullata.",
        field_types: {
            text: "Text",
            email: "Email",
            textarea: "Textarea",
            tel: "Telefono",
            number: "Numero",
            date: "Data",
            time: "Ora",
            password: "Password",
            url: "URL",
            checkbox: "Checkbox",
            radio: "Radio",
            select: "Select",
            file: "File Upload"
        }
    },
    
    // DateRangeFilter
    component_dateRangeFilter: {
        all: "Tutti",
        today: "Oggi",
        yesterday: "Ieri",
        last_week: "Settimana Scorsa",
        this_month: "Questo Mese",
        last_month: "Mese Scorso"
    },
    
    // FormGenerator & SavedFormsModule
    component_formGenerator: {
        title: "Generatore Form",
        edit_title: "Modifica Modulo",
        configure_form: "Configura Modulo",
        step1_title: "1. Seleziona Cliente e Servizio",
        select_client: "Seleziona un cliente...",
        select_service: "Seleziona un servizio...",
        step2_title: "2. Connessione Diretta a Supabase",
        supabase_url: "URL Supabase",
        supabase_key: "Chiave Anon Supabase",
        client_id_generated: "Client ID (generato)",
        thank_you_page: "Pagina di Ringraziamento (Opzionale)",
        thank_you_page_placeholder: "https://tuosito.com/grazie",
        step3_title: "3. Webhook Esterno (Opzionale)",
        webhook_url: "URL Webhook",
        webhook_placeholder: "https://your-webhook-url.com/hook",
        webhook_description: "Se inserito, una copia dei dati del lead verrà inviata anche a questo indirizzo dopo essere stata salvata su Supabase.",
        step4_title: "4. Struttura del Form",
        show_form_title: "Mostra titolo del modulo",
        form_title_label: "Testo del Titolo",
        field_layout: "Layout Campi (Mobile / Desktop)",
        no_fields_to_configure: "Nessun campo da configurare. Seleziona un servizio.",
        multi_step: "Dividi in più step",
        step5_title: "5. Consensi",
        add_privacy_policy: "Aggiungi consenso Privacy Policy",
        privacy_policy_url: "URL Privacy Policy",
        checked_by_default: "Selezionato di default",
        add_terms: "Aggiungi Termini e Condizioni",
        terms_url: "URL Termini e Condizioni",
        step6_title: "6. Stile e Colori",
        primary_color: "Primario",
        button_text_color: "Testo Pulsante",
        form_bg_color: "Sfondo Form",
        text_color: "Testo Campi",
        label_color: "Etichette",
        submit_button_text: "Testo Pulsante di Invio",
        preview_and_code: "Anteprima e Codice",
        update_form_button: "Aggiorna Modulo",
        save_form_button: "Salva Modulo",
        cancel_edit_button: "Annulla",
        copy_code_button: "Copia Codice",
        copied_button: "Copiato!",
        preview_placeholder_title: "L'anteprima del modulo apparirà qui.",
        preview_placeholder_desc: "Seleziona un cliente per iniziare.",
        save_modal_title: "Salva Modulo",
        edit_modal_title: "Aggiorna Nome Modulo",
        form_name_label: "Nome Modulo",
        form_name_placeholder: "Es. Form Campagna Estiva",
        save_error: "Nome modulo, cliente e servizio sono obbligatori.",
        confirm_and_save: "Conferma e Salva",
        confirm_and_update: "Conferma e Aggiorna"
    },
    component_savedFormsModule: {
        title: "Moduli Salvati",
        loading: "Caricamento moduli salvati...",
        module: "modulo",
        modules: "moduli",
        no_forms_saved: "Nessun modulo salvato trovato.",
        no_forms_saved_desc: "Vai su 'Generatore Form' per creare e salvare il tuo primo modulo.",
        confirm_delete_title: "Conferma Eliminazione Modulo",
        confirm_delete_desc: "Sei sicuro di voler eliminare questo modulo? L'azione non può essere annullata."
    },

    // LeadForm
    component_leadForm: {
        client_label: "Cliente",
        select_client: "Seleziona un cliente",
        service_label: "Servizio",
        step_title: "Dati Lead (Parte {{step}})",
        final_details: "Dettagli Finali",
        status_label: "Stato",
        value_label: "Valore (€)",
        name_required_error: "Il campo Nome è obbligatorio per procedere.",
        back_button: "Indietro",
        next_button: "Avanti",
        add_lead_button: "Aggiungi Lead",
        adding_lead: "Aggiunta in corso...",
        no_services_or_fields: "Questo cliente non ha servizi o campi configurati.",
        configure_in_clients: "Aggiungi un servizio e dei campi nella sezione 'Gestione Clienti' per continuare.",
        registration_date_label: "Data di Registrazione",
        registration_date_hint: "Lascia vuoto per usare la data odierna."
    },
    
    // LeadDetailModal
    component_leadDetailModal: {
        title: "Dettagli Lead: {{name}}",
        tab_data: "Dati Forniti",
        tab_summary: "Riepilogo",
        tab_generate: "Genera Messaggio",
        tab_appointment: "Fissa Appuntamento",
        tab_appointments_list: "Appuntamenti",
        tab_history: "Storico",
        tab_history_alert: "Storico*",
        tab_notes: "Note",
        lead_id: "ID Lead",
        client_label: "Cliente",
        reception_date: "Data Ricezione",
        service_label: "Servizio",
        status_label: "Stato",
        value_label: "Valore",
        not_specified: "Non specificato",
        not_defined: "Non definito",
        contact_whatsapp: "Contatta su WhatsApp",
        copy_number: "Copia numero",
        chat_whatsapp: "Chatta su WhatsApp",
        contact_email: "Contatta via Email",
        copy_email: "Copia email",
        write_email: "Scrivi una mail",
        add_price_optional: "Aggiungi Prezzo (Opzionale)",
        price_placeholder: "Es. 150",
        service_requested: "Servizio Richiesto",
        copy_service: "Copia servizio",
        choose_template: "Scegli il modello di messaggio",
        generate_message_button: "Genera Messaggio",
        generating: "Generazione in corso...",
        template_error: "Seleziona un modello di messaggio valido.",
        generic_generation_error: "Si è verificato un errore durante la preparazione del messaggio.",
        generated_message: "Messaggio Generato:",
        copy_message: "Copia messaggio",
        no_history_found: "Nessuno storico trovato per questo cliente.",
        add_manual_work: "Aggiungi Lavoro Manualmente",
        service_performed: "Servizio Effettuato",
        select_placeholder: "Seleziona...",
        value_placeholder: "Es. 150",
        intervention_date: "Data Intervento",
        notes_optional: "Note (Opzionale)",
        notes_placeholder: "Es. Cliente venuto di persona...",
        add_work_button: "Aggiungi Lavoro",
        adding: "Aggiungendo...",
        edit_work: "Modifica Lavoro",
        save_changes: "Salva Modifiche",
        saving: "Salvataggio...",
        confirm_delete_history: "Sei sicuro di voler eliminare questo lavoro dallo storico? L'azione è irreversibile.",
        delete_history_error: "Impossibile eliminare l'elemento.",
        add_new_note_placeholder: "Aggiungi una nuova nota...",
        add_note_button: "Aggiungi Nota",
        adding_note: "Aggiungendo...",
        no_notes_present: "Nessuna nota presente.",
        confirm_delete_note: "Sei sicuro di voler eliminare questa nota?",
        consult_calendar: "Consulta Calendario",
        appointment_form: {
            title: "Dettagli Appuntamento",
            date: "Data Appuntamento",
            time: "Ora Appuntamento",
            duration: "Durata (ore)",
            notes: "Note Aggiuntive",
            notes_placeholder: "Note sull'intervento o sul cliente...",
            save_button: "Salva Appuntamento",
            saving_button: "Salvataggio...",
            success_message: "Appuntamento salvato con successo.",
            error_message: "Data e ora sono obbligatori."
        },
        appointment_note_prefix: "Appuntamento fissato per il",
        appointment_note_middle: "alle",
        appointment_note_duration: "Durata prevista",
        appointment_note_hours: "ore",
        appointment_note_notes: "Note",
        appointment_note_no_notes: "Nessuna",
        appointments_list: {
            title: "Appuntamenti Pianificati",
            time_label: "Ore",
            duration_label: "Durata",
            notes_label: "Note:",
            delete_tooltip: "Elimina appuntamento",
            no_appointments: "Nessun appuntamento pianificato per questo lead."
        },
        template_labels: {
            cambio: "Cambio Automatico",
            differenziale_e_cambio: "Tagliando differenziale 4x4 + Cambio",
            motore: "Tagliando Motore Completo",
            motore_e_cambio: "Tagliando Motore e Cambio",
            catena_distribuzione: "Catena Distribuzione",
            cinghia_distribuzione: "Cinghia Distribuzione",
            catena_e_tagliando_motore: "Catena Distribuzione e Tagliando Motore",
            cinghia_e_tagliando_motore: "Cinghia Distribuzione e Tagliando Motore",
            distribuzione: "Altro"
        }
    },

    // LiveOverview
    component_liveOverview: {
        total_leads: "Totale Lead:",
        no_leads_found: "Nessun lead trovato per i filtri selezionati."
    },
    
    // LiveOverviewChart
    component_liveOverviewChart: {
        total_leads_summary: "Riepilogo Totale Lead",
        no_data_to_display: "Nessun dato da visualizzare nel grafico.",
        lead: "lead",
        leads: "lead"
    },

    // NotificationPanel
    component_notificationPanel: {
        title: "Notifiche",
        mark_all_as_read: "Segna tutte come lette",
        no_notifications: "Nessuna notifica",
        view_all: "Vedi tutte le notifiche",
        time_now: "ora",
        time_minutes_ago: "{{count}}m fa",
        time_hours_ago: "{{count}}o fa",
        time_days_ago: "{{count}}g fa"
    },
    
    // NotificationDetailModal
    component_notificationDetailModal: {
        title: "Dettaglio Notifica"
    },

    // Pagination
    pagination: {
        show: "Mostra",
        results: "risultati",
        page: "Pagina {{currentPage}} di {{totalPages}}",
        previous: "Precedente",
        next: "Successivo"
    },

    component_header: {
        online_users_modal_title: "Utenti Online ({{count}})",
        fetching_locations: "Recupero informazioni sulla posizione...",
        location_unavailable: "Posizione non disponibile",
        location_private: "Posizione privata/sconosciuta",
        no_other_users: "Nessun altro utente è attualmente online."
    },

    platform_status: {
        title: "Stato della Piattaforma",
        title_short: "Stato",
        refresh: "Aggiorna stato",
        all_ok: "Tutti i sistemi sono operativi",
        problems: "Alcuni sistemi presentano problemi",
        last_checked: "Ultimo controllo",
        operational: "Operativo",
        degraded: "Performance Ridotte",
        outage: "Interruzione Grave",
        services: {
            auth: "Autenticazione Utenti",
            db: "Database Supabase (CRUD)",
            api: "API Ricezione Lead",
            gemini: "API Gemini (Chat Assistant)",
            realtime: "Servizi Real-time (Presenze e Notifiche)"
        }
    }
};