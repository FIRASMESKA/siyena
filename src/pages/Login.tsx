import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import "./Login.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate("/dashboard");
      }
    } else {
      const { error } = await signUp(email, password, nom);
      if (error) {
        setError(error);
      } else {
        setSuccessMessage("Compte créé ! Un email de confirmation a été envoyé à " + email + ". Vérifiez votre boîte de réception.");
      }
    }

    setLoading(false);
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMessage("");
    setEmail("");
    setPassword("");
    setNom("");
  };

  return (
    <div className="login-page">
      {/* Header Logo */}
      <div className="header-logo">
        <img
          src="/cims.png"
          alt="CIMS Logo"
          className="cims-logo"
        />
        <img
          src="/siyena.png"
          alt="Siyena Logo"
          className="siyena-header-logo"
        />
        <div className="logo-text">
          <h3>Centre Informatique</h3>
          <p>du Ministère de la Santé</p>
        </div>
      </div>

      {/* Main Container */}
      <div className={`auth-container ${!isLogin ? "sign-up-mode" : ""}`}>
        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-header">
              <h1>Connexion</h1>
              <p>Connectez-vous à votre espace technicien</p>
            </div>

            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                minLength={6}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                {error}
              </motion.p>
            )}

            {successMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="success-message"
              >
                {successMessage}
              </motion.p>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spinner" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-header">
              <h1>Créer un compte</h1>
              <p>Inscrivez-vous en tant que technicien</p>
            </div>

            <div className="form-group">
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom complet"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                minLength={6}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-message"
              >
                {error}
              </motion.p>
            )}

            {successMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="success-message"
              >
                {successMessage}
              </motion.p>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spinner" />
                  Inscription...
                </>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Bienvenue !</h1>
              <p>Vous avez déjà un compte ? Connectez-vous pour accéder à votre espace.</p>
              <button className="overlay-button" onClick={handleToggle}>
                Se connecter
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Bienvenue !</h1>
              <p>Vous êtes nouveau ? Créez un compte pour accéder à votre espace technicien.</p>
              <button className="overlay-button" onClick={handleToggle}>
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <p>© {new Date().getFullYear()} CIMS — Siyena</p>
      </footer>
    </div>
  );
};

export default Login;
