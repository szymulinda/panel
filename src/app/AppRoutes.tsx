import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import LoginPage from "@/features/auth/LoginPage";
import AdminPage from "@/features/admin/AdminPage";
import ClientDashboardPage from "@/features/client/ClientDashboardPage";
import OnboardingWizard from "@/features/client/OnboardingWizard";
import NotFoundPage from "@/features/site/NotFoundPage";

export function AppRoutes() {
  const { isLoggedIn, isAdmin, getClientForCurrentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const client = getClientForCurrentUser();
  const needsOnboarding = !isAdmin && (!client || !client.onboardingComplete);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <ClientDashboardPage />
          )
        }
      />
      <Route
        path="/onboarding"
        element={needsOnboarding ? <OnboardingWizard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin"
        element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
      />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
