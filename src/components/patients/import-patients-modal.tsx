import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { toast } from "sonner";
import { FileSpreadsheet, Upload, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPT = ".xlsx,.xls";

interface ImportResult {
  imported: number;
  skipped: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportPatientsModal({ open, onOpenChange, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = useCallback((f: File | null) => {
    if (!f) return;
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (ext !== ".xlsx" && ext !== ".xls") {
      toast.error("Aceite apenas arquivos .xlsx ou .xls");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) acceptFile(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    acceptFile(f ?? null);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.postForm<ImportResult>("/patients/import", formData, (p) => setProgress(p));

      setResult(res);
      toast.success(`${res.imported} pacientes importados`);
      onSuccess?.();
      if (res.imported > 0) {
        setFile(null);
        setTimeout(() => onOpenChange(false), 2000);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Erro ao importar. Verifique o arquivo.";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && !uploading) {
      setFile(null);
      setProgress(0);
      setResult(null);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const isValidFile = file && (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls"));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Pacientes</DialogTitle>
          <DialogDescription>
            Envie um arquivo Excel (.xlsx ou .xls) com as colunas: Nome completo, Data de nascimento, E-mail, Telefone, Gênero.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag & Drop */}
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30",
              uploading && "pointer-events-none opacity-70",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={ACCEPT}
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploading}
            />
            {file && isValidFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-12 w-12 text-primary" />
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste o arquivo aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">Apenas .xlsx ou .xls</p>
              </div>
            )}
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Enviando...</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Result */}
          {result && !uploading && (
            <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
              <CheckCircle2 className="h-8 w-8 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">{result.imported} pacientes importados</p>
                {result.skipped > 0 && (
                  <p className="text-xs text-muted-foreground">{result.skipped} linhas ignoradas</p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={uploading}>
            Fechar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!isValidFile || uploading}
            className="gold-gradient text-primary-foreground"
          >
            {uploading ? "Importando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
