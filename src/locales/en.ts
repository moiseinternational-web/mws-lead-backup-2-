export default {
    lang_name: "English",
    // Common
    loading: "Loading...",
    name: "Name",
    service: "Service",
    na: "N/A",
    copy: "Copy",
    copied: "Copied!",
    close: "Close",
    actions: "Actions",
    all: "All",
    from: "From",
    to: "To",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    save_changes: "Save Changes",
    add: "Add",
    search: "Search",
    optional: "Optional",
    required_fields_error: "Please fill in all required fields.",
    generic_error: "An unexpected error occurred. Please try again.",
    
    // Login Page
    login_title: "MWS Lead Management",
    login_subtitle: "Login to your account to continue",
    username_placeholder: "Username",
    password_placeholder: "Password",
    login_button: "Login",
    login_button_loading: "Logging in...",
    login_error_credentials: "Invalid credentials. Please try again.",
    login_error_suspended: "This account has been suspended.",
    login_error_generic: "An unexpected error occurred. Please try again later.",
    
    // Header & Layout
    header_title: "MWS Lead Management",
    header_version: "version 2.0",
    menu_account_settings: "Account Settings",
    menu_send_notifications: "Send Notifications",
    menu_manage_sent: "Manage Sent",
    menu_terms: "Terms and Conditions",
    menu_chat: "Chat",
    menu_light_mode: "Light Mode",
    menu_dark_mode: "Dark Mode",
    menu_logout: "Logout",
    footer_developed_by: "Platform developed by Moise Web Srl",
    footer_hq: "Headquarters: București (RO)",
    language: "Language",
    online_users_tooltip: "{{count}} other users online",
    
    // Admin Dashboard Nav
    nav_lead_management: "Lead Management",
    nav_calendar: "Calendar",
    nav_quotes: "Quotes",
    nav_live_overview: "Live Overview",
    nav_client_management: "Client Management",
    nav_form_generator: "Form Generator",
    nav_expense_management: "Expense Management",
    nav_analysis: "Analysis",
    nav_mws_revenue: "MWS Revenue",
    
    // Client Dashboard Nav
    nav_my_leads: "My Leads",
    nav_ad_expenses: "Ad Expenses",
    nav_data_analysis: "Data Analysis",
    
    // Lead Status
    lead_status: {
        Nuovo: "New",
        Contattato: "Contacted",
        "In Lavorazione": "In Progress",
        Perso: "Lost",
        Vinto: "Won"
    },
    
    // Pages & Components
    
    // AdminDashboard
    page_adminDashboard: {
        leads_title: "All Leads",
        total_leads_count: "{{count}}",
        selected_count: "{{count}} selected",
        add_lead_button: "Add Lead",
        refresh: "Refresh",
        search_placeholder: "Search all fields...",
        client_filter_all: "Show all clients",
        filter_by_status: "Filter by status:",
        no_leads_found: "No leads found for the selected filters.",
        confirm_delete_lead: "Are you sure you want to delete this lead?",
        confirm_delete_multiple_leads: "Are you sure you want to delete {{count}} selected leads?",
        clients_title: "Client Management",
        add_client_button: "Add Client",
        total_leads_suffix: "total leads",
        client_suspended: "SUSPENDED",
        tooltip_reactivate_client: "Reactivate Client",
        tooltip_suspend_client: "Suspend Client",
        tooltip_manage_account: "Manage Account",
        tooltip_edit_client: "Edit Client",
        tooltip_delete_client: "Delete Client",
        webhook_urls_title: "Webhook URLs per Service",
        no_services_configured: "No services configured. Edit the client to add them.",
        fields_per_service_title: "Fields per Service",
        no_fields_for_service: "No fields for this service.",
        no_lead_fields_configured: "No lead fields configured.",
        no_clients_found: "No clients found.",
        add_first_client_prompt: "Add your first client to get started.",
        confirm_delete_client: "Are you sure you want to delete this client? This action is irreversible and will also remove the associated user account.",
        ad_spend_title: "Expense Management",
        add_expense_button: "Add Expense",
        select_client_placeholder: "Select a client",
        all_services: "All services",
        confirm_delete_expense: "Are you sure you want to delete this expense item?",
        confirm_delete_multiple_expenses: "Are you sure you want to delete {{count}} selected expense items?",
        no_expenses_found: "No expenses found for the selected filters.",
        forms_title: "Form Generator",
        saved_forms_title: "Saved Forms",
        live_overview_title: "Live Overview",
        filter_by_client: "Filter by Client",
        group_by: "Group by",
        group_by_client: "Client",
        group_by_service: "Service",
        filter_by_period: "Filter by Period",
        modal_edit_client_title: "Edit Client Details",
        modal_new_client_title: "New Client",
        modal_manage_account_title: "Manage Account: {{name}}",
        modal_add_lead_title: "Add New Lead",
        modal_edit_expense_title: "Edit Ad Expense",
        modal_add_expense_title: "Add Ad Expense",
        ad_spend_form: {
            service_label: "Service",
            select_service: "Select a service",
            platform_label: "Platform",
            amount_label: "Amount (€)",
            amount_placeholder: "e.g., 500",
            period_type_label: "Period Type",
            day: "Day",
            week: "Week",
            month: "Month",
            expense_date_label: "Expense Date",
            week_start_date_label: "Week Start Date",
            select_month_label: "Select Month",
            saving: "Saving...",
            save_changes_button: "Save Changes",
            add_expense_button: "Add Expense",
            error_service_amount_required: "Service and amount are required.",
            error_date_required: "Date is required.",
            error_week_start_required: "Week start date is required.",
            error_month_required: "Month is required.",
        },
        user_account_form: {
            username_placeholder: "Username",
            email_placeholder: "Email",
            phone_placeholder: "Phone number",
            password_placeholder: "Leave blank to keep password unchanged",
            saving: "Saving...",
        },
        tagliando_modal: {
            title: "Intervention Details",
            description: "Specify the type of service performed. This information will be added as a note and the lead will be archived.",
            confirm_and_archive: "Confirm and Archive",
            saving: "Saving...",
            types: {
                "Tagliando motore": "Engine service",
                "Tagliando cambio": "Gearbox service",
                "Tagliando motore e cambio": "Engine and gearbox service",
                "Tagliando differenziale 4x4": "4x4 differential service",
                "Tagliando differenziale 4x4 + Cambio": "4x4 differential + Gearbox service",
                "Cinghia di distribuzione": "Timing belt",
                "Cinghia di distribuzione e Tagliando motore": "Timing belt and Engine service"
            }
        }
    },

    // ClientDashboard
    page_clientDashboard: {
        greeting: "Hello, {{name}}",
        description: "This is your dashboard for managing your leads and expenses.",
        my_leads_title: "My Leads",
        add_lead_button: "Add Lead",
        search_placeholder: "Search all fields...",
        filter_by_service: "Filter by service",
        all_services: "All Services",
        columns_button: "Columns",
        filter_by_status: "Filter by status:",
        no_leads_found: "No leads found for the selected filters.",
        confirm_delete_lead: "Are you sure you want to delete this lead?",
        column_manager_title: "Pin Columns to the Left",
        ad_spend_title: "Ad Expenses",
        total_spent: "Total Spent",
        no_ad_spend_recorded: "No ad expenses recorded.",
        live_overview_title: "Live Overview",
        filter_by_period: "Filter by Period",
        tagliando_modal: {
            title: "Intervention Details",
            description: "Specify the type of service performed. This information will be added as a note and the lead will be archived.",
            confirm_and_archive: "Confirm and Archive",
            saving: "Saving...",
             types: {
                "Tagliando motore": "Engine service",
                "Tagliando cambio": "Gearbox service",
                "Tagliando motore e cambio": "Engine and gearbox service",
                "Tagliando differenziale 4x4": "4x4 differential service",
                "Tagliando differenziale 4x4 + Cambio": "4x4 differential + Gearbox service",
                "Cinghia di distribuzione": "Timing belt",
                "Cinghia di distribuzione e Tagliando motore": "Timing belt and Engine service"
            }
        }
    },
    
    // CalendarPage
    page_calendar: {
        title: "Appointments Calendar",
        no_appointments: "No appointments found for the selected period.",
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day"
    },
    appointment_detail_modal: {
        title: "Appointment Details",
        lead_info: "Lead Information",
        appointment_info: "Appointment Information",
        lead_name: "Lead Name",
        client_name: "Client",
        date: "Date",
        time: "Time",
        duration: "Duration",
        duration_hours: "{{count}} hours",
        notes: "Notes",
        no_notes: "No notes provided.",
        associated_quotes: "Associated Quotes"
    },
    
    // QuotesPage
    page_quotes: {
        title: "Quote Management",
        search_placeholder: "Search by quote #, name, surname, license plate, phone...",
        no_quotes_found: "No quotes found for the selected filters.",
        confirm_delete: "Are you sure you want to delete this quote? This action is irreversible.",
        quote_number: "Quote #",
        client: "Client",
        lead: "Lead",
        date: "Date",
        total: "Total",
        status: "Status",
        actions: "Actions"
    },
    quote_status: {
        draft: "Draft",
        sent: "Sent",
        accepted: "Accepted",
        rejected: "Rejected"
    },

    // AnalyticsPage
    page_analytics: {
        title: "Data Analysis",
        refresh_tooltip: "Refresh data",
        loading: "Loading analytics data...",
        client_label: "Client",
        all_clients: "All Clients",
        service_label: "Service",
        all_services: "All Services",
        reset_filters: "Reset",
        total_revenue: "Total Revenue",
        ad_spend: "Ad Expenses",
        net_revenue: "Net Revenue",
        won_leads: "Won Leads",
        conversion_rate: "Conversion Rate",
        detailed_overview: "Detailed Overview",
        ad_spend_distribution: "Ad Spend Distribution",
        no_spend_in_period: "No expenses in the selected period.",
        lead_status_summary: "Lead Status Summary",
        no_leads_in_period: "No leads in the selected period.",
        won_lead_details: "Won Lead Details",
        no_won_leads_found: "No won leads found for the selected filters.",
        client_name: "Client Name"
    },
    
    // MwsRevenuePage
    page_mwsRevenue: {
        title: "MWS Revenue",
        filter_by_month: "Filter by Month",
        total_mws_revenue_period: "Total MWS Revenue (Selected Period)",
        calculator_title: "Revenue Calculation & Invoices",
        no_unpaid_invoices: "No clients found.",
        client_revenue: "Client Revenue",
        spend: "Spend",
        client_profit: "Client Profit",
        mws_fixed_fee: "MWS Fixed (€)",
        mws_profit_perc: "% MWS Profit",
        mws_revenue: "MWS Revenue",
        status: "Status",
        total_mws_revenue: "Total MWS Revenue",
        saving: "Saving...",
        saved: "Saved",
        save_error: "Save Error",
        pending_changes: "Pending changes",
        payment_status: "Payment Status",
        payment_actions: "Payment Actions",
        manage_payment: "Manage",
        payment_history_title: "Paid Invoices History",
        payment_history: {
            client: "Client",
            month: "Month",
            total_amount: "Total Amount",
            paid_amount: "Paid Amount",
            remaining_amount: "Remaining Amount",
            status: "Status",
            paid: "Paid",
            partially_paid: "Partial"
        },
        payment_modal: {
            title: "Manage Invoice Payment",
            description: "Record payment for {{clientName}} for the month of {{month}}.",
            total_due: "Total due",
            already_paid: "Already paid",
            remaining: "Remaining to be paid",
            pay_in_full: "Pay the full remaining amount",
            payment_amount: "Payment Amount",
            confirm_and_save: "Confirm and Save",
            error_invalid_amount: "Please enter a valid amount.",
            error_overpayment: "Partial amount cannot exceed the remaining total."
        }
    },

    // AccountSettingsPage
    page_accountSettings: {
        title: "Account Settings",
        profile_info_card_title: "Profile Information",
        save_profile_button: "Save Profile",
        saving: "Saving...",
        profile_update_success: "Profile updated successfully!",
        change_password_card_title: "Change Password",
        current_password_placeholder: "Current Password",
        new_password_placeholder: "New Password",
        confirm_new_password_placeholder: "Confirm New Password",
        password_mismatch_error: "New passwords do not match.",
        password_empty_error: "New password cannot be empty.",
        change_password_button: "Change Password",
        changing: "Changing...",
        password_update_success: "Password changed successfully!",
        danger_zone_card_title: "Danger Zone",
        delete_account_warning: "Deleting your account is an irreversible action. All your data, including leads, will be permanently deleted.",
        delete_account_confirm_label: "To confirm, type your username: {{username}}",
        delete_account_button: "Delete my account permanently",
        deleting: "Deleting...",
        incorrect_username_error: "The entered username is incorrect.",
        delete_account_success: "Account deleted successfully.",
        delete_account_error: "Could not delete account.",
        current_password_error: "The current password is not correct."
    },
    
    // SendNotificationPage
    page_sendNotification: {
        title: "Send Notification",
        recipients_label: "Recipients",
        loading_users: "Loading users...",
        me_admin: "Myself (Admin)",
        all_clients: "All Clients",
        title_label: "Title",
        title_placeholder: "Notification title",
        message_label: "Message",
        message_placeholder: "Write your message here...",
        send_button: "Send Notification",
        sending: "Sending...",
        error_no_recipient: "Select at least one recipient.",
        error_no_title: "Title cannot be empty.",
        error_no_message: "Message cannot be empty.",
        success_message: "Notification sent successfully to {{count}} user(s)."
    },

    // ManageNotificationsPage
    page_manageNotifications: {
        title: "Manage Sent Notifications",
        no_notifications_sent: "You haven't sent any custom notifications yet.",
        message_preview: "Message (Preview)",
        date_sent: "Date Sent",
        confirm_delete: "Are you sure you want to delete this notification for all recipients? This action is irreversible.",
        delete_error: "Could not delete the notification. Please try again.",
        modal_edit_title: "Edit Notification",
        edit_form: {
            title_label: "Title",
            message_label: "Message",
            empty_error: "Title and message cannot be empty.",
            confirm_resend: "Confirming will delete the original notification and a new, updated version will be sent to all recipients. Continue?",
            success: "Notification updated and resent successfully.",
            error: "Could not edit and resend the notification.",
            save_and_resend: "Save and Resend",
            saving: "Saving..."
        }
    },
    
    // NotificationsPage
    page_notifications: {
        title: "All Notifications",
        mark_all_as_read: "Mark all as read",
        no_notifications: "There are no notifications to display."
    },
    
    // TermsPage
    page_terms: {
        title: "Terms and Conditions",
        acceptance_title: "1. Acceptance of Terms",
        acceptance_p: "By using the Lead Management Platform ('Service'), you agree to be bound by the following terms and conditions ('Terms of Service').",
        description_title: "2. Description of Service",
        description_p: "The Service provides tools for managing customer leads, including acquisition via webhook, categorization, and data analysis. We reserve the right to modify or discontinue the Service with or without notice.",
        account_title: "3. User Account",
        account_p: "You are responsible for safeguarding the password you use to access the Service and for any activities or actions under your password. You must notify us immediately of any security breach or unauthorized use of your account.",
        liability_title: "4. Limitation of Liability",
        liability_p: "In no event shall Moise Web Lead Platform be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
    },

    // ApiHandlerPage
    page_apiHandler: {
        processing: "Processing...",
        saving_lead: "We are saving the new lead.",
        success: "Success!",
        success_message: "Lead received and saved successfully!",
        error: "Error",
        error_client_id_missing: "Client ID missing in the request.",
        error_no_lead_data: "No lead data provided in the request.",
        error_saving: "Error saving the lead.",
        endpoint_notice: "This page is an endpoint for an automatic integration (e.g., Make.com). You can close it."
    },
    
    // ChatPage
    page_chat: {
        title: "MWS Assistant",
        online: "Online",
        reset_tooltip: "Reset chat",
        placeholder: "Write your message...",
        send_aria_label: "Send message",
        confirm_reset: "Are you sure you want to reset the chat? The entire conversation history will be lost.",
        init_error: "Could not initialize the chatbot. Check the API Key configuration.",
        send_error: "An error occurred while communicating with the assistant. Please try again.",
        system_instruction: "You are a virtual assistant for the MWS Lead Management platform. Your name is MWS Assistant. Respond in a friendly and professional manner to user questions about the platform, lead management, and provide advice on how to best use the features. Do not invent features that do not exist. Be concise and clear in your answers. The current user is named '{{username}}'. Speak in English.",
        initial_greeting: "Hello {{username}}! I'm MWS Assistant. How can I help you manage your leads today?"
    },

    // ClientForm
    component_clientForm: {
        client_name_label: "Client Name",
        username_label: "Client Username",
        password_label: "Client Password",
        mws_revenue_settings: "MWS Revenue Settings",
        fixed_fee_label: "Fixed Fee (€)",
        profit_percentage_label: "% on Profit",
        services_and_fields: "Services and Specific Fields",
        service_name_placeholder: "Service Name (e.g., Maintenance)",
        fields_for_service: "Fields for this service:",
        field_label: "Field Label",
        field_label_placeholder: "Field Label {{index}}",
        field_type: "Field Type",
        required: "Required",
        api_name: "Name (API)",
        options_label: "Options (separated by semicolon ';')",
        options_placeholder: "Option 1; Option 2; Option with spaces",
        add_field: "Add Field",
        add_service: "Add New Service",
        error_at_least_one_service: "Add at least one service with a name and at least one valid field.",
        saving: "Saving...",
        create_client: "Create Client",
        confirm_delete_service_title: "Confirm Service Deletion",
        confirm_delete_service_message: "Are you sure you want to delete the '{{serviceName}}' service? All associated fields will also be removed. This action cannot be undone.",
        field_types: {
            text: "Text",
            email: "Email",
            textarea: "Textarea",
            tel: "Phone",
            number: "Number",
            date: "Date",
            time: "Time",
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
        all: "All",
        today: "Today",
        yesterday: "Yesterday",
        last_week: "Last Week",
        this_month: "This Month",
        last_month: "Last Month"
    },
    
    // FormGenerator & SavedFormsModule
    component_formGenerator: {
        title: "Form Generator",
        edit_title: "Edit Form",
        configure_form: "Configure Form",
        step1_title: "1. Select Client and Service",
        select_client: "Select a client...",
        select_service: "Select a service...",
        step2_title: "2. Direct Supabase Connection",
        supabase_url: "Supabase URL",
        supabase_key: "Supabase Anon Key",
        client_id_generated: "Client ID (generated)",
        thank_you_page: "Thank You Page (Optional)",
        thank_you_page_placeholder: "https://yoursite.com/thanks",
        step3_title: "3. External Webhook (Optional)",
        webhook_url: "Webhook URL",
        webhook_placeholder: "https://your-webhook-url.com/hook",
        webhook_description: "If provided, a copy of the lead data will also be sent to this address after being saved to Supabase.",
        step4_title: "4. Form Structure",
        show_form_title: "Show form title",
        form_title_label: "Title Text",
        field_layout: "Field Layout (Mobile / Desktop)",
        no_fields_to_configure: "No fields to configure. Select a service.",
        multi_step: "Split into multiple steps",
        step5_title: "5. Consents",
        add_privacy_policy: "Add Privacy Policy consent",
        privacy_policy_url: "Privacy Policy URL",
        checked_by_default: "Checked by default",
        add_terms: "Add Terms and Conditions",
        terms_url: "Terms and Conditions URL",
        step6_title: "6. Style and Colors",
        primary_color: "Primary",
        button_text_color: "Button Text",
        form_bg_color: "Form BG",
        text_color: "Field Text",
        label_color: "Labels",
        submit_button_text: "Submit Button Text",
        preview_and_code: "Preview and Code",
        update_form_button: "Update Form",
        save_form_button: "Save Form",
        cancel_edit_button: "Cancel",
        copy_code_button: "Copy Code",
        copied_button: "Copied!",
        preview_placeholder_title: "The form preview will appear here.",
        preview_placeholder_desc: "Select a client to get started.",
        save_modal_title: "Save Form",
        edit_modal_title: "Update Form Name",
        form_name_label: "Form Name",
        form_name_placeholder: "e.g., Summer Campaign Form",
        save_error: "Form name, client, and service are required.",
        confirm_and_save: "Confirm and Save",
        confirm_and_update: "Confirm and Update"
    },
    component_savedFormsModule: {
        title: "Saved Forms",
        loading: "Loading saved forms...",
        module: "module",
        modules: "modules",
        no_forms_saved: "No saved forms found.",
        no_forms_saved_desc: "Go to 'Form Generator' to create and save your first form.",
        confirm_delete_title: "Confirm Form Deletion",
        confirm_delete_desc: "Are you sure you want to delete this form? This action cannot be undone."
    },

    // LeadForm
    component_leadForm: {
        client_label: "Client",
        select_client: "Select a client",
        service_label: "Service",
        step_title: "Lead Data (Part {{step}})",
        final_details: "Final Details",
        status_label: "Status",
        value_label: "Value (€)",
        name_required_error: "The Name field is required to proceed.",
        back_button: "Back",
        next_button: "Next",
        add_lead_button: "Add Lead",
        adding_lead: "Adding lead...",
        no_services_or_fields: "This client has no configured services or fields.",
        configure_in_clients: "Add a service and fields in the 'Client Management' section to continue.",
        registration_date_label: "Registration Date",
        registration_date_hint: "Leave blank to use today's date."
    },
    
    // LeadDetailModal
    component_leadDetailModal: {
        title: "Lead Details: {{name}}",
        tab_data: "Provided Data",
        tab_summary: "Summary",
        tab_generate: "Generate Message",
        tab_appointment: "Schedule Appointment",
        tab_appointments_list: "Appointments",
        tab_history: "History",
        tab_history_alert: "History*",
        tab_notes: "Notes",
        lead_id: "Lead ID",
        client_label: "Client",
        reception_date: "Reception Date",
        service_label: "Service",
        status_label: "Status",
        value_label: "Value",
        not_specified: "Not specified",
        not_defined: "Not defined",
        contact_whatsapp: "Contact on WhatsApp",
        copy_number: "Copy number",
        chat_whatsapp: "Chat on WhatsApp",
        contact_email: "Contact via Email",
        copy_email: "Copy email",
        write_email: "Write an email",
        add_price_optional: "Add Price (Optional)",
        price_placeholder: "e.g., 150",
        service_requested: "Service Requested",
        copy_service: "Copy service",
        choose_template: "Choose message template",
        generate_message_button: "Generate Message",
        generating: "Generating...",
        template_error: "Select a valid message template.",
        generic_generation_error: "An error occurred while preparing the message.",
        generated_message: "Generated Message:",
        copy_message: "Copy message",
        no_history_found: "No history found for this client.",
        add_manual_work: "Add Work Manually",
        service_performed: "Service Performed",
        select_placeholder: "Select...",
        value_placeholder: "e.g., 150",
        intervention_date: "Intervention Date",
        notes_optional: "Notes (Optional)",
        notes_placeholder: "e.g., Client came in person...",
        add_work_button: "Add Work",
        adding: "Adding...",
        edit_work: "Edit Work",
        save_changes: "Save Changes",
        saving: "Saving...",
        confirm_delete_history: "Are you sure you want to delete this work from the history? This action is irreversible.",
        delete_history_error: "Could not delete the item.",
        add_new_note_placeholder: "Add a new note...",
        add_note_button: "Add Note",
        adding_note: "Adding...",
        no_notes_present: "No notes present.",
        confirm_delete_note: "Are you sure you want to delete this note?",
        consult_calendar: "Consult Calendar",
        appointment_form: {
            title: "Appointment Details",
            date: "Appointment Date",
            time: "Appointment Time",
            duration: "Duration (hours)",
            notes: "Additional Notes",
            notes_placeholder: "Notes on the intervention or client...",
            save_button: "Save Appointment",
            saving_button: "Saving...",
            success_message: "Appointment saved successfully.",
            error_message: "Date and time are required."
        },
        appointment_note_prefix: "Appointment set for",
        appointment_note_middle: "at",
        appointment_note_duration: "Expected duration",
        appointment_note_hours: "hours",
        appointment_note_notes: "Notes",
        appointment_note_no_notes: "None",
        appointments_list: {
            title: "Scheduled Appointments",
            time_label: "Time",
            duration_label: "Duration",
            notes_label: "Notes:",
            delete_tooltip: "Delete appointment",
            no_appointments: "No scheduled appointments for this lead."
        },
        template_labels: {
            cambio: "Automatic Gearbox",
            differenziale_e_cambio: "4x4 Differential + Gearbox Service",
            motore: "Complete Engine Service",
            motore_e_cambio: "Engine and Gearbox Service",
            catena_distribuzione: "Timing Chain",
            cinghia_distribuzione: "Timing Belt",
            catena_e_tagliando_motore: "Timing Chain and Engine Service",
            cinghia_e_tagliando_motore: "Timing Belt and Engine Service",
            distribuzione: "Other"
        }
    },

    // LiveOverview
    component_liveOverview: {
        total_leads: "Total Leads:",
        no_leads_found: "No leads found for the selected filters."
    },
    
    // LiveOverviewChart
    component_liveOverviewChart: {
        total_leads_summary: "Total Leads Summary",
        no_data_to_display: "No data to display in the chart.",
        lead: "lead",
        leads: "leads"
    },

    // NotificationPanel
    component_notificationPanel: {
        title: "Notifications",
        mark_all_as_read: "Mark all as read",
        no_notifications: "No notifications",
        view_all: "View all notifications",
        time_now: "now",
        time_minutes_ago: "{{count}}m ago",
        time_hours_ago: "{{count}}h ago",
        time_days_ago: "{{count}}d ago"
    },
    
    // NotificationDetailModal
    component_notificationDetailModal: {
        title: "Notification Detail"
    },

    // Pagination
    pagination: {
        show: "Show",
        results: "results",
        page: "Page {{currentPage}} of {{totalPages}}",
        previous: "Previous",
        next: "Next"
    },

    component_header: {
        online_users_modal_title: "Online Users ({{count}})",
        fetching_locations: "Fetching location information...",
        location_unavailable: "Location unavailable",
        location_private: "Private/Unknown location",
        no_other_users: "No other users are currently online."
    },

    platform_status: {
        title: "Platform Status",
        title_short: "Status",
        refresh: "Refresh status",
        all_ok: "All systems operational",
        problems: "Some systems are experiencing issues",
        last_checked: "Last checked",
        operational: "Operational",
        degraded: "Degraded Performance",
        outage: "Major Outage",
        services: {
            auth: "User Authentication",
            db: "Supabase Database (CRUD)",
            api: "Lead Reception API",
            gemini: "Gemini API (Chat Assistant)",
            realtime: "Real-time Services (Presence & Notifications)"
        }
    }
};