
import { createClient } from '@supabase/supabase-js';

// INSERISCI QUI I TUOI VALORI OTTENUTI DAL PASSO 2 DELLA GUIDA-
export const supabaseUrl = 'https://qlbyhztcfgfammiqhhcx.supabase.co'; // Es: 'https://xxxxxxxx.supabase.co'
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsYnloenRjZmdmYW1taXFoaGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMDAwODEsImV4cCI6MjA3ODg3NjA4MX0.wBw4IpWmGNrzv02wFD8bYAT6xT8w2TGm6fyJy0hlQDM'; // Es: 'ey...'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
