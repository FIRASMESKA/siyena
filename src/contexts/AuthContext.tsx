import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface TechnicienProfile {
  id: string;
  nom: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  technicien: TechnicienProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, nom: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [technicien, setTechnicien] = useState<TechnicienProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTechnicien = async (userId: string) => {
    const { data } = await supabase
      .from("techniciens")
      .select("id, nom, email")
      .eq("user_id", userId)
      .single();
    setTechnicien(data);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(() => fetchTechnicien(session.user.id), 0);
        } else {
          setTechnicien(null);
        }
        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTechnicien(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

   const signUp = async (email: string, password: string, nom: string) => {
     const { data, error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         data: { nom },
       },
     });
    if (error) return { error: error.message };

    // Send custom confirmation email via Gmail SMTP
    if (data.user && !data.session) {
      // User created but not confirmed — send confirmation email
      const confirmUrl = `${window.location.origin}/confirm-email?token_hash=${data.user.id}`;
      try {
        await supabase.functions.invoke("send-confirmation-email", {
          body: {
            to: email,
            subject: "SIYENA — Confirmez votre adresse email",
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="display: inline-block; background: #0F4C3A; color: white; width: 56px; height: 56px; border-radius: 16px; line-height: 56px; font-size: 24px;">🔧</div>
                  <h1 style="font-size: 28px; font-weight: 700; color: #0F172A; margin: 16px 0 4px;">SIYENA</h1>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">Module Technicien</p>
                </div>
                <h2 style="font-size: 20px; color: #0F172A; margin-bottom: 16px;">Bienvenue, ${nom} !</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                  Merci de vous être inscrit sur SIYENA. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${confirmUrl}" style="display: inline-block; background: #0F4C3A; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                    Confirmer mon email
                  </a>
                </div>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
                  Si vous n'avez pas créé de compte sur SIYENA, vous pouvez ignorer cet email.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px;" />
                <p style="color: #cbd5e1; font-size: 12px; text-align: center;">© 2026 SIYENA. Tous droits réservés.</p>
              </div>
            `,
          },
        });
      } catch (e) {
        console.error("Failed to send confirmation email:", e);
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setTechnicien(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, technicien, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
