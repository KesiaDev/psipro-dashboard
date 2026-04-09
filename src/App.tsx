import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ClinicProvider } from "@/contexts/ClinicContext";
import { ClinicGate } from "@/components/ClinicGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { ThemeProvider as PaletteProvider } from "@/contexts/ThemeContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AdminRoute } from "./components/AdminRoute";
import { DeveloperRoute } from "./components/DeveloperRoute";
import { Auth401Redirect } from "./components/Auth401Redirect";
const Index = lazy(() => import("./pages/Index"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientDetail = lazy(() => import("./pages/PatientDetail"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Sessions = lazy(() => import("./pages/Sessions"));
const SessionDetail = lazy(() => import("./pages/SessionDetail"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Clinics = lazy(() => import("./pages/Clinics"));
const Psychologists = lazy(() => import("./pages/Psychologists"));
const Financials = lazy(() => import("./pages/Financials"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Billing = lazy(() => import("./pages/Billing"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppBootFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <PaletteProvider>
      <AccessibilityProvider>
        <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <ClinicProvider>
              <Auth401Redirect />
              <Toaster />
              <Sonner />
              <Suspense fallback={<AppBootFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<ProtectedRoute><ClinicGate><Index /></ClinicGate></ProtectedRoute>} />
                  <Route path="/clinics" element={<ProtectedRoute><ClinicGate><Clinics /></ClinicGate></ProtectedRoute>} />
                  <Route path="/psychologists" element={<ProtectedRoute><ClinicGate><Psychologists /></ClinicGate></ProtectedRoute>} />
                  <Route path="/financials" element={<ProtectedRoute><ClinicGate><Financials /></ClinicGate></ProtectedRoute>} />
                  <Route path="/patients" element={<ProtectedRoute><ClinicGate><Patients /></ClinicGate></ProtectedRoute>} />
                  <Route path="/patients/:id" element={<ProtectedRoute><ClinicGate><PatientDetail /></ClinicGate></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><ClinicGate><Calendar /></ClinicGate></ProtectedRoute>} />
                  <Route path="/sessions" element={<ProtectedRoute><ClinicGate><Sessions /></ClinicGate></ProtectedRoute>} />
                  <Route path="/sessions/:id" element={<ProtectedRoute><ClinicGate><SessionDetail /></ClinicGate></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><ClinicGate><Reports /></ClinicGate></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><ClinicGate><Settings /></ClinicGate></ProtectedRoute>} />
                  <Route path="/settings/integrations" element={<ProtectedRoute><ClinicGate><Settings defaultTab="integrations" /></ClinicGate></ProtectedRoute>} />
                  <Route path="/system-health" element={<ProtectedRoute><ClinicGate><AdminRoute><DeveloperRoute><SystemHealth /></DeveloperRoute></AdminRoute></ClinicGate></ProtectedRoute>} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ClinicProvider>
          </AuthProvider>
        </BrowserRouter>
        </TooltipProvider>
      </AccessibilityProvider>
      </PaletteProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
