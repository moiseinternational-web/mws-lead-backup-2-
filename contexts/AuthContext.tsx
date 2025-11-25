import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '../types';
import type { Session, User as AuthUser } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    login: (email: string, pass: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, pass: string) => Promise<{ error: Error | null }>;
    logout: () => void;
    isLoading: boolean;
    updateUserContext: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    }, []);

    const fetchAndSetUserProfile = useCallback(async (authUser: AuthUser) => {
        
        const processProfile = async (profile: any) => {
            if (profile.status === 'suspended') {
                console.warn("User is suspended. Logging out.");
                await logout();
                throw new Error("This account has been suspended.");
            }

            const fullUser: User = {
                id: authUser.id,
                email: authUser.email,
                created_at: authUser.created_at,
                username: profile.username,
                role: profile.role,
                status: profile.status,
                phone: profile.phone,
            };
            setUser(fullUser);
        };
        
        // Use .select().limit(1) to avoid an error when the profile is not yet created (race condition on signup).
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .limit(1);

        if (error) {
            console.error("Error fetching user profile:", error.message, error);
            return;
        }
        
        const profile = profiles?.[0];

        if (profile) {
            await processProfile(profile);
        } else {
             console.warn(`Profile not found for user: ${authUser.id}. This can happen on signup. Retrying...`);
             // Retry after a delay to allow the profile creation trigger to complete.
             await new Promise(res => setTimeout(res, 1000));
             const { data: retryProfiles, error: retryError } = await supabase.from('profiles').select('*').eq('id', authUser.id).limit(1);

             if (retryError) {
                console.error("Error on profile fetch retry:", retryError.message);
                return;
             }
             
             const retryProfile = retryProfiles?.[0];
             if (retryProfile) {
                await processProfile(retryProfile);
             } else {
                 console.error(`Profile for user ${authUser.id} not found after retry. Logging out to prevent login loop.`);
                 await logout();
             }
        }
    }, [logout]);
    
    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Error getting initial session:", error.message);
                setIsLoading(false);
                return;
            }
            
            setSession(session);
            if (session?.user) {
                await fetchAndSetUserProfile(session.user);
            }
            setIsLoading(false);
        };

        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                // The fetch function now includes retry logic, so a timeout here is not needed.
                fetchAndSetUserProfile(session.user);
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [fetchAndSetUserProfile]);

    const login = async (email: string, pass: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (!error && data.user) {
            try {
                // Although onAuthStateChange will fire, calling this here ensures the profile
                // is loaded before the login function resolves, and allows catching profile-related errors.
                await fetchAndSetUserProfile(data.user);
            } catch (profileError: any) {
                return { error: profileError };
            }
        }
        return { error: error ? new Error(error.message) : null };
    };
    
    const signUp = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signUp({ 
            email, 
            password: pass 
        });
        
        return { error: error ? new Error(error.message) : null };
    };

    const updateUserContext = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, login, signUp, logout, isLoading, updateUserContext }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};