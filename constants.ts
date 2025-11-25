import type { User, Client } from './types';

export const ADMIN_USER: User = {
    id: 'admin_01',
    username: 'moise',
    // FIX: Removed password property as it's not in the User type.
    role: 'admin',
    status: 'active',
};

const CLIENT_1_USER: User = { id: 'user_client_1', username: 'facche', role: 'client', email: 'facche@example.com', phone: '3331112233', status: 'active' };

const CLIENT_1: Client = {
    id: 'client_1',
    name: 'Facche',
    // FIX: Changed userId to user_id to match the Client type.
    user_id: CLIENT_1_USER.id,
    services: [
        {
            id: 'service_1_1',
            name: 'tagliando motore',
            fields: [
                { id: 'f1', name: 'nome', label: 'Nome', type: 'text', required: true },
                { id: 'f2', name: 'cognome', label: 'Cognome', type: 'text' },
                { id: 'f3', name: 'mail', label: 'Mail', type: 'email' },
                { id: 'f4', name: 'targa', label: 'Targa Veicolo', type: 'text' },
                { id: 'f5', name: 'modello', label: 'Modello Veicolo', type: 'text' },
            ]
        },
        {
            id: 'service_1_2',
            name: 'tagliando cambio',
            fields: [
                { id: 'f6', name: 'nome', label: 'Nome', type: 'text', required: true },
                { id: 'f7', name: 'cognome', label: 'Cognome', type: 'text' },
                { id: 'f8', name: 'targa', label: 'Targa Veicolo', type: 'text' }
            ]
        },
        {
            id: 'service_1_3',
            name: 'cambio gomme',
            fields: [
                { id: 'f9', name: 'nome', label: 'Nome', type: 'text', required: true },
                { id: 'f10', name: 'telefono', label: 'Telefono', type: 'tel' },
                { id: 'f11', name: 'dimensione_gomme', label: 'Dimensione Gomme', type: 'text' }
            ]
        }
    ],
    leads: [],
    adSpends: [],
};

export const INITIAL_CLIENTS = [
    { user: CLIENT_1_USER, client: CLIENT_1 },
];