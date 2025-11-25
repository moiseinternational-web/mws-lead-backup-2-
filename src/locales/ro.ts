export default {
    lang_name: "Română",
    // Common
    loading: "Se încarcă...",
    name: "Nume",
    service: "Serviciu",
    na: "N/A",
    copy: "Copiază",
    copied: "Copiat!",
    close: "Închide",
    actions: "Acțiuni",
    all: "Toate",
    from: "De la",
    to: "La",
    edit: "Modifică",
    delete: "Șterge",
    save: "Salvează",
    cancel: "Anulează",
    confirm: "Confirmă",
    save_changes: "Salvează Modificările",
    add: "Adaugă",
    search: "Caută",
    optional: "Opțional",
    required_fields_error: "Vă rugăm să completați toate câmpurile obligatorii.",
    generic_error: "A apărut o eroare neașteptată. Vă rugăm să reîncercați.",

    // Login Page
    login_title: "MWS Management Lead-uri",
    login_subtitle: "Autentifică-te în cont pentru a continua",
    username_placeholder: "Nume utilizator",
    password_placeholder: "Parolă",
    login_button: "Autentificare",
    login_button_loading: "Autentificare în curs...",
    login_error_credentials: "Date de autentificare invalide. Vă rugăm să reîncercați.",
    login_error_suspended: "Acest cont a fost suspendat.",
    login_error_generic: "A apărut o eroare neașteptată. Vă rugăm să reîncercați mai târziu.",
    
    // Header & Layout
    header_title: "MWS Management Lead-uri",
    header_version: "versiune 2.0",
    menu_account_settings: "Setări Cont",
    menu_send_notifications: "Trimite Notificări",
    menu_manage_sent: "Gestionează Trimise",
    menu_terms: "Termeni și Condiții",
    menu_chat: "Chat",
    menu_light_mode: "Mod Luminos",
    menu_dark_mode: "Mod Întunecat",
    menu_logout: "Deconectare",
    footer_developed_by: "Platformă dezvoltată de Moise Web Srl",
    footer_hq: "Sediu social: București (RO)",
    language: "Limbă",
    online_users_tooltip: "{{count}} alți utilizatori online",
    
    // Admin Dashboard Nav
    nav_lead_management: "Management Lead-uri",
    nav_calendar: "Calendar",
    nav_quotes: "Oferte",
    nav_live_overview: "Prezentare Live",
    nav_client_management: "Management Clienți",
    nav_form_generator: "Generator Formulare",
    nav_expense_management: "Management Cheltuieli",
    nav_analysis: "Analiză",
    nav_mws_revenue: "Venituri MWS",
    
    // Client Dashboard Nav
    nav_my_leads: "Lead-urile Mele",
    nav_ad_expenses: "Cheltuieli Publicitate",
    nav_data_analysis: "Analiză Date",
    
    // Lead Status
    lead_status: {
        Nuovo: "Nou",
        Contattato: "Contactat",
        "In Lavorazione": "În Lucru",
        Perso: "Pierdut",
        Vinto: "Câștigat"
    },
    
    // Pages & Components

    // AdminDashboard
    page_adminDashboard: {
        leads_title: "Toate Lead-urile",
        total_leads_count: "{{count}}",
        selected_count: "{{count}} selectate",
        add_lead_button: "Adaugă Lead",
        refresh: "Reîmprospătare",
        search_placeholder: "Caută în toate câmpurile...",
        client_filter_all: "Afișează toți clienții",
        filter_by_status: "Filtrează după status:",
        no_leads_found: "Nu s-au găsit lead-uri pentru filtrele selectate.",
        confirm_delete_lead: "Sunteți sigur că doriți să ștergeți acest lead?",
        confirm_delete_multiple_leads: "Sunteți sigur că doriți să ștergeți cele {{count}} lead-uri selectate?",
        clients_title: "Management Clienți",
        add_client_button: "Adaugă Client",
        total_leads_suffix: "lead-uri totale",
        client_suspended: "SUSPENDAT",
        tooltip_reactivate_client: "Reactivează Clientul",
        tooltip_suspend_client: "Suspendă Clientul",
        tooltip_manage_account: "Gestionează Contul",
        tooltip_edit_client: "Modifică Clientul",
        tooltip_delete_client: "Șterge Clientul",
        webhook_urls_title: "URL-uri Webhook per Serviciu",
        no_services_configured: "Niciun serviciu configurat. Modifică clientul pentru a adăuga.",
        fields_per_service_title: "Câmpuri per Serviciu",
        no_fields_for_service: "Niciun câmp pentru acest serviciu.",
        no_lead_fields_configured: "Niciun câmp pentru lead-uri configurat.",
        no_clients_found: "Nu s-au găsit clienți.",
        add_first_client_prompt: "Adaugă primul tău client pentru a începe.",
        confirm_delete_client: "Sunteți sigur că doriți să ștergeți acest client? Această acțiune este ireversibilă și va șterge și contul de utilizator asociat.",
        ad_spend_title: "Management Cheltuieli",
        add_expense_button: "Adaugă Cheltuială",
        select_client_placeholder: "Selectează un client",
        all_services: "Toate serviciile",
        confirm_delete_expense: "Sunteți sigur că doriți să ștergeți această cheltuială?",
        confirm_delete_multiple_expenses: "Sunteți sigur că doriți să ștergeți cele {{count}} cheltuieli selectate?",
        no_expenses_found: "Nu s-au găsit cheltuieli pentru filtrele selectate.",
        forms_title: "Generator Formulare",
        saved_forms_title: "Formulare Salvate",
        live_overview_title: "Prezentare Live",
        filter_by_client: "Filtrează după Client",
        group_by: "Grupează după",
        group_by_client: "Client",
        group_by_service: "Serviciu",
        filter_by_period: "Filtrează după Perioadă",
        modal_edit_client_title: "Modifică Detalii Client",
        modal_new_client_title: "Client Nou",
        modal_manage_account_title: "Gestionează Cont: {{name}}",
        modal_add_lead_title: "Adaugă Lead Nou",
        modal_edit_expense_title: "Modifică Cheltuială Publicitară",
        modal_add_expense_title: "Adaugă Cheltuială Publicitară",
        ad_spend_form: {
            service_label: "Serviciu",
            select_service: "Selectează un serviciu",
            platform_label: "Platformă",
            amount_label: "Sumă (€)",
            amount_placeholder: "ex. 500",
            period_type_label: "Tip Perioadă",
            day: "Zi",
            week: "Săptămână",
            month: "Lună",
            expense_date_label: "Data Cheltuielii",
            week_start_date_label: "Data Început Săptămână",
            select_month_label: "Selectează Luna",
            saving: "Se salvează...",
            save_changes_button: "Salvează Modificările",
            add_expense_button: "Adaugă Cheltuială",
            error_service_amount_required: "Serviciul și suma sunt obligatorii.",
            error_date_required: "Data este obligatorie.",
            error_week_start_required: "Data de început a săptămânii este obligatorie.",
            error_month_required: "Luna este obligatorie.",
        },
        user_account_form: {
            username_placeholder: "Nume utilizator",
            email_placeholder: "Email",
            phone_placeholder: "Număr de telefon",
            password_placeholder: "Lasă gol pentru a nu schimba parola",
            saving: "Se salvează...",
        },
        tagliando_modal: {
            title: "Detalii Intervenție",
            description: "Specificați tipul de serviciu efectuat. Această informație va fi adăugată ca notă, iar lead-ul va fi arhivat.",
            confirm_and_archive: "Confirmă și Arhivează",
            saving: "Se salvează...",
            types: {
                "Tagliando motore": "Revizie motor",
                "Tagliando cambio": "Revizie cutie de viteze",
                "Tagliando motore e cambio": "Revizie motor și cutie de viteze",
                "Tagliando differenziale 4x4": "Revizie diferențial 4x4",
                "Tagliando differenziale 4x4 + Cambio": "Revizie diferențial 4x4 + Cutie de viteze",
                "Cinghia di distribuzione": "Curea de distribuție",
                "Cinghia di distribuzione e Tagliando motore": "Curea de distribuție și revizie motor"
            }
        }
    },

    // ClientDashboard
    page_clientDashboard: {
        greeting: "Salut, {{name}}",
        description: "Acesta este panoul tău de control pentru gestionarea lead-urilor și a cheltuielilor.",
        my_leads_title: "Lead-urile Mele",
        add_lead_button: "Adaugă Lead",
        search_placeholder: "Caută în toate câmpurile...",
        filter_by_service: "Filtrează după serviciu",
        all_services: "Toate Serviciile",
        columns_button: "Coloane",
        filter_by_status: "Filtrează după status:",
        no_leads_found: "Nu s-au găsit lead-uri pentru filtrele selectate.",
        confirm_delete_lead: "Sunteți sigur că doriți să ștergeți acest lead?",
        column_manager_title: "Fixează Coloane la Stânga",
        ad_spend_title: "Cheltuieli Publicitare",
        total_spent: "Total Cheltuit",
        no_ad_spend_recorded: "Nicio cheltuială publicitară înregistrată.",
        live_overview_title: "Prezentare Live",
        filter_by_period: "Filtrează după Perioadă",
        tagliando_modal: {
            title: "Detalii Intervenție",
            description: "Specificați tipul de serviciu efectuat. Această informație va fi adăugată ca notă, iar lead-ul va fi arhivat.",
            confirm_and_archive: "Confirmă și Arhivează",
            saving: "Se salvează...",
             types: {
                "Tagliando motore": "Revizie motor",
                "Tagliando cambio": "Revizie cutie de viteze",
                "Tagliando motore e cambio": "Revizie motor și cutie de viteze",
                "Tagliando differenziale 4x4": "Revizie diferențial 4x4",
                "Tagliando differenziale 4x4 + Cambio": "Revizie diferențial 4x4 + Cutie de viteze",
                "Cinghia di distribuzione": "Curea de distribuție",
                "Cinghia di distribuzione e Tagliando motore": "Curea de distribuție și revizie motor"
            }
        }
    },

    // CalendarPage
    page_calendar: {
        title: "Calendar Programări",
        no_appointments: "Nicio programare găsită pentru perioada selectată.",
        today: "Azi",
        month: "Lună",
        week: "Săptămână",
        day: "Zi"
    },
    appointment_detail_modal: {
        title: "Detalii Programare",
        lead_info: "Informații Lead",
        appointment_info: "Informații Programare",
        lead_name: "Nume Lead",
        client_name: "Client",
        date: "Data",
        time: "Ora",
        duration: "Durata",
        duration_hours: "{{count}} ore",
        notes: "Note",
        no_notes: "Nicio notă furnizată.",
        associated_quotes: "Oferte Asociate"
    },
    
    // QuotesPage
    page_quotes: {
        title: "Management Oferte",
        search_placeholder: "Caută după nr. ofertă, nume, prenume, nr. înmatriculare, telefon...",
        no_quotes_found: "Nicio ofertă găsită pentru filtrele selectate.",
        confirm_delete: "Sunteți sigur că doriți să ștergeți această ofertă? Acțiunea este ireversibilă.",
        quote_number: "Oferta #",
        client: "Client",
        lead: "Lead",
        date: "Data",
        total: "Total",
        status: "Status",
        actions: "Acțiuni"
    },
    quote_status: {
        draft: "Ciornă",
        sent: "Trimisă",
        accepted: "Acceptată",
        rejected: "Refuzată"
    },

    // AnalyticsPage
    page_analytics: {
        title: "Analiză Date",
        refresh_tooltip: "Reîmprospătează datele",
        loading: "Se încarcă datele analitice...",
        client_label: "Client",
        all_clients: "Toți Clienții",
        service_label: "Serviciu",
        all_services: "Toate Serviciile",
        reset_filters: "Resetează",
        total_revenue: "Venit Total",
        ad_spend: "Cheltuieli Publicitate",
        net_revenue: "Venit Net",
        won_leads: "Lead-uri Câștigate",
        conversion_rate: "Rată de Conversie",
        detailed_overview: "Prezentare Detaliată",
        ad_spend_distribution: "Distribuție Cheltuieli Publicitare",
        no_spend_in_period: "Nicio cheltuială în perioada selectată.",
        lead_status_summary: "Rezumat Status Lead-uri",
        no_leads_in_period: "Niciun lead în perioada selectată.",
        won_lead_details: "Detalii Lead-uri Câștigate",
        no_won_leads_found: "Nu s-au găsit lead-uri câștigate pentru filtrele selectate.",
        client_name: "Nume Client"
    },
    
    // MwsRevenuePage
    page_mwsRevenue: {
        title: "Venituri MWS",
        filter_by_month: "Filtrează după Lună",
        total_mws_revenue_period: "Venit Total MWS (Perioada Selectată)",
        calculator_title: "Calcul Venituri și Facturi",
        no_unpaid_invoices: "Niciun client găsit.",
        client_revenue: "Venit Client",
        spend: "Cheltuieli",
        client_profit: "Profit Client",
        mws_fixed_fee: "Fix MWS (€)",
        mws_profit_perc: "% Profit MWS",
        mws_revenue: "Venit MWS",
        status: "Status",
        total_mws_revenue: "Venit Total MWS",
        saving: "Se salvează...",
        saved: "Salvat",
        save_error: "Eroare la salvare",
        pending_changes: "Modificări în așteptare",
        payment_status: "Status Plată",
        payment_actions: "Acțiuni Plată",
        manage_payment: "Gestionează",
        payment_history_title: "Istoric Facturi Plătite",
        payment_history: {
            client: "Client",
            month: "Lună",
            total_amount: "Sumă Totală",
            paid_amount: "Sumă Plătită",
            remaining_amount: "Sumă Rămasă",
            status: "Status",
            paid: "Plătit",
            partially_paid: "Parțial"
        },
        payment_modal: {
            title: "Gestionează Plata Facturii",
            description: "Înregistrează plata pentru {{clientName}} pentru luna {{month}}.",
            total_due: "Total de plată",
            already_paid: "Deja plătit",
            remaining: "Rămas de plată",
            pay_in_full: "Plătește suma totală rămasă",
            payment_amount: "Suma Plății",
            confirm_and_save: "Confirmă și Salvează",
            error_invalid_amount: "Introduceți o sumă validă.",
            error_overpayment: "Suma parțială nu poate depăși totalul rămas."
        }
    },

    // AccountSettingsPage
    page_accountSettings: {
        title: "Setări Cont",
        profile_info_card_title: "Informații Profil",
        save_profile_button: "Salvează Profilul",
        saving: "Se salvează...",
        profile_update_success: "Profil actualizat cu succes!",
        change_password_card_title: "Schimbă Parola",
        current_password_placeholder: "Parola Actuală",
        new_password_placeholder: "Parola Nouă",
        confirm_new_password_placeholder: "Confirmă Parola Nouă",
        password_mismatch_error: "Parolele noi nu se potrivesc.",
        password_empty_error: "Parola nouă nu poate fi goală.",
        change_password_button: "Schimbă Parola",
        changing: "Se schimbă...",
        password_update_success: "Parolă schimbată cu succes!",
        danger_zone_card_title: "Zonă Periculoasă",
        delete_account_warning: "Ștergerea contului este o acțiune ireversibilă. Toate datele, inclusiv lead-urile, vor fi șterse permanent.",
        delete_account_confirm_label: "Pentru a confirma, introduceți numele de utilizator: {{username}}",
        delete_account_button: "Șterge contul meu permanent",
        deleting: "Se șterge...",
        incorrect_username_error: "Numele de utilizator introdus este incorect.",
        delete_account_success: "Cont șters cu succes.",
        delete_account_error: "Contul nu a putut fi șters.",
        current_password_error: "Parola actuală nu este corectă."
    },
    
    // SendNotificationPage
    page_sendNotification: {
        title: "Trimite Notificare",
        recipients_label: "Destinatari",
        loading_users: "Se încarcă utilizatorii...",
        me_admin: "Eu (Admin)",
        all_clients: "Toți Clienții",
        title_label: "Titlu",
        title_placeholder: "Titlul notificării",
        message_label: "Mesaj",
        message_placeholder: "Scrie mesajul aici...",
        send_button: "Trimite Notificare",
        sending: "Se trimite...",
        error_no_recipient: "Selectează cel puțin un destinatar.",
        error_no_title: "Titlul nu poate fi gol.",
        error_no_message: "Mesajul nu poate fi gol.",
        success_message: "Notificare trimisă cu succes către {{count}} utilizator(i)."
    },

    // ManageNotificationsPage
    page_manageNotifications: {
        title: "Gestionează Notificările Trimise",
        no_notifications_sent: "Încă nu ai trimis nicio notificare personalizată.",
        message_preview: "Mesaj (Previzualizare)",
        date_sent: "Data Trimiterii",
        confirm_delete: "Sunteți sigur că doriți să ștergeți această notificare pentru toți destinatarii? Acțiunea este ireversibilă.",
        delete_error: "Notificarea nu a putut fi ștearsă. Vă rugăm să reîncercați.",
        modal_edit_title: "Modifică Notificare",
        edit_form: {
            title_label: "Titlu",
            message_label: "Mesaj",
            empty_error: "Titlul și mesajul nu pot fi goale.",
            confirm_resend: "Confirmarea va șterge notificarea originală și o nouă versiune actualizată va fi trimisă tuturor destinatarilor. Continuați?",
            success: "Notificare actualizată și retrimisă cu succes.",
            error: "Notificarea nu a putut fi modificată și retrimisă.",
            save_and_resend: "Salvează și Retrimite",
            saving: "Se salvează..."
        }
    },
    
    // NotificationsPage
    page_notifications: {
        title: "Toate Notificările",
        mark_all_as_read: "Marchează totul ca citit",
        no_notifications: "Nu există notificări de afișat."
    },
    
    // TermsPage
    page_terms: {
        title: "Termeni și Condiții",
        acceptance_title: "1. Acceptarea Termenilor",
        acceptance_p: "Prin utilizarea Platformei de Management Lead-uri ('Serviciul'), sunteți de acord să respectați următorii termeni și condiții ('Termenii Serviciului').",
        description_title: "2. Descrierea Serviciului",
        description_p: "Serviciul oferă instrumente pentru gestionarea lead-urilor clienților, inclusiv achiziția prin webhook, categorizarea și analiza datelor. Ne rezervăm dreptul de a modifica sau întrerupe Serviciul cu sau fără notificare prealabilă.",
        account_title: "3. Cont de Utilizator",
        account_p: "Sunteți responsabil pentru protejarea parolei pe care o utilizați pentru a accesa Serviciul și pentru orice activități sau acțiuni efectuate sub parola dvs. Trebuie să ne notificați imediat cu privire la orice încălcare a securității sau utilizare neautorizată a contului dvs.",
        liability_title: "4. Limitarea Răspunderii",
        liability_p: "În niciun caz Moise Web Lead Platform nu va fi răspunzătoare pentru daune indirecte, incidentale, speciale, consecutive sau punitive, inclusiv, fără limitare, pierderea de profituri, date, utilizare, fond comercial sau alte pierderi intangibile."
    },

    // ApiHandlerPage
    page_apiHandler: {
        processing: "Se procesează...",
        saving_lead: "Salvăm noul lead.",
        success: "Succes!",
        success_message: "Lead primit și salvat cu succes!",
        error: "Eroare",
        error_client_id_missing: "ID-ul clientului lipsește din cerere.",
        error_no_lead_data: "Nu au fost furnizate date despre lead în cerere.",
        error_saving: "Eroare la salvarea lead-ului.",
        endpoint_notice: "Această pagină este un endpoint pentru o integrare automată (ex. Make.com). O puteți închide."
    },
    
    // ChatPage
    page_chat: {
        title: "Asistent MWS",
        online: "Online",
        reset_tooltip: "Resetează chat-ul",
        placeholder: "Scrie mesajul tău...",
        send_aria_label: "Trimite mesaj",
        confirm_reset: "Sunteți sigur că doriți să resetați chat-ul? Tot istoricul conversației se va pierde.",
        init_error: "Nu s-a putut inițializa chatbot-ul. Verificați configurarea cheii API.",
        send_error: "A apărut o eroare în timpul comunicării cu asistentul. Vă rugăm să reîncercați.",
        system_instruction: "Ești un asistent virtual pentru platforma MWS Lead Management. Numele tău este MWS Assistant. Răspunde într-un mod prietenos și profesional la întrebările utilizatorilor despre platformă, managementul lead-urilor și oferă sfaturi despre cum să folosească cel mai bine funcționalitățile. Nu inventa funcționalități care nu există. Fii concis și clar în răspunsurile tale. Utilizatorul actual se numește '{{username}}'. Vorbește în limba română.",
        initial_greeting: "Salut {{username}}! Sunt Asistentul MWS. Cum te pot ajuta astăzi să-ți gestionezi lead-urile?"
    },

    // ClientForm
    component_clientForm: {
        client_name_label: "Nume Client",
        username_label: "Nume Utilizator Client",
        password_label: "Parolă Client",
        mws_revenue_settings: "Setări Venituri MWS",
        fixed_fee_label: "Comision Fix (€)",
        profit_percentage_label: "% din Profit",
        services_and_fields: "Servicii și Câmpuri Specifice",
        service_name_placeholder: "Nume Serviciu (ex. Mentenanță)",
        fields_for_service: "Câmpuri pentru acest serviciu:",
        field_label: "Etichetă Câmp",
        field_label_placeholder: "Etichetă Câmp {{index}}",
        field_type: "Tip Câmp",
        required: "Obligatoriu",
        api_name: "Nume (API)",
        options_label: "Opțiuni (separate prin punct și virgulă ';')",
        options_placeholder: "Opțiunea 1; Opțiunea 2; Opțiune cu spații",
        add_field: "Adaugă Câmp",
        add_service: "Adaugă Serviciu Nou",
        error_at_least_one_service: "Adaugă cel puțin un serviciu cu un nume și cel puțin un câmp valid.",
        saving: "Se salvează...",
        create_client: "Creează Client",
        confirm_delete_service_title: "Confirmă Ștergerea Serviciului",
        confirm_delete_service_message: "Ești sigur că vrei să ștergi serviciul '{{serviceName}}'? Toate câmpurile asociate vor fi de asemenea eliminate. Această acțiune nu poate fi anulată.",
        field_types: {
            text: "Text",
            email: "Email",
            textarea: "Text lung",
            tel: "Telefon",
            number: "Număr",
            date: "Dată",
            time: "Oră",
            password: "Parolă",
            url: "URL",
            checkbox: "Casetă de bifat",
            radio: "Buton radio",
            select: "Selecție",
            file: "Încărcare fișier"
        }
    },
    
    // DateRangeFilter
    component_dateRangeFilter: {
        all: "Toate",
        today: "Azi",
        yesterday: "Ieri",
        last_week: "Săptămâna Trecută",
        this_month: "Luna Aceasta",
        last_month: "Luna Trecută"
    },
    
    // FormGenerator & SavedFormsModule
    component_formGenerator: {
        title: "Generator Formulare",
        edit_title: "Modifică Formular",
        configure_form: "Configurează Formular",
        step1_title: "1. Selectează Client și Serviciu",
        select_client: "Selectează un client...",
        select_service: "Selectează un serviciu...",
        step2_title: "2. Conexiune Directă la Supabase",
        supabase_url: "URL Supabase",
        supabase_key: "Cheie Anon Supabase",
        client_id_generated: "ID Client (generat)",
        thank_you_page: "Pagină de Mulțumire (Opțional)",
        thank_you_page_placeholder: "https://siteultau.ro/multumesc",
        step3_title: "3. Webhook Extern (Opțional)",
        webhook_url: "URL Webhook",
        webhook_placeholder: "https://your-webhook-url.com/hook",
        webhook_description: "Dacă este completat, o copie a datelor lead-ului va fi trimisă și la această adresă după ce a fost salvată în Supabase.",
        step4_title: "4. Structura Formularului",
        show_form_title: "Afișează titlul formularului",
        form_title_label: "Text Titlu",
        field_layout: "Layout Câmpuri (Mobil / Desktop)",
        no_fields_to_configure: "Niciun câmp de configurat. Selectează un serviciu.",
        multi_step: "Împarte în mai mulți pași",
        step5_title: "5. Consimțăminte",
        add_privacy_policy: "Adaugă consimțământ Politica de Confidențialitate",
        privacy_policy_url: "URL Politica de Confidențialitate",
        checked_by_default: "Bifat implicit",
        add_terms: "Adaugă Termeni și Condiții",
        terms_url: "URL Termeni și Condiții",
        step6_title: "6. Stil și Culori",
        primary_color: "Principală",
        button_text_color: "Text Buton",
        form_bg_color: "Fundal Formular",
        text_color: "Text Câmpuri",
        label_color: "Etichete",
        submit_button_text: "Text Buton Trimitere",
        preview_and_code: "Previzualizare și Cod",
        update_form_button: "Actualizează Formular",
        save_form_button: "Salvează Formular",
        cancel_edit_button: "Anulează",
        copy_code_button: "Copiază Cod",
        copied_button: "Copiat!",
        preview_placeholder_title: "Previzualizarea formularului va apărea aici.",
        preview_placeholder_desc: "Selectează un client pentru a începe.",
        save_modal_title: "Salvează Formular",
        edit_modal_title: "Actualizează Nume Formular",
        form_name_label: "Nume Formular",
        form_name_placeholder: "ex. Formular Campanie de Vară",
        save_error: "Numele formularului, clientul și serviciul sunt obligatorii.",
        confirm_and_save: "Confirmă și Salvează",
        confirm_and_update: "Confirmă și Actualizează"
    },
    component_savedFormsModule: {
        title: "Formulare Salvate",
        loading: "Se încarcă formularele salvate...",
        module: "formular",
        modules: "formulare",
        no_forms_saved: "Nu s-au găsit formulare salvate.",
        no_forms_saved_desc: "Mergi la 'Generator Formulare' pentru a crea și salva primul tău formular.",
        confirm_delete_title: "Confirmă Ștergerea Formularului",
        confirm_delete_desc: "Sunteți sigur că doriți să ștergeți acest formular? Acțiunea nu poate fi anulată."
    },

    // LeadForm
    component_leadForm: {
        client_label: "Client",
        select_client: "Selectează un client",
        service_label: "Serviciu",
        step_title: "Date Lead (Partea {{step}})",
        final_details: "Detalii Finale",
        status_label: "Status",
        value_label: "Valoare (€)",
        name_required_error: "Câmpul Nume este obligatoriu pentru a continua.",
        back_button: "Înapoi",
        next_button: "Următorul",
        add_lead_button: "Adaugă Lead",
        adding_lead: "Se adaugă lead-ul...",
        no_services_or_fields: "Acest client nu are servicii sau câmpuri configurate.",
        configure_in_clients: "Adaugă un serviciu și câmpuri în secțiunea 'Management Clienți' pentru a continua.",
        registration_date_label: "Data Înregistrării",
        registration_date_hint: "Lăsați necompletat pentru a folosi data de astăzi."
    },
    
    // LeadDetailModal
    component_leadDetailModal: {
        title: "Detalii Lead: {{name}}",
        tab_data: "Date Furnizate",
        tab_summary: "Rezumat",
        tab_generate: "Generează Mesaj",
        tab_appointment: "Programează Întâlnire",
        tab_appointments_list: "Programări",
        tab_history: "Istoric",
        tab_history_alert: "Istoric*",
        tab_notes: "Note",
        lead_id: "ID Lead",
        client_label: "Client",
        reception_date: "Data Primirii",
        service_label: "Serviciu",
        status_label: "Status",
        value_label: "Valoare",
        not_specified: "Nespecificat",
        not_defined: "Nedefinit",
        contact_whatsapp: "Contactează pe WhatsApp",
        copy_number: "Copiază numărul",
        chat_whatsapp: "Discută pe WhatsApp",
        contact_email: "Contactează prin Email",
        copy_email: "Copiază email-ul",
        write_email: "Scrie un email",
        add_price_optional: "Adaugă Preț (Opțional)",
        price_placeholder: "ex. 150",
        service_requested: "Serviciu Solicitat",
        copy_service: "Copiază serviciul",
        choose_template: "Alege modelul de mesaj",
        generate_message_button: "Generează Mesaj",
        generating: "Se generează...",
        template_error: "Selectează un model de mesaj valid.",
        generic_generation_error: "A apărut o eroare la pregătirea mesajului.",
        generated_message: "Mesaj Generat:",
        copy_message: "Copiază mesajul",
        no_history_found: "Niciun istoric găsit pentru acest client.",
        add_manual_work: "Adaugă Lucrare Manual",
        service_performed: "Serviciu Efectuat",
        select_placeholder: "Selectează...",
        value_placeholder: "ex. 150",
        intervention_date: "Data Intervenției",
        notes_optional: "Note (Opțional)",
        notes_placeholder: "ex. Clientul a venit personal...",
        add_work_button: "Adaugă Lucrare",
        adding: "Se adaugă...",
        edit_work: "Modifică Lucrare",
        save_changes: "Salvează Modificările",
        saving: "Se salvează...",
        confirm_delete_history: "Sunteți sigur că doriți să ștergeți această lucrare din istoric? Acțiunea este ireversibilă.",
        delete_history_error: "Elementul nu a putut fi șters.",
        add_new_note_placeholder: "Adaugă o notă nouă...",
        add_note_button: "Adaugă Notă",
        adding_note: "Se adaugă...",
        no_notes_present: "Nicio notă prezentă.",
        confirm_delete_note: "Sunteți sigur că doriți să ștergeți această notă?",
        consult_calendar: "Consultă Calendarul",
        appointment_form: {
            title: "Detalii Întâlnire",
            date: "Data Întâlnirii",
            time: "Ora Întâlnirii",
            duration: "Durata (ore)",
            notes: "Note Suplimentare",
            notes_placeholder: "Note despre intervenție sau client...",
            save_button: "Salvează Întâlnirea",
            saving_button: "Se salvează...",
            success_message: "Întâlnire salvată cu succes.",
            error_message: "Data și ora sunt obligatorii."
        },
        appointment_note_prefix: "Întâlnire programată pentru",
        appointment_note_middle: "la ora",
        appointment_note_duration: "Durata estimată",
        appointment_note_hours: "ore",
        appointment_note_notes: "Note",
        appointment_note_no_notes: "Niciuna",
        appointments_list: {
            title: "Programări Planificate",
            time_label: "Ora",
            duration_label: "Durata",
            notes_label: "Note:",
            delete_tooltip: "Șterge programarea",
            no_appointments: "Nicio programare planificată pentru acest lead."
        },
        template_labels: {
            cambio: "Cutie de Viteze Automată",
            differenziale_e_cambio: "Revizie diferențial 4x4 + Cutie de viteze",
            motore: "Revizie Motor Completă",
            motore_e_cambio: "Revizie Motor și Cutie de Viteze",
            catena_distribuzione: "Lanț de Distribuție",
            cinghia_distribuzione: "Curea de distribuție",
            catena_e_tagliando_motore: "Lanț de Distribuție și Revizie Motor",
            cinghia_e_tagliando_motore: "Curea de distribuție și Revizie Motor",
            distribuzione: "Altele"
        }
    },

    // LiveOverview
    component_liveOverview: {
        total_leads: "Total Lead-uri:",
        no_leads_found: "Nu s-au găsit lead-uri pentru filtrele selectate."
    },
    
    // LiveOverviewChart
    component_liveOverviewChart: {
        total_leads_summary: "Rezumat Total Lead-uri",
        no_data_to_display: "Nicio dată de afișat în grafic.",
        lead: "lead",
        leads: "lead-uri"
    },

    // NotificationPanel
    component_notificationPanel: {
        title: "Notificări",
        mark_all_as_read: "Marchează totul ca citit",
        no_notifications: "Nicio notificare",
        view_all: "Vezi toate notificările",
        time_now: "acum",
        time_minutes_ago: "acum {{count}}m",
        time_hours_ago: "acum {{count}}o",
        time_days_ago: "acum {{count}}z"
    },
    
    // NotificationDetailModal
    component_notificationDetailModal: {
        title: "Detaliu Notificare"
    },

    // Pagination
    pagination: {
        show: "Afișează",
        results: "rezultate",
        page: "Pagina {{currentPage}} din {{totalPages}}",
        previous: "Anterior",
        next: "Următor"
    },

    component_header: {
        online_users_modal_title: "Utilizatori Online ({{count}})",
        fetching_locations: "Se preiau informații despre locație...",
        location_unavailable: "Locație indisponibilă",
        location_private: "Locație privată/necunoscută",
        no_other_users: "Niciun alt utilizator nu este online în prezent."
    },

    platform_status: {
        title: "Starea Platformei",
        title_short: "Stare",
        refresh: "Reîmprospătează starea",
        all_ok: "Toate sistemele sunt operaționale",
        problems: "Unele sisteme întâmpină probleme",
        last_checked: "Ultima verificare",
        operational: "Operațional",
        degraded: "Performanță Redusă",
        outage: "Întrerupere Majoră",
        services: {
            auth: "Autentificare Utilizatori",
            db: "Baza de Date Supabase (CRUD)",
            api: "API Recepție Lead-uri",
            gemini: "API Gemini (Asistent Chat)",
            realtime: "Servicii Real-time (Prezență și Notificări)"
        }
    }
};