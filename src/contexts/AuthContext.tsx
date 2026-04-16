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
        emailRedirectTo: `${window.location.origin}/confirm-email`,
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
  <div style="margin:0; padding:0; background:#f8fafc;">
    <div style="max-width:520px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08); font-family:Inter, Arial, sans-serif;">
      
      <!-- HEADER -->
      <div style="background:linear-gradient(135deg,#f97316,#fb923c); padding:28px 24px; text-align:center;">
        <img src="${window.location.origin}/cims.png" alt="CIMS" style="height:32px; margin-bottom:12px;" />
        <div>
          <img src="${window.location.origin}/siyena.png" alt="SIYENA" style="height:36px;" />
        </div>
        <p style="color:rgba(255,255,255,0.85); font-size:13px; margin-top:8px;">
          Plateforme de gestion technique
        </p>
      </div>

      <!-- CONTENT -->
      <div style="padding:32px 28px;">
        
        <h2 style="font-size:22px; color:#0f172a; margin-bottom:12px;">
          Bienvenue, ${nom} 👋
        </h2>

        <p style="color:#475569; font-size:15px; line-height:1.6; margin-bottom:24px;">
          Merci de vous être inscrit sur <strong>SIYENA</strong>.
          Pour activer votre compte et accéder à votre espace technicien,
          veuillez confirmer votre adresse email.
        </p>

        <!-- CTA BUTTON -->
        <div style="text-align:center; margin:30px 0;">
          <a href="${confirmUrl}" 
             style="
              display:inline-block;
              background:linear-gradient(135deg,#f97316,#ea580c);
              color:white;
              padding:14px 34px;
              border-radius:10px;
              font-size:15px;
              font-weight:600;
              text-decoration:none;
              box-shadow:0 6px 18px rgba(249,115,22,0.3);
             ">
            Confirmer mon email
          </a>
        </div>

        <!-- ALT LINK -->
        <p style="color:#94a3b8; font-size:13px; line-height:1.5;">
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
        </p>
        <p style="word-break:break-all; font-size:12px; color:#64748b;">
          ${confirmUrl}
        </p>

        <p style="color:#94a3b8; font-size:13px; margin-top:24px;">
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
        </p>

      </div>

      <!-- FOOTER -->
      <div style="background:#f1f5f9; padding:20px; text-align:center;">
        <p style="font-size:12px; color:#64748b; margin-bottom:6px;">
          © ${new Date().getFullYear()} CIMS • SIYENA
        </p>
        <p style="font-size:11px; color:#94a3b8;">
          Tous droits réservés
        </p>
      </div>

    </div>
  </div>
`
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
