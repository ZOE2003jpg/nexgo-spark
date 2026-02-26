import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: { full_name: string; email: string; avatar_url: string | null } | null;
  role: string | null;
  walletBalance: number;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [role, setRole] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("full_name, email, avatar_url").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.rpc("get_user_role", { _user_id: userId });
    if (data) setRole(data);
  };

  const refreshWallet = async () => {
    if (!user) return;
    const { data } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single();
    if (data) setWalletBalance(data.balance);
  };

  const refreshProfile = async () => {
    if (!user) return;
    await Promise.all([fetchProfile(user.id), fetchRole(user.id), refreshWallet()]);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use setTimeout to avoid Supabase client deadlock
        setTimeout(async () => {
          await Promise.all([
            fetchProfile(session.user.id),
            fetchRole(session.user.id),
          ]);
          const { data } = await supabase.from("wallets").select("balance").eq("user_id", session.user.id).single();
          if (data) setWalletBalance(data.balance);
          setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
        setWalletBalance(0);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, walletBalance, loading, signUp, signIn, signOut, refreshWallet, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
