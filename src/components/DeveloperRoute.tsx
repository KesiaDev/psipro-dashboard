import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";

export function DeveloperRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const normalizedEmail = (profile?.email ?? "").trim().toLowerCase();
  const developerEmails = (import.meta.env.VITE_DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const isDeveloper = import.meta.env.DEV || developerEmails.includes(normalizedEmail);

  if (!isDeveloper) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
