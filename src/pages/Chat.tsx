import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  instanceName: string;
  remoteJid: string;
  contactName: string | null;
  contactPhone: string | null;
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
}

interface Message {
  id: string;
  remoteId: string | null;
  fromMe: boolean;
  content: string;
  messageType: string;
  status: string | null;
  timestamp: string;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
}

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function displayName(conv: Conversation): string {
  return conv.contactName || conv.contactPhone || conv.remoteJid.split("@")[0];
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filtered, setFiltered] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingConvs(true);
    try {
      const data = await api.get<Conversation[]>("/integrations/whatsapp/conversations");
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      // silently fail polling
    } finally {
      if (!quiet) setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    pollRef.current = setInterval(() => fetchConversations(true), 15_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchConversations]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(conversations);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        conversations.filter(
          (c) =>
            displayName(c).toLowerCase().includes(q) ||
            (c.lastMessagePreview ?? "").toLowerCase().includes(q)
        )
      );
    }
  }, [search, conversations]);

  const fetchMessages = useCallback(async (conv: Conversation) => {
    setLoadingMsgs(true);
    try {
      const data = await api.get<Message[]>(`/integrations/whatsapp/conversations/${conv.id}/messages`);
      setMessages(Array.isArray(data) ? data : []);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (!selected) return;
    const poll = setInterval(() => fetchMessages(selected), 10_000);
    return () => clearInterval(poll);
  }, [selected, fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSelectConv = (conv: Conversation) => {
    setSelected(conv);
    setMessages([]);
    fetchMessages(conv);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    if (selected) await fetchMessages(selected);
    setRefreshing(false);
  };

  return (
    <DashboardLayout title="Chat WhatsApp">
      <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-border bg-background">
        {/* Sidebar — lista de conversas */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-border">
          <div className="p-3 border-b border-border flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {loadingConvs ? (
              <div className="space-y-2 p-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
                <MessageSquare className="h-8 w-8 opacity-30" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div>
                {filtered.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConv(conv)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-3 text-left border-b border-border/50 hover:bg-muted/50 transition-colors",
                      selected?.id === conv.id && "bg-muted"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary uppercase">
                      {displayName(conv).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium truncate">{displayName(conv)}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessagePreview || ""}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="text-[10px] h-4 min-w-4 px-1 flex-shrink-0 bg-green-500 hover:bg-green-500">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Área de mensagens */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageSquare className="h-12 w-12 opacity-20" />
              <p className="text-sm">Selecione uma conversa para ver as mensagens</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary uppercase">
                  {displayName(selected).charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{displayName(selected)}</p>
                  {selected.contactPhone && (
                    <p className="text-xs text-muted-foreground">{selected.contactPhone}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-3">
                {loadingMsgs ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                        <Skeleton className="h-10 w-48 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground mt-8">Nenhuma mensagem</p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn("flex", msg.fromMe ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                            msg.fromMe
                              ? "bg-green-500 text-white rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p
                            className={cn(
                              "text-[10px] mt-0.5 text-right",
                              msg.fromMe ? "text-green-100" : "text-muted-foreground"
                            )}
                          >
                            {formatMsgTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
