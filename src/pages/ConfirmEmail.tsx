import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type ConfirmationState = "loading" | "success" | "error";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<ConfirmationState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get token from URL
        const token = searchParams.get("token_hash");

        if (!token) {
          setState("error");
          setMessage("Token de confirmation manquant.");
          return;
        }

        // Verify the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          setState("error");
          setMessage(error.message || "Erreur lors de la confirmation.");
          console.error("Verification error:", error);
        } else {
          setState("success");
          setMessage("Email confirmé avec succès ! Redirection en cours...");
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error("Confirmation error:", error);
        setState("error");
        setMessage("Une erreur est survenue lors de la confirmation.");
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block bg-green-50 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔧</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">SIYENA</h1>
            <p className="text-sm text-slate-600 mt-2">Module Technicien</p>
          </div>

          {/* Content based on state */}
          {state === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
              <h2 className="text-xl font-semibold text-slate-900">
                Confirmation en cours...
              </h2>
              <p className="text-slate-600">
                Veuillez patienter pendant que nous confirmons votre email.
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold text-slate-900">
                Email confirmé !
              </h2>
              <p className="text-slate-600">{message}</p>
              <div className="mt-6">
                <Button
                  onClick={() => navigate("/dashboard", { replace: true })}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Aller au tableau de bord
                </Button>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-slate-900">
                Erreur de confirmation
              </h2>
              <p className="text-slate-600">{message}</p>
              <div className="mt-6 space-y-2">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Retour à la connexion
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Accueil
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 SIYENA. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}

