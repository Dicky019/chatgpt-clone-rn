import { supabase } from "@/utils/supabase";
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  OAuthResponse,
  PostgrestSingleResponse,
  Provider,
  Session,
} from "@supabase/supabase-js";
import {
  useContext,
  useState,
  useEffect,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";
import { Alert } from "react-native";

interface User {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
}

// create a context for authentication
interface AuthContextProps {
  session: Session | null | undefined;
  user: User | null | undefined;
  signOut: () => Promise<{
    error: AuthError | null;
  }>;
  signInEmail: (
    email: string,
    password: string
  ) => Promise<AuthTokenResponsePassword>;
  signInWithOAuth: (provider: Provider) => Promise<OAuthResponse>;
  signUpEmail: (email: string, password: string) => Promise<AuthResponse>;

  setUser: (name: string, avatarUrl: string) => void;
}

const supabaseAuthService = {
  signOut: () => supabase.auth.signOut(),
  signInWithOAuth: (provider: Provider) =>
    supabase.auth.signInWithOAuth({
      provider: provider,
    }),
  signInEmail: (email: string, password: string) =>
    supabase.auth.signInWithPassword({
      email: email,
      password: password,
    }),
  signUpEmail: (email: string, password: string) =>
    supabase.auth.signUp({
      email: email,
      password: password,
    }),
  setUser: (name: string, avatarUrl: string) => {
    console.log("🚀 ~ avatarUrl:", avatarUrl);
    console.log("🚀 ~ name:", name);
  },
};

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  ...supabaseAuthService,
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User>();
  const [session, setSession] = useState<Session | null>();
  const [loading, setLoading] = useState(true);

  async function getProfile(email: string, id: string) {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("user")
        .select(`name, image_url`)
        .eq("id", id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUser({
          email,
          id,
          imageUrl: data.image_url,
          name: data.name,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (_event === "SIGNED_OUT") {
          setSession(undefined);
          setUser(undefined);
          return;
        }

        if (session) {
          setSession(session);
          const { email, id } = session.user;

          setUser({
            email: email ?? "-",
            id,
            imageUrl: "https://galaxies.dev/img/meerkat_2.jpg",
            name: "-",
          });

          await getProfile(email ?? "-", id);
        }
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    ...supabaseAuthService,
    session,
    user,
    setUser: (name: string, avatarUrl: string) => {
      if (user) {
        setUser({
          ...user,
          name,
          imageUrl: avatarUrl,
        });
      }
    },
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
