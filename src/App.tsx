import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClinicProvider } from "@/contexts/ClinicContext";
import { ClinicGate } from "@/components/ClinicGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { ThemeProvider as PaletteProvider } from "@/contexts/ThemeContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Calendar from "./pages/Calendar";
import Sessions from "./pages/Sessions";
import SessionDetail from "./pages/SessionDetail";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Clinics from "./pages/Clinics";
import Psychologists from "./pages/Psychologists";
import Financials from "./pages/Financials";
import SystemHealth from "./pages/SystemHealth";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <PaletteProvider>
      <AccessibilityProvider>
        <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <ClinicProvider>
              <Toaster />
              <Sonner />
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
                <Route path="/system-health" element={<ProtectedRoute><ClinicGate><AdminRoute><SystemHealth /></AdminRoute></ClinicGate></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
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
