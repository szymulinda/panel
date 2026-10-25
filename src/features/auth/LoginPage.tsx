import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const isGuest = searchParams.get("guest");
    if (isGuest === "true") {
      handleGuestLogin();
    }
  }, [searchParams]);

  const handleGuestLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await login("gosc@szymonjurkun.pl", "Start7022!");
      toast.success("Zalogowano w trybie demo!");
      navigate("/");
    } catch (error: any) {
      toast.error("Wystąpił problem z logowaniem gościa.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || loading) return;

    setLoading(true);

    try {
      await login(email.trim(), password);
      toast.success("Zalogowano pomyślnie!");
      navigate("/");
    } catch (error: any) {
      toast.error("Błędny e-mail lub hasło.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10 px-6"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="text-primary" size={22} />
          </motion.div>
          <h1 className="font-heading text-4xl text-heading mb-2">Witaj ponownie.</h1>
          <p className="text-body">Zaloguj się do swojego panelu klienta.</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-widest mb-2">
                Adres E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="klient@firma.pl"
                  required
                  disabled={loading}
                  className="w-full bg-background border border-border rounded-lg pl-4 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-widest mb-2">
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-background border border-border rounded-lg pl-4 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:brightness-110 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Logowanie...
                </>
              ) : (
                <>
                  Zaloguj się
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
              LUB
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-transparent border border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Ładowanie...
              </>
            ) : (
              <>
                <Eye size={16} />
                Sprawdź jako Gość (Demo)
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Twoje dane są bezpiecznie przechowywane i szyfrowane.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;