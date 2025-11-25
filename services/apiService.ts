import { supabase } from '../supabaseClient';
import type { User, Client, Lead, Note, AdSpend, Service, SavedForm, Notification, MwsMonthlyRevenue, Quote, QuoteItem, Appointment, CalendarAppointment, QuoteWithDetails } from '../types';

interface AddLeadOptions {
    clientId: string;
    leadData: Record<string, string>;
    service?: string;
    status?: Lead['status'];
    value?: number;
    createdAt?: string;
}

export class ApiService {
    
    private static unpackMwsSettings<T extends { services?: any, mws_fixed_fee?: number, mws_profit_percentage?: number }>(clientData: T): T {
        if (!clientData) {
            return clientData;
        }

        const clientWithSettings = { ...clientData };
        let rawServices = clientWithSettings.services;

        if (typeof rawServices === 'string') {
            try {
                rawServices = JSON.parse(rawServices);
            } catch (e) {
                console.error("Failed to parse services JSON for client:", (clientData as any).id);
                rawServices = [];
            }
        }
        
        const servicesArray = Array.isArray(rawServices) ? rawServices : [];

        const mwsSettings = servicesArray.find((s: any) => s && s.id === 'mws_settings');
        if (mwsSettings) {
            clientWithSettings.mws_fixed_fee = mwsSettings.mws_fixed_fee;
            clientWithSettings.mws_profit_percentage = mwsSettings.mws_profit_percentage;
        }

        clientWithSettings.services = servicesArray.filter((s: any) => s && s.id !== 'mws_settings');
        
        return clientWithSettings;
    }

    // The old login method is deprecated. Authentication is handled by AuthContext.
    // static async login(...) is removed.

    static async getClients(): Promise<Client[]> {
        const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('*');

        if (clientsError) throw new Error(clientsError.message);

        const clientsWithData = await Promise.all(clientsData.map(async (client) => {
            const { data: leads } = await supabase.from('leads').select('*, notes(*), appointments(*)').eq('client_id', client.id).order('created_at', { ascending: false });
            const { data: adSpends } = await supabase.from('ad_spends').select('*').eq('client_id', client.id);
            
            const unpackedClient = ApiService.unpackMwsSettings(client);

            return {
                ...unpackedClient,
                leads: (leads || []) as Lead[],
                adSpends: (adSpends || []) as AdSpend[],
            };
        }));

        return clientsWithData as Client[];
    }

    static async getUsers(): Promise<User[]> {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw new Error(error.message);
        return data as User[];
    }

    static async getAvailableUsers(): Promise<User[]> {
        // Step 1: Get all user_ids that are already associated with a client.
        const { data: clientUserIds, error: clientIdsError } = await supabase
            .from('clients')
            .select('user_id');

        if (clientIdsError) {
            console.error("Error fetching client user IDs:", clientIdsError.message);
            throw new Error(clientIdsError.message);
        }

        const associatedUserIds = clientUserIds.map(c => c.user_id);

        // Step 2: Get all profiles with role 'client'. If there are associated users, exclude them.
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'client');
            
        if (associatedUserIds.length > 0) {
            // Important: Supabase requires the value for `in` to be a string like '(id1,id2)'
            query = query.not('id', 'in', `(${associatedUserIds.join(',')})`);
        }
        
        const { data: availableProfiles, error: profilesError } = await query;
            
        if (profilesError) {
            console.error("Error fetching available profiles:", profilesError.message);
            throw new Error(profilesError.message);
        }

