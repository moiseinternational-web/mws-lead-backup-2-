export type AdSpendPlatform = 'Meta' | 'Google' | 'TikTok';

export interface AdSpend {
    id: string;
    client_id?: string;
    service: string;
    platform: AdSpendPlatform;
    amount: number;
    date: string; // YYYY-MM-DD (start date)
    created_at?: string;
}

export interface User {
    id: string; // Corresponds to supabase.auth.users.id
    username: string; // From profiles table
    role: 'admin' | 'client'; // From profiles table
    email?: string; // From auth.users
    phone?: string; // From profiles table
    status: 'active' | 'suspended'; // From profiles table
    created_at?: string;
}


export interface Notification {
    id: string;
    user_id: string;
    title?: string;
    message: string;
    read: boolean;
    created_at: string;
    lead_id?: string;
    client_id?: string;
}

export interface Note {
    id: string;
    lead_id?: string;
    content: string;
    created_at: string;
}

export type LeadFieldType =
  | 'text'
  | 'email'
  | 'textarea'
  | 'url'
  | 'tel'
  | 'radio'
  | 'select'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'time'
  | 'file'
  | 'password';

export interface LeadField {
    id: string;
    name: string;
    label: string;
    type: LeadFieldType;
    options?: string[];
    required?: boolean;
}

export interface Service {
    id:string;
    name: string;
    fields: LeadField[];
}

export interface QuoteItem {
    description: string;
    quantity: number;
    price: number;
    vat: number; // percentage, e.g., 22
}

export interface Quote {
    id: string;
    created_at: string;
    client_id: string;
    lead_id: string;
    quote_number_display: string;
    quote_date: string; // YYYY-MM-DD
    recipient_name: string;
    vehicle_details: Record<string, string>;
    payment_type: string;
    notes: string;
    description?: string;
    due_date: string; // YYYY-MM-DD
    taxable_amount: number;
    vat_amount: number;
    total_amount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    items: Record<string, QuoteItem> | QuoteItem[];
}

export interface QuoteWithDetails extends Quote {
    clients: Pick<Client, 'id' | 'name'> | null;
    leads: Pick<Lead, 'id' | 'data'> | null;
}

export interface Appointment {
    id: string;
    created_at: string;
    lead_id?: string;
    client_id?: string;
    user_id?: string;
    appointment_date: string; // YYYY-MM-DD
    appointment_time: string; // HH:MM
    duration_hours: number;
    title?: string;
    notes?: string;
    labor_cost?: number;
    parts_cost?: number;
}

export interface Lead {
    id: string;
    client_id?: string;
    created_at: string;
    data: Record<string, string>;
    status: 'Nuovo' | 'Contattato' | 'In Lavorazione' | 'Perso' | 'Vinto';
    value?: number;
    service?: string;
    notes?: Note[];
    quotes?: Quote[];
    appointments?: Appointment[];
}

export interface Client {
    id: string;
    name: string;
    user_id: string;
    services: Service[];
    created_at?: string;
    mws_fixed_fee?: number;
    mws_profit_percentage?: number;
    quote_webhook_url?: string;
    // These are loaded separately
    leads: Lead[];
    adSpends?: AdSpend[];
}

export interface MwsMonthlyRevenue {
    id: string;
    client_id: string;
    month: string; // YYYY-MM-01
    revenue_amount: number;
    paid_amount: number;
    status: 'paid' | 'unpaid' | 'partially_paid';
    created_at: string;
    updated_at: string;
}

// FIX: Added SavedForm and SavedFormConfig types to resolve error in SavedFormsModule.
export interface SavedFormConfig {
    externalWebhookUrl: string;
    thankYouUrl: string;
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

export interface SavedForm {
    id: string;
    name: string;
    client_id: string;
    service_name: string;
    config: SavedFormConfig;
    created_at: string;
}

export interface CalendarAppointment extends Appointment {
    leads: Lead | null;
    clients: Pick<Client, 'name' | 'user_id'> | null;
}