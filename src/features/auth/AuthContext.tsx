import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  brief?: {
    cel: string;
    zakladki: string;
    estetyka: string;
    inspiracje1: string;
    inspiracje2: string;
    dysk: string;
  };
  timelineStep: number;
  deliverables: { label: string; url: string }[];
  documents: { name: string; url: string }[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentUser: { email: string; name: string; id: string } | null;
  clients: Client[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (brief: Client["brief"], signatureName: string) => Promise<void>;
  updateBrief: (brief: Client["brief"]) => Promise<void>;
  updateClientTimeline: (clientId: string, step: number) => Promise<void>;
  addClient: (name: string, email: string) => Promise<void>;
  addDeliverable: (clientId: string, label: string, url: string) => Promise<void>;
  addDocument: (clientId: string, name: string, file: File) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  getClientForCurrentUser: () => Client | undefined;
  getClientById: (id: string) => Client | undefined;
}

const ADMIN_EMAIL = "admin@portal.pl";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const refreshData = useCallback(async () => {
    if (!user) return;

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        briefs (*),
        deliverables (*),
        documents (*)
      `);

    if (error) return;

    const mapped: Client[] = projects.map((p) => ({
      id: p.id,
      name: p.client_name,
      email: p.client_email || (user.email === ADMIN_EMAIL ? "Klient" : user.email!),
      onboardingComplete: p.current_step > 0,
      timelineStep: p.current_step,
      brief: p.briefs?.[0] ? {
        cel: p.briefs[0].business_goal,
        zakladki: p.briefs[0].pages_structure,
        estetyka: p.briefs[0].aesthetics,
        inspiracje1: p.briefs[0].inspirations,
        inspiracje2: p.briefs[0].inspirations_2 || "",
        dysk: p.briefs[0].assets_url
      } : undefined,
      deliverables: p.deliverables?.map((d: any) => ({ label: d.title, url: d.url })) || [],
      documents: p.documents?.map((d: any) => ({ name: d.title, url: d.file_url })) || []
    }));

    setClients(mapped);
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) refreshData();
  }, [user, refreshData]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setClients([]);
  };

  const completeOnboarding = async (brief: Client["brief"], signatureName: string) => {
    if (!user || !brief) return;

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!project) return;

    await supabase.from('briefs').insert([{
      project_id: project.id,
      business_goal: brief.cel,
      pages_structure: brief.zakladki,
      aesthetics: brief.estetyka,
      inspirations: brief.inspiracje1,
      inspirations_2: brief.inspiracje2,
      assets_url: brief.dysk
    }]);

    await supabase.from('projects')
      .update({ client_name: signatureName, current_step: 1 })
      .eq('id', project.id);

    await refreshData();
  };

  const updateBrief = async (brief: Client["brief"]) => {
    if (!user || !brief) return;
    const { data: project } = await supabase.from('projects').select('id').eq('user_id', user.id).single();
    if (!project) return;
    
    await supabase.from('briefs')
      .update({
        business_goal: brief.cel,
        pages_structure: brief.zakladki,
        aesthetics: brief.estetyka,
        inspirations: brief.inspiracje1,
        inspirations_2: brief.inspiracje2,
        assets_url: brief.dysk
      })
      .eq('project_id', project.id);

    await refreshData();
  };

  const updateClientTimeline = async (clientId: string, step: number) => {
    await supabase.from('projects').update({ current_step: step }).eq('id', clientId);
    await refreshData();
  };

  const addClient = async (name: string, email: string) => {
    const tempPassword = "Start" + Math.floor(1000 + Math.random() * 9000) + "!"; 
    
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: { name, email, password: tempPassword }
      });

      if (data?.error) {
        toast.error("Błąd: " + data.error);
        return;
      }

      if (error) {
        toast.error("Błąd połączenia: " + error.message);
        return;
      }

      const copyText = `Dostęp: ${email} / Hasło: ${tempPassword}`;
      
      try {
        await navigator.clipboard.writeText(copyText);
        toast.success(`KLIENT DODANY! Hasło: ${tempPassword}`, { duration: 15000 });
        toast.info("Dane logowania skopiowano do schowka.");
      } catch (err) {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = copyText;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
          toast.success(`KLIENT DODANY! Hasło: ${tempPassword}`, { duration: 15000 });
          toast.info("Dane logowania skopiowano do schowka.");
        } catch (fallbackErr) {
          toast.success(`KLIENT DODANY! Hasło: ${tempPassword}`, { duration: 30000 });
          toast.error("Zapisz hasło z powiadomienia, nie udało się go skopiować.");
        }
      }
      
      await refreshData();
    } catch (err) {
      toast.error("Wystąpił nieoczekiwany błąd.");
    }
  };

  const addDeliverable = async (clientId: string, label: string, url: string) => {
    await supabase.from('deliverables').insert([{ project_id: clientId, title: label, url }]);
    await refreshData();
  };

  const addDocument = async (clientId: string, name: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${Date.now()}_${safeName}.${fileExt}`;
    const filePath = `${clientId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      toast.error(`Błąd Storage: ${uploadError.message}`);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const downloadUrl = `${publicUrl}?download=${encodeURIComponent(name + '.' + fileExt)}`;

    const { error: dbError } = await supabase.from('documents').insert([{ 
      project_id: clientId, 
      title: name, 
      file_url: downloadUrl 
    }]);

    if (dbError) {
      toast.error(`Błąd bazy: ${dbError.message}`);
      return;
    }

    await refreshData();
    toast.success("Dokument zapisany!");
  };

  const deleteClient = async (clientId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', clientId);
    if (error) throw error;
    await refreshData();
  };

  const getClientForCurrentUser = () => {
    if (!user) return undefined;
    if (isAdmin) return undefined;
    return clients[0];
  };

  const getClientById = (id: string) => clients.find((c) => c.id === id);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!user,
        isAdmin,
        currentUser: user ? { email: user.email!, name: user.email!.split("@")[0], id: user.id } : null,
        clients,
        loading,
        login,
        logout,
        completeOnboarding,
        updateBrief,
        updateClientTimeline,
        addClient,
        addDeliverable,
        addDocument,
        deleteClient,
        getClientForCurrentUser,
        getClientById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};