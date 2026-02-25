import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Phone, Mail, MoreHorizontal, Filter } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  initials: string;
  email: string;
  phone: string;
  age: number;
  sessions: number;
  lastSession: string;
  nextSession: string | null;
  status: "active" | "inactive" | "new";
  progress: "improving" | "stable" | "attention";
}

const patients: Patient[] = [
  { id: 1, name: "Ana Souza", initials: "AS", email: "ana@email.com", phone: "(11) 99123-4567", age: 32, sessions: 12, lastSession: "22 Fev 2026", nextSession: "01 Mar 2026", status: "active", progress: "improving" },
  { id: 2, name: "Carlos Lima", initials: "CL", email: "carlos@email.com", phone: "(11) 98765-4321", age: 45, sessions: 5, lastSession: "20 Fev 2026", nextSession: "27 Fev 2026", status: "active", progress: "stable" },
  { id: 3, name: "Beatriz Ferreira", initials: "BF", email: "beatriz@email.com", phone: "(11) 91234-5678", age: 28, sessions: 8, lastSession: "18 Fev 2026", nextSession: "25 Fev 2026", status: "active", progress: "attention" },
  { id: 4, name: "Diego Santos", initials: "DS", email: "diego@email.com", phone: "(11) 97654-3210", age: 38, sessions: 15, lastSession: "21 Fev 2026", nextSession: "28 Fev 2026", status: "active", progress: "improving" },
  { id: 5, name: "Fernanda Oliveira", initials: "FO", email: "fernanda@email.com", phone: "(11) 93456-7890", age: 29, sessions: 3, lastSession: "19 Fev 2026", nextSession: null, status: "new", progress: "stable" },
  { id: 6, name: "Gabriel Mendes", initials: "GM", email: "gabriel@email.com", phone: "(11) 92345-6789", age: 41, sessions: 20, lastSession: "15 Fev 2026", nextSession: null, status: "inactive", progress: "stable" },
  { id: 7, name: "Helena Costa", initials: "HC", email: "helena@email.com", phone: "(11) 94567-8901", age: 35, sessions: 10, lastSession: "23 Fev 2026", nextSession: "02 Mar 2026", status: "active", progress: "improving" },
  { id: 8, name: "Igor Almeida", initials: "IA", email: "igor@email.com", phone: "(11) 95678-9012", age: 27, sessions: 2, lastSession: "24 Fev 2026", nextSession: "03 Mar 2026", status: "new", progress: "stable" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-accent text-accent-foreground" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  new: { label: "Novo", className: "bg-primary/20 text-primary" },
};

const progressConfig: Record<string, { label: string; dot: string }> = {
  improving: { label: "Evoluindo", dot: "bg-primary" },
  stable: { label: "Estável", dot: "bg-chart-amber" },
  attention: { label: "Atenção", dot: "bg-destructive" },
};

const Patients = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout title="Pacientes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Pacientes</h1>
            <p className="text-sm text-muted-foreground">{patients.length} pacientes cadastrados</p>
          </div>
          <Button className="gold-gradient text-primary-foreground rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-card border-border"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "new", "inactive"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "secondary"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : f === "new" ? "Novos" : "Inativos"}
              </Button>
            ))}
          </div>
        </div>

        {/* Patient List */}
        <div className="grid gap-3">
          {filtered.map((patient, i) => (
            <div
              key={patient.id}
              className="card-soft p-4 flex items-center gap-4 hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Avatar className="h-11 w-11">
                <AvatarFallback className="gold-gradient text-primary-foreground text-sm font-semibold">
                  {patient.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.age} anos · {patient.sessions} sessões</p>
                </div>

                <div className="hidden sm:block min-w-0">
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> {patient.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> {patient.phone}
                  </p>
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground">Última sessão</p>
                  <p className="text-sm font-medium text-foreground">{patient.lastSession}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`rounded-lg text-[10px] px-2 py-0.5 ${statusConfig[patient.status].className}`}>
                    {statusConfig[patient.status].label}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${progressConfig[patient.progress].dot}`} />
                    <span className="text-xs text-muted-foreground">{progressConfig[patient.progress].label}</span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
