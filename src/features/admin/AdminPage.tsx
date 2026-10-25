import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Plus,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Download,
  Upload,
  Save,
  LogOut,
  ChevronRight,
  Loader2,
  Trash2,
  Menu,
  X as CloseIcon,
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

const AdminPage = () => {
  const { clients, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"list-active" | "list-finished" | "detail" | "new">("list-active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeClients = clients.filter((c) => c.timelineStep < 4);
  const finishedClients = clients.filter((c) => c.timelineStep >= 4);
  const selectedClient = clients.find((c) => c.id === selectedId);

  if (loading) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-foreground mb-2">Brak dostępu</h1>
          <p className="text-muted-foreground mb-4">Ta strona jest dostępna tylko dla administratora.</p>
          <button onClick={() => navigate("/")} className="text-primary hover:underline text-sm">
            Wróć do strony głównej
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const NavigationMenu = () => (
    <>
      <h2 className="font-heading text-xl text-primary mb-8 hidden lg:block">Admin Panel</h2>
      <nav className="space-y-1">
        <button
          onClick={() => { setView("list-active"); setIsMobileMenuOpen(false); }}
          className={`w-full text-left p-3 rounded-lg font-semibold text-sm transition-colors ${
            view === "list-active" || (view === "detail" && (selectedClient?.timelineStep ?? 0) < 4)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          W trakcie ({activeClients.length})
        </button>
        <button
          onClick={() => { setView("list-finished"); setIsMobileMenuOpen(false); }}
          className={`w-full text-left p-3 rounded-lg font-semibold text-sm transition-colors ${
            view === "list-finished" || (view === "detail" && (selectedClient?.timelineStep ?? 0) >= 4)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Ukończone ({finishedClients.length})
        </button>
        <button
          onClick={() => { setView("new"); setIsMobileMenuOpen(false); }}
          className={`w-full text-left p-3 rounded-lg font-semibold text-sm transition-colors mt-4 ${
            view === "new"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Nowy klient
        </button>
      </nav>
      <div className="pt-4 border-t border-border mt-8">
        <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2 transition-colors">
          <LogOut size={14} /> Wyloguj się
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-svh bg-background flex flex-col lg:flex-row relative">
      <div className="lg:hidden border-b border-border p-4 flex justify-between items-center bg-background z-50 sticky top-0">
        <h2 className="font-heading text-xl text-primary">Admin Panel</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
          {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-[65px] bg-background z-40 border-b border-border p-6 shadow-xl overflow-y-auto"
          >
             <NavigationMenu />
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-64 border-r border-border p-6 hidden lg:block h-screen sticky top-0">
        <NavigationMenu />
      </aside>

      <main className="flex-1 p-4 lg:p-8 relative">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {view === "list-active" && (
              <ClientList
                key="list-active"
                title="Projekty w trakcie"
                clients={activeClients}
                onSelect={(id) => {
                  setSelectedId(id);
                  setView("detail");
                }}
                onNew={() => setView("new")}
              />
            )}
            {view === "list-finished" && (
              <ClientList
                key="list-finished"
                title="Ukończone projekty"
                clients={finishedClients}
                onSelect={(id) => {
                  setSelectedId(id);
                  setView("detail");
                }}
                onNew={() => setView("new")}
              />
            )}
            {view === "detail" && selectedId && (
              <ProjectDetail
                key="detail"
                clientId={selectedId}
                onBack={() => setView((selectedClient?.timelineStep ?? 0) >= 4 ? "list-finished" : "list-active")}
              />
            )}
            {view === "new" && (
              <NewClient
                key="new"
                onCreated={() => setView("list-active")}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const ClientList = ({
  clients,
  title,
  onSelect,
  onNew,
}: {
  clients: ReturnType<typeof useAuth>["clients"];
  title: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 lg:mb-10">
      <h1 className="text-2xl lg:text-3xl font-heading text-heading">{title}</h1>
      <button
        onClick={onNew}
        className="bg-primary text-primary-foreground hover:brightness-110 px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
      >
        <Plus size={18} /> Nowy Klient
      </button>
    </div>
    <div className="grid gap-3">
      {clients.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground">
          Brak projektów w tej zakładce.
        </div>
      ) : (
        clients.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="w-full bg-card border border-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between hover:border-primary/40 transition-all cursor-pointer group text-left gap-4 sm:gap-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border group-hover:border-primary/20 transition-colors shrink-0">
                <span className="text-xs font-bold text-muted-foreground">{(c.name || "K")[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{c.name || "Bez nazwy"}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 lg:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <div className="text-left sm:text-right flex-1 sm:flex-none">
                <p className="text-[10px] font-bold text-muted-foreground uppercase sm:hidden lg:block">Status</p>
                <p className="text-sm text-primary font-bold">
                  {TIMELINE_STEPS[c.timelineStep] || "Nowy"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  c.onboardingComplete
                    ? "bg-primary/10 border border-primary/20 text-primary"
                    : "bg-muted border border-border text-muted-foreground"
                }`}>
                  {c.onboardingComplete ? "Aktywny" : "Oczekuje"}
                </span>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  </motion.div>
);

const ProjectDetail = ({
  clientId,
  onBack,
}: {
  clientId: string;
  onBack: () => void;
}) => {
  const { getClientById, updateClientTimeline, addDeliverable, addDocument, deleteClient } = useAuth();
  const client = getClientById(clientId);
  
  const [newDelivLabel, setNewDelivLabel] = useState("");
  const [newDelivUrl, setNewDelivUrl] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!client) return null;

  const handleAddDeliverable = async () => {
    if (newDelivLabel && newDelivUrl) {
      setActionLoading(true);
      try {
        await addDeliverable(clientId, newDelivLabel, newDelivUrl);
        setNewDelivLabel("");
        setNewDelivUrl("");
        toast.success("Materiał dodany!");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddDocument = async () => {
    if (newDocName && selectedFile) {
      setActionLoading(true);
      try {
        await addDocument(clientId, newDocName, selectedFile);
        setNewDocName("");
        setSelectedFile(null);
        toast.success("Dokument został poprawnie wgrany!");
      } catch (err) {
        toast.error("Błąd podczas wgrywania dokumentu.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleTimelineUpdate = async (step: number, label: string) => {
    setActionLoading(true);
    try {
      await updateClientTimeline(clientId, step);
      toast.success(`Status zmieniony: ${label}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Czy na pewno chcesz usunąć ten projekt? Ta operacja jest nieodwracalna.")) {
      setActionLoading(true);
      try {
        await deleteClient(clientId);
        toast.success("Projekt został usunięty.");
        onBack();
      } catch (err) {
        toast.error("Wystąpił błąd podczas usuwania projektu.");
        setActionLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
        <ArrowLeft size={16} /> Powrót
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-2xl lg:text-3xl font-heading text-heading break-all">{client.name}</h1>
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase self-start sm:self-auto whitespace-nowrap">
            {TIMELINE_STEPS[client.timelineStep] || "Nowy"}
          </span>
        </div>
        <button
          onClick={handleDeleteProject}
          disabled={actionLoading}
          className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 bg-red-500/10 hover:bg-red-500/20 px-4 py-3 sm:py-2 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto mt-2 sm:mt-0"
        >
          <Trash2 size={16} />
          Usuń projekt
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Zmień status projektu
          </h3>
          <div className="space-y-2">
            {TIMELINE_STEPS.map((label, i) => (
              <button
                key={i}
                disabled={actionLoading}
                onClick={() => handleTimelineUpdate(i, label)}
                className={`w-full text-left p-3 rounded-lg border text-sm font-semibold flex items-center justify-between transition-all ${
                  client.timelineStep === i
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                } disabled:opacity-50`}
              >
                <span className="flex items-center gap-3">
                  {client.timelineStep > i ? (
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                  ) : (
                    <span className="w-3.5 text-center shrink-0">{i + 1}</span>
                  )}
                  <span className="truncate">{label}</span>
                </span>
                {client.timelineStep === i && (
                  <span className="text-[10px] uppercase tracking-wider shrink-0 ml-2">Aktualny</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Brief klienta
          </h3>
          {client.brief ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Cel</p>
                <p className="text-foreground leading-relaxed break-words">{client.brief.cel}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Zakładki</p>
                <p className="text-foreground break-words">{client.brief.zakladki}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Estetyka</p>
                <p className="text-foreground break-words">{client.brief.estetyka}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Inspiracje</p>
                <ul className="text-primary space-y-2 sm:space-y-1">
                  {client.brief.inspiracje1 && <li><a href={formatUrl(client.brief.inspiracje1)} target="_blank" rel="noopener noreferrer" className="hover:underline break-all block leading-tight">{client.brief.inspiracje1}</a></li>}
                  {client.brief.inspiracje2 && <li><a href={formatUrl(client.brief.inspiracje2)} target="_blank" rel="noopener noreferrer" className="hover:underline break-all block leading-tight">{client.brief.inspiracje2}</a></li>}
                </ul>
              </div>
              {client.brief.dysk && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Dysk</p>
                  <a href={formatUrl(client.brief.dysk)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 break-all">
                    <ExternalLink size={12} className="shrink-0" /> {client.brief.dysk}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Klient nie ukończył jeszcze briefu.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Materiały (linki)
          </h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1 sm:pr-2">
            {client.deliverables.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border gap-2">
                <span className="text-sm text-foreground truncate">{d.label}</span>
                <a href={formatUrl(d.url)} target="_blank" rel="noopener noreferrer" className="text-primary shrink-0 p-1">
                  <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={newDelivLabel}
              onChange={(e) => setNewDelivLabel(e.target.value)}
              placeholder="Nazwa"
              className="w-full sm:flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <input
              value={newDelivUrl}
              onChange={(e) => setNewDelivUrl(e.target.value)}
              placeholder="URL"
              className="w-full sm:flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button 
              onClick={handleAddDeliverable} 
              disabled={actionLoading || !newDelivLabel || !newDelivUrl}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-3 py-2.5 sm:py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex justify-center items-center"
            >
              <Plus size={16} />
              <span className="sm:hidden ml-2 font-bold text-xs uppercase tracking-wider">Dodaj</span>
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Dokumenty (PDF)
          </h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1 sm:pr-2">
            {client.documents.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border gap-2">
                <span className="text-sm text-foreground truncate">{d.name}</span>
                <Download size={14} className="text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <input
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="Nazwa dokumentu (np. Umowa)"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full sm:flex-1 text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              <button 
                onClick={handleAddDocument} 
                disabled={actionLoading || !selectedFile || !newDocName}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-4 py-2.5 sm:py-2 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                Wgraj
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NewClient = ({
  onCreated,
}: {
  onCreated: () => void;
}) => {
  const { addClient } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (name && email) {
      setIsSubmitting(true);
      try {
        await addClient(name, email);
        onCreated();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 className="text-2xl lg:text-3xl font-heading text-heading mb-6 lg:mb-8">Nowy Klient</h1>
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 max-w-lg space-y-4">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Wpisz dane klienta. Po utworzeniu projektu, klient otrzyma dane do logowania.
        </p>
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Imię i Nazwisko / Nazwa Firmy
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan Nowak"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Adres E-mail klienta
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="jan@firma.pl"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || !email.trim() || isSubmitting}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:brightness-110 px-6 py-3.5 sm:py-3 mt-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Utwórz Projekt
        </button>
      </div>
    </motion.div>
  );
};

export default AdminPage;