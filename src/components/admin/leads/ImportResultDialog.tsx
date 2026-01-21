import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, RefreshCw, FileText, Download, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ImportResult {
  batchId: string;
  filename: string;
  totalRows: number;
  imported: number;
  updated: number;
  errors: number;
  phoneOnly: number;
  noContact: number;
  errorDetails: Array<{ row: number; name: string; reason: string }>;
  completedAt: Date;
}

interface ImportResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ImportResult | null;
  onViewImported?: () => void;
  onDispatchCampaign?: () => void;
}

export const ImportResultDialog = ({
  open,
  onOpenChange,
  result,
  onViewImported,
  onDispatchCampaign,
}: ImportResultDialogProps) => {
  if (!result) return null;

  const successRate = result.totalRows > 0 
    ? Math.round(((result.imported + result.updated) / result.totalRows) * 100) 
    : 0;

  const hasErrors = result.errors > 0 || result.noContact > 0;

  const handleExportErrors = () => {
    if (result.errorDetails.length === 0) return;
    
    const csvContent = [
      ["Linha", "Nome", "Motivo"].join(","),
      ...result.errorDetails.map(e => [
        e.row,
        `"${e.name}"`,
        `"${e.reason}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `erros_importacao_${format(result.completedAt, "yyyy-MM-dd_HH-mm")}.csv`;
    link.click();
  };

  const successCount = result.imported + result.updated;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {hasErrors ? (
              <RefreshCw className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            Importação Concluída
          </DialogTitle>
          <DialogDescription>
            {result.filename} • {format(result.completedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{result.imported}</div>
              <div className="text-xs text-green-700 dark:text-green-400">Novos</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
              <div className="text-xs text-blue-700 dark:text-blue-400">Atualizados</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{result.errors + result.noContact}</div>
              <div className="text-xs text-red-700 dark:text-red-400">Ignorados</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de sucesso</span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de linhas processadas</span>
              <span>{result.totalRows}</span>
            </div>
            {result.phoneOnly > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Importados só com telefone</span>
                <span className="text-yellow-600">{result.phoneOnly}</span>
              </div>
            )}
            {result.noContact > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sem dados de contato</span>
                <span className="text-red-600">{result.noContact}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID do lote</span>
              <span className="font-mono text-xs">{result.batchId.slice(0, 8)}</span>
            </div>
          </div>

          {/* Error Details */}
          {result.errorDetails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-600">
                  Detalhes dos erros ({result.errorDetails.length})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportErrors}
                  className="h-7 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Exportar
                </Button>
              </div>
              <ScrollArea className="h-32 border rounded-lg">
                <div className="p-2 space-y-1">
                  {result.errorDetails.slice(0, 20).map((error, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-1.5 bg-red-50 dark:bg-red-900/20 rounded">
                      <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">Linha {error.row}:</span>{" "}
                        <span className="text-muted-foreground">{error.name || "Sem nome"}</span>
                        <span className="text-red-600 ml-1">• {error.reason}</span>
                      </div>
                    </div>
                  ))}
                  {result.errorDetails.length > 20 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      ... e mais {result.errorDetails.length - 20} erros
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex flex-col gap-2 pt-4 border-t">
          {/* Primary action: Dispatch campaign */}
          {onDispatchCampaign && successCount > 0 && (
            <Button
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => {
                onOpenChange(false);
                onDispatchCampaign();
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Disparar Campanha para {successCount} Leads
            </Button>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            {onViewImported && successCount > 0 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  onViewImported();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Importados
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