        return (availableProfiles || []) as User[];
    }

    static async getClientByUserId(userId: string): Promise<Client | null> {
        // Use .select() without .single() to handle potential duplicates gracefully.
        const { data: clients, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId);
            
        if (error) {
             console.error("Error fetching client by user ID", error.message);
             return null;
        }
        
        if (!clients || clients.length === 0) {
            // This is a valid case for a new user who is not a client yet.
            return null;
        }
        
        if (clients.length > 1) {
            console.warn(`Warning: Found multiple client profiles for user ID ${userId}. Using the first one found.`);
        }
    
        const client = clients[0]; // Take the first client record.

        const [{data: leads}, {data: spends}] = await Promise.all([
             supabase.from('leads').select('*, notes(*), appointments(*)').eq('client_id', client.id).order('created_at', { ascending: false }),
             supabase.from('ad_spends').select('*').eq('client_id', client.id)
        ]);
        
        const unpackedClient = ApiService.unpackMwsSettings(client);

        return {
            ...unpackedClient,
            leads: (leads || []) as Lead[],
            adSpends: (spends || []) as AdSpend[],
        } as Client;
    }
    
    static async addClient(name: string, userId: string, services: Omit<Service, 'id'>[], quote_webhook_url?: string): Promise<Client> {
        // 1. Check if a client record already exists for this user.
        const { data: existingClients, error: clientCheckError } = await supabase.from('clients').select('id').eq('user_id', userId);
        if (clientCheckError) {
            throw new Error(`Errore durante la verifica del cliente esistente: ${clientCheckError.message}`);
        }
        if (existingClients && existingClients.length > 0) {
            throw new Error('Questo utente è già associato a un cliente.');
        }

        // 2. Insert client
        const servicesWithIds = services.map(s => ({
            ...s,
            id: `service_${Date.now()}_${Math.random()}`,
            fields: s.fields.map(f => ({ ...f, id: `field_${Date.now()}_${Math.random()}` }))
        }));
        
        const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({ name, user_id: userId, services: servicesWithIds, quote_webhook_url })
            .select()
            .single();

        if (clientError) {
            throw new Error(clientError.message);
        }

        return { ...newClient, leads: [], adSpends: [], services: newClient.services || [] } as Client;
    }

    static async updateClient(clientId: string, updates: Partial<Pick<Client, 'name' | 'services' | 'mws_fixed_fee' | 'mws_profit_percentage' | 'quote_webhook_url'>>): Promise<Client> {
        const { mws_fixed_fee, mws_profit_percentage, ...otherUpdates } = updates;
        const updatesForSupabase: Partial<Pick<Client, 'name' | 'services' | 'quote_webhook_url'>> = { ...otherUpdates };

        const mwsSettingsProvided = mws_fixed_fee !== undefined || mws_profit_percentage !== undefined;

        if (mwsSettingsProvided || updates.services) {
            const { data: currentClientData, error: fetchError } = await supabase
                .from('clients')
                .select('services')
                .eq('id', clientId)
                .single();

            if (fetchError) throw new Error(fetchError.message);

            let currentServices = currentClientData.services || [];
            if (typeof currentServices === 'string') {
                try {
                    currentServices = JSON.parse(currentServices);
                } catch (e) {
                    currentServices = [];
                }
            }

            let userServices = Array.isArray(currentServices) ? currentServices.filter((s: any) => s && s.id !== 'mws_settings') : [];
            let mwsSettings = Array.isArray(currentServices) ? currentServices.find((s: any) => s && s.id === 'mws_settings') : undefined;
            if (!mwsSettings) {
                mwsSettings = { id: 'mws_settings', name: '_mws_settings' };
            }

            if (updates.services) {
                userServices = updates.services;
            }

            if (mwsSettingsProvided) {
                if (mws_fixed_fee !== undefined) (mwsSettings as any).mws_fixed_fee = mws_fixed_fee;
                if (mws_profit_percentage !== undefined) (mwsSettings as any).mws_profit_percentage = mws_profit_percentage;
            }
            
            updatesForSupabase.services = [...userServices, mwsSettings];
        }

        if (updatesForSupabase.services) {
            const updatedServicesWithIds = updatesForSupabase.services.map(s => ({
                ...s,
                id: (s.id && !s.id.startsWith('new_')) ? s.id : (s.id === 'mws_settings' ? 'mws_settings' : `service_${Date.now()}_${Math.random()}`),
                fields: s.fields ? s.fields.map(f => ({
                    ...f,
                    id: (f.id && !f.id.startsWith('new_')) ? f.id : `field_${Date.now()}_${Math.random()}`
                })) : undefined
            }));
            updatesForSupabase.services = updatedServicesWithIds;
        }
        
        const { data, error } = await supabase
            .from('clients')
            .update(updatesForSupabase)
            .eq('id', clientId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        
        const unpackedClient = ApiService.unpackMwsSettings(data);
        return { ...unpackedClient, leads: [], adSpends: [] } as Client;
    }
    
    static async deleteClient(clientId: string): Promise<void> {
        // Find user_id first to delete the user via RPC.
        const { data: client, error: findError } = await supabase.from('clients').select('user_id').eq('id', clientId).single();
        if(findError) throw new Error(findError.message);
        if(!client) throw new Error("Client not found.");

        const { error } = await supabase.rpc('delete_user_by_id_and_data', { user_id_to_delete: client.user_id });
        if (error) throw new Error(`Errore RPC durante l'eliminazione dell'utente: ${error.message}`);
    }
    
    static async deleteClientByUserId(userId: string): Promise<void> {
        const { error } = await supabase.rpc('delete_user_by_id_and_data', { user_id_to_delete: userId });
        if (error) throw new Error(`Errore RPC durante l'eliminazione dell'utente: ${error.message}`);
    }

    static async addLead({ clientId, leadData, service, status, value, createdAt }: AddLeadOptions): Promise<Lead> {
        const leadToInsert: { [key: string]: any } = {
            client_id: clientId,
            data: leadData,
            service,
            status: status || 'Nuovo',
            value
        };

        if (createdAt) {
            leadToInsert.created_at = new Date(createdAt).toISOString();
        }

        const { data, error } = await supabase.from('leads').insert(leadToInsert).select().single();
        if (error) throw new Error(error.message);
        const newLead = data as Lead;
        
        // --- Create Notifications ---
        try {
            const { data: clientData } = await supabase.from('clients').select('user_id, name').eq('id', clientId).single();
            const { data: adminUsers } = await supabase.from('profiles').select('id').eq('role', 'admin');

            if (clientData && adminUsers && adminUsers.length > 0) {
                const notificationsToInsert = [
                    // Notification for the client
                    {
                        user_id: clientData.user_id,
                        title: `Nuovo Lead Ricevuto!`,
                        message: `Hai ricevuto un nuovo lead: '${leadData.nome || 'N/D'}'. Clicca per vedere i dettagli.`,
                        lead_id: newLead.id,
                        client_id: clientId
                    },
                    // Notification for all admins
                    ...adminUsers.map(admin => ({
                        user_id: admin.id,
                        title: `Nuovo Lead per ${clientData.name}`,
                        message: `È stato registrato un nuovo lead '${leadData.nome || 'N/D'}' per il cliente '${clientData.name}'.`,
                        lead_id: newLead.id,
                        client_id: clientId
                    }))
                ];
                
                await supabase.from('notifications').insert(notificationsToInsert);
            }
        } catch(notificationError) {
            console.error("Failed to create notifications:", notificationError);
        }

        return newLead;
    }

    static async addHistoricalLead(
        options: {
            clientId: string;
            originalLeadData: Record<string, string>;
            service: string;
            value: number;
            date: string; // YYYY-MM-DD
            notes?: string;
        }
    ): Promise<Lead> {
        const { clientId, originalLeadData, service, value, date, notes } = options;
    
        const leadToInsert = {
            client_id: clientId,
            data: { ...originalLeadData, _is_historical: 'true' },
            service,
            status: 'Vinto' as const,
            value,
            created_at: new Date(date).toISOString(),
        };
    
        const { data: newLead, error: leadError } = await supabase
            .from('leads')
            .insert(leadToInsert)
            .select()
            .single();
        
        if (leadError) throw new Error(leadError.message);
    
        if (notes && notes.trim() !== '') {
            const { error: noteError } = await supabase
                .from('notes')
                .insert({ lead_id: newLead.id, content: notes });
    
            if (noteError) {
                console.error("Could not add note to historical lead:", noteError.message);
            }
        }
    
        const { data: finalLead, error: fetchError } = await supabase
            .from('leads')
            .select('*, notes(*), appointments(*)')
            .eq('id', newLead.id)
            .single();
    
        if (fetchError) throw new Error(fetchError.message);
    
        return finalLead as Lead;
    }

    static async updateHistoricalLead(
        leadId: string,
        updates: {
            service: string;
            value: number;
            date: string; // YYYY-MM-DD
            notes?: string;
        },
        existingNoteId?: string
    ): Promise<Lead> {
        const { service, value, date, notes } = updates;
    
        const leadUpdates = {
            service,
            value,
            created_at: new Date(date).toISOString(),
        };
    
        const { data: updatedLead, error: leadError } = await supabase
            .from('leads')
            .update(leadUpdates)
            .eq('id', leadId)
            .select()
            .single();
        
        if (leadError) throw new Error(leadError.message);
    
        if (notes !== undefined) {
            if (notes.trim() !== '') { 
                if (existingNoteId) {
                    const { error: noteError } = await supabase
                        .from('notes')
                        .update({ content: notes })
                        .eq('id', existingNoteId);
                    if (noteError) console.warn("Could not update note:", noteError.message);
                } else {
                    const { error: noteError } = await supabase
                        .from('notes')
                        .insert({ lead_id: leadId, content: notes });
                    if (noteError) console.warn("Could not add note:", noteError.message);
                }
            } else if (existingNoteId) {
                const { error: noteError } = await supabase
                    .from('notes')
                    .delete()
                    .eq('id', existingNoteId);
                if (noteError) console.warn("Could not delete note:", noteError.message);
            }
        }
    
        const { data: finalLead, error: fetchError } = await supabase
            .from('leads')
            .select('*, notes(*), appointments(*)')
            .eq('id', updatedLead.id)
            .single();
    
        if (fetchError) throw new Error(fetchError.message);
    
        return finalLead as Lead;
    }

    static async updateLead(clientId: string, leadId: string, updates: Partial<Lead>): Promise<Lead> {
        const { data, error } = await supabase.from('leads').update(updates).eq('id', leadId).select('*, notes(*), appointments(*)').single();
        if (error) throw new Error(error.message);
        return data as Lead;
    }

    static async getLeadById(leadId: string): Promise<Lead | null> {
        const { data, error } = await supabase
            .from('leads')
            .select('*, notes(*), appointments(*)')
            .eq('id', leadId)
            .single();
        if (error) {
            console.error(`Error fetching lead with id ${leadId}:`, error);
            return null;
        }
        return data as Lead;
    }

    static async deleteLead(clientId: string, leadId: string): Promise<void> {
        const { error } = await supabase.from('leads').delete().eq('id', leadId);
        if (error) throw new Error(error.message);
    }

    static async deleteMultipleLeads(leadsToDelete: {clientId: string, leadId: string}[]): Promise<void> {
        const leadIds = leadsToDelete.map(l => l.leadId);
        const { error } = await supabase.from('leads').delete().in('id', leadIds);
        if (error) throw new Error(error.message);
    }
    
    static async addNoteToLead(clientId: string, leadId: string, noteContent: string): Promise<Lead> {
        const { error } = await supabase.from('notes').insert({ lead_id: leadId, content: noteContent });
        if (error) throw new Error(error.message);
        
        const { data: updatedLeadData, error: leadError } = await supabase
            .from('leads')
            .select('*, notes(*), appointments(*)')
            .eq('id', leadId)
            .single();
        if(leadError) throw new Error(leadError.message);
        
        return updatedLeadData as Lead;
    }

    static async updateNote(noteId: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('notes')
            .update({ content })
            .eq('id', noteId);
        if (error) throw new Error(error.message);
    }

    static async deleteNote(noteId: string): Promise<void> {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);
        if (error) throw new Error(error.message);
    }

    static async getUserById(userId: string): Promise<User | null> {
        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileError) return null;

        const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError || !authUser) return profile as User; // Return partial data if auth fails

        return { ...profile, email: authUser.email } as User;
    }

    static async updateUser(userId: string, updates: Partial<Pick<User, 'username' | 'email' | 'phone'>>): Promise<User> {
        if (updates.username) {
             const { data: existing, error } = await supabase.from('profiles').select('id').eq('username', updates.username).not('id', 'eq', userId).single();
             if(existing) throw new Error('Username already exists.');
        }

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);
        
        // Cannot update password from client-side code securely.
        // Users should use the "Forgot Password" flow provided by Supabase Auth.
        // Cannot update email directly without verification.
        return updatedProfile as User;
    }
    
    static async updateUserStatus(userId: string, status: User['status']): Promise<User> {
        const { data, error } = await supabase.from('profiles').update({ status }).eq('id', userId).select().single();
        if(error) throw new Error(error.message);
        return data as User;
    }

    // --- Ad Spend Methods ---
    static async addAdSpend(clientId: string, spendData: Omit<AdSpend, 'id' | 'client_id' | 'created_at'>): Promise<AdSpend> {
        const { data, error } = await supabase
            .from('ad_spends')
            .insert({ client_id: clientId, ...spendData })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as AdSpend;
    }

    static async updateAdSpend(clientId: string, spendId: string, updates: Partial<Omit<AdSpend, 'id'>>): Promise<AdSpend> {
        const { data, error } = await supabase.from('ad_spends').update(updates).eq('id', spendId).select().single();
        if(error) throw new Error(error.message);
        return data as AdSpend;
    }

    static async deleteAdSpend(clientId: string, spendId: string): Promise<void> {
        const { error } = await supabase.from('ad_spends').delete().eq('id', spendId);
        if(error) throw new Error(error.message);
    }

    static async deleteMultipleAdSpends(clientId: string, spendIds: string[]): Promise<void> {
        if (spendIds.length === 0) return;
        const { error } = await supabase.from('ad_spends').delete().in('id', spendIds);
        if (error) throw new Error(error.message);
    }

    // --- Saved Form Methods ---
    static async getForms(): Promise<SavedForm[]> {
        const { data, error } = await supabase.from('saved_forms').select('*');
        if (error) throw new Error(error.message);
        return data as SavedForm[];
    }

    static async saveForm(form: Omit<SavedForm, 'id' | 'created_at'>): Promise<SavedForm> {
        const { data, error } = await supabase
            .from('saved_forms')
            .insert(form)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as SavedForm;
    }

    static async updateForm(formId: string, updates: Partial<Omit<SavedForm, 'id' | 'created_at'>>): Promise<SavedForm> {
        const { data, error } = await supabase
            .from('saved_forms')
            .update(updates)
            .eq('id', formId)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as SavedForm;
    }

    static async deleteForm(formId: string): Promise<void> {
        const { error } = await supabase.from('saved_forms').delete().eq('id', formId);
        if (error) throw new Error(error.message);
    }

    // --- Notification Methods ---
    static async getNotificationsForUser(userId: string, limit?: number): Promise<Notification[]> {
        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw new Error(error.message);
        return data as Notification[];
    }

    static async markNotificationAsRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);
        
        if (error) throw new Error(error.message);
    }

    static async markAllNotificationsAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) throw new Error(error.message);
    }

    static async sendCustomNotification(userIds: string[], title: string, message: string): Promise<void> {
        if (!userIds || userIds.length === 0 || !message.trim() || !title.trim()) {
            throw new Error("User IDs, title, and message are required.");
        }

        const notificationsToInsert = userIds.map(userId => ({
            user_id: userId,
            title: title.trim(),
            message: message.trim(),
            read: false,
        }));

        const { error } = await supabase.from('notifications').insert(notificationsToInsert);
        if (error) {
            throw new Error(error.message);
        }
    }
    
    static async getSentNotifications(): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .is('lead_id', null)
            .not('title', 'is', null)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        const grouped = new Map<string, Notification>();
        const notifications = data || [];

        for (const notification of notifications) {
            const date = new Date(notification.created_at);
            const timeKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}-${date.getUTCMinutes()}`;
            const groupKey = `${notification.title}|${notification.message}|${timeKey}`;
    
            if (!grouped.has(groupKey)) {
                grouped.set(groupKey, notification);
            }
        }
        
        return Array.from(grouped.values());
    }

    static async updateSentNotification(originalNotification: Notification, newTitle: string, newMessage: string): Promise<void> {
        const { title, message, created_at } = originalNotification;
    
        const date = new Date(created_at);
        const startTime = new Date(date.getTime());
        startTime.setUTCSeconds(0, 0);
        const endTime = new Date(date.getTime());
        endTime.setUTCSeconds(59, 999);
    
        const { data: originalBatch, error: fetchError } = await supabase
            .from('notifications')
            .select('user_id')
            .is('lead_id', null)
            .eq('title', title)
            .eq('message', message)
            .gte('created_at', startTime.toISOString())
            .lte('created_at', endTime.toISOString());
    
        if (fetchError) {
            throw new Error(`Could not retrieve original notifications: ${fetchError.message}`);
        }
    
        if (!originalBatch || originalBatch.length === 0) {
            console.warn("No notifications found for the group to update.");
            return;
        }
    
        const recipientUserIds = [...new Set(originalBatch.map(n => n.user_id))];
    
        const { error: deleteError } = await supabase
            .from('notifications')
            .delete()
            .is('lead_id', null)
            .eq('title', title)
            .eq('message', message)
            .gte('created_at', startTime.toISOString())
            .lte('created_at', endTime.toISOString());
    
        if (deleteError) {
            throw new Error(`Could not delete original notifications: ${deleteError.message}`);
        }
    
        if (recipientUserIds.length > 0) {
            const notificationsToInsert = recipientUserIds.map(userId => ({
                user_id: userId,
                title: newTitle.trim(),
                message: newMessage.trim(),
                read: false,
            }));
            
            const { error: insertError } = await supabase.from('notifications').insert(notificationsToInsert);
            if (insertError) {
                throw new Error(`Could not resend new notifications: ${insertError.message}`);
            }
        }
    }

    static async deleteSentNotification(notificationToDelete: Notification): Promise<void> {
        const { title, message, created_at } = notificationToDelete;
    
        const date = new Date(created_at);
        const startTime = new Date(date.getTime());
        startTime.setUTCSeconds(0, 0);
        const endTime = new Date(date.getTime());
        endTime.setUTCSeconds(59, 999);

        const { error } = await supabase
            .from('notifications')
            .delete()
            .is('lead_id', null)
            .eq('title', title)
            .eq('message', message)
            .gte('created_at', startTime.toISOString())
            .lte('created_at', endTime.toISOString());

        if (error) {
            throw new Error(error.message);
        }
    }

    // --- MWS Revenue Methods ---
    static async getMwsMonthlyRevenues(clientId?: string): Promise<MwsMonthlyRevenue[]> {
        let query = supabase.from('mws_monthly_revenue').select('*');
        if (clientId) {
            query = query.eq('client_id', clientId);
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data as MwsMonthlyRevenue[];
    }

    static async upsertMwsRevenue(revenueData: Omit<MwsMonthlyRevenue, 'id' | 'created_at' | 'updated_at'>): Promise<MwsMonthlyRevenue> {
        const { data, error } = await supabase
            .from('mws_monthly_revenue')
            .upsert(revenueData, { onConflict: 'client_id, month' })
            .select()
            .single();
        
        if (error) throw new Error(error.message);
        return data as MwsMonthlyRevenue;
    }
    
    // --- Quote Methods ---
    static async getQuotesForLead(leadId: string): Promise<Quote[]> {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching quotes for lead:", error.message);
            return [];
        }
        return data as Quote[];
    }
    
    static async getAllQuotes(): Promise<QuoteWithDetails[]> {
        const { data, error } = await supabase.rpc('get_all_quotes_with_details');

        if (error) {
            console.error("Error fetching all quotes via RPC:", error);
            throw new Error(error.message);
        }
        return (data || []) as QuoteWithDetails[];
    }

    static async saveQuote(quoteData: Omit<Quote, 'id' | 'created_at' | 'status'>): Promise<Quote> {
        const { data, error } = await supabase.rpc('create_quote', {
            quote_data: quoteData
        });
        
        if (error) {
            console.error('RPC create_quote error:', JSON.stringify(error, null, 2));
            throw new Error(`Errore RPC: ${error.message}. Dettagli: ${error.details || 'N/D'}`);
        }

        return data[0] as Quote;
    }

    static async updateQuote(quoteId: string, quoteData: Partial<Omit<Quote, 'id' | 'created_at'>>): Promise<Quote> {
        const { data, error } = await supabase
            .from('quotes')
            .update(quoteData)
            .eq('id', quoteId)
            .select()
            .single();
        
        if (error) {
            console.error('Update quote error:', JSON.stringify(error, null, 2));
            throw new Error(`Errore: ${error.message}.`);
        }

        return data as Quote;
    }

    static async updateQuoteStatus(quoteId: string, status: Quote['status']): Promise<void> {
        const { error } = await supabase
            .from('quotes')
            .update({ status: status })
            .eq('id', quoteId);
        
        if (error) {
            console.error('Update quote status error:', JSON.stringify(error, null, 2));
            throw new Error(`Failed to update quote status: ${error.message}`);
        }
        // Webhook logic now needs to be handled by a Supabase Edge Function triggered by the update.
        // Client-side webhook sending after this is not secure/reliable for admin actions.
    }

    static async sendQuoteByWebhook(quoteId: string): Promise<void> {
        // This logic should ideally be a server-side Edge Function for security.
        // For this context, we will perform it client-side but it's not recommended for production.
        
        // Fetch raw quote data to include all columns, including custom ones like 'items_object'.
        const { data: rawQuote, error: quoteError } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single();

        if (quoteError) throw new Error(quoteError.message);
        if (!rawQuote) throw new Error('Impossibile trovare il preventivo.');
        
        // Fetch associated lead data to include in the payload.
        const lead = await ApiService.getLeadById(rawQuote.lead_id);
        if (!lead) throw new Error('Impossibile trovare il lead associato al preventivo.');

        const { data: client, error: clientError } = await supabase.from('clients').select('quote_webhook_url').eq('id', rawQuote.client_id).single();
        if (clientError || !client || !client.quote_webhook_url) throw new Error("URL webhook non configurato per questo cliente.");

        // Transform items object to array if necessary for easier processing in webhooks
        // This fixes the issue where items arrive as an object with keys in Make.com
        let itemsForPayload = rawQuote.items;
        if (itemsForPayload && typeof itemsForPayload === 'object' && !Array.isArray(itemsForPayload)) {
            itemsForPayload = Object.values(itemsForPayload);
        }

        // Construct the payload with both quote and lead data.
        const payload = {
            event: 'quote_sent_by_email',
            quote: {
                ...rawQuote,
                items: itemsForPayload
            },
            lead_data: lead.data
        };

        const response = await fetch(client.quote_webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Il server webhook ha risposto con un errore: ${response.status} - ${errorText}`);
        }
        
        // Cast to Quote type for status check
        const quote = rawQuote as Quote;
        if (quote.status !== 'accepted') {
            await this.updateQuoteStatus(quoteId, 'sent');
        }
    }

    static async deleteQuote(quoteId: string): Promise<void> {
        const { error } = await supabase.from('quotes').delete().eq('id', quoteId);

        if (error) {
            console.error('Delete quote error:', JSON.stringify(error, null, 2));
            throw new Error(`Errore: ${error.message}.`);
        }
    }

    static async getQuoteById(quoteId: string): Promise<Quote> {
        const { data, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single();
        if (error) throw new Error(error.message);
        return data as Quote;
    }

    // --- Appointment Methods ---
    static async addAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at'>): Promise<Lead> {
        const { error: appointmentError } = await supabase
            .from('appointments')
            .insert(appointmentData);
        
        if (appointmentError) throw new Error(appointmentError.message);
    
        const { data: updatedLead, error: leadError } = await supabase
            .from('leads')
            .select('*, notes(*), appointments(*)')
            .eq('id', appointmentData.lead_id)
            .single();
        
        if (leadError) throw new Error(leadError.message);
    
        return updatedLead as Lead;
    }

    static async addGeneralAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'lead_id' | 'client_id'>): Promise<void> {
        const { error } = await supabase
            .from('appointments')
            .insert(appointmentData);

        if (error) throw new Error(error.message);
    }
    
    static async updateAppointment(appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'created_at'>>): Promise<void> {
        const { error } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', appointmentId);

        if (error) throw new Error(error.message);
    }

    static async deleteAppointment(appointmentId: string): Promise<void> {
        const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
        if (error) throw new Error(error.message);
    }

    static async getAppointmentsForCalendar(): Promise<CalendarAppointment[]> {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                leads (*, notes(*), quotes(*)),
                clients (name, user_id)
            `)
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false });

        if (error) {
            console.error("Error fetching appointments for calendar:", error);
            throw new Error(error.message);
        }
        return data as CalendarAppointment[];
    }
}