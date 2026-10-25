import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  ClipboardList 
} from "lucide-react";
import { toast } from "sonner";

const visualSteps = [
  { id: 1, title: "Brief Projektowy", icon: ClipboardList },
  { id: 2, title: "Umowa", icon: FileText },
  { id: 3, title: "Rozliczenie", icon: CreditCard },
];

const slideVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
};

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState({
    cel: "",
    zakladki: "",
    estetyka: "",
    inspiracje1: "",
    inspiracje2: "",
    dysk: "",
  });
  
  const { completeOnboarding, getClientForCurrentUser } = useAuth();
  const navigate = useNavigate();
  const client = getClientForCurrentUser();

  const currentVisualStep = step <= 3 ? 1 : step - 2;

  const handleFinish = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await completeOnboarding(brief, client?.name || "");
      toast.success("Onboarding zakończony! Witamy w panelu.");
      navigate("/");
    } catch (error: any) {
      toast.error("Wystąpił błąd podczas zapisywania danych.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-background relative overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="flex justify-between mb-14 overflow-x-auto pb-4 hide-scrollbar">
          {visualSteps.map((s) => {
            const Icon = s.icon;
            const isActive = currentVisualStep >= s.id;
            const isCompleted = currentVisualStep > s.id;

            return (
              <div key={s.id} className="flex items-center gap-3 min-w-max">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <span
                  className={`font-heading font-bold text-sm hidden sm:block ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
                {s.id < 3 && <div className="w-6 sm:w-10 h-[1px] bg-border mx-2" />}
              </div>
            );
          })}
        </div>

        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Wróć
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">Krok 1/3</span>
                <h2 className="text-3xl font-heading text-heading mb-2">Cele i odbiorcy</h2>
                <p className="text-sm text-muted-foreground mb-8">Opisz główny cel strony, aby projekt realizował Twoje założenia biznesowe.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Cel strony i grupa docelowa
                </label>
                <textarea
                  value={brief.cel}
                  onChange={(e) => setBrief({ ...brief, cel: e.target.value })}
                  placeholder="np. Chcę pozyskiwać kontakty do firm budowlanych z mojej okolicy..."
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 h-32 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!brief.cel.trim()}
                className="bg-primary text-primary-foreground hover:brightness-110 px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Przejdź do estetyki
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">Krok 2/3</span>
                <h2 className="text-3xl font-heading text-heading mb-2">Estetyka</h2>
                <p className="text-sm text-muted-foreground mb-8">Pokaż mi, co Ci się podoba, abym trafił w Twój gust.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Klimat wizualny
                </label>
                <input
                  value={brief.estetyka}
                  onChange={(e) => setBrief({ ...brief, estetyka: e.target.value })}
                  placeholder="np. Minimalistyczny, ciemny motyw, dużo zdjęć..."
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Inspiracja #1 (Link)
                  </label>
                  <input
                    value={brief.inspiracje1}
                    onChange={(e) => setBrief({ ...brief, inspiracje1: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Inspiracja #2 (Link)
                  </label>
                  <input
                    value={brief.inspiracje2}
                    onChange={(e) => setBrief({ ...brief, inspiracje2: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                className="bg-primary text-primary-foreground hover:brightness-110 px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Przejdź do technologii
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">Krok 3/3</span>
                <h2 className="text-3xl font-heading text-heading mb-2">Wymagania techniczne</h2>
                <p className="text-sm text-muted-foreground mb-8">Ustalmy strukturę i zbierzmy materiały startowe.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Wymagane zakładki i funkcjonalności
                </label>
                <textarea
                  value={brief.zakladki}
                  onChange={(e) => setBrief({ ...brief, zakladki: e.target.value })}
                  placeholder="np. Home, O nas, Portfolio, formularz wyceny..."
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 h-24 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Link do dysku z materiałami (logo, teksty)
                </label>
                <input
                  value={brief.dysk}
                  onChange={(e) => setBrief({ ...brief, dysk: e.target.value })}
                  placeholder="np. https://drive.google.com/..."
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <button
                onClick={() => setStep(4)}
                className="bg-primary text-primary-foreground hover:brightness-110 px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Zapisz brief i przejdź do umowy
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="s4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-heading text-heading">Umowa o świadczenie usług</h2>
              <div className="bg-card border border-border rounded-lg p-6 h-[300px] overflow-y-auto text-sm text-body leading-relaxed space-y-3">
                <p>Niniejsza umowa zostaje zawarta pomiędzy Wykonawcą (freelancerem) a Klientem w celu realizacji projektu strony internetowej.</p>
                <p><strong className="text-foreground">§1. Przedmiot umowy.</strong> Wykonawca zobowiązuje się do zaprojektowania i wdrożenia serwisu internetowego zgodnie z wymaganiami określonymi w briefie projektowym.</p>
                <p><strong className="text-foreground">§2. Terminy.</strong> Realizacja projektu rozpocznie się po zakończeniu procedury onboardingowej i wpłynięciu zaliczki na konto Wykonawcy.</p>
                <p><strong className="text-foreground">§3. Wynagrodzenie.</strong> Wynagrodzenie za wykonanie przedmiotu umowy zostanie ustalone indywidualnie i płatne na podstawie wystawionej faktury VAT.</p>
                <p><strong className="text-foreground">§4. Prawa autorskie.</strong> Po uregulowaniu pełnej płatności, wszystkie prawa majątkowe do projektu przechodzą na Klienta.</p>
                <p><strong className="text-foreground">§5. Postanowienia końcowe.</strong> Wszelkie zmiany umowy wymagają formy pisemnej pod rygorem nieważności.</p>
              </div>
              <button
                onClick={() => setStep(5)}
                className="bg-primary text-primary-foreground hover:brightness-110 px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                Przejdź dalej
              </button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="s5"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-heading text-heading">Rozliczenie</h2>
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="p-4 bg-background rounded-lg border border-border text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-3">Dane do przelewu</p>
                  <p className="text-xl sm:text-2xl font-mono text-foreground tracking-wider font-bold">88 1020 4432 0000 1234 5678 9012</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Płatność za projekt następuje dopiero po jego ukończeniu i obustronnej akceptacji. Powyżej znajdują się dane do przelewu, które przydadzą się na samym końcu naszej współpracy.
                </p>
              </div>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:brightness-110 px-8 py-4 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  "Zakończ i przejdź do panelu"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingWizard;