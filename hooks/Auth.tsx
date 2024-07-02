import { supabase } from '@/utils/supabase';
import { AuthError, AuthResponse, AuthTokenResponsePassword, Session, User } from '@supabase/supabase-js';
import { useContext, useState, useEffect, createContext } from 'react';

// create a context for authentication
interface AuthContextProps {
    session: Session | null | undefined,
    user: User | null | undefined,
    signOut: () => Promise<{
        error: AuthError | null;
    }>,
    signInEmail: (email: string, password: string) => Promise<AuthTokenResponsePassword>,
    signUpEmail: (email: string, password: string) => Promise<AuthResponse>
}

const AuthContext = createContext<AuthContextProps>({
    session: null,
    user: null,
    signOut: () => supabase.auth.signOut(),
    signInEmail: (email: string, password: string) => supabase.auth.signInWithPassword({
        email: email,
        password: password,
    }),
    signUpEmail: (email: string, password: string) => supabase.auth.signUp({
        email: email,
        password: password,
    })
});

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<User>()
    const [session, setSession] = useState<Session | null>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setData = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            setSession(session)
            setUser(session?.user)
            setLoading(false);
        };

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("🚀 ~ const{data:listener}=supabase.auth.onAuthStateChange ~ session:", session?.user.id)
            setSession(session);
            setUser(session?.user)
            setLoading(false)
        });

        setData();

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
        signOut: () => supabase.auth.signOut(),
        signInEmail: (email: string, password: string) => supabase.auth.signInWithPassword({
            email: email,
            password: password,
        }),
        signUpEmail: (email: string, password: string) => supabase.auth.signUp({
            email: email,
            password: password,
        })
    };

    // use a provider to pass down the value
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// export the useAuth hook
export const useAuth = () => {
    return useContext(AuthContext);
};