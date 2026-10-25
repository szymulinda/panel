import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ExternalLink,
  Download,
  ChevronRight,
  LogOut,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const TIMELINE_STEPS = [
  "Formalności",
  "Briefing",
  "Programowanie",
  "Poprawki",
  "Uruchomienie",
];

const formatUrl = (url?: string) => {
  if (!url) return "#";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

const ClientDashboardPage = () => {
  const { currentUser, getClientForCurrentUser, updateBrief, logout, loading } = useAuth();
  const navigate = useNavigate();
  const client = getClientForCurrentUser();
  
  const [editingBrief, setEditingBrief] = useState(false);
  const [briefDraft, setBriefDraft] = useState(client?.brief);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (client?.brief && !editingBrief) {
      setBriefDraft(client.brief);
    }
  }, [client, editingBrief]);

  if (loading) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nie znaleziono Twojego projektu.</p>
          <button onClick={() => logout()} className="text-primary hover:underline text-sm">
            Wyloguj i spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  const currentStep = client.timelineStep;

  const handleSaveBrief = async () => {
    if (briefDraft) {
      setIsSaving(true);
      try {
        await updateBrief(briefDraft);
        setEditingBrief(false);
        toast.success("Brief zaktualizowany!");
      } catch (error) {
        toast.error("Wystąpił błąd przy zapisie.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-svh bg-background relative">
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <nav className="relative z-10 border-b border-border px-6 py-4 flex justify-between items-center">
        <h2 className="font-heading text-xl text-foreground tracking-tight">Portal Klienta</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground italic hidden sm:block">
            {currentUser?.email}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
            {currentUser?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors" title="Wyloguj się">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="relative z-10 p-6 lg:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <h1 className="text-3xl lg:text-4xl font-heading text-heading">
                Witaj, {currentUser?.name?.split(" ")[0] || "użytkowniku"}.
              </h1>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase">
                {currentStep === 4 ? "Zakończono" : "W trakcie realizacji"}
              </span>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">
                Oś czasu projektu
              </h3>
              
              <div className="overflow-x-auto pb-4 -mx-2 px-2 md:mx-0 md:px-0 md:pb-0 md:overflow-visible">
                <div className="relative flex justify-between min-w-[500px] md:min-w-0">
                  <div className="absolute top-4 left-0 w-full h-[2px] bg-border z-0" />
                  <div
                    className="absolute top-4 left-0 h-[2px] bg-primary z-0 transition-all duration-500"
                    style={{
                      width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                  {TIMELINE_STEPS.map((label, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                          i <= currentStep
                            ? "bg-background border-primary text-primary"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        {i < currentStep ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-tight text-center max-w-[72px] ${
                          i <= currentStep ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading text-lg text-heading">Materiały</h3>
                <ExternalLink size={16} className="text-muted-foreground" />
              </div>
              {client.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {client.deliverables.map((d, i) => (
                    <a
                      key={i}
                      href={formatUrl(d.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{d.label}</span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak materiałów do wyświetlenia.</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading text-lg text-heading">Dokumenty</h3>
                <Download size={16} className="text-muted-foreground" />
              </div>
              {client.documents.length > 0 ? (
                <div className="space-y-3">
                  {client.documents.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                    >
                      <span className="text-sm text-foreground">{d.name}</span>
                      <a 
                        href={d.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline text-xs font-bold uppercase"
                      >
                        Pobierz
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak dokumentów (faktury, umowy).</p>
              )}
            </div>
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4"
        >
          <div className="bg-card border border-border rounded-lg p-6 lg:sticky lg:top-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg text-heading">Twój Brief</h3>
              {!editingBrief ? (
                <button
                  onClick={() => {
                    setBriefDraft(client.brief);
                    setEditingBrief(true);
                  }}
                  className="text-xs text-primary font-bold hover:underline uppercase flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edytuj
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveBrief} 
                    disabled={isSaving}
                    className="text-xs text-primary font-bold hover:underline uppercase flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} 
                    Zapisz
                  </button>
                  <button 
                    onClick={() => setEditingBrief(false)} 
                    disabled={isSaving}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {client.brief ? (
              <div className="space-y-5">
                <BriefField
                  label="Cel projektu"
                  value={editingBrief ? briefDraft?.cel : client.brief.cel}
                  editing={editingBrief}
                  onChange={(v) => setBriefDraft((p) => p && { ...p, cel: v })}
                  textarea
                />
                <BriefField
                  label="Zakładki"
                  value={editingBrief ? briefDraft?.zakladki : client.brief.zakladki}
                  editing={editingBrief}
                  onChange={(v) => setBriefDraft((p) => p && { ...p, zakladki: v })}
                />
                <BriefField
                  label="Estetyka"
                  value={editingBrief ? briefDraft?.estetyka : client.brief.estetyka}
                  editing={editingBrief}
                  onChange={(v) => setBriefDraft((p) => p && { ...p, estetyka: v })}
                />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Inspiracje</p>
                  {editingBrief ? (
                    <div className="space-y-2">
                      <input
                        value={briefDraft?.inspiracje1 || ""}
                        onChange={(e) => setBriefDraft((p) => p && { ...p, inspiracje1: e.target.value })}
                        placeholder="Inspiracja #1 (Link)"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <input
                        value={briefDraft?.inspiracje2 || ""}
                        onChange={(e) => setBriefDraft((p) => p && { ...p, inspiracje2: e.target.value })}
                        placeholder="Inspiracja #2 (Link)"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                  ) : (
                    <ul className="text-sm text-primary space-y-1 truncate">
                      {client.brief.inspiracje1 && (
                        <li><a href={formatUrl(client.brief.inspiracje1)} target="_blank" rel="noopener noreferrer" className="hover:underline block truncate">{client.brief.inspiracje1}</a></li>
                      )}
                      {client.brief.inspiracje2 && (
                        <li><a href={formatUrl(client.brief.inspiracje2)} target="_blank" rel="noopener noreferrer" className="hover:underline block truncate">{client.brief.inspiracje2}</a></li>
                      )}
                      {!client.brief.inspiracje1 && !client.brief.inspiracje2 && (
                        <span className="text-foreground">—</span>
                      )}
                    </ul>
                  )}
                </div>
                {(client.brief.dysk || editingBrief) && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Materiały (Drive)</p>
                    {editingBrief ? (
                      <input
                        value={briefDraft?.dysk || ""}
                        onChange={(e) => setBriefDraft((p) => p && { ...p, dysk: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-foreground bg-background p-2 rounded-lg border border-border truncate">
                        <ExternalLink size={12} className="shrink-0 text-muted-foreground" />
                        <a href={formatUrl(client.brief.dysk)} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary transition-colors">
                          {client.brief.dysk}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nie przesłałeś jeszcze briefu.</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const BriefField = ({
  label,
  value,
  editing,
  onChange,
  textarea,
}: {
  label: string;
  value?: string;
  editing: boolean;
  onChange?: (v: string) => void;
  textarea?: boolean;
}) => (
  <div>
    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{label}</p>
    {editing ? (
      textarea ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none h-20"
        />
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      )
    ) : (
      <p className="text-sm text-foreground leading-relaxed">{value || "—"}</p>
    )}
  </div>
);

export default ClientDashboardPage;