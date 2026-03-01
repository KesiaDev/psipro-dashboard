import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Clock, Calendar } from "lucide-react";
import { useSessionsData } from "@/hooks/useSessionsData";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Concluída", className: "bg-accent text-accent-foreground" },
  scheduled: { label: "Agendada", className: "bg-primary/20 text-primary" },
  cancelled: { label: "Cancelada", className: "bg-destructive/20 text-destructive" },
  "in-progress": { label: "Em andamento", className: "bg-chart-amber/20 text-chart-amber" },
};

const Sessions = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { sessions, loading, error, refetch } = useSessionsData();

  const filtered = sessions.filter((s) => {
    const matchesSearch = s.patient.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, session) => {
    if (!acc[session.date]) acc[session.date] = [];
    acc[session.date].push(session);
    return acc;
  }, {});

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Sessões">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar sessões"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading && sessions.length === 0) {
    return (
      <DashboardLayout title="Sessões">
        <LoadingSkeleton variant="list" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sessões">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Sessões</h1>
            <p className="text-sm text-muted-foreground">Histórico e gerenciamento de sessões</p>
          </div>
          <Button className="gold-gradient text-primary-foreground rounded-xl gap-2">
            <Plus className="h-4 w-4" />
            Nova Sessão
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-card border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "completed", "scheduled", "in-progress", "cancelled"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "secondary"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Todas" : statusConfig[f]?.label ?? f}
              </Button>
            ))}
          </div>
        </div>

        {/* Sessions grouped by date */}
        {Object.keys(grouped).length === 0 ? (
          <div className="card-soft p-12 text-center">
            <p className="text-muted-foreground">Nenhuma sessão encontrada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, dateSessions]) => (
              <div key={date} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-sm font-semibold text-foreground">{date}</h3>
                  <span className="text-xs text-muted-foreground">({dateSessions.length} sessões)</span>
                </div>
                <div className="grid gap-2">
                  {dateSessions.map((session) => (
                    <div
                      key={session.id}
                      className="card-soft p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="gold-gradient text-primary-foreground text-xs font-semibold">
                          {session.initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{session.patient}</p>
                          <p className="text-xs text-muted-foreground">{session.type}</p>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-sm">{session.time}</span>
                          <span className="text-xs">· {session.duration}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`rounded-lg text-[10px] px-2 py-0.5 ${statusConfig[session.status]?.className ?? ""}`}
                          >
                            {statusConfig[session.status]?.label ?? session.status}
                          </Badge>
                          {session.notes && (
                            <span className="flex items-center gap-1 text-xs text-primary">
                              <FileText className="h-3 w-3" /> Notas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sessions;
